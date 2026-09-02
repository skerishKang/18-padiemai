(() => {
  const links = [...document.querySelectorAll('.nav-links > a.nav-link')];
  if (links.length < 5) return;

  const configure = (element, label, href, overlay = null) => {
    element.textContent = label;
    element.href = href;
    element.removeAttribute('data-overlay');
    if (overlay) element.dataset.overlay = overlay;
  };

  configure(links[0], 'Solutions', '#solutions');
  configure(links[1], 'Evolution', '#evolution');
  configure(links[2], 'Products', '/products/');
  configure(links[3], 'Design', '/design/');
  configure(links[4], 'Company', '#company', 'about');

  // Mobile keeps the exact same IA, but expresses it as a pearl/glass bottom
  // sheet instead of hiding the primary destinations below 760px.
  const navInner = document.querySelector('.nav-inner');
  const chatCta = document.querySelector('.nav-cta');
  if (navInner && chatCta) {
    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'home-mobile-menu-toggle';
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', 'homeMobileMenu');
    menuButton.setAttribute('aria-label', 'Open PADIEM menu');
    menuButton.innerHTML = '<span class="home-mobile-menu-toggle-lines" aria-hidden="true"></span><span class="home-mobile-menu-toggle-text">MENU</span>';
    navInner.insertBefore(menuButton, chatCta);

    const menu = document.createElement('div');
    menu.id = 'homeMobileMenu';
    menu.className = 'home-mobile-menu';
    menu.hidden = true;
    menu.setAttribute('aria-hidden', 'true');
    menu.innerHTML = `
      <div class="home-mobile-menu-backdrop" data-home-mobile-close></div>
      <section class="home-mobile-menu-panel" role="dialog" aria-modal="true" aria-label="PADIEM navigation">
        <div class="home-mobile-menu-meta"><strong>PADIEM</strong><span>Navigation / 2026</span></div>
        <nav class="home-mobile-menu-links" aria-label="Mobile navigation">
          <a class="home-mobile-menu-link" href="#solutions"><span class="home-mobile-menu-index">01</span><span class="home-mobile-menu-label">Solutions</span><span class="home-mobile-menu-arrow">↓</span></a>
          <a class="home-mobile-menu-link" href="#evolution"><span class="home-mobile-menu-index">02</span><span class="home-mobile-menu-label">Evolution</span><span class="home-mobile-menu-arrow">↓</span></a>
          <a class="home-mobile-menu-link" href="/products/"><span class="home-mobile-menu-index">03</span><span class="home-mobile-menu-label">Products</span><span class="home-mobile-menu-arrow">↗</span></a>
          <a class="home-mobile-menu-link" href="/design/"><span class="home-mobile-menu-index">04</span><span class="home-mobile-menu-label">Design</span><span class="home-mobile-menu-arrow">↗</span></a>
          <a class="home-mobile-menu-link" href="#company" data-overlay="about"><span class="home-mobile-menu-index">05</span><span class="home-mobile-menu-label">Company</span><span class="home-mobile-menu-arrow">→</span></a>
        </nav>
        <div class="home-mobile-menu-foot"><span>Scroll narrative · cinematic worlds</span><span>Concept → System → Field</span></div>
      </section>`;
    document.body.appendChild(menu);

    let lastFocused = null;
    const closeMobileMenu = ({ restoreFocus = true } = {}) => {
      if (menu.hidden) return;
      menu.hidden = true;
      menu.setAttribute('aria-hidden', 'true');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('home-mobile-menu-open');
      if (restoreFocus) (lastFocused || menuButton).focus();
    };
    const openMobileMenu = () => {
      lastFocused = document.activeElement;
      menu.hidden = false;
      menu.setAttribute('aria-hidden', 'false');
      menuButton.setAttribute('aria-expanded', 'true');
      document.body.classList.add('home-mobile-menu-open');
      menu.querySelector('.home-mobile-menu-link')?.focus();
    };

    menuButton.addEventListener('click', () => {
      if (menu.hidden) openMobileMenu();
      else closeMobileMenu();
    });
    menu.querySelectorAll('[data-home-mobile-close]').forEach(element => element.addEventListener('click', () => closeMobileMenu()));
    menu.querySelectorAll('.home-mobile-menu-link').forEach(element => element.addEventListener('click', () => closeMobileMenu({ restoreFocus: false })));
    addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) {
        event.preventDefault();
        closeMobileMenu();
      }
    });
    addEventListener('resize', () => {
      if (innerWidth > 760 && !menu.hidden) closeMobileMenu({ restoreFocus: false });
    });
  }

  // Hidden triggers keep Team and Contact inside the existing first-party
  // pearl drawer system without exposing them as competing top-level routes.
  const hiddenHost = document.createElement('div');
  hiddenHost.hidden = true;
  hiddenHost.setAttribute('aria-hidden', 'true');
  hiddenHost.innerHTML = [
    '<button type="button" id="padiemDrawerCompanyTrigger" data-overlay="about"></button>',
    '<button type="button" id="padiemDrawerTeamTrigger" data-overlay="team"></button>',
    '<button type="button" id="padiemDrawerContactTrigger" data-overlay="inquiry"></button>'
  ].join('');
  document.body.appendChild(hiddenHost);

  const requestedPanel = new URLSearchParams(location.search).get('panel');
  const panelTrigger = {
    company: 'padiemDrawerCompanyTrigger',
    team: 'padiemDrawerTeamTrigger',
    contact: 'padiemDrawerContactTrigger'
  }[requestedPanel];

  // This script executes immediately before the existing overlay runtime.
  // Defer the synthetic click until the current script stack has completed so
  // the original runtime has bound its data-overlay listeners first.
  if (panelTrigger) {
    setTimeout(() => document.getElementById(panelTrigger)?.click(), 0);
  }
})();
