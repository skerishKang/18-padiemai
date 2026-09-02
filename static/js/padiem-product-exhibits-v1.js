(() => {
  if (!document.title.includes('PADIEM Products')) return;

  const frames = [...document.querySelectorAll('.world-media-frame')];
  if (frames.length < 5) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mount = (frame, kind, html) => {
    frame.innerHTML = `<div class="product-exhibit product-${kind}" data-product-exhibit="${kind}">${html}</div>`;
    frame.classList.add('has-live-exhibit');
    return frame.querySelector('[data-product-exhibit]');
  };

  const chat = mount(frames[0], 'chat', `
    <span class="px-meta">LIVE PRODUCT STUDY / PADIEM CHAT</span>
    <div class="chat-shell" aria-label="Padiem Chat composer study">
      <div class="chat-top"><span>PADIEM CHAT</span><span class="chat-live"><i></i>READY</span></div>
      <div class="chat-thread">
        <div class="bubble user">이 자료에서 핵심만 찾아줘.</div>
        <div class="bubble ai">파일과 대화 맥락을 함께 보고 다음 작업으로 연결할게요.</div>
      </div>
      <div class="composer">
        <div class="composer-row"><span class="composer-placeholder">무엇을 함께 할까요?</span><button class="send-orb" type="button" aria-label="Composer study action">↗</button></div>
        <div class="tool-row" aria-label="Padiem Chat tools"><button class="tool-chip active" type="button">ASK</button><button class="tool-chip" type="button">SEARCH</button><button class="tool-chip" type="button">FILES</button><button class="tool-chip" type="button">PROJECTS</button></div>
      </div>
    </div>
    <div class="px-foot"><span>COMPOSER AS PRIMARY OBJECT</span><span>CHAT.PADIEM.NET</span></div>
  `);
  chat.querySelectorAll('.tool-chip').forEach(chip => chip.addEventListener('click', () => {
    chat.querySelectorAll('.tool-chip').forEach(node => node.classList.toggle('active', node === chip));
  }));

  const story = mount(frames[1], 'story', `
    <span class="px-meta">PUBLIC-SAFE STUDY / STORYMEMORY</span>
    <div class="story-shell" aria-label="StoryMemory three-zone context workspace study">
      <section class="story-zone rail"><span class="zone-label">01 / CONTEXT + MEMORY</span><div class="memory-rail">
        <button class="memory-item active" type="button" data-story-note="문장 위치와 메모를 함께 기억합니다.">BOOKMARK / 014</button>
        <button class="memory-item" type="button" data-story-note="선택한 문장과 연결된 기억을 다시 찾습니다.">MEMORY / 021</button>
        <button class="memory-item" type="button" data-story-note="출처와 locator를 유지한 채 질문합니다.">CONTEXT / 038</button>
      </div></section>
      <section class="story-zone reader"><span class="zone-label">02 / SOURCE VIEWER</span><div class="reader-title">읽는 콘텐츠가<br>주인공입니다.</div><div class="reader-copy"><div class="reader-line"></div><div class="reader-line"></div><div class="reader-line highlight">문장과 위치, 기억과 질문이 같은 독서 흐름 안에서 이어집니다.</div><div class="reader-line"></div></div></section>
      <aside class="story-zone companion"><span class="zone-label">03 / AI COMPANION</span><div class="companion-card"><strong>AI Companion</strong><p data-story-companion>문장 위치와 메모를 함께 기억합니다.</p><div class="locator">LOCATOR / SOURCE 014</div></div></aside>
    </div>
    <div class="px-foot"><span>SOURCE FIRST</span><span>MEMORY + COMPANION SECONDARY</span></div>
  `);
  const storyCompanion = story.querySelector('[data-story-companion]');
  story.querySelectorAll('.memory-item').forEach(item => item.addEventListener('click', () => {
    story.querySelectorAll('.memory-item').forEach(node => node.classList.toggle('active', node === item));
    if (storyCompanion) storyCompanion.textContent = item.dataset.storyNote || '';
  }));

  // Product 03 shows REAL LoveTree MVP01 production footage captured from the
  // live deploy (lovetree-limone). No simulated reproduction.
  const loveSteps = [
    { label: 'ENTRY ORBIT', t: 1.5 },
    { label: 'LIVING BOARD', t: 20.5 },
    { label: 'RELATIONSHIPS', t: 27.5 },
    { label: 'MEMORY DETAIL', t: 36.5 },
    { label: 'DEEP EXPLORE', t: 42.5 },
  ];
  const love = mount(frames[2], 'love', `
    <span class="px-meta">LIVE DEPLOY FOOTAGE / LOVETREE MVP01</span>
    <div class="love-demo" aria-label="LoveTree MVP01 production walkthrough footage">
      <video class="love-video" src="/videos/love-mvp01-walkthrough.mp4" poster="/videos/love-mvp01-poster.jpg" muted loop playsinline preload="metadata"></video>
      <div class="love-demo-top"><span class="love-live"><i></i>REAL PRODUCTION · LOVETREE-LIMONE</span><span class="love-time">STEP 1 / 5</span></div>
      <div class="love-demo-bar">
        <button class="love-play" type="button" aria-label="영상 재생 또는 정지">❚❚</button>
        <div class="love-steps" role="group" aria-label="MVP01 five step chapters">${loveSteps.map(step => `<button type="button" data-step-at="${step.t}">${step.label}</button>`).join('')}</div>
      </div>
    </div>
    <div class="px-foot"><span>ACTUAL MVP01 WALKTHROUGH · 5 STEPS · 58s</span><span>CAPTURED FROM LIVE DEPLOY</span></div>
  `);
  const loveVideo = love.querySelector('video');
  const lovePlay = love.querySelector('.love-play');
  const loveTime = love.querySelector('.love-time');
  const loveStepBtns = [...love.querySelectorAll('.love-steps button')];
  const loveSyncStep = () => {
    let idx = 0;
    loveStepBtns.forEach((btn, i) => { if (loveVideo.currentTime >= parseFloat(btn.dataset.stepAt) - .1) idx = i; });
    loveStepBtns.forEach((btn, i) => btn.classList.toggle('active', i === idx));
    if (loveTime) loveTime.textContent = `STEP ${idx + 1} / 5`;
  };
  lovePlay.addEventListener('click', () => { if (loveVideo.paused) loveVideo.play(); else loveVideo.pause(); });
  loveVideo.addEventListener('play', () => { lovePlay.textContent = '❚❚'; });
  loveVideo.addEventListener('pause', () => { lovePlay.textContent = '▶'; });
  loveVideo.addEventListener('timeupdate', loveSyncStep);
  loveStepBtns.forEach(btn => btn.addEventListener('click', () => {
    loveVideo.currentTime = parseFloat(btn.dataset.stepAt);
    loveVideo.play();
  }));
  if (!reduced && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) loveVideo.play().catch(() => {});
        else loveVideo.pause();
      });
    }, { threshold: .35 }).observe(love);
  }

  const danji = mount(frames[3], 'danji', `
    <span class="px-meta">PRODUCT STUDY / DANJION</span>
    <div class="danji-shell" aria-label="Living Neighbor Shop study">
      <div class="danji-controls"><div class="danji-mark">단지온</div><div class="danji-sub">같은 단지에서 일하는 이웃을 먼저 발견합니다.</div><div class="search-box">가게와 서비스 찾기</div><div class="work-tabs">
        <button class="work-tab active" type="button" data-work-title="오늘의 반찬" data-work-person="같은 단지 이웃 · 음식 준비" data-work-benefit="입주민 픽업 혜택" data-work-accent="rgba(213,171,119,.42)">음식 · 반찬</button>
        <button class="work-tab" type="button" data-work-title="한결 수학" data-work-person="같은 단지 이웃 · 수학 지도" data-work-benefit="입주민 상담 우선" data-work-accent="rgba(120,158,205,.36)">교육 · 수업</button>
        <button class="work-tab" type="button" data-work-title="온케어 홈서비스" data-work-person="같은 단지 이웃 · 홈케어" data-work-benefit="단지 방문비 절감" data-work-accent="rgba(125,178,151,.38)">홈케어</button>
      </div></div>
      <div class="work-stage" style="--work-accent:rgba(213,171,119,.42)"><span class="work-label">TODAY'S WORKING NEIGHBOR</span><div class="work-title" data-work-stage-title>오늘의 반찬</div><div class="work-person" data-work-stage-person>같은 단지 이웃 · 음식 준비</div><div class="benefit"><span>RESIDENT BENEFIT</span><strong data-work-stage-benefit>입주민 픽업 혜택</strong></div></div>
    </div>
    <div class="px-foot"><span>WORKING NEIGHBOR + SEARCH</span><span>NOT APARTMENT ERP</span></div>
  `);
  const workStage = danji.querySelector('.work-stage');
  const workTitle = danji.querySelector('[data-work-stage-title]');
  const workPerson = danji.querySelector('[data-work-stage-person]');
  const workBenefit = danji.querySelector('[data-work-stage-benefit]');
  danji.querySelectorAll('.work-tab').forEach(tab => tab.addEventListener('click', () => {
    danji.querySelectorAll('.work-tab').forEach(node => node.classList.toggle('active', node === tab));
    if (workTitle) workTitle.textContent = tab.dataset.workTitle || '';
    if (workPerson) workPerson.textContent = tab.dataset.workPerson || '';
    if (workBenefit) workBenefit.textContent = tab.dataset.workBenefit || '';
    if (workStage) workStage.style.setProperty('--work-accent', tab.dataset.workAccent || 'rgba(125,178,151,.38)');
  }));

  const radar = mount(frames[4], 'radar', `
    <span class="px-meta">EDITORIAL STUDY / AI FREE RADAR</span>
    <div class="radar-board" aria-label="AI Free Radar benefit-first editorial study">
      <button class="radar-card primary active" type="button"><span class="benefit-label">BENEFIT FIRST / STUDY</span><strong class="benefit-big">지금<br>무료인가?</strong><span class="evidence-row"><span class="evidence-dot">EVIDENCE READY</span><span>CONDITION CHECK</span></span></button>
      <button class="radar-card" type="button"><span class="benefit-label">DISCOVERY</span><strong class="benefit-big">무료 범위</strong><span class="evidence-row"><span>OFFICIAL SOURCE</span></span></button>
      <button class="radar-card" type="button"><span class="benefit-label">URGENCY</span><strong class="benefit-big">종료 조건</strong><span class="evidence-row"><span>VERIFY FIRST</span></span></button>
    </div>
    <div class="px-foot"><span>BENEFIT → EVIDENCE → CONDITION</span><span>NO INVENTED OFFER</span></div>
  `);
  radar.querySelectorAll('.radar-card').forEach(card => card.addEventListener('click', () => {
    radar.querySelectorAll('.radar-card').forEach(node => node.classList.toggle('active', node === card));
  }));
})();
