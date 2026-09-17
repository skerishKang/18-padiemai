import fs from 'node:fs';

const file = 'public/design/living-media-sphere/index.html';
let html = fs.readFileSync(file, 'utf8');

function replaceExactly(from, to, label) {
  const count = html.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`PADIEM attribution failed: expected exactly one ${label}, found ${count}`);
  }
  html = html.replace(from, to);
}

replaceExactly(
  '<div class="brand"><span class="mark" aria-hidden="true"></span><span>LoveTree</span></div>',
  '<div class="brand padiem-wordmark"><span class="mark" aria-hidden="true"></span><span class="padiem-product">LoveTree</span><span class="padiem-by">BY PADIEM</span></div>',
  'LoveTree brand lockup',
);

replaceExactly(
  '<div class="top-meta">Living Media Sphere · Entrance Study 01</div>',
  '<div class="top-meta padiem-top-meta"><span>DESIGN ARCHIVE / STUDY 04</span><strong>2026</strong></div>',
  'top metadata',
);

replaceExactly(
  '<section class="viewport" id="viewport" aria-label="Interactive LoveTree sphere">',
  '<section class="viewport" id="viewport" aria-label="Interactive LoveTree sphere"><input class="padiem-note-toggle" id="padiemNoteToggle" type="checkbox"><label class="padiem-note-btn" for="padiemNoteToggle">PADIEM / ABOUT THIS WORK</label><div class="padiem-note"><label class="padiem-note-close" for="padiemNoteToggle" aria-label="Close">×</label><div class="padiem-note-kicker">PADIEM DESIGN ARCHIVE · STUDY 04</div><h3>Living Media Sphere</h3><p>An interactive spatial media study exploring how shared memories can stay discoverable, tactile and emotionally present.</p><div class="padiem-note-meta"><span>CREATED BY PADIEM</span><span>FOR LOVETREE</span><span>2026</span></div></div>',
  'viewport entry',
);

replaceExactly(
  '<div class="status"><span id="visibleCount">36</span> objects',
  '<div class="padiem-archive-signature">PADIEM DESIGN ARCHIVE · 04&nbsp;&nbsp; / &nbsp;&nbsp;MEMORY · MOTION · INTERACTION</div><div class="status"><span id="visibleCount">36</span> objects',
  'status block',
);

const frameCss = `
<style id="padiem-design-archive-attribution">
.brand.padiem-wordmark{align-items:flex-end}
.brand.padiem-wordmark .mark{align-self:center}
.brand.padiem-wordmark .padiem-product{display:block;line-height:1}
.brand.padiem-wordmark .padiem-by{display:block;margin-left:-7px;font-size:7.2px;font-weight:720;letter-spacing:.17em;color:var(--muted);line-height:1;text-transform:uppercase;white-space:nowrap;align-self:flex-end;transform:none;margin-bottom:0}
.padiem-top-meta{display:flex;align-items:center;gap:11px;font-size:8px;letter-spacing:.17em}.padiem-top-meta span{color:var(--muted);font-weight:650}.padiem-top-meta strong{font-size:8px;font-weight:650;color:var(--ink);letter-spacing:.16em}
.padiem-note-toggle{position:absolute;opacity:0;pointer-events:none}.padiem-note-btn{position:absolute;z-index:35;left:18px;top:18px;border:0;border-left:2px solid var(--ink);background:rgba(248,248,245,.55);backdrop-filter:blur(12px);padding:7px 9px;color:var(--muted);font-size:7px;font-weight:650;letter-spacing:.17em;text-transform:uppercase;cursor:pointer;transition:.2s}.padiem-note-btn:hover{color:var(--ink);background:var(--panel)}body.dark .padiem-note-btn{background:rgba(15,17,19,.48)}
.padiem-note{position:absolute;z-index:45;left:18px;top:52px;width:min(310px,calc(100% - 36px));padding:18px 18px 16px;border:1px solid var(--line);border-radius:14px;background:var(--panel);backdrop-filter:blur(28px);box-shadow:0 18px 55px rgba(15,18,20,.14);opacity:0;transform:translateY(-6px);pointer-events:none;transition:.22s}.padiem-note-toggle:checked~.padiem-note{opacity:1;transform:none;pointer-events:auto}.padiem-note-close{position:absolute;right:12px;top:10px;color:var(--muted);font-size:18px;cursor:pointer}.padiem-note-kicker{font-size:7px;letter-spacing:.19em;color:var(--muted);text-transform:uppercase}.padiem-note h3{margin:16px 0 9px;font-size:25px;line-height:1;letter-spacing:-.055em}.padiem-note p{margin:0;font-size:9px;line-height:1.6;color:var(--muted);max-width:250px}.padiem-note-meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:17px;padding-top:12px;border-top:1px solid var(--line);font-size:7px;font-weight:650;letter-spacing:.15em;color:var(--ink);text-transform:uppercase}
.padiem-archive-signature{position:absolute;z-index:12;left:20px;bottom:18px;font-size:7px;font-weight:620;letter-spacing:.16em;color:var(--muted);text-transform:uppercase;pointer-events:none}.selection{bottom:42px}.gesture{bottom:18px}
@media(max-width:940px){.brand.padiem-wordmark .padiem-by{font-size:6.2px;margin-left:-7px}.padiem-top-meta{display:none}.padiem-note-btn{left:12px;top:12px}.padiem-note{left:12px;top:46px}.padiem-archive-signature{left:14px;bottom:14px;max-width:48%;line-height:1.5}.selection{bottom:52px}}
@media(max-width:580px){.brand.padiem-wordmark .padiem-by{letter-spacing:.14em;margin-left:-8px}.padiem-archive-signature{font-size:6px}.padiem-note-btn{font-size:6px}.padiem-note{width:calc(100% - 24px)}}
</style>`;

replaceExactly('</head>', `${frameCss}</head>`, 'head close');

const required = [
  'class="brand padiem-wordmark"',
  'class="padiem-by">BY PADIEM',
  'DESIGN ARCHIVE / STUDY 04',
  'PADIEM / ABOUT THIS WORK',
  'PADIEM DESIGN ARCHIVE · 04',
  'id="padiem-design-archive-attribution"',
];

for (const marker of required) {
  if (!html.includes(marker)) {
    throw new Error(`PADIEM attribution failed: missing output marker ${marker}`);
  }
}

fs.writeFileSync(file, html);
console.log('Living Media Sphere PADIEM attribution: PASS');
