#!/usr/bin/env node
// Generates site/poster.html (a standalone A1 landscape print poster of the AI Platform Capability Model)
// from the model returned by build.js, then renders the PDF and a PNG preview with headless Chrome.
//   node site/poster.js            -> write poster.html, render PDF + PNG
//   node site/poster.js --html     -> write poster.html only
//   node site/poster.js --check    -> write poster.html and print layout checks (clipping, column fill, fonts)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const here = __dirname;
const root = path.resolve(here, '..');
const D = require('./build.js');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_HTML = path.join(here, 'poster.html');
const OUT_PDF = path.join(here, 'downloads', 'AI Platform Capability Model v3 Poster.pdf');
const OUT_PNG = path.join(here, 'downloads', 'AI Platform Capability Model v3 Poster.png');
const ARTIFACT_URL = 'claude.ai/artifact/N1aTBgXoraEoz2PqjavbS5';

// Page geometry (mm). A1 landscape; everything below is in mm so it scales to A2/A3.
const PAGE_W = 841, PAGE_H = 594;
const PREVIEW_W = 2400; // px width of the PNG preview
const MM_PX = 96 / 25.4;
const PREVIEW_ZOOM = PREVIEW_W / (PAGE_W * MM_PX);
const PREVIEW_H = Math.round(PAGE_H * MM_PX * PREVIEW_ZOOM);

const HUES = ['#3D6098', '#2F8071', '#8A5A2B', '#8B3A62', '#5B6B2E', '#4B5A8F', '#556170', '#7A4F3A'];
const PREV = {
  wide:  { label: 'Wide',  color: '#1C7A46', def: 'most clients store it' },
  mixed: { label: 'Mixed', color: '#B0761A', def: 'several clients, different shapes' },
  rare:  { label: 'Rare',  color: '#2F5D8A', def: 'one or two clients' },
  host:  { label: 'Host',  color: '#6B4C9A', def: 'the model runtime' },
  open:  { label: 'Open',  color: '#8996A2', def: 'in the product class, but no reviewed platform ships it' },
};

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const iconCache = {};
function icon(rel) {
  if (!iconCache[rel]) {
    const buf = fs.readFileSync(path.join(here, rel));
    iconCache[rel] = 'data:image/png;base64,' + buf.toString('base64');
  }
  return iconCache[rel];
}

const allServices = D.areas.flatMap(a => a.capabilities.flatMap(c => c.services));
const totalCaps = D.areas.reduce((n, a) => n + a.capabilities.length, 0);
const counts = Object.fromEntries(Object.keys(PREV).map(k => [k, allServices.filter(s => s.prevalence === k).length]));
const word = n => ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'][n] || String(n);
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

// Columns with 12 or more services set their tiles two-up in a double-width column; the rest are one-up.
// That turns 8..20 services into 8..11 tile rows per column, so the eight columns end at nearly the same height.
const TWO_UP_AT = 12;
const areaSize = a => a.capabilities.reduce((k, c) => k + c.services.length, 0);
const colsOf = a => (areaSize(a) >= TWO_UP_AT ? 2 : 1);

function tile(s) {
  const p = PREV[s.prevalence] || PREV.mixed;
  const isOpen = s.prevalence === 'open';
  return `<div class="tile${isOpen ? ' open' : ''}" title="${esc(s.id)}">
        <div class="tn"><span class="nm">${esc(s.name)}</span></div>
        <div class="tm"><span class="pa">${esc(s.pattern)} · ${esc(s.asset)}</span>${isOpen ? '<span class="otag">open</span>' : `<span class="pv" style="--p:${p.color}" title="${p.label}"></span>`}</div>
        <div class="td">${esc(s.description)}</div>
      </div>`;
}

function capability(c, cols) {
  const rows = Math.ceil(c.services.length / cols);
  return `<section class="cap" style="flex-grow:${rows}">
      <header class="ch">
        <img src="${icon(c.icon)}" alt="">
        <div class="cn"><b>${esc(c.name)}</b><span class="cid">${esc(c.id)}</span></div>
        <div class="co">${esc(c.owner)}</div>
      </header>
      <div class="tiles" style="--cols:${cols}">
      ${c.services.map(tile).join('\n      ')}
      </div>
    </section>`;
}

function area(a) {
  const n = areaSize(a), cols = colsOf(a);
  const hue = HUES[(a.hue || 1) - 1];
  return `<article class="area c${cols}" style="--h:${hue}">
    <header class="ah">
      <div class="at">
        <img src="${icon(a.icon)}" alt="">
        <div>
          <div class="aid">${esc(a.id)}</div>
          <h2>${esc(a.name)}</h2>
        </div>
      </div>
      <div class="ac">${a.capabilities.length} capabilities · ${n} services</div>
      <p class="ad">${esc(a.description)}</p>
    </header>
    <div class="caps">
    ${a.capabilities.map(c => capability(c, cols)).join('\n    ')}
    </div>
    <footer class="scope"><b>Scope</b>${esc(a.scope)}</footer>
  </article>`;
}

function html() {
  const legend = Object.entries(PREV).map(([k, p]) =>
    `<div class="lg ${k}"><span class="sw" style="--p:${p.color}"></span><div><b>${p.label}</b> <span class="lc">${counts[k]}</span><br><span>${esc(cap1(p.def))}</span></div></div>`).join('');
  const plats = D.platforms.map(p =>
    `<div class="pl"><span class="pc">${esc(p.code)}</span><span>${esc(p.name)}<em>${esc(p.vendor)}${p.kind === 'host' ? ' · model host' : ''}</em></span></div>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(D.name)} ${esc(D.version)} Poster</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=block">
<style>
  @page { size: ${PAGE_W}mm ${PAGE_H}mm; margin: 0 }
  :root{
    --display:"Archivo","Helvetica Neue",Arial,sans-serif;
    --body:"IBM Plex Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
    --mono:"IBM Plex Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace;
    --ground:#F3F5F8; --surface:#FFFFFF; --ink:#101821; --muted:#4A5762; --faint:#7A8794;
    --line:#D3DBE3; --accent:#C2410C;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:var(--ground)}
  body{width:${PAGE_W}mm;height:${PAGE_H}mm;overflow:hidden;color:var(--ink);font-family:var(--body);
    -webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-font-smoothing:antialiased}
  .page{width:${PAGE_W}mm;height:${PAGE_H}mm;padding:13mm 14mm 10mm;display:flex;flex-direction:column;gap:7mm}

  /* Title band */
  .band{display:grid;grid-template-columns:1fr 128mm;gap:14mm;align-items:end;padding-bottom:6mm;border-bottom:0.6mm solid var(--ink)}
  .eyebrow{font-family:var(--mono);font-weight:600;font-size:3.6mm;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin:0 0 2.5mm}
  h1{font-family:var(--display);font-weight:800;font-size:17mm;line-height:.95;letter-spacing:-.025em;margin:0}
  .thesis{font-family:var(--display);font-weight:700;font-size:8.2mm;line-height:1.12;letter-spacing:-.015em;margin:4mm 0 0}
  .thesis em{font-style:normal;color:var(--accent)}
  .rule{font-size:4.1mm;line-height:1.42;color:var(--muted);margin:3.5mm 0 0;max-width:470mm}
  .rule b{color:var(--ink);font-weight:600}
  .rule .m{font-family:var(--mono);font-size:3.7mm;color:var(--ink)}
  .meta{display:grid;grid-template-columns:repeat(4,auto);justify-content:end;gap:2mm 7mm;text-align:right}
  .meta div{font-family:var(--mono);font-size:3.3mm;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
  .meta b{display:block;font-family:var(--display);font-weight:800;font-size:11mm;letter-spacing:-.02em;color:var(--ink);text-transform:none;line-height:1}
  .meta .stamp{grid-column:1/-1;font-size:3.3mm;color:var(--muted);letter-spacing:.06em;padding-top:2mm;border-top:0.3mm solid var(--line)}

  /* Columns: double-width columns hold two-up tiles; header, capabilities, and scope share subgrid rows */
  .grid{flex:1;min-height:0;display:grid;grid-template-columns:${D.areas.map(a => colsOf(a) === 2 ? '2fr' : '1fr').join(' ')};
    grid-template-rows:auto 1fr auto;column-gap:5mm;row-gap:0}
  .area{grid-row:1/4;display:grid;grid-template-rows:subgrid;min-width:0;min-height:0}
  .ah{background:var(--h);color:#fff;border-radius:2.2mm;padding:3.2mm 3.4mm 3.4mm;display:flex;flex-direction:column}
  .at{display:flex;gap:2.8mm;align-items:center}
  .at img{width:10.5mm;height:10.5mm;border-radius:1.6mm;flex:none;box-shadow:0 0 0 0.35mm rgba(255,255,255,.45)}
  .aid{font-family:var(--mono);font-weight:600;font-size:3.1mm;letter-spacing:.1em;opacity:.92}
  .ah h2{font-family:var(--display);font-weight:800;font-size:6mm;line-height:1.02;letter-spacing:-.02em;margin:.5mm 0 0}
  .ac{font-family:var(--mono);font-size:2.9mm;font-weight:500;opacity:.92;margin-top:2.4mm;padding-top:1.6mm;border-top:0.3mm solid rgba(255,255,255,.35)}
  .ad{font-size:3.1mm;line-height:1.36;margin:1.4mm 0 0;opacity:.96}
  .c2 .ad{font-size:3.6mm;line-height:1.38}

  .caps{display:flex;flex-direction:column;gap:3.6mm;padding-top:3.6mm;min-height:0}
  .cap{display:flex;flex-direction:column;flex-basis:auto;min-height:0}
  .ch{display:grid;grid-template-columns:6.6mm 1fr;column-gap:2.2mm;align-items:center;padding:0 0.4mm 1.4mm;border-bottom:0.45mm solid var(--h);margin-bottom:1.8mm}
  .ch img{grid-row:1/3;width:6.6mm;height:6.6mm;border-radius:1.2mm}
  .cn{display:flex;align-items:baseline;gap:2mm;min-width:0}
  .cn b{font-family:var(--display);font-weight:700;font-size:4.4mm;letter-spacing:-.01em;line-height:1.1;color:var(--h);white-space:nowrap}
  .cid{font-family:var(--mono);font-size:2.6mm;color:var(--faint);margin-left:auto}
  .co{font-family:var(--mono);font-size:2.6mm;color:var(--muted);line-height:1.25}

  .tiles{flex:1;display:grid;grid-template-columns:repeat(var(--cols),minmax(0,1fr));grid-auto-rows:1fr;gap:1.6mm}
  .tile{display:flex;flex-direction:column;min-width:0;background:var(--surface);border:0.3mm solid var(--line);border-left:3px solid var(--h);border-radius:1.3mm;padding:1.6mm 1.8mm 1.7mm 2.2mm}
  .tile.open{border-style:dashed;border-left-style:dashed;border-left-color:var(--h);background:#FAFBFC}
  .tn{display:flex;align-items:center;gap:1.4mm;white-space:nowrap;min-width:0}
  .nm{font-weight:600;font-size:3.8mm;line-height:1.2;letter-spacing:-.01em;overflow:hidden}
  .tile.open .nm{color:var(--muted)}
  .otag{flex:none;margin-left:auto;font-family:var(--mono);font-weight:600;font-size:2.2mm;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);border:0.3mm dashed var(--muted);border-radius:0.8mm;padding:0 .8mm;line-height:1.4}
  .tm{display:flex;justify-content:space-between;align-items:center;gap:1.2mm;font-family:var(--mono);font-size:2.5mm;color:var(--muted);line-height:1.3;margin-top:.5mm;white-space:nowrap}
  .pa{overflow:hidden}
  .pv{flex:none;width:2.2mm;height:2.2mm;border-radius:50%;background:var(--p)}
  .tile.open .pv{background:transparent;border:0.3mm dashed var(--p)}
  .td{font-size:3.4mm;line-height:1.3;color:var(--muted);margin-top:.9mm}

  .scope{margin-top:3.6mm;font-size:2.9mm;line-height:1.36;color:var(--muted);border-top:0.3mm solid var(--line);padding:1.8mm 0.4mm 0}
  .scope b{display:block;font-family:var(--mono);font-size:2.5mm;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--h);margin-bottom:.5mm}

  /* Footer */
  .foot{display:grid;grid-template-columns:auto 1fr auto;gap:12mm;align-items:start;border-top:0.6mm solid var(--ink);padding-top:4.5mm}
  .kt{font-family:var(--mono);font-weight:600;font-size:3mm;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-bottom:2.4mm}
  .legend{display:grid;grid-template-columns:repeat(5,auto);gap:2mm 6mm}
  .lg{display:flex;gap:2mm;align-items:flex-start;font-size:3.1mm;line-height:1.32;color:var(--muted);max-width:52mm}
  .lg b{font-weight:600;color:var(--ink);font-size:3.5mm}
  .lg .lc{font-family:var(--mono);font-size:2.9mm;color:var(--faint)}
  .sw{flex:none;width:4mm;height:4mm;border-radius:50%;background:var(--p);margin-top:.5mm}
  .lg.open .sw{background:transparent;border:0.45mm dashed var(--p);border-radius:0.9mm}
  .plats{display:grid;grid-template-columns:repeat(5,auto);gap:1.6mm 6mm;justify-content:start}
  .pl{display:flex;gap:1.8mm;align-items:baseline;font-size:3.2mm;line-height:1.2}
  .pl em{font-style:normal;font-family:var(--mono);font-size:2.5mm;color:var(--faint);margin-left:1.4mm}
  .pc{font-family:var(--mono);font-weight:600;font-size:2.9mm;background:#fff;border:0.3mm solid var(--line);border-radius:0.9mm;padding:0 1.1mm}
  .url{text-align:right}
  .url .u{font-family:var(--mono);font-weight:600;font-size:3.8mm;color:var(--accent)}
  .url .c{font-family:var(--mono);font-size:2.8mm;color:var(--faint);margin-top:1.6mm;line-height:1.45}
  #check{display:none}
</style>
</head>
<body>
<div class="page">
  <header class="band">
    <div>
      <p class="eyebrow">BIAN-style service landscape · product-neutral</p>
      <h1>${esc(D.name)}</h1>
      <p class="thesis">Every agent platform is the same ${allServices.length} services. <em>${cap1(word(counts.open))} of them no platform ships.</em></p>
      <p class="rule">Three tiers: <b>${D.areas.length} capability areas</b> are the columns, <b>${totalCaps} capabilities</b> the labeled groups, and <b>${allServices.length} services</b> the tiles; each service is exactly one functional pattern applied to one asset, written <span class="m">Pattern · Asset</span>, for example <span class="m">Agree · Folder</span>.</p>
    </div>
    <div class="meta">
      <div><b>${D.areas.length}</b>areas</div>
      <div><b>${totalCaps}</b>capabilities</div>
      <div><b>${allServices.length}</b>services</div>
      <div><b>${counts.open}</b>open</div>
      <div class="stamp">${esc(D.version)} · ${esc(D.generated)} · ${esc(D.license)}</div>
    </div>
  </header>
  <main class="grid">
  ${D.areas.map(area).join('\n  ')}
  </main>
  <footer class="foot">
    <div><div class="kt">Prevalence across the ${D.platforms.length} reviewed platforms</div><div class="legend">${legend}</div></div>
    <div><div class="kt">Evidence base · ${D.platforms.length} platforms reviewed ${esc(D.generated)}</div><div class="plats">${plats}</div></div>
    <div class="url"><div class="kt">Interactive model</div><div class="u">${ARTIFACT_URL}</div><div class="c">${esc(D.name)} ${esc(D.version)}<br>${esc(D.license)} · ${esc(D.generated)}</div></div>
  </footer>
</div>
<pre id="check"></pre>
<script>
(function(){
  var q = location.search;
  if (q.indexOf('preview') >= 0) document.documentElement.style.zoom = ${PREVIEW_ZOOM.toFixed(5)};
  if (q.indexOf('check') < 0) return;
  function run(){
    var out = [];
    document.querySelectorAll('.nm,.tm,.cn b,.co,.pa,.tn').forEach(function(el){
      if (el.scrollWidth > el.clientWidth + 0.5) out.push('CLIP ' + el.className + ': ' + el.textContent.trim().slice(0,60) + ' ' + el.scrollWidth + '>' + el.clientWidth);
    });
    var tn = document.querySelectorAll('.tile');
    var hs = [].map.call(tn, function(t){ return t.getBoundingClientRect().height; });
    out.push('tiles ' + tn.length + ' height px min ' + Math.min.apply(0,hs).toFixed(1) + ' max ' + Math.max.apply(0,hs).toFixed(1));
    tn.forEach(function(t){ if (t.scrollHeight > t.clientHeight + 0.5) out.push('VCLIP tile ' + t.textContent.trim().slice(0,40)); });
    document.querySelectorAll('.area').forEach(function(a){
      var t = a.querySelectorAll('.tile'), spare = [].map.call(t, function(x){ var c = x.lastElementChild.getBoundingClientRect().bottom; return x.getBoundingClientRect().bottom - c; });
      out.push(a.querySelector('h2').textContent + ': tile h ' + t[0].getBoundingClientRect().height.toFixed(0) + 'px, min spare ' + Math.min.apply(0,spare).toFixed(1) + ' max spare ' + Math.max.apply(0,spare).toFixed(1) + ', width ' + a.getBoundingClientRect().width.toFixed(0));
    });
    var pg = document.querySelector('.page');
    out.push('page overflow ' + (pg.scrollHeight - pg.clientHeight) + ' / grid bottom ' + document.querySelector('.grid').getBoundingClientRect().bottom.toFixed(0) + ' page h ' + pg.clientHeight);
    ['Archivo','IBM Plex Sans','IBM Plex Mono'].forEach(function(f){ out.push('font ' + f + ': ' + document.fonts.check('700 12px "' + f + '"')); });
    document.getElementById('check').textContent = out.join('\\n');
  }
  document.fonts.ready.then(function(){ setTimeout(run, 50); });
})();
</script>
</body>
</html>
`;
}

function chrome(args) {
  return execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', ...args],
    { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 }).toString();
}

// The tile max height grows in short columns but is capped so they stay tiles, not slabs.
let out = html();
fs.writeFileSync(OUT_HTML, out);
const url = 'file://' + OUT_HTML;
const argv = process.argv.slice(2);
console.log('wrote', OUT_HTML, (fs.statSync(OUT_HTML).size / 1024).toFixed(0) + ' KB');

if (argv.includes('--check')) {
  const dom = chrome(['--virtual-time-budget=8000', '--window-size=3179,2246', '--dump-dom', url + '?check']);
  const m = dom.match(/<pre id="check">([\s\S]*?)<\/pre>/);
  console.log(m ? m[1].replace(/&amp;/g, '&') : 'no check output');
} else if (!argv.includes('--html')) {
  chrome(['--no-pdf-header-footer', '--virtual-time-budget=8000', '--print-to-pdf=' + OUT_PDF, url]);
  chrome([`--window-size=${PREVIEW_W},${PREVIEW_H}`, '--virtual-time-budget=8000', '--screenshot=' + OUT_PNG, url + '?preview']);
  console.log('wrote', OUT_PDF);
  console.log('wrote', OUT_PNG, PREVIEW_W + 'x' + PREVIEW_H);
}
