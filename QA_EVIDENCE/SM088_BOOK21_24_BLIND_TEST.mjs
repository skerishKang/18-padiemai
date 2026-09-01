import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const runtime=require(path.join(root,'dist','storymemory-universal-source-runtime.js'));
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const staticRoot=path.join(root,'dist','content');
const staticAdapter={async loadUnit({workKey,unitOrdinal}){const manifest=readJson(path.join(staticRoot,workKey,'manifest.json'));const meta=manifest.units.find(x=>Number(x.unit_ordinal)===Number(unitOrdinal));if(!meta)throw new Error(`unit missing ${workKey}/${unitOrdinal}`);const unit=readJson(path.join(staticRoot,workKey,meta.path));return {manifest,unit,unitMeta:meta,entry:{work_key:workKey,title:manifest.title||workKey}};}};
const harness=runtime.createStoryMemoryUniversalSourceRuntime({staticAdapter});
const books={};for(let b=1;b<=24;b++)books[b]=readJson(path.join(staticRoot,'odyssey',`book-${String(b).padStart(2,'0')}.json`));

const koTokens=s=>String(s||'').match(/[가-힣]{3,}/g)||[];
const stop=new Set(['오디세우스','텔레마코스','페넬로페','아테나는','아테나가','그리고','그들은','그녀는','그에게','그들이','그러자','하지만','이렇게','말했습니다','말했다','했습니다','있었습니다','있었다','것입니다','것이었다','때문에']);
const globalFreq=new Map();
for(let b=1;b<=24;b++)for(const p of books[b].passages)for(const t of koTokens(p.ko)){globalFreq.set(t,(globalFreq.get(t)||0)+1)}
function pickRare(book,count=6){
  const out=[];const seen=new Set();const passages=books[book].passages;
  const stride=Math.max(1,Math.floor(passages.length/count));
  for(let anchor=0;anchor<passages.length&&out.length<count;anchor+=stride){
    for(let j=anchor;j<Math.min(passages.length,anchor+stride+3);j++){
      const p=passages[j];
      const term=koTokens(p.ko).find(t=>!stop.has(t)&&(globalFreq.get(t)||0)<=2&&!seen.has(t)&&!String(p.section_title||'').includes(t));
      if(term){seen.add(term);out.push({term,locator:p.canonical_locator,sequence:p.sequence,book});break}
    }
  }
  return out;
}
const rare={};for(const b of [21,22,23,24])rare[b]=pickRare(b,6);
const details={rareRetrieval:[],sectionRetrieval:[],crossUnitRecall:[],spoiler:[],grounded:[]};
function hit(rows,loc,k=8){return rows.slice(0,k).some(x=>x.locator===loc)}
for(const b of [21,22,23,24]){
  await harness.ingest({sourceId:'book:odyssey',sourceType:'book',title:'Odyssey',workKey:'odyssey',unitOrdinal:b,revision:'sm053',fingerprint:'odyssey-sm053',metadata:{progressBounded:true}});
  const last=books[b].passages.at(-1);harness.setPosition('book:odyssey',last.canonical_locator);
  for(const c of rare[b]){const r=await harness.retrieve({sourceId:'book:odyssey',query:c.term,limit:8});details.rareRetrieval.push({...c,top:r.evidence.map(x=>x.locator),hit:hit(r.evidence,c.locator)});}
  const sections=[...new Set(books[b].passages.map(x=>x.section_title))].filter(Boolean).slice(0,4);
  for(const title of sections){const expected=books[b].passages.find(x=>x.section_title===title).canonical_locator;const r=await harness.retrieve({sourceId:'book:odyssey',query:title,limit:8});details.sectionRetrieval.push({book:b,title,expected,top:r.evidence.map(x=>x.locator),hit:r.evidence.some(x=>x.locator.startsWith(expected.replace(/row:\d+$/,'row:'))&&x.title===title)});}
  const g=rare[b][0];if(g){const a=await harness.answer({sourceId:'book:odyssey',question:g.term,trustMode:'GROUNDED'});details.grounded.push({book:b,term:g.term,route:a.route,provenance:a.provenance?.label,validation:a.validation?.status,sourceRefs:a.provenance?.sourceRefs||[],pass:a.route==='SOURCE_GROUNDED'&&a.provenance?.sourceRefs?.length>0&&a.validation?.status==='PASS'});}
}
// Cross-unit recall at Book 24 using source-derived terms from 21-23. No Gold DB or Pack is attached.
await harness.ingest({sourceId:'book:odyssey',sourceType:'book',title:'Odyssey',workKey:'odyssey',unitOrdinal:24,revision:'sm053',fingerprint:'odyssey-sm053',metadata:{progressBounded:true}});
harness.setPosition('book:odyssey',books[24].passages.at(-1).canonical_locator);
for(const b of [21,22,23])for(const c of rare[b].slice(0,3)){const r=await harness.retrieve({sourceId:'book:odyssey',query:`${c.term} 처음 어디서 나왔지`,limit:8});details.crossUnitRecall.push({...c,top:r.evidence.map(x=>x.locator),hit:hit(r.evidence,c.locator),lookback:r.policy.lazyLookbackUnits});}
// Blind spoiler: choose unique future terms in Book24 and ask just before their source passage.
const b24=books[24].passages;
for(const c of rare[24].filter(x=>b24.findIndex(p=>p.canonical_locator===x.locator)>0).slice(0,5)){
  const idx=b24.findIndex(p=>p.canonical_locator===c.locator);const before=b24[idx-1];
  await harness.ingest({sourceId:'book:odyssey',sourceType:'book',title:'Odyssey',workKey:'odyssey',unitOrdinal:24,revision:'sm053',fingerprint:'odyssey-sm053',metadata:{progressBounded:true}});
  harness.setPosition('book:odyssey',before.canonical_locator);const r=await harness.retrieve({sourceId:'book:odyssey',query:c.term,limit:8});details.spoiler.push({term:c.term,before:before.canonical_locator,future:c.locator,leaked:r.evidence.some(x=>x.locator===c.locator),maxOrdinal:Math.max(...r.evidence.map(x=>Number(x.ordinal)||0),0),boundary:Number(before.sequence)});
}
const rate=(a,key='hit')=>a.length?Number((a.filter(x=>x[key]).length/a.length).toFixed(4)):null;
const result={schema:'storymemory-sm088-book21-24-blind-1.0',runtimeVersion:harness.contract.version,status:'PASS',oracle:'STATIC_SOURCE_DERIVED_ONLY',manualKnowledgeDbRows:0,packAttached:false,metrics:{rareExactLocatorHitAt8:rate(details.rareRetrieval),sectionHitAt8:rate(details.sectionRetrieval),crossUnitRecallHitAt8:rate(details.crossUnitRecall),spoilerLeakRate:details.spoiler.length?Number((details.spoiler.filter(x=>x.leaked).length/details.spoiler.length).toFixed(4)):null,groundedRoutePassRate:rate(details.grounded,'pass')},counts:{rareCases:details.rareRetrieval.length,sectionCases:details.sectionRetrieval.length,crossUnitRecallCases:details.crossUnitRecall.length,spoilerCases:details.spoiler.length,groundedCases:details.grounded.length},rareTerms:rare,details};
console.log(JSON.stringify(result,null,2));
