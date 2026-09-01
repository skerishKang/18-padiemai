import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html=await fs.readFile('/mnt/data/StoryMemory_CloudflarePreview_v3.3.6/dist/index.html','utf8');
const a=html.indexOf('/* ===== StoryMemory v3.3.3 — Static Content Adapter =====');
const b=html.indexOf('/* ===== StoryMemory v3.2.2 — Remote Content Repository Foundation =====',a);
assert.ok(a>=0&&b>a,'static adapter block missing');
const staticBlock=html.slice(a,b);
const r0=html.indexOf('function createStoryMemoryContentRepository({adapter=storyMemoryRemote,staticAdapter=storyMemoryStatic}={}){');
const r1=html.indexOf('const storyMemoryContentRepository=createStoryMemoryContentRepository();',r0);
assert.ok(r0>=0&&r1>r0,'repository block missing');
const repoBlock=html.slice(r0,r1);

const root='/mnt/data/StoryMemory_CloudflarePreview_v3.3.6/dist';
const contents={
  'book:iliad':{id:'book:iliad',kind:'prose',title:'일리아드'},
  'book:odyssey':{id:'book:odyssey',kind:'prose',title:'오디세이'}
};
const context={
  console,
  window:{},
  __smDynamicReaderState:{mode:'fallback'},
  __smRemoteReady:false,
  STORYMEMORY_READER_BINDING_CONTRACT:{proseUnitSequenceStride:100000},
  storyMemoryRemote:{},
  storyMemoryResolveContent(input){
    if(typeof input==='string') return contents[input]||Object.values(contents).find(x=>x.title===input)||null;
    if(input?.id)return contents[input.id]||input;
    return null;
  },
  storyMemoryCreateSourceRef(input){return {...input}},
  storyMemoryFallbackContentSlice(content,{limit=200}={}){return {mode:'fallback',reason:'PROTOTYPE_READER',content,work:null,passages:[]}},
  storyMemoryDbWorkKey(){return null;},
};
context.fetch=async function(rel){
  const full=path.join(root,String(rel));
  try{
    const text=await fs.readFile(full,'utf8');
    return {ok:true,status:200,json:async()=>JSON.parse(text)};
  }catch(e){return {ok:false,status:404,json:async()=>({})};}
};
vm.createContext(context);
vm.runInContext(staticBlock+'\n'+repoBlock,context);

const catalog=await context.window.storyMemoryStatic.getCatalog();
assert.equal(catalog.works.length,6);
assert.equal(catalog.totals.bilingual_passages,12628);
for(const w of catalog.works){
  const {manifest}=await context.window.storyMemoryStatic.getManifest(w.work_key);
  assert.equal(manifest.unit_count,w.unit_count);
  assert.equal(manifest.passage_count,w.passage_count);
  const first=await context.window.storyMemoryStatic.loadUnit({workKey:w.work_key,unitOrdinal:1});
  const last=await context.window.storyMemoryStatic.loadUnit({workKey:w.work_key,unitOrdinal:w.unit_count});
  assert.equal(first.unit.passages.length,first.unitMeta.passage_count);
  assert.equal(last.unit.passages.length,last.unitMeta.passage_count);
}
const repo=vm.runInContext('createStoryMemoryContentRepository({adapter:storyMemoryRemote,staticAdapter:storyMemoryStatic})',context);
const bundle=await repo.loadSlice('book:odyssey',{fromSequence:1600001,toSequence:1699999,limit:600,language:'ko'});
assert.equal(bundle.mode,'static');
assert.equal(bundle.unitOrdinal,17);
assert.equal(bundle.passages.length,63);
const p=bundle.passages.find(x=>x.canonicalLocator==='odyssey:book:17:s1:row:004');
assert.ok(p,'canonical resume locator missing');
assert.equal(p.sequence,1600004);
assert.equal(p.language,'ko');
assert.ok(p.text.length>0&&p.sourceText.length>0);
context.__smDynamicReaderState={mode:'static'};
assert.equal(vm.runInContext('storyMemoryIsAuthoritativeReaderMode()',context),true);
context.__smDynamicReaderState={mode:'remote'};
assert.equal(vm.runInContext('storyMemoryIsAuthoritativeReaderMode()',context),true);
context.__smDynamicReaderState={mode:'fallback'};
assert.equal(vm.runInContext('storyMemoryIsAuthoritativeReaderMode()',context),false);
console.log(JSON.stringify({status:'PASS',catalogWorks:catalog.works.length,totalPassages:catalog.totals.bilingual_passages,odyssey17:bundle.passages.length,resumeLocator:p.canonicalLocator,resumeSequence:p.sequence,mode:bundle.mode},null,2));
