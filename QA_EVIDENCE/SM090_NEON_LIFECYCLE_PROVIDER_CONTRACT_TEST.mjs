import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const lifeApi=require(path.join(process.cwd(),'dist/storymemory-pack-lifecycle-runtime.js'));
const calls=[];
const remote={async request(table,opt={}){calls.push({table,opt:JSON.parse(JSON.stringify(opt))});if(table==='pack_ratings'&&opt.method==='POST')return [{pack_id:opt.body.pack_id,version:opt.body.version,overall_rating:opt.body.overall_rating}];if(table==='pack_ratings')return [{pack_id:'p',version:'1.0.0',overall_rating:5}];if(table==='pack_rating_summary')return [{pack_id:'p',version:'1.0.0',rating_count:3,overall_average:'4.67'}];if(table==='pack_feedback'&&opt.method==='POST')return [{id:'f1',...opt.body}];if(table==='pack_feedback')return [];if(table==='pack_version_proposals'&&opt.method==='POST')return [{id:'vp1',...opt.body}];if(table==='pack_version_proposals'&&opt.method==='PATCH')return [{id:'vp1',proposal_status:'pending_review'}];if(table==='pack_version_proposals')return [];if(table==='pack_registry'&&opt.method==='POST')return [opt.body];if(table==='pack_versions'&&opt.method==='POST')return [];return []}};
const p=lifeApi.createStoryMemoryNeonPackLifecycleProvider({remoteAdapter:remote,getUserId:()=> 'user-123'});
await p.saveRating({packId:'p',version:'1.0.0',overallRating:5,accuracyRating:5,reviewText:'good'});
await p.getMyRating('p','1.0.0');
await p.getRatingSummary('p','1.0.0');
await p.submitFeedback({packId:'p',version:'1.0.0',feedbackKind:'error',sourceLocator:'loc:1',message:'wrong',proposedCorrection:{value:'right'}});
await p.saveVersionProposal({packId:'p',proposedVersion:'1.1.0',parentVersion:'1.0.0',artifactUri:'packs/p-1.1.0.json',artifactFingerprint:'fp2',schemaVersion:'storymemory-precision-pack-1.0',declaredTrustTier:'auto-generated',sourceMatchMode:'exact-fingerprint',compatibility:{sourceFingerprint:'x'},rights:{sourceTextIncluded:false},changelog:'fix',metadata:{}});
await p.submitVersionProposal('vp1');
await p.createForkDraft({listing:{packId:'fork:p',name:'Fork',packType:'search',creatorId:'user-123',summary:'fork',rightsDeclaration:{sourceTextIncluded:false},compatibilitySummary:{},permissions:{},processingDisclosure:{},listingMetadata:{lineage:{parentPackId:'p',parentVersion:'1.0.0'}}},version:{version:'0.1.0',schemaVersion:'storymemory-precision-pack-1.0',artifactUri:'packs/fork.json',artifactFingerprint:'forkfp',declaredTrustTier:'auto-generated',sourceMatchMode:'exact-fingerprint',compatibility:{},rights:{sourceTextIncluded:false},changelog:'fork'}});
const by=(table,method)=>calls.filter(c=>c.table===table&&(!method||c.opt.method===method));
const checks={
  ratingUpsert:by('pack_ratings','POST').some(c=>c.opt.query?.on_conflict==='user_id,pack_id,version'&&c.opt.body.user_id==='user-123'),
  aggregateView:by('pack_rating_summary').length===1,
  feedbackInsert:by('pack_feedback','POST').some(c=>c.opt.body.source_locator==='loc:1'&&c.opt.body.user_id==='user-123'),
  versionProposalInsert:by('pack_version_proposals','POST').some(c=>c.opt.body.proposal_status==='draft'&&c.opt.body.parent_version==='1.0.0'),
  versionSubmitPatch:by('pack_version_proposals','PATCH').some(c=>c.opt.query?.proposal_status==='eq.draft'&&c.opt.body.proposal_status==='pending_review'),
  forkTwoPhase:by('pack_registry','POST').length===1&&by('pack_versions','POST').length===1,
  noSourceBodyFields:!calls.some(c=>JSON.stringify(c).includes('source_body_payload'))
};
const result={schema:'sm090-neon-lifecycle-provider-contract-1.0',pass:Object.values(checks).every(Boolean),checks,callCount:calls.length,tables:[...new Set(calls.map(c=>c.table))]};
fs.writeFileSync('QA_EVIDENCE/SM090_NEON_LIFECYCLE_PROVIDER_CONTRACT_RESULT.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(!result.pass)process.exit(1);
