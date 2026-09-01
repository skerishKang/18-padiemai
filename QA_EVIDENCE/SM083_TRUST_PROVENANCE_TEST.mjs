import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const lib=require(path.join(root,'dist','storymemory-universal-source-runtime.js'));
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

const h=lib.createStoryMemoryUniversalSourceRuntime({staticAdapter});

// 1) Fiction defaults to Explore and remains spoiler/progress bounded.
const fiction=await h.ingest({sourceId:'odyssey-b1',sourceType:'book',workKey:'odyssey',unitOrdinal:1,title:'Odyssey',metadata:{progressBounded:true}});
assert(fiction.recommendedTrustMode==='EXPLORE','fiction recommends Explore');
const bookUnit=readJson(path.join(staticRoot,'odyssey','book-01.json'));
const anchor=bookUnit.passages[10];
h.setPosition(fiction.sourceId,anchor.canonical_locator);
const futureCheck=await h.retrieve({sourceId:fiction.sourceId,query:'Odysseus',trustMode:'EXPLORE'});
assert(futureCheck.evidence.every(x=>Number(x.ordinal)<=Number(anchor.sequence)),'fiction spoiler boundary preserved');

// AI_NATIVE is allowed only in Explore when the provider gives no source citations.
h.setProvider(async()=>({body:'A broad literary explanation based on model knowledge.'}));
const aiNative=await h.answer({sourceId:fiction.sourceId,question:'Tell me something broad about epic poetry that is not stated here.'});
assert(aiNative.provenance.label==='AI_NATIVE','Explore uncited provider answer is AI_NATIVE');
assert(aiNative.validation.status==='PASS','Explore AI native allowed');

// 2) Grounded document requires citation for factual provider answers.
const doc=await h.ingest({
  sourceId:'research-policy',sourceType:'pdf',title:'Research Data Policy',metadata:{purpose:'research'},pages:[
    {page:1,blocks:[{title:'Scope',text:'This policy governs the Aurora research project.'}]},
    {page:2,blocks:[{title:'Retention',text:'Research data must be retained for five years after project closure.'}]}
  ]
});
assert(doc.recommendedTrustMode==='GROUNDED','research document recommends Grounded');
h.setProvider(async()=>({body:'The retention period is five years.'}));
const groundedBlocked=await h.answer({sourceId:doc.sourceId,question:'What is the retention period?',trustMode:'GROUNDED'});
assert(groundedBlocked.providerMode==='external-blocked','Grounded uncited factual answer blocked');
assert(groundedBlocked.provenance.label==='UNCERTAIN','Grounded uncited becomes uncertain');
assert(groundedBlocked.validation.issues.includes('CITATION_REQUIRED_FOR_FACTUAL_ANSWER'),'Grounded citation rule enforced');

h.setProvider(async()=>({body:'The retention period is five years.',sourceRefs:['doc:research-policy:page:2:block:1'],claims:[{kind:'number',text:'five years',exactValue:'five years',sourceRefs:['doc:research-policy:page:2:block:1']}]}));
const groundedPass=await h.answer({sourceId:doc.sourceId,question:'What is the retention period?',trustMode:'GROUNDED'});
assert(groundedPass.provenance.label==='SOURCE_GROUNDED','Grounded citation yields source grounded');
assert(groundedPass.validation.status==='PASS','Grounded supported claim passes');

// 3) Strict legal-like documents validate exact claims and allow UNKNOWN.
const contract=await h.ingest({
  sourceId:'service-contract',sourceType:'contract',title:'Service Contract',metadata:{sourceProfile:'contract',extractionQuality:{status:'HIGH',score:0.99}},pages:[
    {page:4,blocks:[{title:'Section 8 - Termination',text:'Either party may terminate this agreement with 30 days written notice.'}]},
    {page:5,blocks:[{title:'Section 9 - Renewal',text:'This agreement renews for one year unless notice is given under Section 8.'}]}
  ]
});
assert(contract.recommendedTrustMode==='STRICT','contract recommends Strict');
h.setProvider(async()=>({body:'Termination requires 30 days written notice.',sourceRefs:['doc:service-contract:page:4:block:1'],claims:[{kind:'clause',text:'30 days written notice',exactValue:'30 days',sourceRefs:['doc:service-contract:page:4:block:1']}]}));
const strictPass=await h.answer({sourceId:contract.sourceId,question:'What is the termination notice period?',trustMode:'STRICT'});
assert(strictPass.validation.status==='PASS','Strict exact supported claim passes');
assert(strictPass.provenance.label==='SOURCE_GROUNDED','Strict supported answer grounded');

h.setProvider(async()=>({body:'Termination requires 60 days notice.',sourceRefs:['doc:service-contract:page:4:block:1'],claims:[{kind:'number',text:'60 days',exactValue:'60 days',sourceRefs:['doc:service-contract:page:4:block:1']}]}));
const strictWrong=await h.answer({sourceId:contract.sourceId,question:'What is the termination notice period?',trustMode:'STRICT'});
assert(strictWrong.providerMode==='external-blocked','Strict unsupported exact claim blocked');
assert(strictWrong.provenance.label==='UNCERTAIN','Strict wrong exact claim becomes uncertain');
assert(strictWrong.validation.issues.includes('UNSUPPORTED_NUMBER'),'Strict exact value validator active');

h.setProvider(async()=>({body:'The contract requires arbitration in Seoul.'}));
const strictUnknown=await h.answer({sourceId:contract.sourceId,question:'Where must arbitration take place?',trustMode:'STRICT'});
assert(strictUnknown.provenance.label==='UNCERTAIN','Strict absent fact returns uncertain');
assert(/UNKNOWN|confirm|확인|근거|조건/i.test(strictUnknown.title+' '+strictUnknown.body),'Strict unknown user-visible');

// 4) Pack provenance: unverified pack -> PACK_ASSISTED, curated pack -> VERIFIED.
const packDoc=await h.ingest({sourceId:'manual-v1',sourceType:'document',title:'Machine Manual',pages:[{page:1,blocks:[{text:'The device enters safe mode when sensor A is disconnected.'}]}]});
h.attachPack(packDoc.sourceId,{id:'community-pack',name:'Community Notes',version:'1.0.0',trustTier:'AUTO-GENERATED',sourceFingerprint:packDoc.fingerprint,async search(){return [{locator:'doc:manual-v1:page:1:block:1',text:'Sensor A controls safe mode.'}]}});
h.setProvider(null);
const packAssisted=await h.answer({sourceId:packDoc.sourceId,question:'What happens if sensor A disconnects?',trustMode:'GROUNDED'});
assert(packAssisted.provenance.label==='PACK_ASSISTED','unverified pack label');

h.detachPack(packDoc.sourceId,'community-pack');
h.attachPack(packDoc.sourceId,{id:'curated-pack',name:'Curated Manual Pack',version:'2.0.0',trustTier:'CURATED',verificationScope:'safe-mode facts',sourceFingerprint:packDoc.fingerprint,async search(){return [{locator:'doc:manual-v1:page:1:block:1',text:'Verified: sensor A disconnect triggers safe mode.'}]}});
const verified=await h.answer({sourceId:packDoc.sourceId,question:'What happens if sensor A disconnects?',trustMode:'STRICT'});
assert(verified.provenance.label==='VERIFIED','curated pack yields VERIFIED');
assert(verified.provenance.verificationTier.toLowerCase()==='curated','verification tier tracked');
assert(verified.provenance.packRefs[0].version==='2.0.0','pack version tracked');

// 5) Bible textual fact vs interpretation separation.
const bible=await h.ingest({sourceId:'scripture-fixture',sourceType:'bible',title:'Scripture Fixture',blocks:[
  {locator:'bible:test:1:1',ordinal:1,text:'In the beginning was the Word.',sourceText:'In the beginning was the Word.'}
]});
assert(bible.recommendedTrustMode==='STRICT','scripture defaults Strict');
h.setProvider(async()=>({body:'This can be interpreted as emphasizing the pre-existence of the Word.',provenance:'INTERPRETATION'}));
const interpretation=await h.answer({sourceId:bible.sourceId,question:'이 구절의 신학적 의미를 해석해줘',trustMode:'STRICT'});
assert(interpretation.provenance.label==='INTERPRETATION','Bible interpretation separated from textual fact');
assert(interpretation.context.questionType==='INTERPRETATION','Bible interpretation question classified');

h.setProvider(async()=>({body:'The verse says “In the beginning was the Word.”',sourceRefs:['bible:test:1:1'],claims:[{kind:'verse',text:'In the beginning was the Word.',exactValue:'In the beginning was the Word.',sourceRefs:['bible:test:1:1']}]}));
const bibleFact=await h.answer({sourceId:bible.sourceId,question:'본문에 실제로 무엇이라고 쓰여 있어?',trustMode:'STRICT'});
assert(bibleFact.provenance.label==='SOURCE_GROUNDED','Bible textual fact grounded');
assert(bibleFact.validation.status==='PASS','Bible textual fact exact source pass');

// 6) Workbook answer reveal is blocked at retrieval/provider layer unless Explain/reveal is allowed.
const wb=await h.ingest({sourceId:'math-workbook',sourceType:'workbook',title:'Math Workbook',metadata:{workbookMode:'tutor'},pages:[
  {page:1,blocks:[{title:'Problem 1',text:'What is 2 + 2?',metadata:{sectionRole:'problem'}},{title:'Answer 1',text:'The answer is 4.',metadata:{sectionRole:'answer'}}]}
]});
assert(wb.recommendedTrustMode==='GROUNDED','workbook defaults Grounded');
const wbContext=await h.buildContext({sourceId:wb.sourceId,question:'정답 알려줘',trustMode:'GROUNDED'});
assert(wbContext.visibility.workbookAnswersHidden===true,'workbook answers hidden in tutor mode');
assert(!wbContext.evidence.some(x=>x.text.includes('answer is 4')),'answer block excluded from retrieval');
h.setProvider(async()=>({body:'The answer is 4.',sourceRefs:['doc:math-workbook:page:1:block:2']}));
const wbBlocked=await h.answer({sourceId:wb.sourceId,question:'정답 알려줘',trustMode:'GROUNDED'});
assert(wbBlocked.validation.issues.includes('WORKBOOK_ANSWER_REVEAL_BLOCKED'),'provider cannot bypass reveal gate');
const wbExplain=await h.buildContext({sourceId:wb.sourceId,question:'정답 알려줘',trustMode:'GROUNDED',workbookMode:'explain',revealAnswers:true});
assert(wbExplain.visibility.workbookAnswersHidden===false,'Explain mode permits answer retrieval');
assert(wbExplain.evidence.some(x=>x.text.includes('answer is 4')),'answer visible when explicitly allowed');

// 7) Low extraction quality cannot masquerade as Strict-ready.
let lowQualityRejected=false;
try{
  await h.ingest({sourceId:'bad-ocr',sourceType:'document',title:'Bad OCR',trustMode:'STRICT',metadata:{extractionQuality:{status:'LOW',score:0.42,issues:['OCR_LOW_CONFIDENCE']}},text:'garbled but nonempty text'});
}catch(e){lowQualityRejected=String(e.message).includes('STRICT_EXTRACTION_QUALITY_TOO_LOW')}
assert(lowQualityRejected,'Strict low extraction quality rejected');

const labels=new Set([aiNative.provenance.label,groundedPass.provenance.label,packAssisted.provenance.label,verified.provenance.label,interpretation.provenance.label,strictWrong.provenance.label]);
for(const label of ['AI_NATIVE','SOURCE_GROUNDED','PACK_ASSISTED','VERIFIED','INTERPRETATION','UNCERTAIN'])assert(labels.has(label),`provenance label covered ${label}`);

const result={
  schema:'storymemory-trust-answer-provenance-1.0',
  runtimeSchema:h.contract.schema,
  runtimeVersion:h.contract.version,
  status:'PASS',
  trustModes:['EXPLORE','GROUNDED','STRICT'],
  provenanceLabels:[...h.contract.provenanceLabels],
  checks:{
    fiction_default_explore:'PASS',fiction_spoiler_boundary:'PASS',explore_ai_native:'PASS',
    grounded_citation_required:'PASS',grounded_source_grounded:'PASS',
    strict_document_default:'PASS',strict_exact_claim_pass:'PASS',strict_wrong_exact_claim_block:'PASS',strict_unknown_allowed:'PASS',
    pack_assisted_label:'PASS',verified_pack_label:'PASS',pack_name_version_tier_tracking:'PASS',
    bible_textual_fact_vs_interpretation:'PASS',workbook_answer_reveal_gate:'PASS',strict_extraction_quality_gate:'PASS',
    all_six_provenance_labels:'PASS'
  },
  examples:{
    aiNative:{label:aiNative.provenance.label,providerMode:aiNative.providerMode},
    grounded:{label:groundedPass.provenance.label,sourceRefs:groundedPass.provenance.sourceRefs},
    strictBlocked:{label:strictWrong.provenance.label,issues:strictWrong.validation.issues},
    verified:{label:verified.provenance.label,packRefs:verified.provenance.packRefs},
    interpretation:{label:interpretation.provenance.label,questionType:interpretation.context.questionType},
    workbook:{hidden:wbContext.visibility.workbookAnswersHidden,blockedIssues:wbBlocked.validation.issues}
  }
};
fs.writeFileSync(path.join(root,'QA_EVIDENCE','SM083_TRUST_PROVENANCE_RESULT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
