(() => {
  const header = document.querySelector('[data-site-header="v1"]');
  const menu = document.getElementById('homeMobileMenu');
  const toggle = header?.querySelector('.site-menu-toggle');
  if (!header || !menu || !toggle) return;

  const pathname = location.pathname;
  const isHome = pathname === '/' || pathname === '/index.html';
  const isNotFound = document.body.classList.contains('site-not-found');
  const current = pathname.startsWith('/products') ? '/products/'
    : pathname.startsWith('/design') ? '/design/' : '';
  header.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'page');
  });

  if (isHome) {
    document.querySelectorAll('a[href="/#solutions"]').forEach(link => link.href = '#solutions');
    document.querySelectorAll('a[href="/#evolution"]').forEach(link => link.href = '#evolution');
    document.querySelectorAll('[data-world-drawer="company"]').forEach(link => link.href = '#company');
  }

  let priorFocus = null;
  const close = (restoreFocus = true) => {
    if (menu.hidden) return;
    menu.hidden = true;
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('home-mobile-menu-open');
    if (restoreFocus) (priorFocus || toggle).focus();
  };
  const open = () => {
    priorFocus = document.activeElement;
    menu.hidden = false;
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('home-mobile-menu-open');
    menu.querySelector('.site-mobile-menu-close').focus();
  };
  toggle.addEventListener('click', () => menu.hidden ? open() : close());
  menu.querySelectorAll('[data-home-mobile-close]').forEach(button =>
    button.addEventListener('click', () => close()));
  menu.querySelectorAll('.home-mobile-menu-link').forEach(link =>
    link.addEventListener('click', () => close(false)));
  addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
    if (event.key === 'Tab') {
      const candidates = [...menu.querySelectorAll('button:not([disabled]),a[href]')];
      const first = candidates[0], last = candidates[candidates.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  addEventListener('resize', () => {
    if (innerWidth > 760) close(false);
  });

  // Only the static 404 page lacks the existing Home / World language runtime.
  // Keep its shared header controls usable without inventing translated body copy.
  if (isNotFound) {
    const storage = window.PADIEM_RUNTIME?.storage || { read: () => null, write: () => {} };
    let language = 'ko';
    const saved = storage.read('padiem-language');
    if (saved === 'ko' || saved === 'en') language = saved;
    const apply = next => {
      language = next;
      document.documentElement.lang = next;
      document.body.dataset.lang = next;
      menu.querySelectorAll('[data-world-lang]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.worldLang === next));
      });
      header.querySelectorAll('[data-world-lang]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.worldLang === next));
      });
    };
    document.querySelectorAll('[data-world-lang]').forEach(button =>
      button.addEventListener('click', () => {
        storage.write('padiem-language', button.dataset.worldLang);
        apply(button.dataset.worldLang);
      }));
    apply(language);
  }
})();
