#!/usr/bin/env node
/* =============================================================================
   confirm.js — the pre-deploy gate.

     node confirm.js

   Reports three things and exits non-zero if any of them would ship:

     1. [[CONFIRM]] values still sitting in content.js
     2. [[CONFIRM]] text still sitting in the static markup
     3. data-c hooks whose static text has drifted from content.js

   (3) matters because the static text is what a visitor with JS disabled
   sees, and what a search engine indexes first. If content.js says one fee
   and the markup says another, one of them is wrong on a live page.

   Wire this into the deploy step. A dev marker reaching production is the
   failure this whole content model exists to prevent.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const MARKER = /\[\[CONFIRM:[^\]]*\]\]/g;

const bold = s => '\x1b[1m' + s + '\x1b[0m';
const red = s => '\x1b[31m' + s + '\x1b[0m';
const green = s => '\x1b[32m' + s + '\x1b[0m';
const dim = s => '\x1b[2m' + s + '\x1b[0m';

/* ---------- 1. markers in content.js ---------- */
const CONTENT = require(path.join(ROOT, 'content.js'));

const inData = [];
(function walk(node, trail) {
  if (typeof node === 'string') {
    const hits = node.match(MARKER);
    if (hits) hits.forEach(h => inData.push({ path: trail, text: h }));
    return;
  }
  if (node && typeof node === 'object') {
    Object.keys(node).forEach(k => walk(node[k], trail ? trail + '.' + k : k));
  }
})(CONTENT, '');

/* ---------- 2 & 3. the markup ---------- */
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

const inMarkup = [];
const drifted = [];
const orphanHooks = [];

function lookup(dotted) {
  return dotted.split('.').reduce(
    (o, k) => (o && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined),
    CONTENT
  );
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');

  html.split('\n').forEach((line, i) => {
    const hits = line.match(MARKER);
    if (hits) hits.forEach(h => inMarkup.push({ file, line: i + 1, text: h }));
  });

  /* Compare each hook's static text with the value it will be given.
     Deliberately loose about whitespace and HTML entities, strict about
     everything else. */
  const hookRe = /<span[^>]*\sdata-c="([^"]+)"[^>]*>([\s\S]*?)<\/span>/g;
  let m;
  while ((m = hookRe.exec(html)) !== null) {
    const [, dotted, rawInner] = m;
    const value = lookup(dotted);

    if (value === undefined) {
      orphanHooks.push({ file, path: dotted });
      continue;
    }

    const staticText = rawInner
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’')
      .replace(/\s+/g, ' ')
      .trim();
    const expected = String(value).replace(/\s+/g, ' ').trim();

    if (staticText !== expected) drifted.push({ file, path: dotted, staticText, expected });
  }
}

/* ---------- report ---------- */
const line = '='.repeat(72);
console.log('\n' + line);
console.log(bold('  Pre-deploy check'));
console.log(line);

console.log('\n' + bold(`  1. Unconfirmed values in content.js  (${inData.length})`));
if (!inData.length) {
  console.log('     ' + green('none'));
} else {
  const width = Math.max(...inData.map(d => d.path.length));
  inData.forEach(d => console.log('     ' + d.path.padEnd(width + 2) + red(d.text)));
}

console.log('\n' + bold(`  2. Unconfirmed text in the markup  (${inMarkup.length})`));
if (!inMarkup.length) {
  console.log('     ' + green('none'));
} else {
  inMarkup.forEach(d => console.log('     ' + dim(d.file + ':' + d.line) + '  ' + red(d.text)));
}

console.log('\n' + bold(`  3. Static text drifted from content.js  (${drifted.length})`));
if (!drifted.length) {
  console.log('     ' + green('none'));
} else {
  drifted.forEach(d => {
    console.log('     ' + d.file + '  ' + bold(d.path));
    console.log('       markup     ' + red(d.staticText));
    console.log('       content.js ' + green(d.expected));
  });
}

if (orphanHooks.length) {
  console.log('\n' + bold(`  data-c hooks with no value in content.js  (${orphanHooks.length})`));
  orphanHooks.forEach(d => console.log('     ' + d.file + '  ' + red(d.path)));
}

/* Standing reminder, not a blocker. 5.7 currently shows --madder totals
   next to dark-red [[CONFIRM]] blocks; they read as different things while
   both are present, because one is large display type and the other is an
   outlined monospace chip. Once the chips clear, madder is the only red on
   the page and the question changes: does it still read as emphasis, or
   does it read as an error? That can only be judged with the markers gone. */
console.log('\n' + bold('  Standing check'));
console.log('     re-verify §5.7 red hierarchy once markers clear');
console.log('     re-read §5.7 as a whole once markers clear — it is the most');
console.log('     important block on the page and it sits on ink, so the chips');
console.log('     are louder there than anywhere else');

const blocking = inData.length + inMarkup.length + drifted.length + orphanHooks.length;
console.log('\n' + line);
if (blocking) {
  console.log('  ' + red(bold(`NOT READY TO SHIP — ${blocking} item(s) outstanding`)));
} else {
  console.log('  ' + green(bold('Clear to ship')));
}
console.log(line + '\n');

process.exit(blocking ? 1 : 0);
