(() => {
  const config = Object.freeze({
    version: '1.0.0',
    modes: Object.freeze({
      products: 'album',
      design: 'album',
    }),
    allowedModes: Object.freeze(['current', 'album']),
    queryParam: 'exhibit',
    controlsParam: 'exhibitControls',
  });
  window.PADIEM_EXHIBIT_CONFIG = config;

  const params = new URLSearchParams(location.search);
  if (params.get(config.controlsParam) !== '1') return;

  const pageKey = location.pathname.startsWith('/design')
    ? 'design'
    : location.pathname.startsWith('/products')
      ? 'products'
      : '';
  if (!pageKey) return;

  const requested = params.get(config.queryParam);
  const active = config.allowedModes.includes(requested) ? requested : config.modes[pageKey];

  const mount = () => {
    const controls = document.createElement('div');
    controls.className = 'px-exhibit-controls';
    controls.setAttribute('aria-label', 'Exhibit view test controls');
    controls.innerHTML = config.allowedModes.map(mode => `<button type="button" data-exhibit-mode="${mode}" aria-pressed="${String(mode === active)}">${mode.toUpperCase()}</button>`).join('');
    controls.addEventListener('click', event => {
      const button = event.target.closest('[data-exhibit-mode]');
      if (!button) return;
      const next = new URL(location.href);
      next.searchParams.set(config.queryParam, button.dataset.exhibitMode);
      next.searchParams.set(config.controlsParam, '1');
      location.assign(next.toString());
    });
    document.body.appendChild(controls);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
