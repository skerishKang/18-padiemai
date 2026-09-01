/* StoryMemory B61 #1337 R7 — behavior-preserving private UI extraction.
   PRIVATE SOURCE. Not for public GitHub publication. */

function renderLibrary(){
 const prior=(window.__smLastSelected ?? selected);
 let rawDelta=selected-prior;
 if(rawDelta>BOOKS.length/2)rawDelta-=BOOKS.length;
 if(rawDelta<-BOOKS.length/2)rawDelta+=BOOKS.length;
 const inertiaDir=rawDelta===0?0:(rawDelta>0?1:-1);
 if(window.__storyMemoryVisualReady) animateLibrarySelection();
 const track=document.getElementById('shelfTrack'); track.innerHTML='';
 BOOKS.forEach((b,i)=>{
  const d=normalizeDelta(i);

  let oldD=i-prior;
  if(oldD>BOOKS.length/2)oldD-=BOOKS.length;
  if(oldD<-BOOKS.length/2)oldD+=BOOKS.length;

  const rig=document.createElement('div');
  rig.className='book-rig'
    +(i===selected?' selected':'')
    +(i===selected&&inertiaDir!==0?' inertia-enter':'')
    +(inertiaDir!==0&&i!==selected?' shelf-shift':'');

  const x=d*178 - b.w/2;
  const z=-Math.abs(d)*105;
  const ry=d*-13;
  const sc=i===selected?1.10:(Math.abs(d)===1?.91:.78);
  const op=i===selected?1:(Math.abs(d)>=3?.58:.82);

  const fromX=oldD*178 - b.w/2;
  const fromZ=-Math.abs(oldD)*105;
  const fromRy=oldD*-13;
  const fromS=i===prior?1.10:(Math.abs(oldD)===1?.91:.78);
  const fromO=i===prior?1:(Math.abs(oldD)>=3?.58:.82);

  rig.style.setProperty('--x',x+'px');
  rig.style.setProperty('--z',z+'px');
  rig.style.setProperty('--ry',ry+'deg');
  rig.style.setProperty('--s',sc);
  rig.style.setProperty('--from-x',fromX+'px');
  rig.style.setProperty('--from-z',fromZ+'px');
  rig.style.setProperty('--from-ry',fromRy+'deg');
  rig.style.setProperty('--from-s',fromS);
  rig.style.setProperty('--from-o',fromO);
  rig.style.setProperty('--to-o',op);
  rig.style.setProperty('--travel-dir',inertiaDir);
  rig.style.setProperty('--cloth',b.cloth);rig.style.setProperty('--foil',b.foil);
  rig.style.setProperty('--w',b.w+'px');rig.style.setProperty('--h',b.h+'px');rig.style.setProperty('--d',b.d+'px');
  rig.dataset.motif=b.motif;
  rig.dataset.index=String(i);
  rig.innerHTML=`<div class="book-front">
    <div class="cover-copy cover-${b.motif}">
      <small>${b.sub}</small>
      ${coverMotif(b)}
      <strong>${b.title}</strong>
      <small>STORYMEMORY · READ / REMEMBER</small>
    </div>
  </div>
  <div class="book-inner-leaf"><span>STORYMEMORY</span><i></i><small>PERSONAL READING EDITION</small><b class="leaf-folio">I</b></div>
  <span class="hinge-glow" aria-hidden="true"></span>
  <div class="book-back"><span class="back-monogram">SM</span></div>
  <div class="book-spine"><div class="spine-copy"><small>STORYMEMORY</small><span>${b.title}</span><small>${String(i+1).padStart(2,'0')}</small></div></div>
  <div class="book-pages"><span class="page-band page-band-top"></span><span class="page-band page-band-bottom"></span></div>
  <div class="book-hit-surface" aria-hidden="true"></div>`;
  // Click/drag is handled by the direct-manipulation pointer controller below.

  if(i===selected&&inertiaDir!==0){
    for(let echoIndex=1;echoIndex<=3;echoIndex++){
      const echo=rig.cloneNode(true);
      echo.className='book-rig motion-echo echo-'+echoIndex;
      echo.removeAttribute('onclick');
      echo.setAttribute('aria-hidden','true');
      track.append(echo);
    }
  }

  track.append(rig);
 });
 document.getElementById('libCounter').textContent=String(selected+1).padStart(2,'0')+' / '+String(BOOKS.length).padStart(2,'0');
 document.getElementById('libTitle').textContent=BOOKS[selected].title;
 document.getElementById('libNote').textContent=BOOKS[selected].note;
 document.getElementById('libProgressText').textContent=BOOKS[selected].title==='성경'?'최근 읽음 · 오늘':'라이브러리 항목';
 document.getElementById('libProgressBar').style.width=(BOOKS[selected].title==='성경'?'38%':(18+selected*7)+'%');
 document.documentElement.style.setProperty('--scene-accent',BOOKS[selected].foil);
 document.getElementById('selectedEditionNo').textContent=String(selected+1).padStart(2,'0');
 document.getElementById('materialNote').textContent=MATERIALS[BOOKS[selected].motif]||'CLOTH · FOIL · HAND-BOUND';
 const weights={bible:'HEAVY',iliad:'HEAVY',crime:'MEDIUM+',pride:'MEDIUM',odyssey:'LIGHT',alice:'LIGHT',personal:'MEDIUM'};
 document.getElementById('objectWeight').textContent=weights[BOOKS[selected].motif]||'MEDIUM';
 document.getElementById('finishNote').textContent=FINISHES[BOOKS[selected].motif]||'MATTE CLOTH';
 document.getElementById('collectionNo').textContent=String(selected+1).padStart(2,'0')+' / '+String(BOOKS.length).padStart(2,'0');
 const normalized=(selected-(BOOKS.length-1)/2)/Math.max(1,(BOOKS.length-1)/2);
 document.documentElement.style.setProperty('--selection-shift',(normalized*54)+'px');
 document.documentElement.style.setProperty('--selection-depth',Math.abs(normalized).toFixed(2));
 const markers=document.getElementById('markers');markers.innerHTML='';
 BOOKS.forEach((book,i)=>{
   const m=document.createElement('button');
   m.type='button';
   m.className='marker'+(i===selected?' on':'');
   m.setAttribute('aria-label',`${book.title} 선택`);
   m.setAttribute('aria-current',i===selected?'true':'false');
   m.onclick=()=>__smRetargetSelection(i,{duration:__smMotionDuration(3650)});
   markers.append(m);
 });
 setTimeout(()=>{ if(typeof updateSelectedBookLight==='function') updateSelectedBookLight(); },0);
 requestAnimationFrame(()=>__smTrackHitZonesFor(inertiaDir!==0?3900:420));
 clearTimeout(window.__smLibraryRestTimer);
 window.__smLibraryRestTimer=setTimeout(()=>{
   document.getElementById('library')?.classList.add('selection-rest');
   setTimeout(()=>{
     document.getElementById('library')?.classList.remove('selection-rest');
   },720);
 },3650);
 window.__smLastSelected=selected;
}

function renderTodayHome(){
  formatTodayDate();

  const cont=bestContinueReading();
  __smTodayContinueContext=cont.context;
  const vis=progressVisual(cont);
  document.getElementById('todayContinueTitle').textContent=cont.context;
  document.getElementById('todayContinueMeta').textContent=cont.updatedAt?'최근 읽은 곳 · 진행상태 복원':'최근 읽은 곳';
  document.getElementById('todayContinueProgress').style.width=vis.pct+'%';
  document.getElementById('todayContinueProgressText').textContent=vis.label;

  const due=todayRecallItems();
  document.getElementById('todayRecallCount').textContent=String(due.length);
  document.getElementById('todayEntryCount').textContent=String(due.length);
  const recallPreview=document.getElementById('todayRecallPreview');
  if(due.length){
    const item=due[0];
    recallPreview.innerHTML=`<b>NEXT MEMORY · ${escapeHtml(item.title)}</b><strong>${escapeHtml(item.cue||item.prompt)}</strong><small>${escapeHtml(item.context)}</small>`;
    document.getElementById('todayRecallCopy').textContent=`지금 떠올릴 Memory ${due.length}개가 있습니다. 먼저 기억하고, 그 다음 원문을 확인합니다.`;
  }else{
    recallPreview.innerHTML='<b>RECALL CLEAR</b><strong>오늘의 복습을 마쳤습니다.</strong><small>새 Memory가 쌓이면 다시 Queue가 만들어집니다.</small>';
    document.getElementById('todayRecallCopy').textContent='지금 당장 복습할 Memory가 없습니다.';
  }

  const memories=todayMemoryItems();
  document.getElementById('todayMemoryCount').textContent=String(memories.length);
  const list=document.getElementById('todayMemoryList');
  list.innerHTML='';
  if(!memories.length){
    list.innerHTML='<div class="today-empty">오늘 저장한 Memory가 아직 없습니다. 읽다가 표시하거나 메모를 남기면 여기에 이어집니다.</div>';
  }else{
    memories.slice(0,4).forEach(m=>{
      const b=document.createElement('button');
      b.type='button';b.className='today-memory-row';
      b.style.setProperty('--today-accent',m.accent);
      b.innerHTML=`<i></i><div><b>${escapeHtml(m.title)}</b><span>${escapeHtml(m.body)}</span></div><small>${escapeHtml(m.kind)}</small>`;
      b.onclick=m.jump;
      list.append(b);
    });
  }

  const thread=document.getElementById('todayThreadList');
  thread.innerHTML='';
  const readings=recentReadingThread();
  if(!readings.length){
    thread.innerHTML='<div class="today-empty">최근 Reading이 아직 없습니다.</div>';
  }else{
    readings.forEach(r=>{
      const vis=progressVisual(r.progress||{});
      const b=document.createElement('button');
      b.type='button';b.className='today-thread-card';
      b.innerHTML=`<div><strong>${escapeHtml(r.context)}</strong><span>${escapeHtml(vis.label)} · Memory ${__smUserMemories.filter(m=>m.context===r.context).length}</span></div><b>→</b>`;
      b.onclick=()=>openStoredMemoryContext(r.context);
      thread.append(b);
    });
  }
}


function morphVolumeToPaper(v,b){
 const morph=document.getElementById('volumeMorph');
 const obj=morph.querySelector('.volume-morph-object');
 const shadow=morph.querySelector('.volume-morph-shadow');
 const indexEl=document.getElementById('index');
 const target=document.getElementById('chapterCarousel');

 if(v===selectedVolume && !volumeTransitioning){
   const carousel=document.getElementById('chapterCarousel');
   carousel.classList.remove('volume-arrival');
   void carousel.offsetWidth;
   carousel.classList.add('volume-arrival');
   setTimeout(()=>carousel.classList.remove('volume-arrival'),720);
   return;
 }

 const generation=++volumeMorphGeneration;
 clearVolumeMorphTimers();

 const alreadyActive=volumeTransitioning && morph.classList.contains('active');
 const sr=alreadyActive?obj.getBoundingClientRect():b.getBoundingClientRect();
 const tr=target.getBoundingClientRect();

 volumeTransitioning=true;
 document.querySelectorAll('.volume').forEach(x=>x.classList.toggle('on',x===b));
 selectedVolume=v;
 selectedChapter=v==='고린도전서'?3:1;

 document.getElementById('chapterTitle').textContent=v;
 document.getElementById('volumeFocusTitle').textContent=v;
 const count=VOLUME_CHAPTERS[v]||16;
 document.getElementById('volumeFocusCopy').textContent=
   (v==='고린도전서'
    ?'16개의 장 · 읽던 위치 3장 · 기억과 표시를 그대로 이어 읽습니다.'
    :count+'개의 장 · 이 권의 장을 종이뭉치로 넘겨보며 원하는 곳에서 독서를 시작합니다.');

 document.getElementById('volumeMorphTitle').textContent=v;
 morph.className='volume-morph active';
 indexEl.classList.add('volume-transitioning');

 obj.style.transition='none';
 shadow.style.transition='none';
 obj.style.left=sr.left+'px';
 obj.style.top=sr.top+'px';
 obj.style.width=sr.width+'px';
 obj.style.height=sr.height+'px';
 shadow.style.left=(sr.left+sr.width*.10)+'px';
 shadow.style.top=(sr.bottom+5)+'px';
 shadow.style.width=(sr.width*.80)+'px';

 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(generation!==volumeMorphGeneration)return;
   obj.style.transition='';
   shadow.style.transition='';
   morph.classList.add('lift');

   const mobile=innerWidth<=720;
   const finalW=mobile?138:190;
   const finalH=mobile?184:235;
   const finalLeft=tr.left+(tr.width-finalW)/2;
   const finalTop=tr.top+(tr.height-finalH)/2-18;

   obj.style.left=finalLeft+'px';
   obj.style.top=finalTop+'px';
   obj.style.width=finalW+'px';
   obj.style.height=finalH+'px';

   shadow.style.left=(finalLeft+finalW*.10)+'px';
   shadow.style.top=(finalTop+finalH+13)+'px';
   shadow.style.width=(finalW*.80)+'px';
 }));

 const later=(ms,fn)=>{
   const t=setTimeout(()=>{if(generation===volumeMorphGeneration)fn()},ms);
   volumeMorphTimers.push(t);
 };

 later(220,()=>morph.classList.add('destination-hold'));
 later(350,()=>{
   morph.classList.remove('destination-hold');
   morph.classList.add('open');
 });
 later(650,()=>morph.classList.add('to-paper'));
 later(790,()=>applyVolumeSelection(v,b,true));
 later(1060,()=>{
   morph.className='volume-morph';
   indexEl.classList.remove('volume-transitioning');
   obj.style.cssText='';
   shadow.style.cssText='';
   volumeTransitioning=false;
   clearVolumeMorphTimers();
 });
}


function renderChapters(n){
 chapterCount=n;
 if(selectedChapter>n)selectedChapter=1;
 const track=document.getElementById('chapterTrack');
 const dots=document.getElementById('chapterDots');
 track.innerHTML='';dots.innerHTML='';
 for(let i=1;i<=n;i++){
   const d=chapterDelta(i);
   if(Math.abs(d)<=3){
     const st=document.createElement('button');
     st.className='chapter-stack'+(i===selectedChapter?' on':'');
     st.style.border='0';st.style.background='transparent';st.style.padding='0';
     st.style.setProperty('--x',(d*165)+'px');
     st.style.setProperty('--z',(-Math.abs(d)*90)+'px');
     st.style.setProperty('--ry',(d*-10)+'deg');
     st.style.setProperty('--s',i===selectedChapter?'1.08':(Math.abs(d)===1?'.9':'.76'));
     const preview=selectedVolume==='고린도전서'
       ?CHAPTER_PREVIEW[(i-1)%CHAPTER_PREVIEW.length]
       :'이 장의 인물과 사건의 흐름을 따라 읽습니다.';
     st.innerHTML=`<span class="paper-layer layer-a"><i class="contact-shadow"></i></span><span class="paper-layer layer-b"><i class="contact-shadow"></i></span><span class="paper-layer layer-c"><i class="contact-shadow"></i></span><span class="paper-layer layer-d"><i class="contact-shadow"></i></span><span class="paper-layer top"><span class="folio-tab">CH.${String(i).padStart(2,'0')}</span><span class="chapter-small">${selectedVolume}</span><span class="chapter-no">${i}</span><span class="chapter-preview">${preview}</span><span class="sheet-crease"></span><span class="paper-bow"></span><span class="sheet-side-shadow"></span><span class="paper-seal">SM</span>
       <span class="sheet-tension tension-left"></span>
       <span class="sheet-tension tension-right"></span>
       <span class="micro-curl"></span><span class="fold-shadow"></span><span class="chapter-folio">${String(i).padStart(2,'0')} / ${String(chapterCount).padStart(2,'0')}</span>
       <span class="paper-notch"></span>
       <span class="bundle-link bundle-link-a"></span>
       <span class="bundle-link bundle-link-b"></span>
       <span class="lower-tension-line"></span></span>`;
     st.onclick=()=>{
       if(i===selectedChapter){openChapterMorph();return}
       selectedChapter=i;
       renderChapters(chapterCount);
     };
     track.append(st);
   }
   const showDot=n<=24 || Math.abs(i-selectedChapter)<=5;
   if(showDot){
     const dot=document.createElement('button');
     dot.className='chapter-dot'+(i===selectedChapter?' on':'');
     dot.setAttribute('aria-label',`${selectedVolume} ${i}장`);
     dot.onclick=()=>{selectedChapter=i;renderChapters(chapterCount)};
     dots.append(dot);
   }
 }
 document.getElementById('openChapter').textContent=selectedChapter+'장 읽기';
 document.getElementById('chapterSpecimenNo').textContent=String(selectedChapter).padStart(2,'0');
 requestAnimationFrame(triggerChapterSettle);
 clearTimeout(window.__smChapterRestTimer);
 window.__smChapterRestTimer=setTimeout(()=>{
   const carousel=document.getElementById('chapterCarousel');
   carousel.classList.add('paper-settled');
   setTimeout(()=>carousel.classList.remove('paper-settled'),500);
 },560);
}

function openChapterMorph(){
 if(chapterOpening)return;
 const stack=document.querySelector('.chapter-stack.on');
 const selectedSheet=stack?.querySelector('.paper-layer.top');
 if(!selectedSheet){transitionTo('reader');return}

 chapterOpening=true;
 const r=selectedSheet.getBoundingClientRect();
 const morph=document.getElementById('paperMorph');
 const backdrop=document.getElementById('morphBackdrop');
 const carousel=document.getElementById('chapterCarousel');

 document.getElementById('paperMorphNo').textContent=selectedChapter;
 document.getElementById('paperMorphVolume').textContent=selectedVolume;
 document.getElementById('paperMorphFolio').textContent=
   String(selectedChapter).padStart(2,'0')+' / '+String(chapterCount).padStart(2,'0');

 carousel.classList.add('chapter-extracting');
 stack.classList.add('extracting-sheet');

 morph.style.left=r.left+'px';
 morph.style.top=r.top+'px';
 morph.style.width=r.width+'px';
 morph.style.height=r.height+'px';
 morph.style.transition='none';
 morph.classList.add('show');
 backdrop.classList.add('show');

 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   morph.style.transition=
     'left .96s cubic-bezier(.16,.78,.18,1),'+
     'top .96s cubic-bezier(.16,.78,.18,1),'+
     'width .96s cubic-bezier(.16,.78,.18,1),'+
     'height .96s cubic-bezier(.16,.78,.18,1),'+
     'transform .56s cubic-bezier(.16,.78,.18,1),'+
     'box-shadow .32s ease';
   morph.classList.add('lifted');
 }));

 setTimeout(()=>{
   morph.classList.add('held-sheet');
   morph.classList.add('separating');
   stack.classList.add('release-stack');
 },280);

 setTimeout(()=>{
   morph.classList.remove('held-sheet');
   const mobile=__smReaderCompactMode();
   const targetW=mobile?innerWidth:Math.min(innerWidth*.58,760);
   const targetH=mobile?innerHeight:Math.min(innerHeight*.80,800);
   morph.classList.add('is-expanding');
   morph.style.left=((innerWidth-targetW)/2)+'px';
   morph.style.top=((innerHeight-targetH)/2)+'px';
   morph.style.width=targetW+'px';
   morph.style.height=targetH+'px';
 },590);

 setTimeout(()=>morph.classList.add('becoming-reader'),980);

 setTimeout(()=>{
   const smReaderPaper=document.getElementById('paper');
   smReaderPaper?.style.setProperty('--lamp-x','34%');
   smReaderPaper?.style.setProperty('--lamp-y','17%');
   setReaderContext({
     kind:'bible',
     book:'성경',
     volume:selectedVolume,
     chapter:selectedChapter,
     chapterCount:chapterCount
   });
   showScreen('reader');
   const reader=document.getElementById('reader');
   reader.classList.add('paper-enter');
   setTimeout(()=>reader.classList.add('reader-rest'),430);

   morph.classList.remove('show','lifted','held-sheet','separating','is-expanding','becoming-reader');
   morph.style.cssText='';
   backdrop.classList.remove('show');
   carousel.classList.remove('chapter-extracting');
   stack.classList.remove('extracting-sheet','release-stack');

   setTimeout(()=>{
     reader.classList.remove('paper-enter','reader-rest');
     const readerPaper=document.getElementById('paper');
     readerPaper?.style.setProperty('--lamp-x','34%');
     readerPaper?.style.setProperty('--lamp-y','17%');
   },880);
   chapterOpening=false;
 },1420);
}


function animateLibrarySelection(){
  libraryEl.classList.add('book-moving');
  libBottom?.classList.add('book-changing');
  const ghost=document.getElementById('libGhost');
  if(ghost) ghost.textContent=BOOKS[selected].title;

  // Metadata changes quickly; it no longer waits for the whole physical travel.
  clearTimeout(window.__smMetaTimer);
  window.__smMetaTimer=setTimeout(()=>{
    libBottom?.classList.remove('book-changing');
  },220);

  clearTimeout(librarySettleTimer);
  librarySettleTimer=setTimeout(()=>{
    libraryEl.classList.remove('book-moving');
    libraryEl.classList.remove('light-pass');
    void libraryEl.offsetWidth;
    libraryEl.classList.add('light-pass');
    setTimeout(()=>libraryEl.classList.remove('light-pass'),850);
  },3700);
}
