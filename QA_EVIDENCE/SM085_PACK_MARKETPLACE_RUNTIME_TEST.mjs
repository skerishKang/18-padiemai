import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const require=createRequire(import.meta.url);
const {createStoryMemoryUniversalSourceRuntime}=require(path.join(root,'dist/storymemory-universal-source-runtime.js'));
const {createStoryMemoryPackMarketplaceRuntime,STORYMEMORY_PACK_REGISTRY_CONTRACT}=require(path.join(root,'dist/storymemory-pack-marketplace-runtime.js'));
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contentRoot=path.join(root,'dist/content');
const manifest=readJson(path.join(contentRoot,'odyssey/manifest.json'));
const staticAdapter={async loadUnit({workKey,unitOrdinal}){return {manifest:readJson(path.join(contentRoot,workKey,'manifest.json')),unit:readJson(path.join(contentRoot,workKey,`book-${String(unitOrdinal).padStart(2,'0')}.json`))}}};
const rt=createStoryMemoryUniversalSourceRuntime({staticAdapter});
const sourceId='book:odyssey-sm085';
await rt.ingest({sourceId,sourceType:'book',title:'The Odyssey',workKey:'odyssey',unitOrdinal:20,ownerScope:'public',revision:manifest.schema_version,fingerprint:manifest.provenance.canonical_source_sha256,language:'ko',metadata:{progressBounded:true,unitOrdinal:20,locatorScheme:'book',workKey:'odyssey'}});
rt.setPosition(sourceId,'odyssey:book:20:s6:row:006');
const catalogFile=readJson(path.join(root,'dist/packs/marketplace-catalog-v1.json'));
const publicListing=catalogFile.listings[0];
const privateListing={...publicListing,packId:'pack:private:hidden',name:'Private Hidden Pack',visibility:'private',publicationStatus:'draft',latestVersion:'1.0.0',versions:[{...publicListing.versions[0],packId:'pack:private:hidden'}]};
const paidListing={...publicListing,packId:'pack:paid:future',name:'Paid Future Pack',pricingMode:'paid',latestVersion:'1.0.0',versions:[{...publicListing.versions[0],packId:'pack:paid:future'}]};
const attestedListing={...publicListing,packId:'pack:odyssey:korean-alias-attested-qa',name:'Attested QA Alias Pack',versions:[{...publicListing.versions[0],packId:'pack:odyssey:korean-alias-attested-qa'}],attestations:[{id:'att:sm085:qa',packId:'pack:odyssey:korean-alias-attested-qa',version:'1.0.0',verifierId:'storymemory-registry-qa',verifierKind:'registry',tier:'curated',status:'valid',trusted:true,verificationScope:{qaOnly:true,claims:['artifact-compatibility']},metadata:{notProductionVerification:true}}]};
const artifacts=new Map([[publicListing.packId,readJson(path.join(root,'dist/packs/odyssey-korean-alias-public-v1.json'))]]);
artifacts.set(attestedListing.packId,{...artifacts.get(publicListing.packId),id:attestedListing.packId,name:attestedListing.name,artifactFingerprint:undefined});
artifacts.set(paidListing.packId,{...artifacts.get(publicListing.packId),id:paidListing.packId,name:paidListing.name,artifactFingerprint:undefined});
const installRows=[];
const installProvider={async list(){return installRows.map(x=>({...x}))},async upsert(row){const i=installRows.findIndex(x=>x.packId===row.packId&&x.sourceIdentity===row.sourceIdentity);if(i>=0)installRows[i]={...installRows[i],...row};else installRows.push({...row});return {...(i>=0?installRows[i]:installRows.at(-1))}},async remove(packId,sourceIdentity){const i=installRows.findIndex(x=>x.packId===packId&&x.sourceIdentity===sourceIdentity);if(i>=0)installRows.splice(i,1);return true}};
const market=createStoryMemoryPackMarketplaceRuntime({universalRuntime:rt,artifactLoader:async(uri,{listing})=>JSON.parse(JSON.stringify(artifacts.get(listing.packId))),installProvider});
market.replaceCatalog([publicListing,privateListing,paidListing,attestedListing]);
const source=rt.getSource(sourceId);
const baseline=await rt.retrieve({sourceId,query:'헬렌 처음 어디서 나왔지?',locator:'odyssey:book:20:s6:row:006'});
const baselineExact=baseline.relevantEvidence.some(x=>x.locator==='odyssey:book:04:s1:row:002');
const publicSearch=market.search({source,compatibleOnly:true});
const hiddenLeak=publicSearch.some(x=>x.packId===privateListing.packId);
const installed=await market.install(publicListing.packId,sourceId);
const improved=await rt.retrieve({sourceId,query:'헬렌 처음 어디서 나왔지?',locator:'odyssey:book:20:s6:row:006'});
const improvedExact=improved.relevantEvidence.some(x=>x.locator==='odyssey:book:04:s1:row:002');
const installedRows=await market.listInstalls();
const publicAttached=rt.listAttachedPacks(sourceId).find(x=>x.id===publicListing.packId);
await market.detach(publicListing.packId,sourceId);
const afterDetach=await rt.retrieve({sourceId,query:'헬렌 처음 어디서 나왔지?',locator:'odyssey:book:20:s6:row:006'});
let paidError=null;try{await market.install(paidListing.packId,sourceId)}catch(e){paidError=String(e.message||e)}
const attestedArtifact=artifacts.get(attestedListing.packId);const attested=await market.install(attestedListing.packId,sourceId);
const attestedAttached=rt.listAttachedPacks(sourceId).find(x=>x.id===attestedListing.packId);
const attestedAnswer=await rt.answer({sourceId,question:'헬렌 처음 어디서 나왔지?',locator:'odyssey:book:20:s6:row:006',trustMode:'GROUNDED'});
await market.uninstall(attestedListing.packId,sourceId);
let sourceLeakError=null;try{market.normalizeListing({...publicListing,packId:'pack:leak',sourceTextIncluded:true})}catch(e){sourceLeakError=String(e.message||e)}
const privatePublication=market.validatePublication({...privateListing,packId:'pack:private-data',visibility:'public',publicationStatus:'published',rightsDeclaration:{containsPrivateData:true}});
const incompatible={...publicListing,packId:'pack:wrong-fingerprint',versions:[{...publicListing.versions[0],packId:'pack:wrong-fingerprint',compatibility:{...publicListing.versions[0].compatibility,sourceFingerprint:'deadbeef'}}]};
market.mergeCatalog([incompatible]);
const incompatibleResult=market.sourceCompatible(source,market.getListing(incompatible.packId));
const checks={
 contract:STORYMEMORY_PACK_REGISTRY_CONTRACT.schema==='storymemory-pack-registry-1.0'&&STORYMEMORY_PACK_REGISTRY_CONTRACT.paidProcessingImplemented===false,
 public_discovery:publicSearch.some(x=>x.packId===publicListing.packId),
 private_not_leaked:hiddenLeak===false,
 compatible_filter:publicSearch.every(x=>x.compatibilityResult?.compatible===true),
 baseline_miss:baselineExact===false,
 install_attaches:installed.attached?.id===publicListing.packId&&Boolean(publicAttached),
 install_persisted:installedRows.some(x=>x.packId===publicListing.packId&&x.installStatus==='installed'),
 public_self_declared_not_verified:publicAttached?.trustTier==='unverified'&&publicAttached?.verifiedTier===false,
 pack_improves_retrieval:improvedExact===true,
 detach_restores_baseline:afterDetach.relevantEvidence.some(x=>x.locator==='odyssey:book:04:s1:row:002')===false,
 paid_processing_deferred:paidError==='PAID_ENTITLEMENT_REQUIRED_NOT_IMPLEMENTED',
 registry_attestation_effective:attestedAttached?.verifiedTier===true&&attestedAttached?.trustTier==='curated'&&attestedAttached?.attestation?.attestationId==='att:sm085:qa'&&attestedAttached?.attestation?.verifiedBy==='registry:storymemory-registry-qa',
 verified_answer_not_faked_by_attestation_only:attestedAnswer.provenance.label!=='VERIFIED',
 source_body_listing_blocked:sourceLeakError==='PACK_PUBLICATION_SOURCE_BODY_FORBIDDEN',
 private_data_publication_blocked:privatePublication.pass===false&&privatePublication.issues.includes('PRIVATE_SOURCE_PUBLICATION_FORBIDDEN'),
 wrong_fingerprint_blocked:incompatibleResult.compatible===false&&incompatibleResult.reason==='PACK_SOURCE_FINGERPRINT_MISMATCH',
 uninstall_clears_install:!(await market.listInstalls()).some(x=>x.packId===attestedListing.packId),
 source_unchanged:rt.getSource(sourceId).fingerprint===manifest.provenance.canonical_source_sha256
};
const result={schema:'storymemory-sm085-pack-marketplace-runtime-result-1.0',sourceFingerprint:source.fingerprint,catalog:{count:market.status().catalogCount,publicSearch:publicSearch.map(x=>({packId:x.packId,name:x.name,pricingMode:x.pricingMode,effectiveTrustTier:x.effectiveTrustTier,verified:x.verified,compatible:x.compatibilityResult?.compatible}))},baseline:{exactHelen:baselineExact},installed:{packId:installed.listing.packId,exactHelen:improvedExact,attached:publicAttached,installs:installedRows},attested:{attached:attestedAttached,answerProvenance:attestedAnswer.provenance},guards:{paidError,sourceLeakError,privatePublication,incompatibleResult},checks,pass:Object.values(checks).every(Boolean)};
fs.writeFileSync(path.join(__dirname,'SM085_PACK_MARKETPLACE_RUNTIME_RESULT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exit(1);
