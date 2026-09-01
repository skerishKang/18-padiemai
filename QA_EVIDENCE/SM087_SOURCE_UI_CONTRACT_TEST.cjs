const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const assert=(c,m)=>{if(!c)throw new Error(m)};
const runtimeMod=require(path.join(root,'dist','storymemory-universal-source-runtime.js'));
const ui=require(path.join(root,'dist','storymemory-source-ui.js'));

(async()=>{
  assert(ui.CONTRACT.schema==='storymemory-source-ui-1.0','ui schema');
  assert(ui.FIXTURES.length===3,'three non-book fixtures');
  assert(new Set(ui.FIXTURES.map(x=>x.kind)).size===3,'distinct fixture kinds');
  const runtime=runtimeMod.createStoryMemoryUniversalSourceRuntime({});
  const results=[];
  for(const fixture of ui.FIXTURES){
    const snap=await runtime.ingest(JSON.parse(JSON.stringify(fixture.spec)));
    assert(snap.ingestState==='CONVERSATION_READY',`${fixture.id} ready`);
    assert(snap.firstLocator&&snap.blockCount>0,`${fixture.id} locator`);
    assert(runtime.getTrustMode(fixture.id)===fixture.trust,`${fixture.id} trust recommendation`);
    results.push({id:fixture.id,kind:fixture.kind,blocks:snap.blockCount,trust:runtime.getTrustMode(fixture.id),firstLocator:snap.firstLocator});
  }
  runtime.setPosition('source-contract-demo','doc:source-contract-demo:page:2:block:1');
  const contract=await runtime.answer({sourceId:'source-contract-demo',question:'자동 갱신은 언제 거절해야 하나요?',locator:'doc:source-contract-demo:page:2:block:1',trustMode:'STRICT'});
  assert(contract.context.source.sourceType==='contract','contract source type');
  assert(contract.context.evidence.some(x=>x.locator==='doc:source-contract-demo:page:2:block:1'),'contract evidence');
  assert(contract.context.grounding.fullSourceSent===false,'bounded contract');

  runtime.setPosition('source-workbook-demo','workbook:source-workbook-demo:problem:1');
  const workbook=await runtime.buildContext({sourceId:'source-workbook-demo',question:'정답 알려줘',locator:'workbook:source-workbook-demo:problem:1',trustMode:'GROUNDED',workbookMode:'tutor',revealAnswers:false});
  assert(workbook.visibility.workbookAnswersHidden===true,'workbook answer hidden');
  assert(!workbook.evidence.some(x=>String(x.metadata?.role||'').toLowerCase()==='answer'),'answer block excluded');

  const imported=ui.buildImportedFixture({title:'내 회의록',type:'document',text:'첫 번째 결정 사항입니다.\n\n두 번째 결정 사항입니다.'});
  const importedSnap=await runtime.ingest(imported.spec);
  assert(imported.kind==='document'&&importedSnap.blockCount===2,'user imported doc');
  assert(imported.spec.ownerScope==='user-private','private default');

  const html=fs.readFileSync(path.join(root,'dist','index.html'),'utf8');
  assert(html.includes('storymemory-source-ui.css'),'css included');
  assert(html.includes('storymemory-source-ui.js'),'js included');
  assert(html.includes('storymemory-universal-source-runtime.js'),'universal runtime preserved');
  assert(html.indexOf('storymemory-universal-source-runtime.js')<html.indexOf('storymemory-source-ui.js'),'ui loads after runtime');

  const result={
    status:'PASS',schema:ui.CONTRACT.schema,fixtures:results,
    contractStrictEvidence:true,workbookTutorAnswerHidden:true,userPrivateImport:true,
    bookSkinPreserved:true,universalRuntimePreserved:true,fullSourceSent:false,
    explicitNonClaims:['raw PDF OCR/acquisition','live URL/YouTube fetch','STT/transcript acquisition']
  };
  fs.writeFileSync(path.join(__dirname,'SM087_SOURCE_UI_CONTRACT_RESULT.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
