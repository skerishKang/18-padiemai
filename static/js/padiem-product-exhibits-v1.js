(() => {
  if (!document.title.includes('PADIEM Products')) return;

  const frames = [...document.querySelectorAll('.world-media-frame')];
  if (frames.length < 5) return;

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

  const love = mount(frames[2], 'love', `
    <span class="px-meta">PRODUCT STUDY / LOVETREE</span>
    <div class="love-field" aria-label="Connected memory tree study">
      <svg class="love-svg" viewBox="0 0 800 480" preserveAspectRatio="none" aria-hidden="true"><path class="love-link" d="M120 150 C260 110 300 180 385 225 M365 100 C390 145 392 175 385 225 M650 180 C540 175 475 205 385 225 M265 395 C305 325 340 270 385 225 M560 405 C520 320 465 270 385 225"/></svg>
      <button class="memory-node node-a" type="button"><strong>첫 무대</strong><span>좋아했던 순간을 기억으로 남깁니다.</span></button>
      <button class="memory-node node-b" type="button"><strong>다시 본 영상</strong><span>미디어와 감정의 맥락을 이어갑니다.</span></button>
      <button class="memory-node node-c" type="button"><strong>함께 남긴 말</strong><span>공개 기억과 커뮤니티를 연결합니다.</span></button>
      <button class="memory-node node-d" type="button"><strong>이어진 기억</strong><span>새 순간을 기존 흐름에 붙입니다.</span></button>
      <button class="memory-node node-e" type="button"><strong>오늘의 순간</strong><span>시간이 지나도 다시 탐색할 수 있습니다.</span></button>
      <div class="tree-core">MEMORY<br>TREE</div>
    </div>
    <div class="px-foot"><span>MOMENT → MEMORY → CONNECTION</span><span>EXTERNAL SUCCESSOR</span></div>
  `);
  love.querySelectorAll('.memory-node').forEach(node => node.addEventListener('click', () => {
    love.querySelectorAll('.memory-node').forEach(card => card.classList.toggle('active', card === node));
  }));

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
