(() => {
  const progress = document.querySelector('[data-world-progress]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateProgress = () => {
    if (!progress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / max))})`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);
  updateProgress();

  const revealEls = [...document.querySelectorAll('.reveal')];
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = `${entry.target.dataset.delay || 0}ms`;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealEls.forEach(el => observer.observe(el));
  }

  const DRAWER = {
    ko: {
      company: {
        kicker: 'COMPANY / 01',
        title: '주식회사 파디엠',
        lead: '기술을 나열하는 데서 멈추지 않고, 산업과 공공의 실제 업무를 사람이 체감하는 AI 시스템으로 바꿉니다.',
        paragraphs: [
          '파디엠은 2016년 Safety IoT 기술에서 출발해 2018년 법인을 설립하고, 음성·언어 AI, Vision·Multimodal AI, Generative AI·AX, Public AI Agent로 기술 영역을 확장해왔습니다.',
          '제품, 인터랙션, 운영 구조를 따로 보지 않고 하나의 실행 경험으로 설계하는 것이 파디엠의 핵심 방식입니다.'
        ],
        items: ['Safety IoT · Public Safety', 'Speech · Language AI', 'Vision · Multimodal AI', 'Generative AI · AX', 'Public AI Agent']
      },
      team: {
        kicker: 'COMPANY / 02',
        title: 'Team',
        lead: '기술, 제품, 디자인과 현장 문제를 하나의 흐름으로 연결하는 멀티디시플린 팀.',
        paragraphs: [
          '파디엠의 공개 사이트에서는 개인 경력의 나열보다 어떤 문제를 어떤 방식으로 해결하는지가 먼저 보이도록 합니다.',
          '리더십 상세 프로필은 검증된 공개 정보만 사용하며 별도 승인 없이 새로운 수치·경력·성과를 만들어내지 않습니다.'
        ],
        items: ['Product & Business', 'AI & Software', 'Interaction Design', 'Public / Field Operations']
      },
      contact: {
        kicker: 'COMPANY / 03',
        title: 'Project Inquiry',
        lead: '현재 해결하려는 업무와 문제를 알려주시면 적용 가능한 AI 방식부터 함께 검토합니다.',
        paragraphs: ['기업 AI 도입, 공공 AI 서비스, 맞춤형 기술 개발, AI 교육·컨설팅, 사업 제휴를 검토합니다.'],
        items: ['기업 AI 도입', '공공 AI 서비스', '맞춤형 기술 개발', 'AI 교육·컨설팅', '사업 제휴'],
        email: 'ceo@padiem.net'
      }
    },
    en: {
      company: {
        kicker: 'COMPANY / 01',
        title: 'PADIEM Co., Ltd.',
        lead: 'We turn real workflows across industry and the public sector into AI systems people can actually experience and use.',
        paragraphs: [
          'PADIEM began with Safety IoT in 2016, incorporated in 2018, and expanded into speech and language AI, vision and multimodal AI, generative AI and AX, and public AI agents.',
          'Our core method is to design product, interaction and operational structure as one execution experience.'
        ],
        items: ['Safety IoT · Public Safety', 'Speech · Language AI', 'Vision · Multimodal AI', 'Generative AI · AX', 'Public AI Agent']
      },
      team: {
        kicker: 'COMPANY / 02',
        title: 'Team',
        lead: 'A multidisciplinary team connecting technology, product, design and field problems in one flow.',
        paragraphs: [
          'Our public site prioritizes how we solve problems over a long list of credentials.',
          'Leadership details use verified public information only; no new metrics or claims are introduced without authority.'
        ],
        items: ['Product & Business', 'AI & Software', 'Interaction Design', 'Public / Field Operations']
      },
      contact: {
        kicker: 'COMPANY / 03',
        title: 'Project Inquiry',
        lead: 'Tell us the workflow or problem you are trying to solve, and we will review a practical AI approach with you.',
        paragraphs: ['We review enterprise AI adoption, public AI services, custom technology development, AI training and consulting, and partnerships.'],
        items: ['Enterprise AI Adoption', 'Public AI Services', 'Custom Technology Development', 'AI Training & Consulting', 'Partnerships'],
        email: 'ceo@padiem.net'
      }
    }
  };

  const langButtons = [...document.querySelectorAll('[data-world-lang]')];
  let language = localStorage.getItem('padiem-language') || (/^ko/i.test(navigator.language || '') ? 'ko' : 'en');
  if (!DRAWER[language]) language = 'ko';

  const applyLanguage = next => {
    if (!DRAWER[next]) return;
    language = next;
    localStorage.setItem('padiem-language', next);
    document.documentElement.lang = next;
    document.body.dataset.lang = next;
    langButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.worldLang === next)));
    document.querySelectorAll('[data-copy-ko][data-copy-en]').forEach(element => {
      const value = next === 'ko' ? element.dataset.copyKo : element.dataset.copyEn;
      if (value) element.textContent = value;
    });
    if (overlay && !overlay.hidden) renderDrawer(activeDrawerTab);
  };
  langButtons.forEach(button => button.addEventListener('click', () => applyLanguage(button.dataset.worldLang)));

  const overlay = document.getElementById('worldCompanyOverlay');
  const overlayKicker = document.getElementById('worldDrawerKicker');
  const overlayTitle = document.getElementById('worldDrawerTitle');
  const overlayLead = document.getElementById('worldDrawerLead');
  const overlayBody = document.getElementById('worldDrawerBody');
  const closeButton = overlay?.querySelector('[data-world-drawer-close]');
  let activeDrawerTab = 'company';
  let lastTrigger = null;

  const renderDrawer = key => {
    if (!overlay || !DRAWER[language][key]) return;
    activeDrawerTab = key;
    const data = DRAWER[language][key];
    overlay.dataset.panel = key;
    overlay.style.setProperty('--overlay-accent-rgb', key === 'contact' ? '143,207,255' : key === 'team' ? '153,194,229' : '228,188,116');
    overlayKicker.textContent = data.kicker;
    overlayTitle.textContent = data.title;
    overlayLead.textContent = data.lead;
    const tabs = `<div class="world-drawer-tabs" role="tablist" aria-label="Company sections">
      ${['company','team','contact'].map(tab => `<button type="button" data-world-drawer-tab="${tab}" aria-pressed="${String(tab === key)}">${tab.toUpperCase()}</button>`).join('')}
    </div>`;
    const paragraphs = data.paragraphs.map(text => `<p>${text}</p>`).join('');
    const list = `<ul class="world-drawer-list">${data.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    const email = data.email ? `<a class="world-drawer-link" href="mailto:${data.email}">${data.email}</a>` : '';
    overlayBody.innerHTML = `${tabs}<div class="world-drawer-copy">${paragraphs}${list}${email}</div>`;
  };

  const openDrawer = trigger => {
    if (!overlay) return;
    lastTrigger = trigger || null;
    renderDrawer('company');
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
    closeButton?.focus();
  };
  const closeDrawer = () => {
    if (!overlay) return;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');
    lastTrigger?.focus();
  };

  document.querySelectorAll('[data-world-drawer="company"]').forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault();
    openDrawer(trigger);
  }));
  overlay?.addEventListener('click', event => {
    const tab = event.target.closest('[data-world-drawer-tab]');
    if (tab) {
      renderDrawer(tab.dataset.worldDrawerTab);
      return;
    }
    if (event.target.closest('[data-world-drawer-close]')) closeDrawer();
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay && !overlay.hidden) closeDrawer();
  });

  applyLanguage(language);
})();
