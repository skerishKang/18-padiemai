import {createRequire} from 'module';
import fs from 'fs';
const require=createRequire(import.meta.url);
const {createStoryMemoryPackEntitlementRuntime}=require('../dist/storymemory-pack-entitlement-runtime.js');
const catalog=[
 {packId:'free-pack',name:'Free',pricingMode:'free',publicationStatus:'published',latestVersion:'1.0.0'},
 {packId:'paid-pack',name:'Paid',pricingMode:'paid',publicationStatus:'published',latestVersion:'1.0.0'}
];
const market={getListing:id=>catalog.find(x=>x.packId===id)||null,listCatalog:()=>catalog};
const result={schema:'sm091-entitlement-runtime-result-1.0',checks:[]};
const check=(name,pass,details={})=>{result.checks.push({name,pass:Boolean(pass),details});if(!pass)throw new Error(name)};
let rt=createStoryMemoryPackEntitlementRuntime({marketplaceRuntime:market});
check('CONTRACT_NO_LIVE_PAYMENT',rt.contract.livePaymentCollectionImplemented===false&&rt.contract.directClientGrantAllowed===false,rt.status());
let a=await rt.checkAccess('free-pack');check('FREE_ACCESS',a.allowed&&a.reason==='FREE_PUBLIC',a);
a=await rt.checkAccess('paid-pack');check('PAID_DENIED_WITHOUT_ENTITLEMENT',!a.allowed&&a.reason==='PAID_ENTITLEMENT_REQUIRED',a);
rt.mergeOffers([{offerId:'paid-krw-1000',packId:'paid-pack',currency:'KRW',amountMinor:1000,status:'active',accessScope:'pack'}]);
let intent=await rt.createPurchaseIntent('paid-pack');check('INTENT_NO_ACCESS',intent.status==='intent'&&intent.accessGranted===false&&intent.requiresExternalProvider===true,intent);
let malicious=createStoryMemoryPackEntitlementRuntime({marketplaceRuntime:market,provider:{listOffers:async()=>[{offerId:'x',packId:'paid-pack',currency:'KRW',amountMinor:1000,status:'active'}],createPurchaseIntent:async()=>({status:'paid',accessGranted:true})}});await malicious.refreshOffers();let blocked=false;try{await malicious.createPurchaseIntent('paid-pack')}catch(e){blocked=String(e.message).includes('PURCHASE_INTENT_CANNOT_GRANT_ACCESS')}check('MALICIOUS_INTENT_BLOCKED',blocked);
let verified=false;rt.setProvider({verifyPaymentEvent:async e=>verified?{...e,verified:true,purchaseStatus:e.purchaseStatus||'paid',userId:'u1',provider:'fixture',purchaseId:'p1',providerTransactionId:'tx1',currency:'KRW',amountMinor:1000,accessScope:'pack'}:{...e,verified:false},restoreEntitlements:async()=>[],verifySettlementEvent:async e=>({...e,verified:true})});
blocked=false;try{await rt.reconcilePaymentEvent({packId:'paid-pack',purchaseStatus:'paid'})}catch(e){blocked=String(e.message).includes('PAYMENT_EVENT_NOT_VERIFIED')}check('UNVERIFIED_PAYMENT_BLOCKED',blocked);
verified=true;let recon=await rt.reconcilePaymentEvent({packId:'paid-pack',purchaseStatus:'paid',version:'1.0.0'});check('VERIFIED_PAYMENT_GRANTS',recon.access.allowed&&recon.entitlement?.verified===true,recon);
recon=await rt.reconcilePaymentEvent({packId:'paid-pack',purchaseStatus:'refunded',version:'1.0.0'});check('REFUND_REVOKES',!recon.access.allowed&&recon.entitlement?.status==='refunded',recon);
let restoreRt=createStoryMemoryPackEntitlementRuntime({marketplaceRuntime:market,provider:{restoreEntitlements:async()=>[{entitlementId:'e-good',userId:'u1',packId:'paid-pack',status:'active',accessScope:'pack',verified:true},{entitlementId:'e-bad',userId:'u1',packId:'paid-pack',status:'active',accessScope:'pack',verified:false}]}});let rr=await restoreRt.restoreEntitlements();check('RESTORE_ONLY_VERIFIED',rr.imported===1&&rr.entitlements.length===1,rr);
let prev=rt.settlementPreview({packId:'paid-pack',purchaseId:'p1',grossMinor:1000,platformFeeMinor:100,currency:'KRW',creatorId:'c1'});check('SETTLEMENT_PREVIEW_PENDING',prev.settlementStatus==='pending'&&prev.creatorNetMinor===900&&prev.previewOnly===true,prev);
let settRt=createStoryMemoryPackEntitlementRuntime({marketplaceRuntime:market,provider:{verifySettlementEvent:async e=>({...e,verified:true})}});blocked=false;try{await settRt.reconcileSettlementEvent({settlementId:'s1',packId:'paid-pack',purchaseId:'p1',creatorId:'c1',currency:'KRW',grossMinor:1000,platformFeeMinor:100,creatorNetMinor:900,status:'paid'})}catch(e){blocked=String(e.message).includes('SETTLEMENT_PAID_REFERENCE_REQUIRED')}check('PAID_SETTLEMENT_REFERENCE_REQUIRED',blocked);
let sr=await settRt.reconcileSettlementEvent({settlementId:'s1',packId:'paid-pack',purchaseId:'p1',creatorId:'c1',currency:'KRW',grossMinor:1000,platformFeeMinor:100,creatorNetMinor:900,status:'paid',payoutReference:'payout-fixture-1'});check('VERIFIED_SETTLEMENT_ACCEPTED',sr.providerVerified===true&&sr.settlementStatus==='paid',sr);
const failed=result.checks.filter(x=>!x.pass).length;result.pass=failed===0;result.summary={total:result.checks.length,passed:result.checks.length-failed,failed};fs.writeFileSync(new URL('./SM091_PACK_ENTITLEMENT_RUNTIME_RESULT.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
