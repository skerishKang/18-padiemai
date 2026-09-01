import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const require=createRequire(import.meta.url);
const {createStoryMemoryUniversalSourceRuntime}=require(path.join(root,'dist/storymemory-universal-source-runtime.js'));
const {createStoryMemoryPackMarketplaceRuntime}=require(path.join(root,'dist/storymemory-pack-marketplace-runtime.js'));
const {createStoryMemoryAutoPackRuntime,createStoryMemoryNeonAutoPackRegistryWriter,STORYMEMORY_AUTO_PACK_CONTRACT}=require(path.join(root,'dist/storymemory-auto-pack-runtime.js'));
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contentRoot=path.join(root,'dist/content');
const manifest=readJson(path.join(contentRoot,'odyssey/manifest.json'));
const staticAdapter={async loadUnit({workKey,unitOrdinal}){return {manifest:readJson(path.join(contentRoot,workKey,'manifest.json')),unit:readJson(path.join(contentRoot,workKey,`book-${String(unitOrdinal).padStart(2,'0')}.json`))}}};
const rt=createStoryMemoryUniversalSourceRuntime({staticAdapter});
const sourceId='book:odyssey-sm089';
await rt.ingest({sourceId,sourceType:'book',title:'The Odyssey',workKey:'odyssey',unitOrdinal:20,ownerScope:'public',rightsMode:'public-domain',revision:manifest.schema_version,fingerprint:manifest.provenance.canonical_source_sha256,language:'ko',metadata:{progressBounded:true,unitOrdinal:20,locatorScheme:'book',workKey:'odyssey'}});
const currentLocator='odyssey:book:20:s6:row:006';
const expectedLocator='odyssey:book:04:s1:row:002';
rt.setPosition(sourceId,currentLocator);
rt.addMemory({sourceId,locator:currentLocator,title:'SM089 QA Memory',body:'Auto Pack generation must not mutate or remove this Memory.'});
const market=createStoryMemoryPackMarketplaceRuntime({universalRuntime:rt});
let providerRequest=null;
const auto=createStoryMemoryAutoPackRuntime({universalRuntime:rt,marketplaceRuntime:market,generatorProvider:async req=>{providerRequest=JSON.parse(JSON.stringify(req));return {name:'Helen Korean correction',aliases:[{from:'헬렌',to:['헬레네','Helen']}],policies:{answerStyle:'concise',trustMode:'EXPLORE',revealAnswers:true}}}});
const q='헬렌 처음 어디서 나왔지?';
const base=await rt.retrieve({sourceId,query:q,locator:currentLocator});
const baseExact=base.relevantEvidence.some(x=>x.locator===expectedLocator);
const beforeMemory=rt.status().localMemoryCount;
const beforeFingerprint=rt.getSource(sourceId).fingerprint;

const triggerExplicit=auto.evaluateNeed({sourceId,question:q,explicitRequest:true,retrieval:base});
auto.recordSignal({sourceId,question:q,kind:'correction'});
auto.recordSignal({sourceId,question:q,kind:'wrong-answer'});
const triggerRepeated=auto.evaluateNeed({sourceId,question:q,retrieval:base});
const triggerLow=auto.evaluateNeed({sourceId,question:'missing',retrieval:{relevantEvidence:[]}});
const triggerStrict=auto.evaluateNeed({sourceId,question:'strict',retrieval:base,trustMode:'STRICT'});

const generated=await auto.generate({sourceId,question:q,locator:currentLocator,expectedLocator,explicitRequest:true,mode:'quick'});
const attached=rt.listAttachedPacks(sourceId).find(x=>x.id===generated.pack.id);
const afterExact=generated.after.expectedLocatorHit;
const privateListing=market.getListing(generated.pack.id);
const publicSearch=market.search({source:rt.getSource(sourceId)});
const review=auto.preparePublicReview(generated.pack.id);
const afterMemory=rt.status().localMemoryCount;
const afterFingerprint=rt.getSource(sourceId).fingerprint;
const generatedRecord=auto.getGenerated(generated.pack.id);

const detached=auto.detach(generated.pack.id,sourceId);
const detachedRetrieval=await rt.retrieve({sourceId,query:q,locator:currentLocator});
const detachedExact=detachedRetrieval.relevantEvidence.some(x=>x.locator===expectedLocator);

// No-improvement Pack must be auto-rolled back and not persisted.
auto.setGeneratorProvider(async req=>({name:'Style only',policies:{answerStyle:'concise'}}));
const noImprove=await auto.generate({sourceId,question:'오디세우스',locator:currentLocator,explicitRequest:true,mode:'quick'});
const noImproveStored=noImprove.pack?.id?auto.getGenerated(noImprove.pack.id):null;
const noImproveAttached=noImprove.pack?.id?rt.listAttachedPacks(sourceId).some(x=>x.id===noImprove.pack.id):false;

// Source body exfiltration proposal must fail before attach/store.
auto.setGeneratorProvider(async req=>({name:'Bad',sourceText:'COPY OF SOURCE',aliases:[{from:'x',to:['y']}]}));
let sourceBodyError=null;
try{await auto.generate({sourceId,question:'x',locator:currentLocator,explicitRequest:true,mode:'quick'})}catch(e){sourceBodyError=String(e.message||e)}

// Deep is explicit-only.
let deepConfirmError=null;
try{await auto.generate({sourceId,question:'deep',locator:currentLocator,explicitRequest:true,mode:'deep'})}catch(e){deepConfirmError=String(e.message||e)}

// Sanitizer blocks hard policy and rejects ungrounded Deep knowledge-only proposal.
const boundedLocators=new Set(providerRequest.evidence.map(x=>x.locator));
const hardSanitized=auto.sanitizeProposal({aliases:[{from:'A',to:['B']}],policies:{answerStyle:'short',trustMode:'EXPLORE',allowFuture:true,revealAnswers:true}},'quick',boundedLocators);
let ungroundedKnowledgeError=null;
try{auto.sanitizeProposal({knowledge:[{id:'bad',summary:'Unsupported fact',sourceRefs:['not:a:real:locator']}]},'deep',boundedLocators)}catch(e){ungroundedKnowledgeError=String(e.message||e)}
const validEvidenceLocator=providerRequest.evidence[0]?.locator||null;
const groundedDeep=validEvidenceLocator?auto.sanitizeProposal({knowledge:[{id:'good',summary:'Bounded source fact',sourceRefs:[validEvidenceLocator]}]},'deep',boundedLocators):null;

// Confirmed correction fallback works without an external generator provider.
const fallbackAuto=createStoryMemoryAutoPackRuntime({universalRuntime:rt});
const fallback=await fallbackAuto.generate({sourceId,question:q,locator:currentLocator,expectedLocator,explicitRequest:true,mode:'quick',confirmedAliases:[{from:'헬렌',to:['헬레네','Helen']}],persistLocal:false});
const fallbackAttached=rt.listAttachedPacks(sourceId).some(x=>x.id===fallback.pack.id);
fallbackAuto.detach(fallback.pack.id,sourceId);

// No explicit signal/no measured failure = no generation need.
const notNeeded=auto.evaluateNeed({sourceId,question:'normal',retrieval:{relevantEvidence:[{locator:currentLocator,score:20}]},trustMode:'EXPLORE'});

// Registry writer stores metadata only and requires durable artifact URI.
const calls=[];
const remoteAdapter={async request(table,opts={}){calls.push({table,opts:JSON.parse(JSON.stringify(opts))});return []}};
const writer=createStoryMemoryNeonAutoPackRegistryWriter({remoteAdapter,getUserId:'qa-user'});
const draftListing={
  listing:{packId:generated.pack.id,name:generated.pack.name,packType:generated.pack.kind,publisherName:'',summary:'private auto pack',visibility:'private',publicationStatus:'draft',sourceTextIncluded:false,rightsDeclaration:generated.pack.rights,compatibilitySummary:generated.pack.compatibility,permissions:{sourceAccess:'required'},processingDisclosure:generated.pack.metadata.processingDisclosure,listingMetadata:{autoGenerated:true}},
  version:{version:generated.pack.version,artifactUri:'private://packs/sm089-generated.json',artifactFingerprint:generated.pack.artifactFingerprint,sourceMatchMode:generated.pack.compatibility.mode,compatibility:generated.pack.compatibility,rights:generated.pack.rights}
};
const persisted=await writer.saveDraft(draftListing);
let missingUriError=null;
try{await writer.saveDraft({...draftListing,version:{...draftListing.version,artifactUri:''}})}catch(e){missingUriError=String(e.message||e)}
const dbBodies=calls.map(x=>x.opts?.body||{});
const serializedDb=JSON.stringify(dbBodies);

const checks={
  contract:STORYMEMORY_AUTO_PACK_CONTRACT.schema==='storymemory-auto-pack-generation-1.0'&&STORYMEMORY_AUTO_PACK_CONTRACT.defaultVisibility==='private'&&STORYMEMORY_AUTO_PACK_CONTRACT.publicAutoPublish===false,
  explicit_trigger:triggerExplicit.needed&&triggerExplicit.reasons.includes('EXPLICIT_USER_REQUEST'),
  repeated_correction_trigger:triggerRepeated.reasons.includes('REPEATED_CORRECTION'),
  low_retrieval_trigger:triggerLow.reasons.includes('LOW_RETRIEVAL_CONFIDENCE'),
  strict_trigger:triggerStrict.reasons.includes('STRICT_HIGH_ACCURACY_NEED'),
  base_miss:baseExact===false,
  bounded_provider_request:providerRequest?.policy?.fullSourceSent===false&&providerRequest.evidence.length<=8&&providerRequest.evidence.reduce((n,x)=>n+x.text.length,0)<=7000,
  generated_private_auto:generated.status==='READY_PRIVATE'&&generated.pack.metadata.publicationDefault==='private'&&generated.pack.trustTier==='auto-generated'&&generated.publication.autoPublished===false,
  compatibility_identity:generated.pack.compatibility.mode==='exact-fingerprint'&&generated.pack.compatibility.sourceFingerprint===manifest.provenance.canonical_source_sha256&&generated.pack.compatibility.sourceRevision===manifest.schema_version,
  artifact_fingerprint_accepts:generated.compatibility.compatible===true&&generated.compatibility.artifactFingerprint===generated.pack.artifactFingerprint,
  measured_improvement:generated.delta.improved===true&&afterExact===true&&generated.after.packQueryHintsUsed===true,
  attached_after_improvement:Boolean(attached)&&generated.attached===true,
  source_memory_unchanged:beforeMemory===afterMemory&&beforeFingerprint===afterFingerprint&&generated.sourceIntegrity.unchanged===true,
  private_catalog_not_public:privateListing?.visibility==='private'&&privateListing?.publicationStatus==='draft'&&!publicSearch.some(x=>x.packId===generated.pack.id),
  public_review_pending_only:review.visibility==='public'&&review.publicationStatus==='pending_review'&&review.autoPublish===false&&review.verified===false&&review.sourcePublicationImplied===false,
  detach_restores_baseline:detached===true&&detachedExact===false,
  no_improvement_rejected:noImprove.status==='REJECTED_NO_IMPROVEMENT'&&noImproveStored===null&&noImproveAttached===false,
  source_body_proposal_blocked:sourceBodyError?.startsWith('AUTO_PACK_SOURCE_BODY_FORBIDDEN:'),
  deep_explicit_gate:deepConfirmError==='AUTO_PACK_DEEP_EXPLICIT_CONFIRMATION_REQUIRED',
  hard_policy_blocked:['trustMode','allowFuture','revealAnswers'].every(k=>hardSanitized.blockedPolicyKeys.includes(k))&&hardSanitized.policies.answerStyle==='short',
  ungrounded_deep_knowledge_blocked:ungroundedKnowledgeError==='AUTO_PACK_EMPTY_SAFE_PROPOSAL',
  grounded_deep_knowledge_allowed:Boolean(groundedDeep?.knowledge?.length===1&&groundedDeep.knowledge[0].sourceRefs[0]===validEvidenceLocator),
  confirmed_correction_fallback:fallback.status==='READY_PRIVATE'&&fallback.after.expectedLocatorHit===true&&fallbackAttached===true&&fallback.request.policy.fullSourceSent===false,
  no_unnecessary_pack:notNeeded.needed===false,
  registry_metadata_only:persisted.payloadStoredInDb===false&&calls.length===2&&calls.some(x=>x.table==='pack_registry')&&calls.some(x=>x.table==='pack_versions')&&!serializedDb.includes('"payload"')&&!serializedDb.includes('COPY OF SOURCE'),
  registry_requires_artifact_uri:missingUriError==='AUTO_PACK_DURABLE_ARTIFACT_URI_REQUIRED',
  final_memory_preserved:rt.status().localMemoryCount===beforeMemory,
  final_source_fingerprint_preserved:rt.getSource(sourceId).fingerprint===beforeFingerprint
};
const result={schema:'storymemory-sm089-auto-pack-generation-result-1.0',runtimeContract:STORYMEMORY_AUTO_PACK_CONTRACT,source:{sourceId,fingerprint:beforeFingerprint,revision:manifest.schema_version},triggerChecks:{explicit:triggerExplicit,repeated:triggerRepeated,low:triggerLow,strict:triggerStrict,notNeeded},providerRequest:{evidenceBlocks:providerRequest?.evidence?.length||0,evidenceChars:providerRequest?.evidence?.reduce((n,x)=>n+x.text.length,0)||0,fullSourceSent:providerRequest?.policy?.fullSourceSent,evidenceLocators:providerRequest?.evidence?.map(x=>x.locator)||[]},generation:{packId:generated.pack.id,artifactFingerprint:generated.pack.artifactFingerprint,before:generated.before,after:generated.after,delta:generated.delta,publication:generated.publication,compatibility:generated.compatibility},rollback:{detached,detachedExact,noImproveStatus:noImprove.status,noImproveAttached,noImproveStored:Boolean(noImproveStored)},guards:{sourceBodyError,deepConfirmError,ungroundedKnowledgeError,hardPolicyBlocked:hardSanitized.blockedPolicyKeys},fallback:{packId:fallback.pack.id,after:fallback.after},registry:{persisted,calls:calls.map(x=>({table:x.table,method:x.opts?.method,bodyKeys:Object.keys(x.opts?.body||{}).sort()})),missingUriError,payloadStoredInDb:false},checks,pass:Object.values(checks).every(Boolean)};
fs.writeFileSync(path.join(__dirname,'SM089_AUTO_PACK_GENERATION_RESULT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exit(1);
