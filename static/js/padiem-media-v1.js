/**
 * Central public media configuration (issue #50).
 *
 * Only high-churn, page-level media lives here. Exhibit media stays owned by
 * `static/js/padiem-exhibit-registry-v1.js`, which is the authority for Design and Product
 * hero films — do not copy those URLs into a runtime.
 *
 * Every public film is served from the approved first-party media origin
 * (`media.padiem.net`, Cloudflare R2 behind the CDN). No runtime may define its own
 * absolute media URL, so a media move is a one-line change here plus the registry.
 *
 * `fallbackCopy` is the single source for the words shown (and announced) when a film cannot
 * play; runtimes read it instead of inventing their own message.
 */
(() => {
  const origin = 'https://media.padiem.net';
  const build = path => `${origin}/${String(path).replace(/^\/+/, '')}`;

  window.PADIEM_MEDIA = Object.freeze({
    version: '1.0.0',
    origin,
    build,
    home: Object.freeze({
      scrollFilm: build('home/cinematic-scroll-v1.mp4'),
    }),
    fallbackCopy: Object.freeze({
      ko: '영상을 불러오지 못해 정지 화면으로 표시합니다.',
      en: 'The film could not be loaded, so a still frame is shown.',
    }),
  });
})();
