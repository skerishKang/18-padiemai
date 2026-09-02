(() => {
  const config = window.PADIEM_EXHIBIT_CONFIG;
  if (config) {
    const params = new URLSearchParams(location.search);
    const requested = params.get(config.queryParam);
    const mode = config.allowedModes.includes(requested) ? requested : config.modes.design;
    if (mode === 'album') return;
  }

  const frames = [...document.querySelectorAll('.world-media-frame')];
  if (frames.length < 4 || !document.title.includes('PADIEM Design')) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mount = (frame, kind, html) => {
    frame.innerHTML = `<div class="live-exhibit exhibit-${kind}" data-live-exhibit="${kind}">${html}</div>`;
    frame.classList.add('has-live-exhibit');
    return frame.querySelector('[data-live-exhibit]');
  };

  const shelf = mount(frames[0], 'shelf', `
    <span class="exhibit-meta">LIVE STUDY / PERSON MEMORY SHELF</span>
    <div class="shelf-glow"></div>
    <div class="shelf-books" aria-label="Interactive person memory shelf study">
      <button class="memory-book" style="--book:linear-gradient(160deg,#a56079,#6c3549);--rz:-3deg" aria-label="Memory volume one"><span>첫 번째<br>기억</span></button>
      <button class="memory-book" style="--book:linear-gradient(160deg,#7c8e6f,#4b5e42);--rz:2deg" aria-label="Memory volume two"><span>함께한<br>시간</span></button>
      <button class="memory-book active" style="--book:linear-gradient(160deg,#9a735d,#5e4437);--rz:-1deg" aria-label="Memory volume three"><span>우리의<br>장면</span></button>
      <button class="memory-book" style="--book:linear-gradient(160deg,#65758f,#3e495e);--rz:3deg" aria-label="Memory volume four"><span>다시<br>만난 날</span></button>
      <button class="memory-book" style="--book:linear-gradient(160deg,#a67a55,#6e4d34);--rz:-2deg" aria-label="Memory volume five"><span>남겨진<br>온도</span></button>
    </div>
    <div class="shelf-base"></div>
    <div class="exhibit-foot"><span>PERSON → SPACE → RECALL</span><span>SELECT A VOLUME</span></div>
  `);

  shelf.querySelectorAll('.memory-book').forEach(book => book.addEventListener('click', () => {
    shelf.querySelectorAll('.memory-book').forEach(node => node.classList.toggle('active', node === book));
  }));

  const lp = mount(frames[1], 'lp', `
    <span class="exhibit-meta">LIVE STUDY / VINYL MEMORY PLAYER</span>
    <div class="lp-window" aria-hidden="true"></div>
    <div class="turntable" aria-label="Interactive vinyl memory player study">
      <div class="platter"><div class="record"><div class="record-label"></div></div></div>
      <div class="tonearm"></div>
      <button class="lp-toggle" type="button" aria-pressed="false">PLAY MEMORY</button>
    </div>
    <div class="exhibit-foot"><span>ROTATION → TIME → MEMORY</span><span>CLICK PLAY</span></div>
  `);

  const lpToggle = lp.querySelector('.lp-toggle');
  lpToggle.addEventListener('click', () => {
    const playing = lp.classList.toggle('is-playing');
    lpToggle.setAttribute('aria-pressed', String(playing));
    lpToggle.textContent = playing ? 'PAUSE MEMORY' : 'PLAY MEMORY';
  });

  const tape = mount(frames[2], 'tape', `
    <span class="exhibit-meta">LIVE STUDY / MEMORY TAPE</span>
    <div class="tape-grid"></div>
    <svg class="tape-svg" viewBox="0 0 800 480" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="tapeRibbonGradient" x1="0" x2="1"><stop offset="0" stop-color="#77736f"/><stop offset=".45" stop-color="#bab7b0"/><stop offset=".7" stop-color="#726c68"/><stop offset="1" stop-color="#d0ccc4"/></linearGradient></defs>
      <path class="tape-path-shadow" d="M80 335 C170 240 250 330 330 245 S500 115 610 220 S700 325 750 190"/>
      <path class="tape-path" d="M80 335 C170 240 250 330 330 245 S500 115 610 220 S700 325 750 190"/>
    </svg>
    <div class="tape-roll" aria-hidden="true"></div>
    <div class="tape-hud">ROLL ↔ RIBBON<br>PATH = PERSISTENT<br>MECHANICS FIRST</div>
    <div class="exhibit-foot"><span>MOVE POINTER TO DRAW</span><span>ROLL / RIBBON / PATH</span></div>
  `);

  if (!reduced) {
    const updateTape = event => {
      const rect = tape.getBoundingClientRect();
      const x = Math.max(.18, Math.min(.82, (event.clientX - rect.left) / rect.width));
      const y = Math.max(.24, Math.min(.76, (event.clientY - rect.top) / rect.height));
      tape.style.setProperty('--roll-x', `${x * 100}%`);
      tape.style.setProperty('--roll-y', `${y * 100}%`);
      tape.style.setProperty('--roll-r', `${(x - .5) * 420}deg`);
    };
    tape.addEventListener('pointermove', updateTape);
  }

  const wallCards = [
    ['001','-58%','-34%','-70px','12deg'],['002','-15%','-42%','20px','-7deg'],['003','31%','-31%','-25px','9deg'],
    ['004','-68%','5%','30px','8deg'],['005','-25%','2%','85px','-5deg'],['006','22%','7%','15px','7deg'],['007','61%','4%','-55px','-11deg'],
    ['008','-52%','42%','-15px','9deg'],['009','-5%','38%','65px','-6deg'],['010','43%','40%','5px','8deg']
  ];
  const wall = mount(frames[3], 'wall', `
    <span class="exhibit-meta">LIVE STUDY / LIQUID GLASS VIDEO FIELD</span>
    <div class="glass-field" aria-label="Interactive moving memory field study">
      ${wallCards.map(([no,x,y,z,ry]) => `<button class="glass-memory" data-no="LT-${no}" style="--x:${x};--y:${y};--z:${z};--ry:${ry}" aria-label="Moving moment ${no}"></button>`).join('')}
    </div>
    <div class="exhibit-foot"><span>FIELD / DISCOVERY / DEPTH</span><span>SELECT A MOMENT</span></div>
  `);

  const glassField = wall.querySelector('.glass-field');
  wall.querySelectorAll('.glass-memory').forEach(card => card.addEventListener('click', () => {
    wall.querySelectorAll('.glass-memory').forEach(node => node.classList.toggle('active', node === card));
  }));

  if (!reduced) {
    let pointerX = 0;
    let pointerY = 0;
    wall.addEventListener('pointermove', event => {
      const rect = wall.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - .5) * 2;
    });
    wall.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
    const animateField = () => {
      const progress = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--padiem-scroll-progress')) || 0;
      const x = pointerX * 13 + Math.sin(progress * Math.PI * 2) * 5;
      const y = pointerY * 9 + Math.cos(progress * Math.PI * 2) * 4;
      glassField.style.transform = `translate3d(${x}px,${y}px,0) rotateX(${pointerY * -1.5}deg) rotateY(${pointerX * 2}deg)`;
      requestAnimationFrame(animateField);
    };
    requestAnimationFrame(animateField);
  }

  document.querySelectorAll('.world-action-secondary').forEach((pill, index) => {
    if (index > 3) return;
    if (pill.textContent.includes('MECHANICS FIRST')) return;
    pill.textContent = 'LIVE INTERACTION STUDY';
  });
})();
