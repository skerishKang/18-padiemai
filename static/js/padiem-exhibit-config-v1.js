(() => {
  window.PADIEM_EXHIBIT_CONFIG = Object.freeze({
    version: '1.0.0',
    modes: Object.freeze({
      products: 'album',
      design: 'album',
    }),
    allowedModes: Object.freeze(['current', 'album']),
    queryParam: 'exhibit',
    controlsParam: 'exhibitControls',
  });
})();
