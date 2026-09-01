const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const html=fs.readFileSync('/mnt/data/StoryMemory_CloudflarePreview_v3.3.6/dist/index.html','utf8');

function extract(start,end){
  const a=html.indexOf(start); if(a<0)throw new Error('missing start '+start);
  const b=html.indexOf(end,a); if(b<0)throw new Error('missing end '+end);
  return html.slice(a,b);
}

(async()=>{
  const calls=[];
  const works=[
    ['iliad','w1'],['odyssey','w2'],['aeneid','w3'],['metamorphoses','w4'],['paradise-lost','w5'],['divine-comedy','w6'],['bible-demo-work','w7'],['reading-copy-work','w8']
  ].map(([work_key,id])=>({id,work_key,title:work_key,author:null,work_type:'book',metadata:{},source_id:'s'}));
  const versions=Array.from({length:6},(_,i)=>({id:'v'+i,work_id:'w'+(i+1),source_id:'s',version_key:'sm053-runtime-v1',runtime_schema:'storymemory-static-content-1.0',build_id:'SM-053',delivery_mode:'static-unit-json',catalog_path:'content/catalog.json',catalog_hash:'x',manifest_path:'m',manifest_hash:'h',package_hash:'p',package_drive_id:'d',status:'active',metadata:{}}));
  const units=Array.from({length:185},(_,i)=>({id:'u'+i,content_version_id:'v0',work_id:'w1',unit_key:'book:01',unit_kind:'book',unit_ordinal:i+1,label:'Unit',static_asset_path:'content/x.json',metadata:{}}));
  function response(payload,status=200){return {ok:status>=200&&status<300,status,async text(){return JSON.stringify(payload)}}}
  async function fetchImpl(url,opts={}){
    calls.push({url,opts,body:opts.body?JSON.parse(opts.body):null});
    const path=new URL(url).pathname.split('/').pop();
    if(path==='works')return response(works);
    if(path==='sources')return response([]);
    if(path==='content_versions')return response(versions);
    if(path==='content_unit_index')return response(units);
    if(['entities','entity_aliases','entity_mentions','entity_relationships','answer_cards','answer_card_sources','memories','annotations','reader_progress'].includes(path))return response([]);
    if(['source_passages','passage_translations'].includes(path))throw new Error('FORBIDDEN_LEGACY_BODY_REQUEST:'+path);
    return response([]);
  }
  const ctx={URLSearchParams,URL,console,fetch:fetchImpl}; ctx.globalThis=ctx;
  vm.createContext(ctx);
  let adapterCode=extract('const STORYMEMORY_REMOTE_CONFIG = Object.freeze({','let storyMemoryRemote = createStoryMemoryRemoteAdapter();');
  adapterCode+='\nglobalThis.createStoryMemoryRemoteAdapter=createStoryMemoryRemoteAdapter;globalThis.STORYMEMORY_RUNTIME_CONTRACT=STORYMEMORY_RUNTIME_CONTRACT;';
  vm.runInContext(adapterCode,ctx);
  const adapter=ctx.createStoryMemoryRemoteAdapter({fetchImpl,tokenProvider:async()=> 'jwt'});
  assert.equal(adapter.runtimeContract.legacyDbBodyRemote,false);
  const status=await adapter.runtimeStatus();
  assert.equal(status.observedMainRegistry.activeContentVersions,6);
  assert.equal(status.observedMainRegistry.contentUnitIndex,185);
  assert.equal(status.registryMatchesExpected,true);
  await adapter.listContentEntities({workId:'w1'});
  await adapter.listEntityMentions({workId:'w1'});
  await adapter.listEntityRelationships({workId:'w1',currentSequence:10});
  await adapter.listAnswerCards({workId:'w1',currentSequence:10});
  let legacyError='';
  try{await adapter.loadContentSlice({workKey:'iliad'});}catch(e){legacyError=e.message}
  assert.equal(legacyError,'LEGACY_DB_BODY_REMOTE_DISABLED');
  assert.equal(calls.some(x=>x.url.includes('/source_passages')),false);
  assert.equal(calls.some(x=>x.url.includes('/passage_translations')),false);
  const bibleBlock=extract('async function storyMemoryLoadBibleChapter(ctx,{adapter=storyMemoryRemote,staticAdapter=storyMemoryStatic,forceRemote=false}={}){','async function storyMemoryLoadReaderContent(ctx,options={}){');
  assert(bibleBlock.includes("if(!legacyDbBodyRemote)return {mode:'fallback',reason:'STATIC_BIBLE_SOURCE_NOT_AVAILABLE'"));
  const entityCall=calls.find(x=>x.url.includes('/entities?'));
  assert(entityCall && !decodeURIComponent(entityCall.url).includes('summary'));
  const mentionCall=decodeURIComponent(calls.find(x=>x.url.includes('/entity_mentions?')).url);
  assert(mentionCall.includes('canonical_locator')&&mentionCall.includes('source_sequence')&&mentionCall.includes('source_text_hash'));
  const relCall=decodeURIComponent(calls.find(x=>x.url.includes('/entity_relationships?')).url);
  assert(relCall.includes('evidence_canonical_locator')&&relCall.includes('first_visible_locator'));
  const cardCall=decodeURIComponent(calls.find(x=>x.url.includes('/answer_cards?')).url);
  assert(cardCall.includes('first_visible_locator'));

  // Execute the canonical user-state payload helpers with production-like stubs.
  const syncCtx={console,Date,Number,String,encodeURIComponent}; syncCtx.globalThis=syncCtx;
  syncCtx.storyMemoryResolveContent=(x)=>{
    const key=typeof x==='object'?x?.contentId:x;
    if(key==='book:iliad'||key==='일리아드')return {id:'book:iliad',kind:'prose',title:'일리아드'};
    return null;
  };
  syncCtx.storyMemoryDbWorkKey=(c)=>c?.id==='book:iliad'?'iliad':null;
  syncCtx.storyMemoryResumeForContext=()=>null;
  syncCtx.STORYMEMORY_BIBLE_USFM_CODES={};
  syncCtx.annotationColor=()=> '#test';
  vm.createContext(syncCtx);
  let syncCode=extract('function storyMemorySyncContent(record={}){','function remoteTimestamp(row){');
  syncCode+='\nglobalThis.serverMemoryPayload=serverMemoryPayload;globalThis.serverAnnotationPayload=serverAnnotationPayload;globalThis.storyMemorySyncExactPosition=storyMemorySyncExactPosition;globalThis.workKeyForRecord=workKeyForRecord;';
  vm.runInContext(syncCode,syncCtx);
  const exact={contentId:'book:iliad',context:'일리아드',page:2,unitOrdinal:1,canonicalLocator:'iliad:book:01:s1:row:003',sourceSequence:3,sourcePreview:'source preview',authoritative:true,clientRecordId:'c1',clientUpdatedAt:1,type:'hl-yellow',text:'Achilles',kind:'note',body:'note'};
  assert.equal(syncCtx.workKeyForRecord(exact),'iliad');
  const ann=syncCtx.serverAnnotationPayload(exact,'w1');
  assert.equal(ann.canonical_locator,'iliad:book:01:s1:row:003');
  assert.equal(ann.source_sequence,3);
  assert.equal(ann.unit_key,'book:01');
  assert.equal(ann.content_version_key,'sm053-runtime-v1');
  const mem=syncCtx.serverMemoryPayload(exact,'w1');
  assert.equal(mem.canonical_locator,ann.canonical_locator);
  assert.equal(mem.source_preview,'source preview');
  let legacyAnn='';
  try{syncCtx.serverAnnotationPayload({contentId:'book:iliad',context:'일리아드',clientRecordId:'c2',text:'legacy',type:'hl-yellow'},'w1')}catch(e){legacyAnn=e.message}
  assert.equal(legacyAnn,'CANONICAL_LOCATOR_REQUIRED_FOR_ANNOTATION_SYNC');

  // Static assertions for the sync loop: no synthetic legacy locator for progress writes.
  const progressBlock=extract('async function pushLocalProgress(adapter,works){','function setSyncUI(state,label){');
  assert(progressBlock.includes('if(!pos.canonicalLocator){skipped++;continue}'));
  assert(progressBlock.includes('canonical_locator:pos.canonicalLocator'));
  assert(!progressBlock.includes('canonicalLocatorForLocal('));
  const authInstallBlock=extract('function installStoryMemoryAuthBridge(bridge={}){','function openAuthGate(){');
  assert(authInstallBlock.includes('storyMemoryEnableRemote(tokenProvider)'));
  assert(authInstallBlock.includes('__smRemoteReady=false'));

  const result={
    pass:true,
    runtimeContract:adapter.runtimeContract,
    registry:status.observedMainRegistry,
    registryMatchesExpected:status.registryMatchesExpected,
    legacyBodyRequests:calls.filter(x=>/source_passages|passage_translations/.test(x.url)).length,
    canonicalKnowledgeFields:true,
    annotationCanonicalPayload:true,
    progressCanonicalOnly:true,
    legacyAnnotationRejected:true,
    bibleLegacyBodyFallbackDisabled:true,
    authSessionAutoActivatesRemote:true,
    totalMockApiCalls:calls.length
  };
  fs.writeFileSync('/mnt/data/StoryMemory_CloudflarePreview_v3.3.6/QA_EVIDENCE/SM058_PRODUCTION_RUNTIME_CONTRACT_RESULT.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
