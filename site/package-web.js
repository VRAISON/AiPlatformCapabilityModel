#!/usr/bin/env node
// Packages the landscape page for the corholdings static sites: copies lens-preview.html as index.html with that
// site's GA4 tag, plus icons/ and downloads/. Run after build-lens.js and render-map.js:  node package-web.js
// Each target is a site folder with a site.json; the tag uses its analytics.ga4 measurement id (laforge convention)
// and is left out, with a warning, when the id is empty. The Claude artifact and the GitHub copy carry no tag.
const fs = require('fs');
const path = require('path');
const here = __dirname;
const COR = '/Users/geekout/projects/corholdings';
const TARGETS = [
  { site: path.join(COR, 'vraison.ai'), dest: 'src/model', label: 'vraison.ai/model' },
  { site: path.join(COR, 'corcoranp.com'), dest: 'src/ai/model', label: 'corcoranp.com/ai/model' },
];
function gtag(id) {
  return `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  </script>
`;
}
const page = fs.readFileSync(path.join(here, 'lens-preview.html'), 'utf8');
if (!page.includes('</head>')) throw new Error('lens-preview.html has no <head>; run build-lens.js first');
const copyDir = (from, to) => { fs.rmSync(to, { recursive: true, force: true }); fs.cpSync(from, to, { recursive: true, preserveTimestamps: true, filter: p => !/\.DS_Store$/.test(p) }); };
// Timestamps are preserved so the sites' S3 sync re-uploads only files that changed.
for (const t of TARGETS) {
  const cfg = JSON.parse(fs.readFileSync(path.join(t.site, 'site.json'), 'utf8'));
  const id = ((cfg.analytics || {}).ga4 || '').trim();
  if (id && !/^G-[A-Z0-9]+$/.test(id)) throw new Error(`${t.label}: analytics.ga4 must look like G-XXXXXXXXXX, got ${id}`);
  const dest = path.join(t.site, t.dest);
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, 'index.html'), id ? page.replace('</head>', gtag(id) + '</head>') : page);
  copyDir(path.join(here, 'icons'), path.join(dest, 'icons'));
  copyDir(path.join(here, 'downloads'), path.join(dest, 'downloads'));
  const n = fs.readdirSync(dest, { recursive: true }).filter(f => fs.statSync(path.join(dest, f)).isFile()).length;
  console.log(`${t.label}: ${n} files` + (id ? `, GA4 ${id}` : ', NO GA4 tag (set analytics.ga4 in ' + path.relative(COR, path.join(t.site, 'site.json')) + ')'));
}
