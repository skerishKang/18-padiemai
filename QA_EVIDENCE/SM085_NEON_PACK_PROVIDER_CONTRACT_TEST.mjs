import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const require=createRequire(import.meta.url);
const {createStoryMemoryNeonPackRegistryProvider}=require(path.join(root,'dist/storymemory-pack-marketplace-runtime.js'));
const calls=[];
const fake={async request(table,opts={}){calls.push({table,method:opts.method||'GET',query:opts.query||{},body:opts.body||null,prefer:opts.prefer||null});
  if(table==='pack_registry')return [{pack_id:'pack:test',name:'Test',pack_type:'search',creator_id:'creator',publisher_name:'QA',summary:'No body',visibility:'public',pricing_mode:'free',publication_status:'published',latest_version:'1.0.0',source_text_included:false,rights_declaration:{sourceBody:'excluded'},compatibility_summary:{workKey:'odyssey'},permissions:{},processing_disclosure:{aiGenerated:true},listing_metadata:{},created_at:null,updated_at:null}];
  if(table==='pack_versions')return [{pack_id:'pack:test',version:'1.0.0',schema_version:'storymemory-precision-pack-1.0',artifact_uri:'packs/test.json',artifact_fingerprint:'fnv1a:test',declared_trust_tier:'curated',source_match_mode:'source-id',compatibility:{sourceId:'book:test'},rights:{sourceTextIncluded:false},changelog:'x',parent_version:null,created_at:null}];
  if(table==='pack_attestations')return [{id:'att:1',pack_id:'pack:test',version:'1.0.0',verifier_id:'registry',verifier_kind:'registry',tier:'curated',verification_scope:{claims:['alias']},source_fingerprint:null,status:'valid',issued_at:null,expires_at:null,revoked_at:null,metadata:{}}];
  if(table==='pack_installs'&&(!opts.method||opts.method==='GET'))return [];
  if(table==='pack_installs'&&opts.method==='POST')return [opts.body];
  if(table==='pack_installs'&&opts.method==='DELETE')return null;
  throw new Error('UNEXPECTED_TABLE:'+table);
}};
const bridge=createStoryMemoryNeonPackRegistryProvider({remoteAdapter:fake,getUserId:()=> 'user-1'});
const listings=await bridge.list();
await bridge.installProvider.list();
const up=await bridge.installProvider.upsert({packId:'pack:test',version:'1.0.0',sourceIdentity:'book:test',sourceFingerprint:'fp',installStatus:'installed',autoUpdate:false,settings:{}});
await bridge.installProvider.remove('pack:test','book:test');
const checks={
  joins_metadata:listings.length===1&&listings[0].versions.length===1&&listings[0].attestations.length===1&&listings[0].attestations[0].trusted===true,
  public_filter:calls.find(x=>x.table==='pack_registry')?.query?.publication_status==='eq.published'&&calls.find(x=>x.table==='pack_registry')?.query?.visibility==='eq.public',
  no_pack_payload_table:!calls.some(x=>x.table.includes('payload')||x.table.includes('knowledge')),
  install_user_bound:up.user_id==='user-1'&&up.pack_id==='pack:test'&&up.source_identity==='book:test',
  upsert_conflict_key:calls.some(x=>x.table==='pack_installs'&&x.method==='POST'&&x.query?.on_conflict==='user_id,pack_id,source_identity'),
  delete_is_scoped:calls.some(x=>x.table==='pack_installs'&&x.method==='DELETE'&&x.query?.pack_id==='eq.pack:test'&&x.query?.source_identity==='eq.book:test')
};
const result={schema:'storymemory-sm085-neon-pack-provider-contract-1.0',calls,checks,pass:Object.values(checks).every(Boolean)};
fs.writeFileSync(path.join(__dirname,'SM085_NEON_PACK_PROVIDER_CONTRACT_RESULT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exit(1);
