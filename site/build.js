// Builds site/index.html (publishable fragment) and site/preview.html (full document for local screenshots)
// from landscape.js (the model's data block), descriptions.js, platforms.js, services/*.js, views/*.{css,js}, and template.html.
// `require('./build.js')` returns the DATA object without writing files; `node build.js` writes the site.
const fs = require('fs');
const path = require('path');
const here = __dirname;
const AREAS = require('./landscape.js');
const D = require('./descriptions.js');
const PLATFORMS = require('./platforms.js');
// Service profiles, one file per area, merged by service name.
const PROFILES = Object.assign({}, ...fs.readdirSync(path.join(here, 'services')).filter(f => /^BA\d\.js$/.test(f)).sort().map(f => require(path.join(here, 'services', f))));
// Names allowed as interface sources or targets that are not services in the model.
const ACTORS = ['User', 'Editor', 'Operating system', 'Vendor service', 'Model provider', 'Git host', 'Chat platform', 'Package author', 'Organization admin'];

const CODES = PLATFORMS.map(p => p.code);
const CLIENTS = PLATFORMS.filter(p => p.kind === 'client').map(p => p.code);
const OVERRIDE = {
  'Turn Interrupt': CLIENTS,
  'Turn Execution': CLIENTS,
  'File Edit': CLIENTS,
  'Instruction File': ['Cl', 'Ge', 'Qw', 'Cx', 'He'],
  'Transcript Log': ['Cx', 'Cl', 'Cp', 'Ge', 'Ag', 'Gk', 'He', 'Qw'],
};
function derive(name, prev, ev) {
  if (prev === 'open') return [];
  if (OVERRIDE[name]) return OVERRIDE[name];
  const set = {};
  if (/every (CLI|client)/i.test(ev)) CLIENTS.forEach(c => set[c] = 1);
  if (/\bAHP\b|VS Code/.test(ev)) set.Cp = 1;
  (ev.match(/\b(Cx|Cl|Cp|Ge|Ag|Gk|He|Qw|Ol)\b/g) || []).forEach(c => set[c] = 1);
  return CODES.filter(c => set[c]);
}
const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pad = n => String(n).padStart(2, '0');

const missing = [];
// descriptions.js entries are either a plain string or an object { ability, scope, owner }.
function describe(entry, label) {
  if (!entry) { missing.push(label); return { description: '' }; }
  if (typeof entry === 'string') return { description: entry };
  const out = { description: entry.ability || entry.description || '' };
  if (entry.scope) out.scope = entry.scope;
  if (entry.owner) out.owner = entry.owner;
  return out;
}
// Stable identifiers: area BA1, capability BA1.01, service BA1.01.03. Position-based; a renamed service keeps its id,
// a moved or inserted one changes the ids after it, so inserts go at the end of a capability.
const areas = AREAS.map((a, ai) => ({
  id: a.id, name: a.name, hue: ai + 1, slug: slug(a.name), icon: 'icons/area-' + slug(a.name) + '.png',
  ...describe(D.areas[a.name], 'area ' + a.name),
  capabilities: a.domains.map((d, di) => ({
    id: a.id + '.' + pad(di + 1), name: d.name, slug: slug(d.name), icon: 'icons/cap-' + slug(d.name) + '.png',
    ...describe(D.capabilities[d.name], 'capability ' + d.name),
    services: d.tiles.map((t, ti) => ({
      id: a.id + '.' + pad(di + 1) + '.' + pad(ti + 1),
      name: t[0], slug: slug(t[0]), pattern: t[1], asset: t[2], prevalence: t[3], evidence: t[4],
      ...describe(D.services[t[0]], 'service ' + t[0]),
      platforms: derive(t[0], t[3], t[4]),
      profile: PROFILES[t[0]] || (missing.push('profile ' + t[0]), null),
    })),
  })),
}));
if (missing.length) throw new Error('Missing descriptions: ' + missing.join(', '));

// Validate cross-references in interfaces and report profile names that match no service.
const names = new Set();
areas.forEach(a => a.capabilities.forEach(c => c.services.forEach(s => names.add(s.name))));
const bad = [];
areas.forEach(a => a.capabilities.forEach(c => c.services.forEach(s => {
  ['inbound', 'outbound'].forEach(k => (s.profile[k] || []).forEach(r => {
    if (!names.has(r[0]) && ACTORS.indexOf(r[0]) < 0) bad.push(s.name + ' ' + k + ' -> ' + r[0]);
    if (r[0] === s.name) bad.push(s.name + ' ' + k + ' references itself');
  }));
  ['inside', 'excludes', 'purpose', 'security', 'storage', 'performance'].forEach(k => { if (!s.profile[k]) bad.push(s.name + ' missing ' + k); });
  ['functions', 'entities', 'inbound', 'outbound'].forEach(k => { if (!Array.isArray(s.profile[k]) || !s.profile[k].length) bad.push(s.name + ' empty ' + k); });
})));
Object.keys(PROFILES).forEach(n => { if (!names.has(n)) bad.push('profile for unknown service ' + n); });
if (bad.length) throw new Error('Profile problems:\n  ' + bad.join('\n  '));
const slugs = new Set();
areas.forEach(a => a.capabilities.forEach(c => c.services.forEach(s => { if (slugs.has(s.slug)) throw new Error('dup slug ' + s.slug); slugs.add(s.slug); })));

const DATA = { name: 'AI Platform Capability Model', version: 'v3', generated: '2026-10-18', license: 'CC BY 4.0', actors: ACTORS, areas, platforms: PLATFORMS };
module.exports = DATA;

if (require.main === module) {
  const noIcon = [];
  areas.forEach(a => { if (!fs.existsSync(path.join(here, a.icon))) noIcon.push(a.icon); a.capabilities.forEach(c => { if (!fs.existsSync(path.join(here, c.icon))) noIcon.push(c.icon); }); });
  if (noIcon.length) console.warn('missing icon files: ' + noIcon.join(', '));
  // Optional views: site/views/*.css is inlined into the stylesheet, site/views/*.js inside the page's closure after CM is defined.
  const viewsDir = path.join(here, 'views');
  const list = ext => fs.existsSync(viewsDir) ? fs.readdirSync(viewsDir).filter(f => f.endsWith(ext)).sort().map(f => '/* views/' + f + ' */\n' + fs.readFileSync(path.join(viewsDir, f), 'utf8')).join('\n') : '';
  const tpl = fs.readFileSync(path.join(here, 'template.html'), 'utf8');
  const json = JSON.stringify(DATA).replace(/<\/script/gi, '<\\/script');
  const page = tpl.replace('/*__DATA__*/', 'var DATA=' + json + ';').replace('/*__VIEW_CSS__*/', list('.css')).replace('/*__VIEWS__*/', list('.js'));
  fs.writeFileSync(path.join(here, 'index.html'), page);
  fs.writeFileSync(path.join(here, 'preview.html'),
    '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>\n' + page + '\n</body></html>');
  const nS = areas.reduce((n, a) => n + a.capabilities.reduce((m, c) => m + c.services.length, 0), 0);
  console.log('built: ' + areas.length + ' areas, ' + areas.reduce((n, a) => n + a.capabilities.length, 0) + ' capabilities, ' + nS + ' services with profiles, ' + PLATFORMS.length + ' platforms, views: ' + (fs.existsSync(viewsDir) ? fs.readdirSync(viewsDir).join(' ') : 'none') + ', ' + page.length + ' bytes');
}
