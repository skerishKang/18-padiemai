import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const require=createRequire(import.meta.url);
const {createStoryMemoryUniversalSourceRuntime,STORYMEMORY_UNIVERSAL_SOURCE_CONTRACT}=require(path.join(root,'dist/storymemory-universal-source-runtime.js'));
const contentRoot=path.join(root,'dist/content');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=readJson(path.join(contentRoot,'odyssey/manifest.json'));
const staticAdapter={
  async loadUnit({workKey,unitOrdinal}){
    const mf=readJson(path.join(contentRoot,workKey,'manifest.json'));
    const unit=readJson(path.join(contentRoot,workKey,`book-${String(unitOrdinal).padStart(2,'0')}.json`));
    return {manifest:mf,unit};
  }
};
const rt=createStoryMemoryUniversalSourceRuntime({staticAdapter,packVerifier:({pack})=>pack?.id==='pack:odyssey:precision-demo:v1'?{trusted:true,effectiveTrustTier:'curated',attestationId:'qa:sm084:odyssey-demo',verifiedBy:'sm084-qa'}:{trusted:false,effectiveTrustTier:'unverified',attestationId:'qa:untrusted'}});
const fingerprint=manifest.provenance.canonical_source_sha256;
const revision=manifest.schema_version;
const sourceId='book:odyssey-sm084';
await rt.ingest({sourceId,sourceType:'book',title:'The Odyssey',workKey:'odyssey',unitOrdinal:20,ownerScope:'public',revision,fingerprint,language:'ko',metadata:{progressBounded:true,unitOrdinal:20,locatorScheme:'book',workKey:'odyssey'}});
rt.setPosition(sourceId,'odyssey:book:20:s6:row:006');
rt.addMemory({sourceId,locator:'odyssey:book:20:s6:row:006',title:'QA Memory',body:'Pack attach/detach must not remove me.'});
const baselineStatus=rt.status();
const baseline=await rt.retrieve({sourceId,query:'헬렌 처음 어디서 나왔지?',locator:'odyssey:book:20:s6:row:006'});
const baselineExact=baseline.relevantEvidence.some(x=>x.locator==='odyssey:book:04:s1:row:002');
const pack=readJson(path.join(root,'dist/packs/odyssey-precision-demo-v1.json'));
const compatibility=rt.checkPackCompatibility(sourceId,pack);
const attached=rt.attachPack(sourceId,pack);
const listAfterAttach=rt.listAttachedPacks(sourceId);
const selfDeclared={...pack,id:'pack:self-declared-curated',name:'Self Declared Curated'};
const selfDeclaredAttached=rt.attachPack(sourceId,selfDeclared);
const selfDeclaredContext=await rt.buildContext({sourceId,question:'필로이티오스 누구야?',locator:'odyssey:book:20:s6:row:006',trustMode:'GROUNDED'});
rt.detachPack(sourceId,selfDeclared.id);

const improved=await rt.retrieve({sourceId,query:'헬렌 처음 어디서 나왔지?',locator:'odyssey:book:20:s6:row:006'});
const improvedExact=improved.relevantEvidence.some(x=>x.locator==='odyssey:book:04:s1:row:002');
const context=await rt.buildContext({sourceId,question:'필로이티오스 누구야?',locator:'odyssey:book:20:s6:row:006',trustMode:'GROUNDED'});
const deterministic=await rt.answer({sourceId,question:'필로이티오스 누구야?',locator:'odyssey:book:20:s6:row:006',trustMode:'GROUNDED'});
const harnessPack={schema:'storymemory-precision-pack-1.0',id:'pack:odyssey:harness-demo:v1',name:'Odyssey Soft Harness Demo',kind:'harness',version:'1.0.0',priority:30,trustTier:'auto-generated',compatibility:{mode:'exact-fingerprint',sourceFingerprint:fingerprint,sourceRevision:revision,language:'ko',locatorScheme:'book'},payload:{policies:{answerStyle:'character-first concise explanation',citationPreference:'show locator when grounded',trustMode:'EXPLORE',revealAnswers:true,allowFuture:true}}};
rt.attachPack(sourceId,harnessPack);
const harnessContext=await rt.buildContext({sourceId,question:'필로이티오스 누구야?',locator:'odyssey:book:20:s6:row:006',trustMode:'GROUNDED'});
rt.detachPack(sourceId,harnessPack.id);
const verifiedPackEvidence=context.packs.evidence.filter(x=>x.verified&&x.sourceValidated);
let mismatchError=null;
try{rt.attachPack(sourceId,{...pack,id:'pack:wrong-fingerprint',compatibility:{...pack.compatibility,sourceFingerprint:'deadbeef'}})}catch(e){mismatchError=String(e.message||e)}
let revisionError=null;
try{rt.attachPack(sourceId,{...pack,id:'pack:wrong-revision',compatibility:{...pack.compatibility,sourceRevision:'stale-revision'}})}catch(e){revisionError=String(e.message||e)}
let artifactError=null;
try{rt.attachPack(sourceId,{...pack,id:'pack:bad-artifact',artifactFingerprint:'fnv1a:00000000'})}catch(e){artifactError=String(e.message||e)}
let missingIdentityError=null;
try{rt.attachPack(sourceId,{schema:'storymemory-precision-pack-1.0',id:'pack:no-identity',kind:'search',version:'1.0.0',payload:{aliases:[]}})}catch(e){missingIdentityError=String(e.message||e)}
const detached=rt.detachPack(sourceId,pack.id);
const listAfterDetach=rt.listAttachedPacks(sourceId);
const afterDetach=await rt.retrieve({sourceId,query:'헬렌 처음 어디서 나왔지?',locator:'odyssey:book:20:s6:row:006'});
const afterDetachExact=afterDetach.relevantEvidence.some(x=>x.locator==='odyssey:book:04:s1:row:002');
const finalStatus=rt.status();
const checks={
  schema:STORYMEMORY_UNIVERSAL_SOURCE_CONTRACT.packSchema==='storymemory-precision-pack-1.0',
  compatibility:compatibility.compatible===true,
  attached:listAfterAttach.some(x=>x.id===pack.id)&&attached.compatibilityReport.compatible===true,
  baseline_miss:baselineExact===false,
  pack_improves_exact_locator:improvedExact===true,
  pack_query_hint_used:improved.policy.packQueryHintsUsed===true,
  verified_requires_source_locator:verifiedPackEvidence.some(x=>x.packId===pack.id&&x.sourceRefs.includes('odyssey:book:20:s3:row:008')),
  verified_provenance:deterministic.provenance.label==='VERIFIED',
  verified_requires_attestation:attached.trustAttested===true&&attached.attestation?.attestationId==='qa:sm084:odyssey-demo',
  self_declared_curated_not_verified:selfDeclaredAttached.trustTier==='unverified'&&!selfDeclaredContext.packs.evidence.some(x=>x.packId===selfDeclared.id&&x.verified),
  harness_soft_policy_applied:harnessContext.packs.policyBundle.soft.some(x=>x.packId===harnessPack.id&&x.policies.answerStyle==='character-first concise explanation'),
  harness_hard_rules_blocked:['trustMode','revealAnswers','allowFuture'].every(key=>harnessContext.packs.policyBundle.blocked.some(x=>x.packId===harnessPack.id&&x.key===key)),
  harness_cannot_lower_grounded:harnessContext.trust.mode==='GROUNDED',
  fingerprint_mismatch_blocked:mismatchError==='PACK_SOURCE_FINGERPRINT_MISMATCH',
  revision_mismatch_blocked:revisionError==='PACK_SOURCE_REVISION_MISMATCH',
  artifact_mismatch_blocked:artifactError==='PACK_ARTIFACT_FINGERPRINT_MISMATCH',
  missing_identity_blocked:missingIdentityError==='PACK_COMPATIBILITY_IDENTITY_REQUIRED',
  detach_success:detached===true&&listAfterDetach.length===0,
  detach_restores_baseline:afterDetachExact===false,
  memory_preserved:baselineStatus.localMemoryCount===1&&finalStatus.localMemoryCount===1,
  precision_state_restored:rt.getSource(sourceId).precisionState==='BASE',
  no_provider_required:deterministic.providerMode==='deterministic'
};
const result={schema:'storymemory-sm084-precision-pack-runtime-result-1.0',runtimeVersion:STORYMEMORY_UNIVERSAL_SOURCE_CONTRACT.version,sourceFingerprint:fingerprint,packId:pack.id,baseline:{exactHelenFirstMention:baselineExact,queryHints:baseline.policy.queryHints,relevantLocators:baseline.relevantEvidence.map(x=>x.locator)},attached:{compatibility,pack:attached,list:listAfterAttach},improved:{exactHelenFirstMention:improvedExact,queryHints:improved.policy.queryHints,relevantLocators:improved.relevantEvidence.map(x=>x.locator)},verified:{evidence:verifiedPackEvidence,provenance:deterministic.provenance},guards:{mismatchError,revisionError,artifactError,missingIdentityError},detached:{detached,list:listAfterDetach,exactHelenFirstMention:afterDetachExact},checks,pass:Object.values(checks).every(Boolean)};
fs.writeFileSync(path.join(__dirname,'SM084_PRECISION_PACK_RUNTIME_RESULT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exit(1);
