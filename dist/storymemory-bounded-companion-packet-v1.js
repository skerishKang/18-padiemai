/* ===== B61 #1305 Slice B · Bounded Companion Packet — deterministic ceiling-aware composition ===== */
(function(){
'use strict';
var SPOILER_POLICY='hard_no_future';
function buildBoundedCompanionPacketV1(opts){
  opts=opts||{};
  var rc=window.storyMemoryGetReaderContextV1?window.storyMemoryGetReaderContextV1():null;
  var wk=rc?rc.current_work_key:null;
  var auth=rc?!!rc.authoritative_reader:false;
  var progress=wk&&window.storyMemoryGetReadingProgressV1?window.storyMemoryGetReadingProgressV1(wk):null;
  var ceiling=progress?progress.knowledge_ceiling_locator:null;
  var boundary_available=!!ceiling;
  var cmp=window.storyMemoryCompareLocatorV1?window.storyMemoryCompareLocatorV1:function(){return 0;};
  var rawPassages=[];
  if(window.storyMemoryBuildAIContextPacketV1){
    var base=window.storyMemoryBuildAIContextPacketV1();
    rawPassages=base.source_passages||[];
  }
  var allowedPassages=[];
  var filteredFutureSourceCount=0;
  var filteredNoLocatorSourceCount=0;
  var isCompat=window.storyMemoryIsLocatorCompatibleWithWorkV1||function(){return true;};
  var famOf=window.storyMemoryLocatorWorkFamilyV1||function(){return null;};
  for(var i=0;i<rawPassages.length;i++){
    var p=rawPassages[i];
    var loc=p&&(p.canonical_locator||p.canonicalLocator||p.locator||'');
    if(!loc){filteredNoLocatorSourceCount++;continue;}
    if(!boundary_available){filteredFutureSourceCount++;continue;}
    if(!isCompat(loc,wk)){filteredFutureSourceCount++;continue;}
    if(ceiling && famOf(loc)!==famOf(ceiling)){filteredFutureSourceCount++;continue;}
    if(cmp(loc,ceiling)<=0){allowedPassages.push(p);}
    else{filteredFutureSourceCount++;}
  }
  var rawAnnotations=[];
  try{
    if(window.__smAnnotationLayerV1 && typeof window.__smAnnotationLayerV1.list==='function'){
      rawAnnotations=window.__smAnnotationLayerV1.list()||[];
    }else{
      var v=localStorage.getItem('storymemory.annotations.v1');
      if(v){var p=JSON.parse(v); if(p&&p.version===1&&Array.isArray(p.items)) rawAnnotations=p.items;}
    }
  }catch(_){rawAnnotations=[];}
  var currentUnitKey=rc?rc.current_unit_key:null;
  function unitOfAnn(loc){ try{ var p=String(loc).split(':'); return p[0]==='bible'? p.slice(0,4).join(':') : p.slice(0,3).join(':'); }catch(_){ return null; } }
  var allowedAnnotations=[];
  var filteredFutureAnnCount=0;
  var filteredNoLocatorAnnCount=0;
  var filteredWrongUnitAnnCount=0;
  for(var j=0;j<rawAnnotations.length;j++){
    var a=rawAnnotations[j];
    if(!a||typeof a!=='object')continue;
    if(!['highlight','underline','memo','bookmark'].includes(a.kind))continue;
    var aloc=a.locator||a.canonical_locator||'';
    if(!aloc){filteredNoLocatorAnnCount++;continue;}
    if(!isCompat(aloc,wk)){filteredWrongUnitAnnCount++;continue;}
    if(ceiling && famOf(aloc)!==famOf(ceiling)){filteredWrongUnitAnnCount++;continue;}
    var derivedUnit=null; try{ derivedUnit=unitOfAnn(aloc); }catch(_){}
    if(currentUnitKey && derivedUnit && derivedUnit!==currentUnitKey){filteredWrongUnitAnnCount++;continue;}
    if(!boundary_available){filteredFutureAnnCount++;continue;}
    if(cmp(aloc,ceiling)<=0){
      allowedAnnotations.push({id:String(a.id||''),kind:String(a.kind),locator:String(aloc),unit:String(a.unit||derivedUnit||''),text:String(a.text||'').slice(0,2000),color:a.color?String(a.color):null,note:a.note?String(a.note).slice(0,2000):null,createdAt:Number.isFinite(Number(a.createdAt))?Number(a.createdAt):null});
    }
    else{filteredFutureAnnCount++;}
  }
  allowedAnnotations.sort(function(a,b){var c=String(a.locator).localeCompare(String(b.locator));return c!==0?c:String(a.id).localeCompare(String(b.id));});
  var selected_included=false;
  var selected_reasons=[];
  var selLoc=rc?rc.selected_locator:null;
  var selText=rc?rc.selected_text:null;
  if(!auth){
    selected_reasons.push('non_authoritative_reader');
    selLoc=null;selText=null;
  }else if(!boundary_available){
    selected_reasons.push('boundary_unavailable');
    selLoc=null;selText=null;
  }else if(!selLoc){
    if(selText){selected_reasons.push('no_selected_locator');}
    selText=null;
  }else if(!isCompat(selLoc,wk) || (ceiling && famOf(selLoc)!==famOf(ceiling))){
    selected_reasons.push('selected_incompatible_work');
    selLoc=null;selText=null;
  }else if(cmp(selLoc,ceiling)>0){
    selected_reasons.push('selected_beyond_ceiling');
    selLoc=null;selText=null;
  }else{
    selected_included=true;
  }
  var coReader=null;
  if(window.storyMemoryCoReaderDecisionV1){
    coReader=window.storyMemoryCoReaderDecisionV1(opts.query||'',opts.targetLocator||selLoc||null,wk);
  }else{
    coReader={decision:boundary_available?'ALLOW':'BLOCK',reason:boundary_available?'WITHIN_CEILING':'BOUNDARY_UNAVAILABLE',ceiling:ceiling||null};
  }
  var selected_packet=null;
  if(selected_included&&selLoc){
    selected_packet={selected_locator:selLoc,selected_text:(selText||'').slice(0,2000)||null};
  }
  var diagnostics={
    boundary_available:boundary_available,
    spoiler_policy:SPOILER_POLICY,
    allowed_source_count:allowedPassages.length,
    filtered_future_source_count:filteredFutureSourceCount,
    filtered_no_locator_source_count:filteredNoLocatorSourceCount,
    allowed_annotation_count:allowedAnnotations.length,
    filtered_future_annotation_count:filteredFutureAnnCount,
    filtered_no_locator_annotation_count:filteredNoLocatorAnnCount,
    filtered_wrong_unit_annotation_count:filteredWrongUnitAnnCount,
    selected_included:selected_included,
    selected_reasons:selected_reasons
  };
  var packet={
    version:'1',
    mode:'storymemory_bounded_companion',
    source_scope:'ceiling_filtered',
    reader_context:rc,
    reading_progress:progress?{furthest_read_locator:progress.furthest_read_locator,knowledge_ceiling_locator:progress.knowledge_ceiling_locator,updatedAt:progress.updatedAt}:null,
    annotation_context:{version:'1',work_key:wk,unit_key:currentUnitKey,annotations:allowedAnnotations,count:allowedAnnotations.length},
    source_passages:allowedPassages,
    selected:selected_packet,
    diagnostics:diagnostics,
    co_reader_decision:coReader
  };
  return packet;
}
window.storyMemoryBuildBoundedCompanionPacketV1=buildBoundedCompanionPacketV1;
window.__smBoundedCompanionPacketV1={SPOILER_POLICY:SPOILER_POLICY};
})();
