(() => {
  const overlay = document.getElementById('overlay');
  const body = document.getElementById('overlayBody');
  if (!overlay || !body) return;

  const labels = {
    ko: { about: 'COMPANY', team: 'TEAM', inquiry: 'CONTACT' },
    en: { about: 'COMPANY', team: 'TEAM', inquiry: 'CONTACT' }
  };
  const triggerIds = {
    about: 'padiemDrawerCompanyTrigger',
    team: 'padiemDrawerTeamTrigger',
    inquiry: 'padiemDrawerContactTrigger'
  };

  const language = () => document.body.dataset.lang === 'en' ? 'en' : 'ko';

  const injectTabs = () => {
    const panel = overlay.dataset.panel;
    if (!['about', 'team', 'inquiry'].includes(panel)) return;
    if (body.querySelector('.padiem-company-drawer-tabs')) return;

    const nav = document.createElement('div');
    nav.className = 'padiem-company-drawer-tabs';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Company sections');
    nav.innerHTML = ['about', 'team', 'inquiry'].map(key => (
      `<button type="button" data-company-panel="${key}" aria-pressed="${String(key === panel)}">${labels[language()][key]}</button>`
    )).join('');
    body.prepend(nav);
  };

  overlay.addEventListener('click', event => {
    const button = event.target.closest('[data-company-panel]');
    if (!button) return;
    const trigger = document.getElementById(triggerIds[button.dataset.companyPanel]);
    trigger?.click();
  });

  const observer = new MutationObserver(injectTabs);
  observer.observe(body, { childList: true, subtree: false });
  const panelObserver = new MutationObserver(injectTabs);
  panelObserver.observe(overlay, { attributes: true, attributeFilter: ['data-panel'] });
  injectTabs();

  const style = document.createElement('style');
  style.textContent = `
    .padiem-company-drawer-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 22px;}
    .padiem-company-drawer-tabs button{border:1px solid rgba(35,63,86,.16);border-radius:999px;background:rgba(255,255,255,.23);color:rgba(17,42,62,.66);padding:8px 11px;font-family:var(--font-label);font-size:9px;letter-spacing:.12em;cursor:pointer;}
    .padiem-company-drawer-tabs button[aria-pressed="true"]{background:#17354e;color:#fff;border-color:#17354e;}
  `;
  document.head.appendChild(style);
})();
