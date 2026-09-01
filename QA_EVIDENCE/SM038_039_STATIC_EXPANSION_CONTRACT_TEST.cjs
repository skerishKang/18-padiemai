const fs=require('fs'); const path=require('path');
const window={};
let __smRemoteReady=false;
const contents={
 'book:iliad':{id:'book:iliad',kind:'prose',title:'일리아드'},
 'book:odyssey':{id:'book:odyssey',kind:'prose',title:'오디세이'},
 'book:crime-and-punishment':{id:'book:crime-and-punishment',kind:'prose',title:'죄와 벌'},
 'bible:1cor':{id:'bible:1cor',kind:'bible',title:'고린도전서'},
 'book:pride-and-prejudice':{id:'book:pride-and-prejudice',kind:'prose',title:'오만과 편견'},
 'book:alice-in-wonderland':{id:'book:alice-in-wonderland',kind:'prose',title:'이상한 나라의 앨리스'}
};
function storyMemoryResolveContent(input){ if(input&&typeof input==='object')return input; if(input==='성경')return contents['bible:1cor']; return contents[input]||Object.values(contents).find(x=>x.title===input)||null; }
function storyMemoryCreateSourceRef(input){return {...input};}
const STORYMEMORY_DB_WORK_KEYS={'book:iliad':'iliad','book:odyssey':'odyssey','book:crime-and-punishment':'crime-and-punishment','bible:1cor':'bible-web','book:pride-and-prejudice':'pride-and-prejudice','book:alice-in-wonderland':'alice-in-wonderland'};
function storyMemoryDbWorkKey(input){const c=storyMemoryResolveContent(input);return c?STORYMEMORY_DB_WORK_KEYS[c.id]||null:null;}
const STORYMEMORY_READER_BINDING_CONTRACT={proseUnitSequenceStride:100000};
const STORYMEMORY_STATIC_CONTENT_CONFIG=Object.freeze({
  basePath:'content',
  catalogPath:'content/catalog.json',
  schemaVersion:'storymemory-static-content-1.0'
});
const STORYMEMORY_STATIC_WORK_KEYS=Object.freeze({
  'book:iliad':'iliad',
  'book:odyssey':'odyssey',
  'book:crime-and-punishment':'crime-and-punishment',
  'bible:1cor':'bible-web',
  'book:pride-and-prejudice':'pride-and-prejudice',
  'book:alice-in-wonderland':'alice-in-wonderland'
});
function storyMemoryStaticWorkKey(input){
  const content=storyMemoryResolveContent(input);
  return content?STORYMEMORY_STATIC_WORK_KEYS[content.id]||null:null;
}
function createStoryMemoryStaticAdapter({fetchImpl=(...args)=>fetch(...args),config=STORYMEMORY_STATIC_CONTENT_CONFIG}={}){
  let catalogPromise=null;
  const manifestPromises=new Map();
  const unitPromises=new Map();
  async function fetchJson(path){
    const res=await fetchImpl(path,{headers:{'Accept':'application/json'}});
    if(!res?.ok)throw new Error(`STATIC_CONTENT_${res?.status||'FETCH_FAILED'}:${path}`);
    return res.json();
  }
  async function getCatalog(){
    if(!catalogPromise)catalogPromise=fetchJson(config.catalogPath).then(c=>{
      if(c?.schema_version!==config.schemaVersion||!Array.isArray(c?.works))throw new Error('STATIC_CATALOG_SCHEMA_MISMATCH');
      return c;
    }).catch(error=>{catalogPromise=null;throw error});
    return catalogPromise;
  }
  async function getWorkEntry(workKey){
    const catalog=await getCatalog();
    return catalog.works.find(w=>w.work_key===workKey)||null;
  }
  async function getManifest(workKey){
    if(!manifestPromises.has(workKey))manifestPromises.set(workKey,(async()=>{
      const entry=await getWorkEntry(workKey);if(!entry)throw new Error(`STATIC_WORK_NOT_FOUND:${workKey}`);
      const manifest=await fetchJson(`${config.basePath}/${entry.manifest_path}`);
      if(manifest?.schema_version!==config.schemaVersion||manifest?.work_key!==workKey||!Array.isArray(manifest?.units))throw new Error(`STATIC_MANIFEST_SCHEMA_MISMATCH:${workKey}`);
      return {entry,manifest};
    })().catch(error=>{manifestPromises.delete(workKey);throw error}));
    return manifestPromises.get(workKey);
  }
  async function loadUnit({workKey,unitOrdinal,language='ko'}={}){
    if(!workKey)throw new Error('STATIC_WORK_KEY_REQUIRED');
    const ordinal=Math.max(1,Math.floor(Number(unitOrdinal)||1));
    const key=`${workKey}::ordinal:${ordinal}::${language}`;
    if(!unitPromises.has(key))unitPromises.set(key,(async()=>{
      const {entry,manifest}=await getManifest(workKey);
      const unitMeta=manifest.units.find(u=>Number(u.unit_ordinal)===ordinal);
      if(!unitMeta)throw new Error(`STATIC_UNIT_NOT_FOUND:${workKey}:${ordinal}`);
      const dir=String(entry.manifest_path||'').split('/').slice(0,-1).join('/');
      const path=`${config.basePath}/${dir?dir+'/':''}${unitMeta.path}`;
      const unit=await fetchJson(path);
      if(unit?.schema_version!==config.schemaVersion||unit?.work_key!==workKey||Number(unit?.unit_ordinal)!==ordinal||!Array.isArray(unit?.passages))throw new Error(`STATIC_UNIT_SCHEMA_MISMATCH:${workKey}:${ordinal}`);
      if(Number(unitMeta.passage_count)!==unit.passages.length)throw new Error(`STATIC_UNIT_COUNT_MISMATCH:${workKey}:${ordinal}`);
      return {entry,manifest,unitMeta,unit,path,language};
    })().catch(error=>{unitPromises.delete(key);throw error}));
    return unitPromises.get(key);
  }
  async function loadUnitByKey({workKey,unitKey,language='ko'}={}){
    if(!workKey)throw new Error('STATIC_WORK_KEY_REQUIRED');
    if(!unitKey)throw new Error('STATIC_UNIT_KEY_REQUIRED');
    const {manifest}=await getManifest(workKey);
    const unitMeta=manifest.units.find(u=>String(u.unit_key)===String(unitKey));
    if(!unitMeta)throw new Error(`STATIC_UNIT_KEY_NOT_FOUND:${workKey}:${unitKey}`);
    return loadUnit({workKey,unitOrdinal:unitMeta.unit_ordinal,language});
  }
  function clearCache(){catalogPromise=null;manifestPromises.clear();unitPromises.clear()}
  return Object.freeze({getCatalog,getWorkEntry,getManifest,loadUnit,loadUnitByKey,clearCache});
}
const storyMemoryStatic=createStoryMemoryStaticAdapter();
window.storyMemoryStatic=storyMemoryStatic;
window.createStoryMemoryStaticAdapter=createStoryMemoryStaticAdapter;
window.storyMemoryStaticWorkKey=storyMemoryStaticWorkKey;

function storyMemoryStaticPassageSourceRef(content,passage={},unit={}){
  const loc=passage?.locator&&typeof passage.locator==='object'?passage.locator:{};
  if(content?.kind==='bible'){
    const verseRaw=loc.verse==null?(passage.verse_label||''):String(loc.verse);
    const verseNums=(verseRaw.match(/\d+/g)||[]).map(Number).filter(Number.isFinite);
    return storyMemoryCreateSourceRef({
      id:passage.canonical_locator||'',contentId:content?.id||'',kind:'bible',title:content?.title||'',
      book:loc.book||unit.book_code||content?.title||'',chapter:Number(loc.chapter||unit.chapter_number||0)||null,
      verses:verseNums,location:passage.canonical_locator||'',quotePolicy:'reference-only'
    });
  }
  return storyMemoryCreateSourceRef({
    id:passage.canonical_locator||'',contentId:content?.id||'',kind:content?.kind||'prose',title:content?.title||'',
    chapter:Number(loc.chapter_index||loc.book_number||unit.chapter_number||unit.unit_ordinal||0)||null,
    location:passage.canonical_locator||'',quotePolicy:'reference-only'
  });
}
function storyMemoryNormalizeStaticUnit(content,bundle){
  const unit=bundle?.unit||{};
  const passages=(unit.passages||[]).map((row,index)=>{
    const rowLocator=row?.locator&&typeof row.locator==='object'?row.locator:{book_number:Number(unit.unit_ordinal||0)||null,section_id:row.section_id||null,pair_id:row.pair_id||null};
    return {
      id:row.canonical_locator||`${bundle.entry?.work_key||'work'}:${unit.unit_key||unit.unit_ordinal}:${index+1}`,
      canonicalLocator:row.canonical_locator||'',sequence:Number(row.sequence),
      sourceRef:storyMemoryStaticPassageSourceRef(content,row,unit),sourceText:row.en||'',
      text:row.ko||row.en||'',language:row.ko?'ko':'en',sourceHash:row.source_text_hash||null,
      translationHash:row.translation_text_hash||null,translationPolicy:row.translation_policy||(row.ko?'storymemory-derived-ko':null),
      metadata:{delivery:'static',sectionId:row.section_id||null,sectionTitle:row.section_title||null,pairId:row.pair_id||null,unitKey:unit.unit_key||null,assetPath:bundle.path||null},
      locator:rowLocator,chapterLabel:row.chapter_label||unit.unit_label||'',verseLabel:String(row.verse_label??rowLocator.verse??'')
    };
  });
  return {
    mode:'static',reason:'STATIC_CONTENT_READY',content,
    work:{work_key:bundle.entry?.work_key||unit.work_key,title:bundle.entry?.title||unit.work_title||content?.title||'',author:bundle.entry?.author||'',work_type:unit.work_type||bundle.manifest?.work_type||(content?.kind==='bible'?'scripture':'book'),metadata:{delivery:'static',schema:unit.schema_version}},
    unitOrdinal:Number(unit.unit_ordinal||1),unitMeta:bundle.unitMeta||null,passages
  };
}
function storyMemoryIsAuthoritativeReaderMode(mode=__smDynamicReaderState?.mode){return mode==='static'||mode==='remote'}
window.storyMemoryIsAuthoritativeReaderMode=storyMemoryIsAuthoritativeReaderMode;


const STORYMEMORY_BIBLE_USFM_CODES=Object.freeze({
  '창세기':'GEN','출애굽기':'EXO','레위기':'LEV','민수기':'NUM','신명기':'DEU','여호수아':'JOS','사사기':'JDG','룻기':'RUT',
  '사무엘상':'1SA','사무엘하':'2SA','열왕기상':'1KI','열왕기하':'2KI','역대상':'1CH','역대하':'2CH','에스라':'EZR','느헤미야':'NEH','에스더':'EST',
  '욥기':'JOB','시편':'PSA','잠언':'PRO','전도서':'ECC','아가':'SNG','이사야':'ISA','예레미야':'JER','예레미야애가':'LAM','에스겔':'EZK','다니엘':'DAN',
  '호세아':'HOS','요엘':'JOL','아모스':'AMO','오바댜':'OBA','요나':'JON','미가':'MIC','나훔':'NAM','하박국':'HAB','스바냐':'ZEP','학개':'HAG','스가랴':'ZEC','말라기':'MAL',
  '마태복음':'MAT','마가복음':'MRK','누가복음':'LUK','요한복음':'JHN','사도행전':'ACT','로마서':'ROM','고린도전서':'1CO','고린도후서':'2CO',
  '갈라디아서':'GAL','에베소서':'EPH','빌립보서':'PHP','골로새서':'COL','데살로니가전서':'1TH','데살로니가후서':'2TH','디모데전서':'1TI','디모데후서':'2TI',
  '디도서':'TIT','빌레몬서':'PHM','히브리서':'HEB','야고보서':'JAS','베드로전서':'1PE','베드로후서':'2PE','요한일서':'1JN','요한이서':'2JN','요한삼서':'3JN','유다서':'JUD','요한계시록':'REV'
});
let __smDynamicReaderState={generation:0,mode:'fallback',content:null,work:null,unitOrdinal:1,passages:[],pagePassages:[],pageSourceRefs:[],remoteError:null};

function storyMemoryReaderUnitOrdinal(ctx={}){
  const raw=ctx.unitOrdinal??ctx.bookNumber??ctx.unit??1;
  const n=Math.floor(Number(raw)||1);return Math.max(1,n);
}
function storyMemoryReaderProseSequenceRange(ctx={}){
  const unit=storyMemoryReaderUnitOrdinal(ctx),stride=STORYMEMORY_READER_BINDING_CONTRACT.proseUnitSequenceStride;
  return {unit,fromSequence:(unit-1)*stride+1,toSequence:unit*stride-1};
}
function storyMemoryReaderContentForContext(ctx={}){
  if((ctx.kind||'book')==='bible')return storyMemoryResolveContent('성경');
  return storyMemoryResolveContent(ctx.book||BOOKS[selected]?.title||'');
}
function storyMemoryNormalizeRemoteRows(content,work,rows=[],translationByPassageId={}){
  return (rows||[]).map(row=>{
    const tr=translationByPassageId?.[row.id]||null;
    return {
      id:row.id,canonicalLocator:row.canonical_locator,sequence:Number(row.sequence),
      sourceRef:storyMemoryRemotePassageSourceRef(content,row),sourceText:row.text_content,
      text:tr?.text_content||row.text_content,language:tr?.language||'en',sourceHash:row.text_hash||null,
      translationHash:tr?.text_hash||null,translationPolicy:tr?.translation_policy||null,
      metadata:row.metadata||{},locator:row.locator||{},chapterLabel:row.chapter_label||'',verseLabel:row.verse_label||''
    };
  });
}
async function storyMemoryLoadBibleChapter(ctx,{adapter=storyMemoryRemote,staticAdapter=storyMemoryStatic,forceRemote=false}={}){
  const content=storyMemoryReaderContentForContext(ctx);const workKey=storyMemoryDbWorkKey(content);
  if(!content||!workKey)return {mode:'fallback',content,work:null,passages:[]};
  const volume=ctx.volume||'고린도전서',chapter=Math.max(1,Number(ctx.chapter||1));
  const bookCode=STORYMEMORY_BIBLE_USFM_CODES[volume];
  if(!bookCode)return {mode:'fallback',content,work:null,passages:[]};
  let staticError=null;
  const staticWorkKey=storyMemoryStaticWorkKey(content);
  if(!forceRemote&&staticWorkKey&&typeof staticAdapter?.loadUnitByKey==='function'){
    try{
      const unitKey=`book:${bookCode}:chapter:${String(chapter).padStart(3,'0')}`;
      const staticBundle=await staticAdapter.loadUnitByKey({workKey:staticWorkKey,unitKey,language:'ko'});
      const normalized=storyMemoryNormalizeStaticUnit(content,staticBundle);
      if(normalized.passages.length)return {...normalized,reason:'STATIC_BIBLE_CHAPTER_READY'};
      staticError='STATIC_EMPTY';
    }catch(error){staticError=String(error?.message||error||'STATIC_BIBLE_CONTENT_ERROR')}
  }
  if(!forceRemote&&!__smRemoteReady)return {mode:'fallback',content,work:null,passages:[],staticError};
  if(typeof adapter?.request!=='function'||typeof adapter?.getWorkByKey!=='function')return {mode:'fallback',content,work:null,passages:[],staticError};
  const work=await adapter.getWorkByKey(workKey);if(!work)return {mode:'fallback',content,work:null,passages:[],staticError};
  const rows=await adapter.request('source_passages',{query:{
    select:'id,source_id,work_id,canonical_locator,chapter_label,verse_label,sequence,text_content,text_hash,metadata,locator,created_at',
    work_id:`eq.${work.id}`,'locator->>book':`eq.${bookCode}`,'locator->>chapter':`eq.${chapter}`,order:'sequence.asc',limit:250
  }});
  const translations=typeof adapter.listPassageTranslations==='function'?await adapter.listPassageTranslations({passageIds:(rows||[]).map(x=>x.id),language:'ko',limit:500}):[];
  const translationByPassageId=Object.fromEntries((translations||[]).map(x=>[x.source_passage_id,x]));
  const passages=storyMemoryNormalizeRemoteRows(content,work,rows||[],translationByPassageId);
  return passages.length?{mode:'remote',reason:'REMOTE_BIBLE_CHAPTER_READY',content,work,passages,staticError}:{mode:'fallback',content,work,passages:[],staticError};
}
async function storyMemoryLoadReaderContent(ctx,options={}){
  const adapter=options.adapter||storyMemoryRemote;
  const staticAdapter=options.staticAdapter||storyMemoryStatic;
  const repository=options.repository||createStoryMemoryContentRepository({adapter,staticAdapter});
  const forceRemote=Boolean(options.forceRemote);
  const content=storyMemoryReaderContentForContext(ctx);if(!content||content.kind==='private')return {mode:'fallback',reason:'PRIVATE_OR_UNKNOWN',content,work:null,passages:[]};
  if((ctx.kind||'book')==='bible')return storyMemoryLoadBibleChapter(ctx,{adapter,staticAdapter,forceRemote});
  const range=storyMemoryReaderProseSequenceRange(ctx);
  const bundle=await repository.loadSlice(content,{...range,limit:STORYMEMORY_READER_BINDING_CONTRACT.maxRemotePassages,language:'ko',preferStatic:true,preferRemote:forceRemote||__smRemoteReady});
  return {...bundle,unitOrdinal:bundle?.unitOrdinal||range.unit};
}


async function main(){
 const base='/mnt/data/sm038_039_runtime_builder_fixture_qa';
 async function fileFetch(rel){
  const p=path.join(base,rel);
  if(!fs.existsSync(p))return {ok:false,status:404,json:async()=>({})};
  return {ok:true,status:200,json:async()=>JSON.parse(fs.readFileSync(p,'utf8'))};
 }
 const adapter=createStoryMemoryStaticAdapter({fetchImpl:fileFetch});
 const mapping={
  iliad:storyMemoryStaticWorkKey(contents['book:iliad']),
  odyssey:storyMemoryStaticWorkKey(contents['book:odyssey']),
  crime:storyMemoryStaticWorkKey(contents['book:crime-and-punishment']),
  bible:storyMemoryStaticWorkKey(contents['bible:1cor']),
  pride:storyMemoryStaticWorkKey(contents['book:pride-and-prejudice']),
  alice:storyMemoryStaticWorkKey(contents['book:alice-in-wonderland'])
 };
 const expected={iliad:'iliad',odyssey:'odyssey',crime:'crime-and-punishment',bible:'bible-web',pride:'pride-and-prejudice',alice:'alice-in-wonderland'};
 if(JSON.stringify(mapping)!==JSON.stringify(expected))throw new Error('STATIC_MAPPING_MISMATCH:'+JSON.stringify(mapping));
 const bibleBundle=await adapter.loadUnitByKey({workKey:'bible-web',unitKey:'book:1CO:chapter:001',language:'ko'});
 const bibleNorm=storyMemoryNormalizeStaticUnit(contents['bible:1cor'],bibleBundle);
 const p=bibleNorm.passages[0];
 if(bibleNorm.mode!=='static'||p.locator.book!=='1CO'||Number(p.locator.chapter)!==1||String(p.verseLabel)!=='1'||p.sourceRef.book!=='1CO'||Number(p.sourceRef.chapter)!==1||!p.text.startsWith('검증 번역 '))throw new Error('BIBLE_NORMALIZATION_FAILED:'+JSON.stringify(p));
 const loaded=await storyMemoryLoadBibleChapter({kind:'bible',volume:'고린도전서',chapter:1},{adapter:{},staticAdapter:adapter,forceRemote:false});
 if(loaded.mode!=='static'||loaded.reason!=='STATIC_BIBLE_CHAPTER_READY'||loaded.passages.length!==1||loaded.passages[0].canonicalLocator!=='bible:web:1CO:1:1')throw new Error('STATIC_BIBLE_LOAD_FAILED:'+JSON.stringify(loaded));
 const crime=await adapter.loadUnit({workKey:'crime-and-punishment',unitOrdinal:1,language:'ko'});
 const crimeNorm=storyMemoryNormalizeStaticUnit(contents['book:crime-and-punishment'],crime);
 if(crimeNorm.passages.length!==1||!crimeNorm.passages[0].canonicalLocator.startsWith('crime-and-punishment:chapter:'))throw new Error('PROSE_STATIC_LOAD_FAILED');
 console.log(JSON.stringify({status:'PASS',mapping,bible:{unitKey:bibleBundle.unit.unit_key,locator:p.canonicalLocator,book:p.locator.book,chapter:p.locator.chapter,verse:p.verseLabel,mode:loaded.mode},crime:{locator:crimeNorm.passages[0].canonicalLocator,mode:crimeNorm.mode}},null,2));
}
main().catch(e=>{console.error(e.stack||e);process.exit(1)});
