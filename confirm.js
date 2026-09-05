#!/usr/bin/env node
/* =============================================================================
   confirm.js — the pre-deploy gate.

     node confirm.js

   Reports five things and exits non-zero if any of them would ship:

     1. [[CONFIRM]] values still sitting in content.js
     2. [[CONFIRM]] text still sitting in the static markup
     3. data-c hooks whose static text has drifted from content.js
     4. FAQPage structured data that no longer matches the visible answers
     5. generated SEO artefacts (canonical, sitemap, robots, Course,
        CollegeOrUniversity) that no longer agree with each other

   (3) matters because the static text is what a visitor with JS disabled
   sees, and what a search engine indexes first. If content.js says one fee
   and the markup says another, one of them is wrong on a live page.

   This IS the deploy step: vercel.json runs it as buildCommand, so a
   non-zero exit fails the deployment. A dev marker reaching production is
   the failure this whole content model exists to prevent, and until now
   the gate only failed if somebody chose to run it.
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

/* ---------- 2 & 3. the markup and the generated files ----------
   sitemap.xml and robots.txt are generated from content.js site.canonical
   and can carry a marker exactly like the page can. A marker reaching a
   live robots.txt would point crawlers at a sitemap that does not exist,
   so they are scanned on the same terms. */
const htmlFiles = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html') || ['sitemap.xml', 'robots.txt', 'vercel.json'].includes(f));

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

/* ---------- deploy blockers ----------
   Not every marker costs the same. These four make the page actively wrong
   rather than merely incomplete if it ships, so they are named above the
   full list instead of being left to scroll past with the other 28.

   site.canonical is the worst of them and the least obvious. An unresolved
   canonical is not a blank: whatever sits there is published to Google as
   this page's own address. The value this repo shipped with pointed at the
   Nashik domain, so it would have told crawlers to rank a different page,
   and quietly wasted every other SEO decision on the build.

   vercel.json runs this file as its buildCommand, so a non-zero exit now
   fails the deployment itself. Before that, the gate only failed if
   somebody chose to run it. */
const DEPLOY_BLOCKERS = [
  ['site.canonical', 'canonical, og:url, sitemap and robots all derive from it — a wrong value hands the ranking to another page'],
  ['dates.lastDate', 'an admission page with no deadline has no urgency'],
  ['org.phone', 'the site displays one number and dials another; the mobile Call button is wired to this'],
  ['FORM_ENDPOINT', 'the form refuses to submit until this is real'],
];

/* ---------- report ---------- */
const line = '='.repeat(72);
console.log('\n' + line);
console.log(bold('  Pre-deploy check'));
console.log(line);

const unresolvedBlockers = DEPLOY_BLOCKERS.filter(([k]) => {
  const v = lookup(k);
  return typeof v === 'string' && /\[\[CONFIRM:/.test(v);
});
if (unresolvedBlockers.length) {
  console.log('\n' + red(bold('  BLOCKS DEPLOY  (' + unresolvedBlockers.length + ' of ' + DEPLOY_BLOCKERS.length + ')')));
  const bw = Math.max(...unresolvedBlockers.map(b => b[0].length));
  unresolvedBlockers.forEach(([k, why]) => console.log('     ' + red(k.padEnd(bw + 2)) + dim(why)));
} else {
  console.log('\n' + green(bold('  BLOCKS DEPLOY  (none)')));
}

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

/* ---------- 4. FAQPage structured data vs the visible answers ----------
   Google requires the answer in the structured data to be the answer on the
   page. Two hand-kept copies of twelve answers will drift, and the drift is
   invisible: the page looks correct while the rich result quietly says
   something else. faq-jsonld.js generates the block from the markup; this
   confirms nobody has since edited one side without regenerating. */
const faqDrift = [];
let faqCount = 0;
try {
  const { extract, textOf } = require(path.join(ROOT, 'faq-jsonld.js'));
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const visible = extract(html);
  faqCount = visible.length;

  const blockMatch = html.match(/<!-- FAQPage\. GENERATED[\s\S]*?<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!blockMatch) {
    faqDrift.push({ q: '(whole block)', why: 'no generated FAQPage block in index.html — run: node faq-jsonld.js' });
  } else {
    const data = JSON.parse(blockMatch[1]);
    const structured = (data.mainEntity || []).map(e => ({
      q: e.name, a: (e.acceptedAnswer || {}).text || '',
    }));
    if (structured.length !== visible.length) {
      faqDrift.push({
        q: '(count)',
        why: structured.length + ' in the JSON-LD, ' + visible.length + ' on the page',
      });
    }
    visible.forEach((v, i) => {
      const st = structured[i];
      if (!st) { faqDrift.push({ q: v.q, why: 'missing from the JSON-LD' }); return; }
      if (st.q !== v.q) faqDrift.push({ q: v.q, why: 'question differs: ' + st.q });
      else if (st.a !== v.a) faqDrift.push({ q: v.q, why: 'answer differs from the visible text' });
    });
  }
} catch (err) {
  faqDrift.push({ q: '(check failed)', why: err.message });
}

console.log('\n' + bold('  4. FAQPage structured data matches the page  (' + faqCount + ' questions)'));
if (!faqDrift.length) {
  console.log('     ' + green('in step'));
} else {
  faqDrift.forEach(d => console.log('     ' + red(d.q) + '  ' + d.why));
}

/* ---------- 5. generated SEO artefacts still agree ----------
   Same argument as the FAQ check: these values live in more than one place
   and a mismatch is silent. A canonical that disagrees with the sitemap
   splits the page's own signals; a Course price that has drifted from the
   fee table publishes a number the visible page contradicts. */
const seoDrift = [];
let courseCount = 0;
try {
  const seo = require(path.join(ROOT, 'build-seo.js'));
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const base = seo.base;

  const canonical = (html.match(/<link rel="canonical" href="([^"]*)">/) || [])[1];
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]*)">/) || [])[1];
  if (canonical !== base) seoDrift.push('canonical does not match content.js site.canonical');
  if (ogUrl !== base) seoDrift.push('og:url does not match the canonical');

  if (fs.existsSync(path.join(ROOT, 'sitemap.xml'))) {
    const loc = (fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').match(/<loc>([^<]*)<\/loc>/) || [])[1];
    if (loc !== canonical) seoDrift.push('sitemap <loc> does not match the canonical byte for byte');
  } else seoDrift.push('sitemap.xml missing — run: node build-seo.js');

  if (fs.existsSync(path.join(ROOT, 'robots.txt'))) {
    const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
    /* Match to end of line rather than \S+. While the canonical is still a
       marker its value contains spaces, and \S+ captured only "[[CONFIRM:"
       and reported a mismatch that was not real. */
    const sm = (robots.match(/^Sitemap:[ \t]*(.+?)[ \t]*$/m) || [])[1];
    if (sm !== base + 'sitemap.xml') seoDrift.push('robots.txt Sitemap line does not match the canonical');
    const blocked = robots.match(/^Disallow:\s*(\S+)/gm) || [];
    if (blocked.length) seoDrift.push('robots.txt disallows ' + blocked.join(', ') + ' — a blocked asset path stops the page rendering for the crawler');
  } else seoDrift.push('robots.txt missing — run: node build-seo.js');

  /* Course blocks must carry the same fees and eligibility the page shows. */
  const courseMatch = html.match(/<!-- Course\. GENERATED by build-seo\.js[\s\S]*?<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!courseMatch) {
    seoDrift.push('no generated Course block — run: node build-seo.js');
  } else {
    const published = JSON.parse(courseMatch[1]);
    const expected = seo.courseBlocks(seo.branches(html));
    courseCount = published.length;
    if (published.length !== expected.length) {
      seoDrift.push('Course blocks: ' + published.length + ' published, ' + expected.length + ' branches on the page');
    }
    expected.forEach((exp, i) => {
      const pub = published[i];
      if (!pub) { seoDrift.push('Course missing: ' + exp.name); return; }
      if (pub.name !== exp.name) seoDrift.push('Course name differs: ' + pub.name);
      const pp = (pub.offers || {}).price, ep = (exp.offers || {}).price;
      if (pp !== ep) seoDrift.push(exp.name + ': price ' + pp + ' published, fee table says ' + ep);
      if (pub.coursePrerequisites !== exp.coursePrerequisites) {
        seoDrift.push(exp.name + ': eligibility differs from content.js');
      }
    });
  }

  const college = html.match(/<!-- CollegeOrUniversity\. GENERATED by build-seo\.js[\s\S]*?<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!college) seoDrift.push('no generated CollegeOrUniversity block — run: node build-seo.js');
  else {
    const c = JSON.parse(college[1]);
    if (c.telephone !== CONTENT.org.phone) seoDrift.push('CollegeOrUniversity telephone differs from content.js');
    if (c.url !== base) seoDrift.push('CollegeOrUniversity url is not the canonical');
  }
} catch (err) {
  seoDrift.push('check failed: ' + err.message);
}

console.log('\n' + bold('  5. Generated SEO artefacts agree  (' + courseCount + ' Course blocks)'));
if (!seoDrift.length) console.log('     ' + green('in step'));
else seoDrift.forEach(d => console.log('     ' + red(d)));

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

const blocking = inData.length + inMarkup.length + drifted.length + orphanHooks.length
  + faqDrift.length + seoDrift.length;
console.log('\n' + line);
if (blocking) {
  console.log('  ' + red(bold(`NOT READY TO SHIP — ${blocking} item(s) outstanding`)));
} else {
  console.log('  ' + green(bold('Clear to ship')));
}
console.log(line + '\n');

process.exit(blocking ? 1 : 0);
