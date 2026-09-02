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

  // LoveTree product donor = current LoveTree Limone MVP001 entry portal, SRC064.
  // Preserve the real Memory Orbit grammar (central welcome copy + orbital moments)
  // without copying the original heavy runtime or personal/source media.
  const love = mount(frames[2], 'love', `
    <span class="px-meta">MVP01 / SRC064 STUDY · LOVETREE</span>
    <div class="love-orbit" aria-label="LoveTree MVP01 Memory Orbit entry study">
      <div class="orbit-brand">LOVETREE · MEMORY ORBIT</div>
      <div class="orbit-world" aria-hidden="false">
        <button class="orbit-card orbit-a visual" type="button" aria-label="Moment 01"><span class="orbit-type">PHOTO</span><span class="orbit-no">01</span></button>
        <button class="orbit-card orbit-b memo" type="button" aria-label="Moment 02"><span class="orbit-type">MEMORY NOTE</span><strong>다시 듣고 싶은<br>그날의 한마디</strong><span class="orbit-no">02</span></button>
        <button class="orbit-card orbit-c visual video" type="button" aria-label="Moment 03"><span class="orbit-play">▶</span><span class="orbit-type">VIDEO</span><span class="orbit-no">03</span></button>
        <button class="orbit-card orbit-d visual" type="button" aria-label="Moment 04"><span class="orbit-type">PHOTO</span><span class="orbit-no">04</span></button>
        <button class="orbit-card orbit-e memo" type="button" aria-label="Moment 05"><span class="orbit-type">MEMO</span><strong>처음 만난 계절을<br>기억해요.</strong><span class="orbit-no">05</span></button>
        <button class="orbit-card orbit-f visual" type="button" aria-label="Moment 06"><span class="orbit-type">PHOTO</span><span class="orbit-no">06</span></button>
        <button class="orbit-card orbit-g visual video" type="button" aria-label="Moment 07"><span class="orbit-play">▶</span><span class="orbit-type">VIDEO</span><span class="orbit-no">07</span></button>
        <button class="orbit-card orbit-h visual" type="button" aria-label="Moment 08"><span class="orbit-type">PHOTO</span><span class="orbit-no">08</span></button>
      </div>
      <div class="orbit-center">
        <span class="orbit-eyebrow">WELCOME BACK</span>
        <strong>다시, 그 순간으로.</strong>
        <p>기억은 아직 여기에서 이어지고 있어요.</p>
        <div class="orbit-actions" aria-label="MVP01 entry actions">
          <button type="button">이어 보던 순간</button>
          <button type="button">첫 순간으로</button>
          <button type="button">내 트리 보기</button>
        </div>
      </div>
      <div class="orbit-status">WELCOME_IDLE · 40 MOMENTS</div>
      <div class="orbit-hint">MOVE · TAP TO FOCUS</div>
    </div>
    <div class="px-foot"><span>REAL MVP01 ENTRY GRAMMAR</span><span>SRC064 · MEMORY ORBIT</span></div>
  `);

  love.querySelectorAll('.orbit-card').forEach(card => card.addEventListener('click', () => {
    love.querySelectorAll('.orbit-card').forEach(node => node.classList.toggle('active', node === card));
  }));
  love.querySelectorAll('.orbit-actions button').forEach(action => action.addEventListener('click', () => {
    love.querySelectorAll('.orbit-actions button').forEach(node => node.classList.toggle('active', node === action));
  }));

  if (!reduced) {
    let orbitX = 0;
    let orbitY = 0;
    const orbitWorld = love.querySelector('.orbit-world');
    love.addEventListener('pointermove', event => {
      const rect = love.getBoundingClientRect();
      orbitX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      orbitY = ((event.clientY - rect.top) / rect.height - .5) * 2;
      if (orbitWorld) orbitWorld.style.transform = `rotateX(${orbitY * -2.5}deg) rotateY(${orbitX * 4}deg) translate3d(${orbitX * 5}px,${orbitY * 3}px,0)`;
    });
    love.addEventListener('pointerleave', () => {
      orbitX = 0;
      orbitY = 0;
      if (orbitWorld) orbitWorld.style.transform = '';
    });
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
