const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const staticRoot=path.join(root,'dist','content');
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const assert=(c,m)=>{if(!c)throw new Error(m)};

const staticAdapter={
  async getManifest(workKey){
    const manifest=readJson(path.join(staticRoot,workKey,'manifest.json'));
    return {manifest,entry:{work_key:workKey,title:manifest.title}};
  },
  async loadUnit({workKey,unitOrdinal}){
    const manifest=readJson(path.join(staticRoot,workKey,'manifest.json'));
    const unitMeta=manifest.units.find(x=>Number(x.unit_ordinal)===Number(unitOrdinal));
    const unit=readJson(path.join(staticRoot,workKey,unitMeta.path));
    return {manifest,unit,unitMeta,entry:{work_key:workKey,title:manifest.title}};
  }
};

global.document={documentElement:{dataset:{}}};
global.localStorage={getItem(key){
  if(key!=='storymemory.store.v1')return null;
  return JSON.stringify({schemaVersion:1,memories:[{id:'m1',contentId:'book:odyssey',context:'오디세이',canonicalLocator:'odyssey:book:17:s1:row:004',body:'Book 17 memory',createdAt:1}]});
}};
global.storyMemoryStatic=staticAdapter;
global.storyMemoryStaticWorkKey=content=>content?.id==='book:odyssey'?'odyssey':null;
global.storyMemoryResumeContent=()=>({id:'book:odyssey',title:'오디세이',kind:'book'});
global.storyMemoryExactResumeSnapshot=()=>({unitOrdinal:17,canonicalLocator:'odyssey:book:17:s1:row:004',sourceSequence:1600004,authoritative:true});

require(path.join(root,'dist','storymemory-universal-source-runtime.js'));
(async()=>{
  assert(typeof global.storyMemoryUniversalEnsureCurrentBookSource==='function','bridge helper missing');
  const ensured=await global.storyMemoryUniversalEnsureCurrentBookSource();
  assert(ensured.source.sourceId==='book:odyssey','source id');
  assert(ensured.source.structure.loadedUnits.includes(17),'unit 17 loaded');
  assert(ensured.position.locator==='odyssey:book:17:s1:row:004','exact locator bound');
  const ctx=await global.storyMemoryBuildUniversalCurrentContext('Who is Odysseus?');
  assert(ctx.source.sourceId==='book:odyssey','context source');
  assert(ctx.position.locator==='odyssey:book:17:s1:row:004','context locator');
  assert(ctx.memories.some(x=>x.body==='Book 17 memory'),'existing Memory bridge');
  assert(ctx.grounding.fullSourceSent===false,'bounded source');
  const result={status:'PASS',sourceId:ensured.source.sourceId,unitOrdinal:ensured.source.structure.loadedUnits[0],locator:ensured.position.locator,memoryBridge:ctx.memories.length,fullSourceSent:ctx.grounding.fullSourceSent,uiRebinding:false};
  fs.writeFileSync(path.join(__dirname,'SM082_CURRENT_READER_BRIDGE_RESULT.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
