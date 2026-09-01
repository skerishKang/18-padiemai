import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const runtime=require(path.join(root,'dist','storymemory-universal-source-runtime.js'));

function assert(cond,msg){if(!cond)throw new Error(msg)}
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));

const staticRoot=path.join(root,'dist','content');
const staticAdapter={
  async loadUnit({workKey,unitOrdinal}){
    const manifest=readJson(path.join(staticRoot,workKey,'manifest.json'));
    const meta=manifest.units.find(x=>Number(x.unit_ordinal)===Number(unitOrdinal));
    if(!meta)throw new Error(`unit missing ${workKey}/${unitOrdinal}`);
    const unit=readJson(path.join(staticRoot,workKey,meta.path));
    return {manifest,unit,unitMeta:meta,entry:{work_key:workKey,title:manifest.title||workKey}};
  }
};

const events=[];
const harness=runtime.createStoryMemoryUniversalSourceRuntime({staticAdapter});
harness.onStateChange(e=>events.push(e));

const book=await harness.ingest({
  sourceId:'odyssey-book-01',sourceType:'book',title:'Odyssey Book 01',workKey:'odyssey',unitOrdinal:1,
  revision:'sm053',fingerprint:'odyssey-sm053-book01',rightsMode:'public-domain',ownerScope:'public',metadata:{progressBounded:true}
});
assert(book.ingestState==='CONVERSATION_READY','book conversation ready');
assert(book.blockCount>10,'book blocks loaded');
assert(book.firstLocator.startsWith('odyssey:book:01:'),'book canonical locator');
const sourceBook=harness.listSources().find(x=>x.sourceId==='odyssey-book-01');
assert(sourceBook?.structure?.workKey==='odyssey','book structure workKey');

const bookUnit=readJson(path.join(staticRoot,'odyssey','book-01.json'));
const positionPassage=bookUnit.passages[Math.min(11,bookUnit.passages.length-1)];
harness.setPosition(book.sourceId,positionPassage.canonical_locator);
const bookRetrieval=await harness.retrieve({sourceId:book.sourceId,query:'Telemachus'});
assert(bookRetrieval.evidence.length>0,'book lexical retrieval');
assert(bookRetrieval.evidence.every(x=>Number(x.ordinal)<=Number(positionPassage.sequence)),'book progress boundary');

const documentSource=await harness.ingest({
  sourceId:'policy-pdf-v1',sourceType:'pdf',title:'Research Data Policy',revision:'2026-08-27',fingerprint:'policy-pdf-sha-fixture',
  pages:[
    {page:1,blocks:[{title:'Scope',text:'This policy governs research data handling for the Aurora study.'}]},
    {page:2,blocks:[{title:'Retention',text:'Research data must be retained for five years after project closure.'},{title:'Access',text:'Access is limited to authorized project members.'}]},
    {page:3,blocks:[{title:'Deletion',text:'After the retention period, approved deletion must be logged.'}]}
  ]
});
assert(documentSource.firstLocator==='doc:policy-pdf-v1:page:1:block:1','document stable locator');
assert(documentSource.blockCount===4,'document block count');
harness.setPosition(documentSource.sourceId,'doc:policy-pdf-v1:page:2:block:1');
const docRetrieval=await harness.retrieve({sourceId:documentSource.sourceId,query:'retained five years'});
assert(docRetrieval.evidence[0]?.locator==='doc:policy-pdf-v1:page:2:block:1','document lexical hit');

harness.addMemory({sourceId:documentSource.sourceId,locator:'doc:policy-pdf-v1:page:2:block:1',title:'Retention note',body:'Remember that the retention period is five years.'});
const docContext=await harness.buildContext({sourceId:documentSource.sourceId,question:'What is the retention period?'});
assert(docContext.memories.some(x=>x.body.includes('five years')),'user memory continuity');
assert(docContext.grounding.sourceRequiredForSourceSpecificFacts===true,'source grounding policy');
assert(docContext.modelPrior.allowed===true,'model prior enabled as reasoning aid');
assert(docContext.policy.noMandatoryKnowledgePrecompute===true,'no mandatory knowledge precompute');

const transcriptSource=await harness.ingest({
  sourceId:'retrieval-talk',sourceType:'youtube',title:'Retrieval Talk',revision:'capture-1',fingerprint:'retrieval-talk-fixture',url:'https://example.invalid/retrieval-talk',
  segments:[
    {startMs:0,endMs:20000,text:'Welcome. We will compare lexical and semantic retrieval.'},
    {startMs:20000,endMs:50000,text:'Lexical retrieval is cheap and precise for exact terms.'},
    {startMs:50000,endMs:80000,text:'Semantic retrieval should be added lazily when lexical search is insufficient.'}
  ]
});
assert(transcriptSource.firstLocator==='url:retrieval-talk:t:0-20000','transcript timestamp locator');
const transcriptHit=await harness.retrieve({sourceId:transcriptSource.sourceId,query:'semantic retrieval lazily'});
assert(transcriptHit.evidence[0]?.locator==='url:retrieval-talk:t:50000-80000','transcript lexical hit');

harness.attachPack(transcriptSource.sourceId,{
  id:'fixture-search-pack',kind:'search',version:'0.1.0',trustTier:'fixture',sourceFingerprint:transcriptSource.fingerprint,
  async search({query}){return query.toLowerCase().includes('semantic')?[{locator:'url:retrieval-talk:t:50000-80000',text:'Pack confirms lazy semantic escalation.'}]:[]}
});
const packed=await harness.answer({sourceId:transcriptSource.sourceId,question:'When should semantic retrieval be added?'});
assert(packed.context.packs.attached.length===1,'pack attached');
assert(packed.context.packs.evidence.length===1,'pack hook evidence');
assert(packed.route==='PACK_ASSISTED','pack-assisted deterministic route');

let providerSeen=null;
harness.setProvider(async payload=>{
  providerSeen=payload;
  return {route:'SOURCE_GROUNDED',title:'Provider answer',body:'Use semantic retrieval lazily when lexical retrieval is insufficient.',source:payload.context.evidence[0]?.locator||null};
});
const providerAnswer=await harness.answer({sourceId:transcriptSource.sourceId,question:'When should semantic retrieval be added?',modelPriorHints:['semantic retrieval may improve recall']});
assert(providerAnswer.providerMode==='external','provider hook');
assert(providerSeen.context.modelPrior.allowed===true,'provider receives model prior policy');
assert(providerSeen.context.grounding.fullSourceSent===false,'provider bounded source context');
assert(providerSeen.context.evidence.length<=harness.contract.maxEvidenceBlocks,'bounded evidence count');

let mismatchRejected=false;
try{harness.attachPack(documentSource.sourceId,{id:'bad-pack',sourceFingerprint:'wrong-fingerprint'})}catch(_){mismatchRejected=true}
assert(mismatchRejected,'pack fingerprint mismatch rejected');

const expectedStates=['RECEIVED','PARSING','STRUCTURING','SEARCH_READY','CONVERSATION_READY'];
for(const id of [book.sourceId,documentSource.sourceId,transcriptSource.sourceId]){
  const states=events.filter(x=>x.sourceId===id).map(x=>x.state);
  assert(expectedStates.every((x,i)=>states[i]===x),`ingest state sequence ${id}`);
}

const result={
  schema:harness.contract.schema,
  version:harness.contract.version,
  status:'PASS',
  sourceTypes:['book','pdf-document','url-transcript'],
  sourceCount:harness.status().sourceCount,
  checks:{
    book_static_adapter:'PASS',book_canonical_locator:'PASS',book_progress_boundary:'PASS',
    document_ingest:'PASS',document_stable_locator:'PASS',document_lexical_retrieval:'PASS',
    transcript_ingest:'PASS',transcript_timestamp_locator:'PASS',transcript_lexical_retrieval:'PASS',
    visible_ingest_states:'PASS',user_memory_continuity:'PASS',model_prior_policy:'PASS',source_grounding:'PASS',
    bounded_provider_context:'PASS',optional_pack_hook:'PASS',pack_fingerprint_guard:'PASS',mandatory_entity_graph_precompute:'NOT_REQUIRED'
  },
  counts:{bookBlocks:book.blockCount,documentBlocks:documentSource.blockCount,transcriptBlocks:transcriptSource.blockCount,providerEvidence:providerSeen.context.evidence.length,providerMemories:providerSeen.context.memories.length,attachedPacks:providerSeen.context.packs.attached.length},
  exampleLocators:{book:book.firstLocator,document:documentSource.firstLocator,transcript:transcriptSource.firstLocator}
};
console.log(JSON.stringify(result,null,2));
