import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';

const root = path.resolve('/mnt/data/StoryMemory_CloudflarePreview_v3.3.6');
const html = fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const start = html.indexOf('const STORYMEMORY_HYBRID_AI_CONTRACT=');
const end = html.indexOf('\nconst storyMemoryHybridAI=createStoryMemoryHybridAIAdapter();', start);
assert.ok(start >= 0 && end > start, 'SM-057 factory block not found');
const factorySource = html.slice(start, end) + '\nthis.STORYMEMORY_HYBRID_AI_CONTRACT=STORYMEMORY_HYBRID_AI_CONTRACT; this.createStoryMemoryHybridAIAdapter=createStoryMemoryHybridAIAdapter;';
const sandbox = { console };
vm.createContext(sandbox);
vm.runInContext(factorySource, sandbox, {filename:'sm057-factory.js'});
const {createStoryMemoryHybridAIAdapter, STORYMEMORY_HYBRID_AI_CONTRACT} = sandbox;
assert.equal(typeof createStoryMemoryHybridAIAdapter,'function');

const book1 = JSON.parse(fs.readFileSync(path.join(root,'dist/content/iliad/book-01.json'),'utf8'));
assert.equal(book1.passages.length,146);
assert.equal(book1.passages[0].canonical_locator,'iliad:book:01:s1:row:001');
assert.equal(book1.passages[0].sequence,1);

const WORK_ID='79e2140e-4f88-4dc9-b66c-d587c779dc17';
const ACHILLES='b1934def-7c8c-47d6-ab89-5664ef357271';
const AGAMEMNON='0d3f8dc5-263f-4544-bffe-d668332034d3';
const SAFE_CARD='b47029f3-b473-46a6-ba5d-e055e5e49bfc';
const FUTURE_CARD='57000000-0000-4000-8000-000000000099';
const CURRENT='iliad:book:01:s1:row:001';
const FUTURE='iliad:book:01:s1:row:002';

const tables = {
  entities: [
    {id:ACHILLES,work_id:WORK_ID,entity_type:'person',canonical_name:'Achilles',normalized_key:'achilles',metadata:{}},
    {id:AGAMEMNON,work_id:WORK_ID,entity_type:'person',canonical_name:'Agamemnon',normalized_key:'agamemnon',metadata:{}}
  ],
  entity_aliases: [
    {id:'a1',work_id:WORK_ID,entity_id:ACHILLES,alias:'아킬레우스',normalized_alias:'아킬레우스',locale:'ko',metadata:{}},
    {id:'a2',work_id:WORK_ID,entity_id:AGAMEMNON,alias:'Atrides',normalized_alias:'atrides',locale:'en',metadata:{}}
  ],
  entity_mentions: [
    {id:'m1',work_id:WORK_ID,entity_id:ACHILLES,canonical_locator:CURRENT,source_sequence:1,source_text_hash:'safe',surface_text:'Achilles',metadata:{}},
    {id:'m2',work_id:WORK_ID,entity_id:ACHILLES,canonical_locator:FUTURE,source_sequence:2,source_text_hash:'future',surface_text:'Achilles',metadata:{}}
  ],
  entity_relationships: [
    {id:'r1',work_id:WORK_ID,from_entity_id:ACHILLES,to_entity_id:AGAMEMNON,relationship_type:'conflict_with',evidence_canonical_locator:CURRENT,evidence_sequence:1,first_visible_locator:CURRENT,first_visible_sequence:1,metadata:{}},
    {id:'r2',work_id:WORK_ID,from_entity_id:ACHILLES,to_entity_id:AGAMEMNON,relationship_type:'future_secret',evidence_canonical_locator:FUTURE,evidence_sequence:2,first_visible_locator:FUTURE,first_visible_sequence:2,metadata:{}}
  ],
  answer_cards: [
    {id:SAFE_CARD,work_id:WORK_ID,entity_id:ACHILLES,card_key:'who-is-achilles',question_key:'achilles:identity',route_class:'known_fact',answer_body:'아킬레우스는 일리아드의 핵심 그리스 영웅이며, 작품은 그의 분노를 노래하며 시작합니다.',first_visible_locator:CURRENT,first_visible_sequence:1,metadata:{},enabled:true},
    {id:FUTURE_CARD,work_id:WORK_ID,entity_id:ACHILLES,card_key:'future-achilles',question_key:'achilles:future',route_class:'known_fact',answer_body:'미래 스포일러',first_visible_locator:FUTURE,first_visible_sequence:2,metadata:{},enabled:true}
  ],
  answer_card_sources: [
    {answer_card_id:SAFE_CARD,source_passage_id:null,canonical_locator:CURRENT,source_sequence:1,source_text_hash:'safe',citation_order:0,citation_role:'primary'},
    {answer_card_id:FUTURE_CARD,source_passage_id:null,canonical_locator:FUTURE,source_sequence:2,source_text_hash:'future',citation_order:0,citation_role:'primary'}
  ],
  memories: [
    {id:'mem1',work_id:WORK_ID,source_passage_id:null,canonical_locator:CURRENT,source_sequence:1,unit_key:'book:01',semantic_page:0,content_version_key:'sm053-runtime-v1',source_preview:'Achilles wrath',memory_type:'note',title:'현재 기억',body:'아킬레우스와 아가멤논의 갈등',quote:'',metadata:{},created_at:'2026-08-26T00:00:00Z',updated_at:'2026-08-26T00:00:00Z'},
    {id:'mem2',work_id:WORK_ID,source_passage_id:null,canonical_locator:FUTURE,source_sequence:2,unit_key:'book:01',semantic_page:0,content_version_key:'sm053-runtime-v1',source_preview:'future',memory_type:'note',title:'미래 기억',body:'아킬레우스 미래 스포일러',quote:'',metadata:{},created_at:'2026-08-26T00:01:00Z',updated_at:'2026-08-26T00:01:00Z'}
  ]
};

function parseIn(v){
  const m=String(v||'').match(/^in\.\((.*)\)$/); return m ? m[1].split(',') : [];
}
const remoteAdapter = {
  async getWorkByKey(key){ return key==='iliad' ? {id:WORK_ID,work_key:'iliad'} : null; },
  async request(table,{query={}}={}){
    let rows = structuredClone(tables[table]||[]);
    if(query.work_id?.startsWith('eq.')) rows = rows.filter(r=>r.work_id===query.work_id.slice(3));
    if(query.enabled?.startsWith('eq.')) rows = rows.filter(r=>String(r.enabled)===query.enabled.slice(3));
    if(query.answer_card_id?.startsWith('in.(')){
      const ids=parseIn(query.answer_card_id); rows=rows.filter(r=>ids.includes(r.answer_card_id));
    }
    return rows;
  }
};
const staticAdapter = {
  async loadUnit({workKey,unitOrdinal,language}){
    assert.equal(workKey,'iliad'); assert.equal(language,'ko');
    if(unitOrdinal!==1) throw new Error('unexpected unit '+unitOrdinal);
    return {mode:'static',unit:{unit_key:book1.unit_key,unit_ordinal:book1.unit_ordinal,passages:structuredClone(book1.passages)}};
  }
};

const adapter = createStoryMemoryHybridAIAdapter({
  remoteAdapter, staticAdapter,
  contentResolver:x=>x,
  dbWorkKeyResolver:x=>x?.workKey,
  staticWorkKeyResolver:x=>x?.workKey
});

const args={question:'아킬레우스는 누구인가요?',content:{workKey:'iliad'},workKey:'iliad',staticWorkKey:'iliad',unitOrdinal:1,canonicalLocator:CURRENT,currentSequence:1,semanticPage:0};
const context=await adapter.buildContext(args);
assert.equal(context.schema,'storymemory-hybrid-ai-context-1.0');
assert.equal(context.version,'1.0.0');
assert.equal(context.position.canonical_locator,CURRENT);
assert.equal(context.position.current_sequence,1);
assert.equal(context.retrieval.remote_mode,'remote');
assert.equal(context.retrieval.static_mode,'static');
assert.deepEqual(Array.from(context.retrieval.loaded_units),[1]);
assert.ok(context.evidence.length>=1 && context.evidence.length<=STORYMEMORY_HYBRID_AI_CONTRACT.maxEvidencePassages);
assert.ok(context.retrieval.evidence_chars<=STORYMEMORY_HYBRID_AI_CONTRACT.maxEvidenceChars);
assert.ok(context.evidence.every(x=>Number(x.sequence)<=1),'future static evidence leaked');
assert.ok(context.evidence.some(x=>x.canonical_locator===CURRENT),'current static passage missing');
assert.ok(context.knowledge.answerCards.some(x=>x.id===SAFE_CARD),'safe answer card missing');
assert.ok(!context.knowledge.answerCards.some(x=>x.id===FUTURE_CARD),'future answer card leaked');
assert.ok(context.knowledge.relationships.some(x=>x.relationship_type==='conflict_with'),'safe relationship missing');
assert.ok(!context.knowledge.relationships.some(x=>x.relationship_type==='future_secret'),'future relationship leaked');
assert.ok(context.knowledge.memories.some(x=>x.id==='mem1'),'safe memory missing');
assert.ok(!context.knowledge.memories.some(x=>x.id==='mem2'),'future memory leaked');
assert.ok(context.knowledge.answerCardSources.some(x=>x.canonical_locator===CURRENT),'citation locator missing');
assert.equal(context.policy.full_book_body_sent,false);
assert.equal(context.policy.no_future_sequence,true);
assert.equal(context.policy.spoiler_safe,true);
const serialized=JSON.stringify(context);
assert.ok(!serialized.includes('text_content'),'DB full body field leaked');
assert.ok(serialized.length < 30000,'context unexpectedly unbounded');

const deterministic=await adapter.answer(args);
assert.equal(deterministic.route,'KNOWN_FACT');
assert.equal(deterministic.providerMode,'deterministic');
assert.match(deterministic.body,/아킬레우스/);
assert.match(deterministic.source,/iliad:book:01:s1:row:001/);

let providerPayload=null;
adapter.setProvider(async payload=>{providerPayload=structuredClone(payload);return {route:'SUPPORTED_TEXT',title:'Provider fixture',body:'bounded provider answer',source:CURRENT};});
const external=await adapter.answer(args);
assert.equal(external.providerMode,'external');
assert.equal(external.body,'bounded provider answer');
assert.ok(providerPayload && providerPayload.context);
assert.equal(providerPayload.context.policy.full_book_body_sent,false);
assert.ok(providerPayload.context.evidence.length<=6);
assert.ok(JSON.stringify(providerPayload).length<30000);
assert.ok(!JSON.stringify(providerPayload).includes('text_content'));
assert.ok(!('passages' in providerPayload.context), 'top-level full passages payload should not exist');

const offlineAdapter=createStoryMemoryHybridAIAdapter({
  remoteAdapter:null, staticAdapter,
  contentResolver:x=>x,
  dbWorkKeyResolver:x=>x?.workKey,
  staticWorkKeyResolver:x=>x?.workKey
});
const offline=await offlineAdapter.answer(args);
assert.equal(offline.context.retrieval.remote_mode,'unavailable');
assert.equal(offline.context.retrieval.static_mode,'static');
assert.ok(offline.context.evidence.some(x=>x.canonical_locator===CURRENT));
assert.equal(offline.route,'SUPPORTED_TEXT');
assert.ok(offline.context.evidence.every(x=>Number(x.sequence)<=1));

const result={
  status:'PASS',
  schema:context.schema,
  version:context.version,
  current_locator:CURRENT,
  current_sequence:1,
  remote_mode:context.retrieval.remote_mode,
  static_mode:context.retrieval.static_mode,
  loaded_units:Array.from(context.retrieval.loaded_units),
  evidence_count:context.evidence.length,
  evidence_chars:context.retrieval.evidence_chars,
  max_evidence_passages:STORYMEMORY_HYBRID_AI_CONTRACT.maxEvidencePassages,
  max_evidence_chars:STORYMEMORY_HYBRID_AI_CONTRACT.maxEvidenceChars,
  safe_answer_card:true,
  future_answer_card_excluded:true,
  safe_relationship:true,
  future_relationship_excluded:true,
  safe_memory:true,
  future_memory_excluded:true,
  no_future_static_evidence:true,
  full_book_body_sent:context.policy.full_book_body_sent,
  provider_packet_bounded:true,
  deterministic_route:deterministic.route,
  offline_static_fallback_route:offline.route,
  source_passage_first_en:book1.passages[0].en.slice(0,120),
  source_passage_first_ko:book1.passages[0].ko.slice(0,120)
};
fs.writeFileSync(path.join(root,'QA_EVIDENCE/SM058_HYBRID_AI_REGRESSION_RESULT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
