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

const entityCases=[
[1,'태양신 히페리온','odyssey:book:01:s1:row:001'],[1,'에우리클레이아','odyssey:book:01:s8:row:002'],
[2,'안티노오스','odyssey:book:02:s2:row:002'],[2,'멘토르','odyssey:book:02:s4:row:001'],
[3,'필로스','odyssey:book:03:s1:row:001'],[3,'피시스트라토스','odyssey:book:03:s8:row:012'],
[4,'스파르타 라케다이몬','odyssey:book:04:s1:row:001'],[4,'메돈','odyssey:book:04:s7:row:001'],
[5,'제우스','odyssey:book:05:s1:row:005'],[5,'이노 레우코테아','odyssey:book:05:s6:row:002'],
[6,'나우시토오스','odyssey:book:06:s1:row:001'],[6,'나우시카','odyssey:book:06:s1:row:003'],
[7,'에우리메두사','odyssey:book:07:s1:row:002'],[7,'폰토노오스','odyssey:book:07:s4:row:007'],
[8,'데모도코스','odyssey:book:08:s1:row:005'],[8,'에우리알로스','odyssey:book:08:s5:row:005'],
[9,'키코네스족','odyssey:book:09:s2:row:001'],[9,'마론','odyssey:book:09:s4:row:001'],
[10,'아이올로스','odyssey:book:10:s1:row:002'],[10,'엘페노르','odyssey:book:10:s8:row:002'],
[11,'안티클레이아','odyssey:book:11:s1:row:005'],[11,'헤라클레스','odyssey:book:11:s9:row:006'],
[12,'세이렌','odyssey:book:12:s2:row:001'],[12,'람페티에','odyssey:book:12:s3:row:005'],
[13,'네리툼','odyssey:book:13:s5:row:003'],[13,'나이아스','odyssey:book:13:s5:row:004'],
[14,'에우마이오스','odyssey:book:14:s2:row:004'],
[15,'메가펜테스','odyssey:book:15:s2:row:001'],[15,'피라이오스','odyssey:book:15:s7:row:006'],
[16,'암피노모스','odyssey:book:16:s5:row:007'],
[17,'돌리오스','odyssey:book:17:s2:row:004'],[17,'아르고스 개','odyssey:book:17:s3:row:004'],[17,'에우리노메','odyssey:book:17:s6:row:001'],
[18,'이로스 아르나이오스','odyssey:book:18:s1:row:011'],[18,'멜란토','odyssey:book:18:s4:row:003'],
[19,'에우리바테스','odyssey:book:19:s3:row:003'],[19,'파르나소스 산','odyssey:book:19:s4:row:004'],
[20,'필로이티오스','odyssey:book:20:s3:row:008'],[20,'아겔라오스','odyssey:book:20:s5:row:003']
];
const relationshipCases=[
[1,'칼립소 오디세우스 관계','odyssey:book:01:s1:row:003'],[2,'할리테르세스 오디세우스 관계','odyssey:book:02:s3:row:003'],
[3,'피시스트라토스 네스토르 관계','odyssey:book:03:s2:row:002'],[4,'에테오네우스 메넬라오스 관계','odyssey:book:04:s1:row:004'],
[5,'제우스 오디세우스 관계','odyssey:book:05:s1:row:005'],[6,'나우시토오스 파이아케스인 관계','odyssey:book:06:s1:row:001'],
[7,'에우리메두사 나우시카 관계','odyssey:book:07:s1:row:002'],[8,'데모도코스 오디세우스 관계','odyssey:book:08:s1:row:006'],
[9,'오디세우스 이스마로스 관계','odyssey:book:09:s2:row:001'],[10,'아이올로스 오디세우스 관계','odyssey:book:10:s1:row:002'],
[11,'안티클레이아 오디세우스 관계','odyssey:book:11:s1:row:005'],[12,'키르케 스킬라 관계','odyssey:book:12:s3:row:001'],
[13,'포세이돈 파이아케스인 관계','odyssey:book:13:s3:row:005'],[14,'에우마이오스 오디세우스 관계','odyssey:book:14:s2:row:004'],
[15,'테오클리메노스 텔레마코스 관계','odyssey:book:15:s4:row:004'],[16,'오디세우스 텔레마코스 정체 관계','odyssey:book:16:s3:row:005'],
[17,'멜란티오스 돌리오스 관계','odyssey:book:17:s2:row:004'],[18,'오디세우스 이로스 관계','odyssey:book:18:s1:row:011'],
[19,'에우리바테스 오디세우스 관계','odyssey:book:19:s3:row:003'],[20,'필로이티오스 오디세우스 관계','odyssey:book:20:s3:row:008']
];
const recallCases=[
[1,'칼립소 처음 어디서 나왔지','odyssey:book:01:s1:row:003'],[2,'안티노오스 처음 어디서 나왔지','odyssey:book:02:s2:row:002'],
[3,'네스토르 처음 어디서 나왔지','odyssey:book:03:s7:row:003'],[4,'헬렌 처음 어디서 나왔지','odyssey:book:04:s2:row:023'],
[6,'나우시카 처음 어디서 나왔지','odyssey:book:06:s1:row:003'],[8,'데모도코스 처음 어디서 나왔지','odyssey:book:08:s1:row:005'],
[10,'키르케 처음 어디서 나왔지','odyssey:book:10:s3:row:001'],[11,'안티클레이아 처음 어디서 나왔지','odyssey:book:11:s1:row:005'],
[14,'에우마이오스 처음 어디서 나왔지','odyssey:book:14:s2:row:004'],[17,'아르고스 개 처음 어디서 나왔지','odyssey:book:17:s3:row:004']
];

async function ingestBook(book){return harness.ingest({sourceId:'book:odyssey',sourceType:'book',title:'Odyssey',workKey:'odyssey',unitOrdinal:book,revision:'sm053',fingerprint:'odyssey-sm053',metadata:{progressBounded:true}})}
function hit(rows,locator,k=8){return rows.slice(0,k).some(x=>x.locator===locator)}
const details={entity:[],relationship:[],recall:[],spoiler:[],sameName:null,memory:null};
for(const [book,q,gold] of entityCases){await ingestBook(book);harness.setPosition('book:odyssey',gold);const r=await harness.retrieve({sourceId:'book:odyssey',query:q,limit:8});details.entity.push({book,q,gold,top:r.evidence.map(x=>x.locator),hit:hit(r.evidence,gold)});}
for(const [book,q,gold] of relationshipCases){await ingestBook(book);harness.setPosition('book:odyssey',gold);const r=await harness.retrieve({sourceId:'book:odyssey',query:q,limit:8});details.relationship.push({book,q,gold,top:r.evidence.map(x=>x.locator),hit:hit(r.evidence,gold)});}
// Recall is intentionally asked at Book 20. Gold is from an earlier unit.
await ingestBook(20);const b20=readJson(path.join(staticRoot,'odyssey','book-20.json'));const last20=b20.passages[b20.passages.length-1].canonical_locator;harness.setPosition('book:odyssey',last20);
for(const [originBook,q,gold] of recallCases){const r=await harness.retrieve({sourceId:'book:odyssey',query:q,limit:8});details.recall.push({originBook,q,gold,top:r.evidence.map(x=>x.locator),hit:hit(r.evidence,gold)});}
// Spoiler boundary: just before selected first-visible rows, future locator must not appear.
for(const [book,q,gold] of entityCases.filter((_,i)=>i%4===0)){
  const unit=readJson(path.join(staticRoot,'odyssey',`book-${String(book).padStart(2,'0')}.json`));const idx=unit.passages.findIndex(x=>x.canonical_locator===gold);if(idx<=0)continue;await ingestBook(book);const before=unit.passages[idx-1];harness.setPosition('book:odyssey',before.canonical_locator);const r=await harness.retrieve({sourceId:'book:odyssey',query:q,limit:8});details.spoiler.push({book,q,before:before.canonical_locator,forbidden:gold,leaked:r.evidence.some(x=>x.locator===gold),maxOrdinal:Math.max(...r.evidence.map(x=>Number(x.ordinal)||0),0),boundary:Number(before.sequence)});
}
// Same-name Argos dog should resolve to dog context in Book 17 and not unrelated place evidence from earlier units.
await ingestBook(17);harness.setPosition('book:odyssey','odyssey:book:17:s3:row:004');const arg=await harness.retrieve({sourceId:'book:odyssey',query:'아르고스 개 누구야',limit:8});details.sameName={top:arg.evidence.map(x=>x.locator),dogHit:hit(arg.evidence,'odyssey:book:17:s3:row:004'),allBook17:arg.evidence.every(x=>x.locator.includes('book:17:'))};
// Memory continuity across unit re-ingest of the same source.
await ingestBook(14);harness.addMemory({sourceId:'book:odyssey',locator:'odyssey:book:14:s2:row:004',title:'에우마이오스',body:'충성스러운 돼지치기였다는 독서 메모'});await ingestBook(20);harness.setPosition('book:odyssey',last20);const c=await harness.buildContext({sourceId:'book:odyssey',question:'에우마이오스 기억나?'});details.memory={count:c.memories.length,found:c.memories.some(x=>String(x.body||'').includes('돼지치기'))};
const rate=a=>a.length?Number((a.filter(x=>x.hit).length/a.length).toFixed(4)):null;
const result={schema:'storymemory-sm088-gold-baseline-1.0',runtimeVersion:harness.contract.version,status:'BASELINE',goldOracleUsedForScoringOnly:true,knowledgePackAttached:false,precomputedKnowledgeInjected:false,metrics:{entityLocatorHitAt8:rate(details.entity),relationshipLocatorHitAt8:rate(details.relationship),crossUnitRecallOriginHitAt8:rate(details.recall),spoilerLeakRate:details.spoiler.length?Number((details.spoiler.filter(x=>x.leaked).length/details.spoiler.length).toFixed(4)):null,sameNameArgosDogPass:Boolean(details.sameName.dogHit&&details.sameName.allBook17),memoryContinuityPass:Boolean(details.memory.found)},counts:{entityCases:details.entity.length,relationshipCases:details.relationship.length,recallCases:details.recall.length,spoilerCases:details.spoiler.length},details};
console.log(JSON.stringify(result,null,2));
