#!/usr/bin/env node
// Open-data exporter for the AI Platform Capability Model.
// Reads the model from build.js (no files written there) and writes data/:
//   model.json, model.yaml, model.schema.json, services.csv, coverage.csv, README.md
// Plain Node, no dependencies. Run from anywhere: `node site/export.js`.
// Validates model.json against model.schema.json with a small hand-written checker and exits non-zero on failure.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'data');
const D = require('./build.js');

const PATTERNS = ['Direct', 'Manage', 'Administer', 'Design', 'Provision', 'Fulfill', 'Operate', 'Maintain', 'Track', 'Monitor', 'Analyze', 'Register', 'Agree', 'Assess', 'Allocate', 'Process'];
const PREVALENCE = ['wide', 'mixed', 'rare', 'host', 'open'];
const KINDS = ['client', 'host'];

// ---------------------------------------------------------------- model
function cleanService(s) {
  const p = s.profile;
  return {
    id: s.id, name: s.name, slug: s.slug, pattern: s.pattern, asset: s.asset, prevalence: s.prevalence,
    evidence: s.evidence, description: s.description, platforms: s.platforms.slice(),
    profile: {
      inside: p.inside, excludes: p.excludes, purpose: p.purpose,
      functions: p.functions, entities: p.entities, inbound: p.inbound, outbound: p.outbound,
      security: p.security, storage: p.storage, performance: p.performance,
    },
  };
}
function opt(o, k, v) { if (v !== undefined && v !== null && v !== '') o[k] = v; return o; }
const model = {
  $schema: './model.schema.json',
  name: D.name, version: D.version, generated: D.generated, license: D.license,
  actors: D.actors.slice(),
  platforms: D.platforms.map(p => ({ code: p.code, name: p.name, kind: p.kind, vendor: p.vendor, home: p.home, version: p.version, auth: p.auth, model: p.model, note: p.note })),
  areas: D.areas.map(a => {
    const o = { id: a.id, name: a.name, slug: a.slug, description: a.description };
    opt(o, 'scope', a.scope);
    o.capabilities = a.capabilities.map(c => {
      const co = { id: c.id, name: c.name, slug: c.slug, description: c.description };
      opt(co, 'scope', c.scope); opt(co, 'owner', c.owner);
      co.services = c.services.map(cleanService);
      return co;
    });
    return o;
  }),
};

// ---------------------------------------------------------------- schema
const str = d => ({ type: 'string', minLength: 1, description: d });
const pair = (d, a, b) => ({ type: 'array', description: d, prefixItems: [str(a), str(b)], items: false, minItems: 2 });
const triple = (d, a, b, c) => ({ type: 'array', description: d, prefixItems: [str(a), str(b), str(c)], items: false, minItems: 3 });
const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'model.schema.json',
  title: 'AI Platform Capability Model',
  description: 'A product-neutral capability model of AI agent platforms in three tiers (Capability Area, Capability, Service), with an architectural profile per service and evidence of which reviewed platforms exhibit it.',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'version', 'generated', 'license', 'actors', 'platforms', 'areas'],
  properties: {
    $schema: { type: 'string', description: 'Relative reference to this schema file.' },
    name: str('Name of the model.'),
    version: { type: 'string', pattern: '^v[0-9]+$', description: 'Model version, for example v3.' },
    generated: { type: 'string', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$', description: 'Date the evidence was reviewed and the model generated (ISO 8601 date).' },
    license: str('License of the data, for example CC BY 4.0.'),
    actors: { type: 'array', minItems: 1, uniqueItems: true, description: 'External actors allowed as interface sources or targets that are not services in the model.', items: str('Actor name, for example User or Model provider.') },
    platforms: { type: 'array', minItems: 1, description: 'The platforms whose homes, protocols, and flags were reviewed for evidence.', items: { $ref: '#/$defs/platform' } },
    areas: { type: 'array', minItems: 1, description: 'Tier 1: Capability Areas.', items: { $ref: '#/$defs/area' } },
  },
  $defs: {
    platform: {
      type: 'object', additionalProperties: false, description: 'One reviewed platform.',
      required: ['code', 'name', 'kind', 'vendor', 'home', 'version', 'auth', 'model', 'note'],
      properties: {
        code: { type: 'string', pattern: '^[A-Z][a-z]$', description: 'Two-letter platform code used in evidence strings and coverage, for example Cx.' },
        name: str('Product name.'),
        kind: { type: 'string', enum: KINDS, description: 'client: an agent client. host: a local model runtime with no session, grant, or memory service.' },
        vendor: str('Vendor of the product.'),
        home: str('The home directory or store that was reviewed.'),
        version: str('Version observed, or "not recorded".'),
        auth: str('Authentication method.'),
        model: str('Default model, or "not recorded".'),
        note: str('Short summary of what the home contains.'),
      },
    },
    area: {
      type: 'object', additionalProperties: false, description: 'Tier 1: a Capability Area, a broad concern every agent platform has.',
      required: ['id', 'name', 'slug', 'description', 'capabilities'],
      properties: {
        id: { type: 'string', pattern: '^BA[0-9]+$', description: 'Position-based area id, for example BA1.' },
        name: str('Area name.'),
        slug: { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', description: 'URL-safe form of the name.' },
        description: { type: 'string', pattern: '^Ability to ', description: 'An "Ability to [action] [object] [context]" statement.' },
        scope: str('What the area includes and what it leaves to a neighbor.'),
        capabilities: { type: 'array', minItems: 1, description: 'Tier 2: the capabilities in this area.', items: { $ref: '#/$defs/capability' } },
      },
    },
    capability: {
      type: 'object', additionalProperties: false, description: 'Tier 2: a Capability, an ability the platform must have inside its area.',
      required: ['id', 'name', 'slug', 'description', 'services'],
      properties: {
        id: { type: 'string', pattern: '^BA[0-9]+\\.[0-9]{2}$', description: 'Position-based capability id: area id, dot, two-digit position, for example BA1.01.' },
        name: str('Capability name.'),
        slug: { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', description: 'URL-safe form of the name.' },
        description: { type: 'string', pattern: '^Ability to ', description: 'An "Ability to [action] [object] [context]" statement.' },
        scope: str('What the capability includes and excludes.'),
        owner: str('The role or team that owns the capability.'),
        services: { type: 'array', minItems: 1, description: 'Tier 3: the services that deliver this capability.', items: { $ref: '#/$defs/service' } },
      },
    },
    service: {
      type: 'object', additionalProperties: false, description: 'Tier 3: a Service, one functional pattern applied to one asset.',
      required: ['id', 'name', 'slug', 'pattern', 'asset', 'prevalence', 'evidence', 'description', 'platforms', 'profile'],
      properties: {
        id: { type: 'string', pattern: '^BA[0-9]+\\.[0-9]{2}\\.[0-9]{2}$', description: 'Position-based service id: capability id, dot, two-digit position, for example BA1.01.03.' },
        name: str('Service name, unique in the model.'),
        slug: { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$', description: 'URL-safe form of the name, unique in the model.' },
        pattern: { type: 'string', enum: PATTERNS, description: 'The functional pattern: what is done.' },
        asset: str('The asset: what the pattern is done to. Never equal to the service name.'),
        prevalence: { type: 'string', enum: PREVALENCE, description: 'wide: most clients store or expose it. mixed: several clients, different shapes. rare: one or two clients. host: the model runtime. open: in the product class, but no home or protocol evidences it.' },
        evidence: { type: 'string', description: 'Evidence string: platform codes with file paths, tables, flags, or protocol messages. Empty or descriptive for open services.' },
        description: str('One-sentence definition of the service.'),
        platforms: { type: 'array', uniqueItems: true, description: 'Codes of the platforms that exhibit the service. Empty when prevalence is open. Binary presence, not quality.', items: { type: 'string', pattern: '^[A-Z][a-z]$', description: 'A platform code from platforms[].code.' } },
        profile: { $ref: '#/$defs/profile' },
      },
    },
    profile: {
      type: 'object', additionalProperties: false, description: 'The five-section architectural profile of a service.',
      required: ['inside', 'excludes', 'purpose', 'functions', 'entities', 'inbound', 'outbound', 'security', 'storage', 'performance'],
      properties: {
        inside: str('Section 1, bounded context: what is inside the service.'),
        excludes: str('Section 1, bounded context: what the service leaves to named neighbors.'),
        purpose: str('Section 1: why the service exists.'),
        functions: { type: 'array', minItems: 1, description: 'Section 2, functional capabilities: [name, description] pairs.', items: pair('One function.', 'Function name.', 'What it does.') },
        entities: { type: 'array', minItems: 1, description: 'Section 3, core domain entities: [name, definition] pairs.', items: pair('One entity.', 'Entity name.', 'Definition and attributes.') },
        inbound: { type: 'array', minItems: 1, description: 'Section 4, interfaces consumed: [source, mechanism, purpose]. Source is a service name or an actor.', items: triple('One inbound interface.', 'Source service or actor.', 'Mechanism.', 'Purpose.') },
        outbound: { type: 'array', minItems: 1, description: 'Section 4, interfaces exposed: [target, mechanism, data]. Target is a service name or an actor.', items: triple('One outbound interface.', 'Target service or actor.', 'Mechanism.', 'Data or trigger.') },
        security: str('Section 5, quality constraint: security.'),
        storage: str('Section 5, quality constraint: storage.'),
        performance: str('Section 5, quality constraint: performance.'),
      },
    },
  },
};

// ---------------------------------------------------------------- validation
// A small structural validator covering the subset of JSON Schema used above.
function validate(node, sch, at, errs) {
  if (sch.$ref) sch = sch.$ref.replace('#/$defs/', '').split('/').reduce((o, k) => o[k], schema.$defs);
  const t = Array.isArray(node) ? 'array' : node === null ? 'null' : typeof node;
  if (sch.type && sch.type !== t) { errs.push(at + ': expected ' + sch.type + ', got ' + t); return; }
  if (sch.enum && sch.enum.indexOf(node) < 0) errs.push(at + ': "' + node + '" not in enum');
  if (t === 'string') {
    if (sch.minLength && node.length < sch.minLength) errs.push(at + ': empty string');
    if (sch.pattern && !new RegExp(sch.pattern).test(node)) errs.push(at + ': "' + node + '" does not match ' + sch.pattern);
  }
  if (t === 'array') {
    if (sch.minItems && node.length < sch.minItems) errs.push(at + ': fewer than ' + sch.minItems + ' items');
    if (sch.uniqueItems && new Set(node.map(x => JSON.stringify(x))).size !== node.length) errs.push(at + ': duplicate items');
    const pre = sch.prefixItems || [];
    node.forEach((v, i) => {
      if (i < pre.length) validate(v, pre[i], at + '[' + i + ']', errs);
      else if (sch.items === false) errs.push(at + ': unexpected item ' + i);
      else if (sch.items) validate(v, sch.items, at + '[' + i + ']', errs);
    });
  }
  if (t === 'object') {
    (sch.required || []).forEach(k => { if (!(k in node)) errs.push(at + ': missing ' + k); });
    Object.keys(node).forEach(k => {
      if (sch.properties && sch.properties[k]) validate(node[k], sch.properties[k], at + '.' + k, errs);
      else if (sch.additionalProperties === false) errs.push(at + ': unexpected key ' + k);
    });
  }
}
function checkModel(m) {
  const errs = [];
  validate(m, schema, '$', errs);
  const codes = m.platforms.map(p => p.code);
  const names = new Set(), slugs = new Set(), ids = new Set(), evid = {};
  m.areas.forEach(a => a.capabilities.forEach(c => c.services.forEach(s => names.add(s.name))));
  m.areas.forEach((a, ai) => {
    if (a.id !== 'BA' + (ai + 1)) errs.push(a.id + ': area id out of position');
    a.capabilities.forEach((c, ci) => {
      if (c.id !== a.id + '.' + String(ci + 1).padStart(2, '0')) errs.push(c.id + ': capability id out of position');
      c.services.forEach((s, si) => {
        if (s.id !== c.id + '.' + String(si + 1).padStart(2, '0')) errs.push(s.id + ': service id out of position');
        if (ids.has(s.id)) errs.push(s.id + ': duplicate id'); ids.add(s.id);
        if (slugs.has(s.slug)) errs.push(s.id + ': duplicate slug ' + s.slug); slugs.add(s.slug);
        if (s.asset === s.name) errs.push(s.id + ': asset equals name');
        if (s.prevalence === 'open' && s.platforms.length) errs.push(s.id + ': open service lists platforms');
        if (s.prevalence !== 'open' && !s.platforms.length) errs.push(s.id + ': evidenced service lists no platforms');
        s.platforms.forEach(p => { if (codes.indexOf(p) < 0) errs.push(s.id + ': unknown platform ' + p); });
        if (s.evidence) { if (evid[s.evidence]) errs.push(s.id + ': evidence duplicates ' + evid[s.evidence]); evid[s.evidence] = s.id; }
        ['inbound', 'outbound'].forEach(k => s.profile[k].forEach(r => {
          if (!names.has(r[0]) && m.actors.indexOf(r[0]) < 0) errs.push(s.id + ' ' + k + ': "' + r[0] + '" is neither a service nor an actor');
          if (r[0] === s.name) errs.push(s.id + ' ' + k + ': references itself');
        }));
      });
    });
  });
  return errs;
}
// Advisory only: two services sharing a pattern and asset should be distinguishable by name and profile.
function pairWarnings(m) {
  const seen = {}, out = [];
  m.areas.forEach(a => a.capabilities.forEach(c => c.services.forEach(s => {
    const k = s.pattern + ' · ' + s.asset;
    if (seen[k]) out.push(k + ': ' + seen[k] + ' and ' + s.id); else seen[k] = s.id;
  })));
  return out;
}

// ---------------------------------------------------------------- YAML
const RESERVED = /^(true|false|yes|no|on|off|y|n|null|~)$/i;
function yStr(s) {
  s = String(s);
  if (s !== '' && /^[A-Za-z_][A-Za-z0-9 _.,()'\/+&-]*$/.test(s) && !RESERVED.test(s) && !/\s$/.test(s)) return s;
  return JSON.stringify(s); // JSON strings are valid YAML double-quoted scalars
}
function yScalar(v) { return typeof v === 'string' ? yStr(v) : v === null ? 'null' : String(v); }
const isScalar = v => v === null || typeof v !== 'object';
function yaml(v, ind) {
  const pad = ' '.repeat(ind);
  if (Array.isArray(v)) {
    if (!v.length) return ' []';
    return v.map(x => {
      if (isScalar(x)) return '\n' + pad + '- ' + yScalar(x);
      if (Array.isArray(x) && x.every(isScalar)) return '\n' + pad + '- [' + x.map(y => typeof y === 'string' ? JSON.stringify(y) : yScalar(y)).join(', ') + ']';
      const body = yaml(x, ind + 2);
      return '\n' + pad + '- ' + body.replace(/^\n\s*/, '');
    }).join('');
  }
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    if (!keys.length) return ' {}';
    return keys.map(k => {
      const x = v[k], key = /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : JSON.stringify(k);
      if (isScalar(x)) return '\n' + pad + key + ': ' + yScalar(x);
      if (Array.isArray(x) && !x.length) return '\n' + pad + key + ': []';
      return '\n' + pad + key + ':' + yaml(x, Array.isArray(x) ? ind : ind + 2);
    }).join('');
  }
  return ' ' + yScalar(v);
}

// ---------------------------------------------------------------- CSV
function csvCell(v) { v = v === undefined || v === null ? '' : String(v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function csv(rows) { return rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n'; }

// ---------------------------------------------------------------- outputs
const services = [];
model.areas.forEach(a => a.capabilities.forEach(c => c.services.forEach(s => services.push({ a, c, s }))));
const codes = model.platforms.map(p => p.code);

const servicesCsv = csv([['id', 'area_id', 'area', 'capability_id', 'capability', 'service', 'slug', 'pattern', 'asset', 'prevalence', 'platform_count', 'platforms', 'description', 'evidence']]
  .concat(services.map(({ a, c, s }) => [s.id, a.id, a.name, c.id, c.name, s.name, s.slug, s.pattern, s.asset, s.prevalence, s.platforms.length, s.platforms.join(' '), s.description, s.evidence])));
const coverageCsv = csv([['id', 'service'].concat(codes, ['total'])]
  .concat(services.map(({ s }) => [s.id, s.name].concat(codes.map(c => s.platforms.indexOf(c) >= 0 ? 1 : 0), [s.platforms.length]))));

const nCaps = model.areas.reduce((n, a) => n + a.capabilities.length, 0);
const prev = {}; PREVALENCE.forEach(p => prev[p] = 0); services.forEach(({ s }) => prev[s.prevalence]++);
const perPlat = codes.map(c => c + ' ' + services.filter(({ s }) => s.platforms.indexOf(c) >= 0).length);

const readme = `# Data: AI Platform Capability Model ${model.version}

Generated by \`node site/export.js\` from the model's source of record on ${model.generated}. Do not edit these files by hand. Edit the sources and run the exporter again.

The model has ${model.areas.length} capability areas, ${nCaps} capabilities, and ${services.length} services. Each service is one functional pattern applied to one asset, with a five-section architectural profile and evidence of which of ${codes.length} platforms exhibit it.

## Files

| File | What it is |
| --- | --- |
| \`model.json\` | The full model: areas, capabilities, services with profiles, platforms, and actors. Pretty-printed. Points at \`model.schema.json\`. |
| \`model.yaml\` | The same model as YAML. Interface rows and function or entity pairs are written as one-line flow lists. |
| \`model.schema.json\` | JSON Schema (draft 2020-12) for \`model.json\`. Every property has a description. Pattern, prevalence, and platform kind are enums. |
| \`services.csv\` | One row per service: ids, area, capability, pattern, asset, prevalence, platform count, platform codes, description, and evidence. |
| \`coverage.csv\` | A service by platform matrix. One column per platform code, 1 when the platform exhibits the service and 0 when it does not, then a total. |
| \`README.md\` | This file. |

Both CSV files are UTF-8, comma-separated, with CRLF line endings and RFC 4180 quoting. The evidence column uses the middle dot (·) as a separator.

## Identifiers

Ids are position-based.

| Tier | Example | Form |
| --- | --- | --- |
| Capability Area | \`BA1\` | \`BA\` plus the area's position |
| Capability | \`BA1.01\` | Area id, a dot, and the capability's two-digit position in the area |
| Service | \`BA1.01.03\` | Capability id, a dot, and the service's two-digit position in the capability |

A renamed item keeps its id. A moved or inserted item changes the ids after it, so new services are added at the end of their capability. Slugs are unique and follow the name. Use ids for joins inside one version and slugs or names across versions.

## Evidence standard and its limits

Evidence was read from nine platform homes on one machine on ${model.generated}, plus each runtime's documented protocols and command-line flags. Each piece of evidence is one of four states:

| State | Meaning |
| --- | --- |
| Observed | The home has real sessions, approvals, jobs, or memories |
| Configured | The setting or plugin is on, even if unused |
| Shipped | The schema, binary, or bundled skill exists, and this machine has not used it |
| Not in this home | Nothing in that directory represents the capability |

The first three count as presence. A shipped but empty table still counts.

Read the coverage with these limits in mind:

- Coverage is binary presence, not quality, depth, or maturity. A 1 means the service is there in some form.
- One machine was reviewed. Another installation, version, or plan may differ.
- Versions were not recorded for every platform. See \`platforms[].version\`.
- A 0 means no evidence was found in that home, protocol, or flag. It does not prove absence from the product.
- Prevalence (${PREVALENCE.join(', ')}) is a summary across clients. Open services (${prev.open}) are in the product class but no home evidences them, so they list no platforms.

Platform codes: ${model.platforms.map(p => '`' + p.code + '` ' + p.name).join(', ')}.

## Regenerate

\`\`\`sh
node site/export.js
\`\`\`

The exporter needs only Node. It validates \`model.json\` against the schema (required keys, enums, id formats and positions, unique slugs, and that every interface source or target is a service name or a listed actor) and exits non-zero on failure.

## License

${model.license}. You may share and adapt the data for any purpose, including commercially, if you give appropriate credit, link to the license, and indicate changes. Full text in \`../LICENSE\`. To cite, see \`../CITATION.cff\`.
`;

// ---------------------------------------------------------------- run
const errs = checkModel(model);
if (errs.length) {
  console.error('export: model failed validation (' + errs.length + ' problems):\n  ' + errs.slice(0, 50).join('\n  '));
  process.exit(1);
}
// Re-check the serialized form so the file on disk is what was validated.
const json = JSON.stringify(model, null, 2) + '\n';
const reErrs = checkModel(JSON.parse(json));
if (reErrs.length) { console.error('export: serialized model failed validation:\n  ' + reErrs.join('\n  ')); process.exit(1); }

fs.mkdirSync(OUT, { recursive: true });
const files = {
  'model.json': json,
  'model.yaml': '# AI Platform Capability Model ' + model.version + ' (' + model.generated + '). ' + model.license + '. Generated by site/export.js; do not edit.' + yaml(model, 0) + '\n',
  'model.schema.json': JSON.stringify(schema, null, 2) + '\n',
  'services.csv': servicesCsv,
  'coverage.csv': coverageCsv,
  'README.md': readme,
};
Object.keys(files).forEach(f => fs.writeFileSync(path.join(OUT, f), files[f]));

console.log('export: ' + model.areas.length + ' areas, ' + nCaps + ' capabilities, ' + services.length + ' services, ' + model.platforms.length + ' platforms, ' + model.actors.length + ' actors');
console.log('prevalence: ' + PREVALENCE.map(p => p + ' ' + prev[p]).join(', '));
console.log('coverage: ' + perPlat.join(', '));
console.log('validated against model.schema.json: ok');
pairWarnings(model).forEach(w => console.warn('note: shared pattern and asset ' + w));
Object.keys(files).forEach(f => console.log('  data/' + f + '  ' + Buffer.byteLength(files[f]) + ' bytes'));
