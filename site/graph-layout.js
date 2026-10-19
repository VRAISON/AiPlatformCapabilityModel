// Service dependency graph layout for views/graph.js.
// Regenerate after any change to services/*.js, descriptions.js or the landscape data:
//   node graph-layout.js && node build.js
// Reads DATA via require('./build.js'), builds the directed graph from every service's interface tables
// (outbound row [T,mech,data] => S->T, inbound row [X,mech,purpose] => X->S, deduplicated by (from,to) with all
// mechanisms kept), runs a seeded force-directed layout, and writes views/graph-data.js as `var GRAPH={...};`.
// Layout: services start in eight angular sectors (one per capability area, hubs nearer the centre), actors on
// the rim; then ITER iterations of all-pairs repulsion, edge springs, a pull toward each area's sector anchor,
// a degree-weighted pull toward the centre, and a rim constraint for actors, with linear cooling. A final pass
// separates overlapping circles and picks a collision-free side for each always-on label (hubs and actors).
// Deterministic: fixed seed, fixed iteration count, nodes processed in model order.
'use strict';
const fs = require('fs');
const path = require('path');
const DATA = require('./build.js');

const W = 1600, H = 1100, ITER = 900, SEED = 20261018, HUBS = 20;

// mulberry32
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = rng(SEED);

// ---------- graph ----------
const services = [];
DATA.areas.forEach((a, ai) => a.capabilities.forEach(c => c.services.forEach(s => services.push({ s, ai }))));
const nodes = [], byName = {};
services.forEach(({ s, ai }) => {
  const n = { slug: s.slug, name: s.name, id: s.id, area: s.area ? s.area.id : DATA.areas[ai].id, ai, kind: 'service', prevalence: s.prevalence, inDeg: 0, outDeg: 0 };
  n.area = DATA.areas[ai].id;
  nodes.push(n); byName[s.name] = n;
});
const actorSlug = n => 'actor-' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const edgeMap = new Map();
function addEdge(from, to, mech) {
  [from, to].forEach(nm => {
    if (!byName[nm]) {
      if (DATA.actors.indexOf(nm) < 0) throw new Error('unknown endpoint ' + nm);
      const a = { slug: actorSlug(nm), name: nm, id: '', area: '', ai: -1, kind: 'actor', prevalence: '', inDeg: 0, outDeg: 0 };
      nodes.push(a); byName[nm] = a;
    }
  });
  const k = from + '\u0000' + to;
  let e = edgeMap.get(k);
  if (!e) { e = { from: byName[from].slug, to: byName[to].slug, mechs: [] }; edgeMap.set(k, e); byName[from].outDeg++; byName[to].inDeg++; }
  if (e.mechs.indexOf(mech) < 0) e.mechs.push(mech);
}
services.forEach(({ s }) => {
  (s.profile.outbound || []).forEach(r => addEdge(s.name, r[0], r[1]));
  (s.profile.inbound || []).forEach(r => addEdge(r[0], s.name, r[1]));
});
const edges = Array.from(edgeMap.values());
// actors in DATA.actors order, after services
nodes.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'service' ? -1 : 1) || (a.kind === 'actor' ? DATA.actors.indexOf(a.name) - DATA.actors.indexOf(b.name) : 0));
const idx = {}; nodes.forEach((n, i) => { idx[n.slug] = i; n.deg = n.inDeg + n.outDeg; });
const E = edges.map(e => [idx[e.from], idx[e.to]]);
const maxDeg = Math.max(...nodes.filter(n => n.kind === 'service').map(n => n.deg));
const minDeg = Math.min(...nodes.filter(n => n.kind === 'service').map(n => n.deg));
const radius = n => n.kind === 'actor' ? 8 : 6 + 16 * Math.sqrt((n.deg - minDeg) / Math.max(1, maxDeg - minDeg));
const hubSet = new Set(nodes.filter(n => n.kind === 'service').slice().sort((a, b) => b.deg - a.deg || a.id.localeCompare(b.id)).slice(0, HUBS).map(n => n.slug));

// ---------- layout (unit-ish space centred on 0,0; x stretched to the viewBox aspect) ----------
const AX = 1.3, R = 520; // R = rim radius in px-like units before normalisation (y axis)
const SECT = 2 * Math.PI / 8, A0 = -Math.PI / 2; // area 1 starts at the top, clockwise
const sectorAngle = ai => A0 + (ai + 0.5) * SECT;
const P = nodes.map(n => {
  if (n.kind === 'actor') return { x: 0, y: 0 };
  const t = 1 - (n.deg - minDeg) / Math.max(1, maxDeg - minDeg); // 0 for hubs
  const ang = sectorAngle(n.ai) + (rand() - 0.5) * SECT * 0.8;
  const rad = R * (0.18 + 0.62 * t) * (0.85 + 0.3 * rand());
  return { x: Math.cos(ang) * rad * AX, y: Math.sin(ang) * rad };
});
// actors: angle = mean direction of neighbours, on the rim
function placeActors(pull) {
  nodes.forEach((n, i) => {
    if (n.kind !== 'actor') return;
    let sx = 0, sy = 0;
    E.forEach(([a, b]) => { const o = a === i ? b : b === i ? a : -1; if (o >= 0 && nodes[o].kind !== 'actor') { sx += P[o].x / AX; sy += P[o].y; } });
    let ang = Math.atan2(sy, sx);
    if (!pull) { P[i].x = Math.cos(ang) * R * 1.02 * AX; P[i].y = Math.sin(ang) * R * 1.02; }
  });
}
placeActors(false);
const anchor = nodes.map(n => n.kind === 'service' ? { x: Math.cos(sectorAngle(n.ai)) * R * 0.6 * AX, y: Math.sin(sectorAngle(n.ai)) * R * 0.6 } : null);
const N = nodes.length;
for (let it = 0; it < ITER; it++) {
  const cool = 1 - it / ITER, step = 14 * cool + 0.6;
  const F = P.map(() => ({ x: 0, y: 0 }));
  // repulsion (in aspect-normalised space so the ellipse fills evenly)
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    let dx = (P[i].x - P[j].x) / AX, dy = P[i].y - P[j].y; let d2 = dx * dx + dy * dy;
    if (d2 < 1) { dx = rand() - 0.5; dy = rand() - 0.5; d2 = 1; }
    const d = Math.sqrt(d2), minD = (radius(nodes[i]) + radius(nodes[j])) / 1.6 + 14;
    let f = 7000 / d2; if (d < minD) f += (minD - d) * 0.8;
    F[i].x += dx / d * f; F[i].y += dy / d * f; F[j].x -= dx / d * f; F[j].y -= dy / d * f;
  }
  // springs
  E.forEach(([a, b]) => {
    const dx = (P[b].x - P[a].x) / AX, dy = P[b].y - P[a].y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    const k = nodes[a].kind === 'actor' || nodes[b].kind === 'actor' ? 0.004 : 0.012;
    const f = k * (d - 90);
    F[a].x += dx / d * f; F[a].y += dy / d * f; F[b].x -= dx / d * f; F[b].y -= dy / d * f;
  });
  nodes.forEach((n, i) => {
    if (n.kind === 'service') {
      // sector anchor: keeps areas legible; weaker for hubs so they can sit near the middle
      const h = (n.deg - minDeg) / Math.max(1, maxDeg - minDeg);
      const ka = 0.05 * (1 - 0.75 * h);
      F[i].x += (anchor[i].x - P[i].x) / AX * ka; F[i].y += (anchor[i].y - P[i].y) * ka;
      // centre pull grows with degree
      const kc = 0.002 + 0.06 * h * h;
      F[i].x -= P[i].x / AX * kc; F[i].y -= P[i].y * kc;
    }
  });
  let rmax = 0;
  for (let i = 0; i < N; i++) if (nodes[i].kind === 'service') rmax = Math.max(rmax, Math.hypot(P[i].x / AX, P[i].y));
  for (let i = 0; i < N; i++) {
    let fx = F[i].x, fy = F[i].y; const m = Math.sqrt(fx * fx + fy * fy);
    if (m > step) { fx = fx / m * step; fy = fy / m * step; }
    P[i].x += fx * AX; P[i].y += fy;
    const ux = P[i].x / AX, uy = P[i].y, r = Math.sqrt(ux * ux + uy * uy) || 1;
    if (nodes[i].kind === 'actor') { P[i].x = ux / r * rmax * 1.1 * AX; P[i].y = uy / r * rmax * 1.1; }
    else if (r > R * 0.94) { P[i].x = ux / r * R * 0.94 * AX; P[i].y = uy / r * R * 0.94; }
  }
}

// ---------- spread actors around the rim (keep their order, enforce a minimum angular gap) ----------
{
  const act = nodes.map((n, i) => i).filter(i => nodes[i].kind === 'actor');
  const ang = act.map(i => Math.atan2(P[i].y, P[i].x / AX)).map(a => ({ a }));
  act.forEach((i, k) => ang[k].i = i);
  const GAP = 2 * Math.PI / act.length * 0.62;
  for (let pass = 0; pass < 200; pass++) {
    ang.sort((p, q) => p.a - q.a);
    for (let k = 0; k < ang.length; k++) {
      const p = ang[k], q = ang[(k + 1) % ang.length];
      let d = q.a - p.a; if (k === ang.length - 1) d += 2 * Math.PI;
      if (d < GAP) { const m = (GAP - d) / 2 * 0.5; p.a -= m; q.a += m; }
    }
  }
  let rmax = 0;
  nodes.forEach((n, i) => { if (n.kind === 'service') rmax = Math.max(rmax, Math.hypot(P[i].x / AX, P[i].y)); });
  ang.forEach(p => { P[p.i].x = Math.cos(p.a) * rmax * 1.1 * AX; P[p.i].y = Math.sin(p.a) * rmax * 1.1; });
}

// ---------- normalise to the viewBox ----------
const MX = 150, MY = 50;
let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
P.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
const sc = Math.min((W - 2 * MX) / (x1 - x0), (H - 2 * MY) / (y1 - y0));
P.forEach(p => { p.x = W / 2 + (p.x - (x0 + x1) / 2) * sc; p.y = H / 2 + (p.y - (y0 + y1) / 2) * sc; });

// ---------- overlap removal and label placement for always-on labels ----------
const FONT = 15, CW = 8.2; // approx. glyph width for 15px IBM Plex Sans semibold (labels are 15 viewBox units at zoom 1)
const always = nodes.map(n => n.kind === 'actor' || hubSet.has(n.slug));
function labelBox(i, side) {
  const n = nodes[i], r = radius(n), w = n.name.length * CW, h = FONT + 2, p = P[i];
  if (side === 'r') return [p.x + r + 4, p.y - h / 2, w, h];
  if (side === 'l') return [p.x - r - 4 - w, p.y - h / 2, w, h];
  if (side === 't') return [p.x - w / 2, p.y - r - 3 - h, w, h];
  return [p.x - w / 2, p.y + r + 3, w, h];
}
const ov = (a, b) => Math.max(0, Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
const circBox = i => { const r = radius(nodes[i]); return [P[i].x - r, P[i].y - r, 2 * r, 2 * r]; };
const side = nodes.map(() => 'b');
function chooseSides() {
  const order = nodes.map((n, i) => i).filter(i => always[i]).sort((a, b) => nodes[b].deg - nodes[a].deg);
  const placed = [];
  order.forEach(i => {
    let best = null, bestCost = Infinity;
    const prefs = nodes[i].kind === 'actor' ? (P[i].x < W / 2 - 40 ? ['l', 'b', 't', 'r'] : P[i].x > W / 2 + 40 ? ['r', 'b', 't', 'l'] : (P[i].y < H / 2 ? ['t', 'r', 'l', 'b'] : ['b', 'r', 'l', 't'])) : ['b', 'r', 'l', 't'];
    prefs.forEach((s, k) => {
      const bx = labelBox(i, s); let c = k * 2;
      if (bx[0] < 4 || bx[0] + bx[2] > W - 4 || bx[1] < 4 || bx[1] + bx[3] > H - 4) c += 5000;
      placed.forEach(b => c += ov(bx, b) * 10);
      for (let j = 0; j < N; j++) if (j !== i) c += ov(bx, circBox(j)) * 3;
      if (c < bestCost) { bestCost = c; best = s; }
    });
    side[i] = best; placed.push(labelBox(i, best));
  });
  return order.map(i => labelBox(i, side[i]));
}
for (let pass = 0; pass < 60; pass++) {
  let moved = 0;
  // circle-circle separation
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const dx = P[j].x - P[i].x, dy = P[j].y - P[i].y, d = Math.sqrt(dx * dx + dy * dy) || 0.01, min = radius(nodes[i]) + radius(nodes[j]) + 6;
    if (d < min) { const m = (min - d) / 2; P[i].x -= dx / d * m; P[i].y -= dy / d * m; P[j].x += dx / d * m; P[j].y += dy / d * m; moved++; }
  }
  // label-label and label-circle: push the label owner away
  chooseSides();
  const lab = nodes.map((n, i) => always[i] ? labelBox(i, side[i]) : null);
  for (let i = 0; i < N; i++) {
    if (!lab[i]) continue;
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const others = [circBox(j)]; if (lab[j] && j > i) others.push(lab[j]);
      others.forEach(b => {
        const a = lab[i]; if (!ov(a, b)) return;
        const ox = Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0]), oy = Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]);
        const cx = (a[0] + a[2] / 2) - (b[0] + b[2] / 2), cy = (a[1] + a[3] / 2) - (b[1] + b[3] / 2);
        const s = 0.5;
        if (oy < ox) { const m = (oy + 1) * s * (cy >= 0 ? 1 : -1); P[i].y += m; P[j].y -= m; }
        else { const m = (ox + 1) * s * (cx >= 0 ? 1 : -1); P[i].x += m; P[j].x -= m; }
        moved++;
      });
    }
  }
  P.forEach((p, i) => { const r = radius(nodes[i]); p.x = Math.max(r + 4, Math.min(W - r - 4, p.x)); p.y = Math.max(r + 4, Math.min(H - r - 4, p.y)); });
  if (!moved) break;
}
const finalBoxes = chooseSides();
let collisions = 0;
for (let a = 0; a < finalBoxes.length; a++) for (let b = a + 1; b < finalBoxes.length; b++) if (ov(finalBoxes[a], finalBoxes[b]) > 0) collisions++;

// ---------- write ----------
const out = {
  w: W, h: H, iterations: ITER, seed: SEED,
  nodes: nodes.map((n, i) => ({ slug: n.slug, name: n.name, id: n.id, area: n.area, kind: n.kind, x: Math.round(P[i].x * 10) / 10, y: Math.round(P[i].y * 10) / 10, inDeg: n.inDeg, outDeg: n.outDeg, prevalence: n.prevalence, hub: hubSet.has(n.slug) ? 1 : 0, lp: always[i] ? side[i] : 'b' })),
  edges,
};
fs.writeFileSync(path.join(__dirname, 'views', 'graph-data.js'),
  '// Generated by graph-layout.js (node graph-layout.js && node build.js). Do not edit by hand.\nvar GRAPH=' + JSON.stringify(out) + ';\n');
const svc = nodes.filter(n => n.kind === 'service');
const top = k => svc.slice().sort((a, b) => b[k] - a[k] || a.id.localeCompare(b.id)).slice(0, 10).map(n => n.name + ' ' + n[k]).join(', ');
const mechs = {}; edges.forEach(e => e.mechs.forEach(m => mechs[m] = 1));
console.log('nodes ' + nodes.length + ' (' + svc.length + ' services, ' + (nodes.length - svc.length) + ' actors), edges ' + edges.length + ', mechanisms ' + Object.keys(mechs).length + ', iterations ' + ITER + ', hub/actor label collisions ' + collisions);
console.log('top in:  ' + top('inDeg'));
console.log('top out: ' + top('outDeg'));
