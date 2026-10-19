#!/usr/bin/env node
// Renders the capability map (lens-preview.html#map in print mode) to downloads/capability-map.png and .pdf
// with headless Chrome. Run after build-lens.js:  node render-map.js
// Pass 1 measures the page height from the meta tag the page writes in print mode; pass 2 prints a PDF with a
// page exactly that size; pass 3 screenshots the same layout as a PNG.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const here = __dirname;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = +(process.argv[2] || 2400);
const out = path.join(here, 'downloads');
fs.mkdirSync(out, { recursive: true });
const page = 'file://' + path.join(here, 'lens-preview.html');
const profile = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cl-render-'));
const base = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-pdf-header-footer', '--virtual-time-budget=9000', '--user-data-dir=' + profile];
const run = (args) => execFileSync(CHROME, base.concat(args), { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

const dom = run(['--window-size=' + W + ',1200', '--dump-dom', page + '#map?print=1']);
const m = dom.match(/name="map-height" content="(\d+)"/);
if (!m) throw new Error('map-height not found; is print mode in the template?');
const H = +m[1] + 8;
console.log('map height at ' + W + 'px wide: ' + H + 'px');
const url = page + '#map?print=1&pw=' + W + '&ph=' + H;
run(['--window-size=' + W + ',' + H, '--print-to-pdf=' + path.join(out, 'capability-map.pdf'), url]);
run(['--window-size=' + W + ',' + H, '--screenshot=' + path.join(out, 'capability-map.png'), url]);
fs.rmSync(profile, { recursive: true, force: true });
['capability-map.pdf', 'capability-map.png'].forEach(f => console.log(f + ': ' + (fs.statSync(path.join(out, f)).size / 1024).toFixed(0) + ' KB'));
