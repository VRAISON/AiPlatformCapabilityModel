// Builds the "Capability Landscape" page (lens-index.html, plus lens-preview.html for local screenshots)
// from lens-template.html and the DATA block already baked into index.html by build.js.
// It reads index.html rather than the sources so the two pages always show the same model.
const fs = require('fs');
const path = require('path');
const here = __dirname;
const page = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
const m = page.match(/var DATA=\{[\s\S]*?\};\n/);
if (!m) throw new Error('DATA block not found in index.html; run build.js first');
const dataStmt = m[0];
const DATA = JSON.parse(dataStmt.slice('var DATA='.length, -2).replace(/<\\\/script/gi, '</script'));
const missing = [];
DATA.areas.forEach(a => {
  if (!a.icon || !fs.existsSync(path.join(here, a.icon))) missing.push(a.name);
  a.capabilities.forEach(c => { if (!c.icon || !fs.existsSync(path.join(here, c.icon))) missing.push(c.name); });
});
if (missing.length) console.warn('nodes without an icon file: ' + missing.join(', '));
// Plug-in views shared with the original site: site/views/*.css is inlined into the stylesheet and
// site/views/*.js inside the page's closure after CM is defined (sorted, so graph-data.js precedes graph.js).
const viewsDir = path.join(here, 'views');
const list = ext => fs.existsSync(viewsDir) ? fs.readdirSync(viewsDir).filter(f => f.endsWith(ext)).sort().map(f => '/* views/' + f + ' */\n' + fs.readFileSync(path.join(viewsDir, f), 'utf8')).join('\n') : '';
// Open-data files written by export.js into ../data are copied under downloads/data so the artifact can serve them;
// the page zips them in the browser on request (the artifact store does not take archives).
const DATA_FILES = ['model.json', 'model.yaml', 'model.schema.json', 'services.csv', 'coverage.csv', 'README.md'];
const dataSrc = path.join(here, '..', 'data'), dataDst = path.join(here, 'downloads', 'data');
fs.mkdirSync(dataDst, { recursive: true });
const dataList = DATA_FILES.filter(f => fs.existsSync(path.join(dataSrc, f))).map(f => { fs.copyFileSync(path.join(dataSrc, f), path.join(dataDst, f)); return [f, Math.max(1, Math.round(fs.statSync(path.join(dataSrc, f)).size / 1024))]; });
if (dataList.length !== DATA_FILES.length) console.warn('open-data files missing from ../data: run node export.js');
const tpl = fs.readFileSync(path.join(here, 'lens-template.html'), 'utf8');
const out = tpl.replace('/*__DATA__*/', dataStmt.trim()).replace('/*__VIEW_CSS__*/', list('.css')).replace('/*__VIEWS__*/', list('.js')).replace('/*__DATA_FILES__*/', 'var DATA_FILES=' + JSON.stringify(dataList) + ';');
fs.writeFileSync(path.join(here, 'lens-index.html'), out);
fs.writeFileSync(path.join(here, 'lens-preview.html'),
  '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n' + out + '\n</body></html>');
const n = DATA.areas.reduce((s, a) => s + a.capabilities.reduce((t, c) => t + c.services.length, 0), 0);
console.log('built lens page: ' + DATA.areas.length + ' areas, ' + n + ' services, views: ' + (fs.existsSync(viewsDir) ? fs.readdirSync(viewsDir).join(' ') : 'none') + ', ' + out.length + ' bytes');
