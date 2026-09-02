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

    /* Issue #30: Company / Team / Contact are three views inside one shell.
       Keep the accepted content styling, but lock the outer geometry so tabs do
       not resize or shift the pearl-glass panel between views. */
    @media (min-width:1181px){
      .overlay[data-panel="about"] .overlay-panel,
      .overlay[data-panel="team"] .overlay-panel,
      .overlay[data-panel="inquiry"] .overlay-panel{
        width:min(1160px,85vw)!important;
        height:min(calc(100dvh - 28px),860px)!important;
        max-height:calc(100dvh - 28px)!important;
        grid-template-columns:minmax(260px,.65fr) minmax(0,1.35fr)!important;
        column-gap:48px!important;
        padding:clamp(40px,4vw,58px) clamp(44px,4.5vw,64px)!important;
      }
      .overlay[data-panel="about"] .overlay-panel::before,
      .overlay[data-panel="team"] .overlay-panel::before,
      .overlay[data-panel="inquiry"] .overlay-panel::before{left:33%!important;}
    }

    @media (max-width:1180px) and (min-width:761px){
      .overlay[data-panel="about"] .overlay-panel,
      .overlay[data-panel="team"] .overlay-panel,
      .overlay[data-panel="inquiry"] .overlay-panel{
        width:min(1040px,92vw)!important;
        height:min(calc(100dvh - 28px),860px)!important;
        max-height:calc(100dvh - 28px)!important;
        grid-template-columns:minmax(200px,.55fr) minmax(0,1.45fr)!important;
        column-gap:28px!important;
        padding:34px 32px!important;
      }
      .overlay[data-panel="about"] .overlay-panel::before,
      .overlay[data-panel="team"] .overlay-panel::before,
      .overlay[data-panel="inquiry"] .overlay-panel::before{left:27.5%!important;}
    }

    @media (max-width:760px){
      .overlay[data-panel="about"] .overlay-panel,
      .overlay[data-panel="team"] .overlay-panel,
      .overlay[data-panel="inquiry"] .overlay-panel{
        width:100%!important;
        height:92dvh!important;
        min-height:92dvh!important;
        max-height:92dvh!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
