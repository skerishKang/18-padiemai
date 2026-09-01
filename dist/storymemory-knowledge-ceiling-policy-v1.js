/* ===== B61 #1305 · Knowledge Ceiling policy — consumes #1337 R1 locator/progress module ===== */
(function(){
'use strict';
var R1=window.__smLocatorProgressR1V1;
if(!R1) throw new Error('StoryMemory locator/progress R1 module missing');
var locatorWorkFamily=R1.locatorWorkFamily;
var isLocatorCompatibleWithWork=R1.isLocatorCompatibleWithWork;
var compareLocators=R1.compareLocators;
var getCeiling=R1.getCeiling;
function isFuture(locator, workKey){
  if(!locator || !workKey) return false;
  if(!isLocatorCompatibleWithWork(locator, workKey)) return true;
  var ceil=getCeiling(workKey);
  if(!ceil) return false;
  if(!isLocatorCompatibleWithWork(ceil, workKey)) return true;
  if(locatorWorkFamily(locator)!==locatorWorkFamily(ceil)) return true;
  return compareLocators(locator, ceil)>0;
}
function filterFuturePassages(passages, workKey){
  if(!Array.isArray(passages)) return [];
  var ceil=getCeiling(workKey);
  if(!ceil) return [];
  return passages.filter(function(p){ var loc=p.canonical_locator||p.canonicalLocator||p.locator||''; if(!loc) return false; if(!isLocatorCompatibleWithWork(loc, workKey)) return false; if(locatorWorkFamily(loc)!==locatorWorkFamily(ceil)) return false; return compareLocators(loc, ceil)<=0; });
}
function filterFutureAnnotations(annotations, workKey){
  if(!Array.isArray(annotations)) return [];
  var ceil=getCeiling(workKey);
  if(!ceil) return [];
  return annotations.filter(function(a){ var loc=a.locator||a.canonical_locator||''; if(!loc) return false; if(!isLocatorCompatibleWithWork(loc, workKey)) return false; if(locatorWorkFamily(loc)!==locatorWorkFamily(ceil)) return false; return compareLocators(loc, ceil)<=0; });
}
var REFUSAL_COPY_FUTURE="아직 읽지 않은 부분은 안내해 드릴 수 없어요. 현재까지 읽은 범위 안에서 함께 이야기 나눠요.";
var REFUSAL_COPY_CONSENT="스포일러 허용을 말씀해 주셔도, 동행 독자 모드에서는 미리 알려드리지 않아요. 지금 읽은 곳까지만 나눠요.";
var REFUSAL_COPY_YESNO="해당 내용은 앞으로의 전개를 직접 확인하셔야 해서, 미리 결론을 전해 드리지 않아요.";
var REFUSAL_COPY_NOBOUNDARY="아직 읽은 범위가 설정되지 않아, 안전하게 답변드리기 어렵습니다. 먼저 읽은 챕터를 이동해 주세요.";
function coReaderDecision(query, targetLocator, workKey){
  var q=String(query||'').toLowerCase();
  var isConsent = /스포.*괜찮|괜찮.*스포|스포일러.*허용|미리.*알려/.test(q);
  var isYesNo = /yes\/no|예.*아니오|아니오.*예|맞나|아니냐|일까/.test(q) && /미래|앞으로|다음/.test(q);
  var ceil=getCeiling(workKey);
  if(!ceil){
    return {decision:'BLOCK', reason:'BOUNDARY_UNAVAILABLE', copy:REFUSAL_COPY_NOBOUNDARY, ceiling:null, requested: targetLocator||null, query:q};
  }
  if(targetLocator && !isLocatorCompatibleWithWork(targetLocator, workKey)) {
    return {decision:'BLOCK', reason:'HARD_NO_FUTURE', copy:REFUSAL_COPY_FUTURE, ceiling:ceil, requested: targetLocator||null, query:q};
  }
  var isFutureLoc = targetLocator ? isFuture(targetLocator, workKey) : false;
  var hardFuturePattern = /다음\s*장|다음\s*권|앞으로|미래|결말|스포|결국|어떻게\s*돼|죽어|죽지|죽는지|사망|살아.*남|나중에/;
  var needsFuture = isFutureLoc || hardFuturePattern.test(q);
  if(needsFuture){
    var copy=isConsent? REFUSAL_COPY_CONSENT : (isYesNo? REFUSAL_COPY_YESNO : REFUSAL_COPY_FUTURE);
    return {decision:'BLOCK', reason:'HARD_NO_FUTURE', copy:copy, ceiling:ceil, requested: targetLocator||null, query:q};
  }
  return {decision:'ALLOW', reason:'WITHIN_CEILING', ceiling:ceil, requested: targetLocator||null, query:q};
}
window.storyMemoryIsFutureLocatorV1=isFuture;
window.storyMemoryFilterFuturePassagesV1=filterFuturePassages;
window.storyMemoryFilterFutureAnnotationsV1=filterFutureAnnotations;
window.storyMemoryCoReaderDecisionV1=coReaderDecision;
window.__smKnowledgeCeilingV1={
  STORAGE_KEY:R1.STORAGE_KEY, VERSION:R1.VERSION, BIBLE_BOOK_ORDER:R1.BIBLE_BOOK_ORDER,
  REFUSAL_COPY_FUTURE:REFUSAL_COPY_FUTURE, REFUSAL_COPY_CONSENT:REFUSAL_COPY_CONSENT, REFUSAL_COPY_YESNO:REFUSAL_COPY_YESNO, REFUSAL_COPY_NOBOUNDARY:REFUSAL_COPY_NOBOUNDARY
};
})();
