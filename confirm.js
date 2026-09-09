#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const MARKER = /\[\[CONFIRM:[^\]]*\]\]/g;

const bold = s => '\x1b[1m' + s + '\x1b[0m';
const red = s => '\x1b[31m' + s + '\x1b[0m';
const green = s => '\x1b[32m' + s + '\x1b[0m';
const dim = s => '\x1b[2m' + s + '\x1b[0m';

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

      .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
      .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
      .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
      .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…')
      .replace(/\s+/g, ' ')
      .trim();
    const expected = String(value).replace(/\s+/g, ' ').trim();

    if (staticText !== expected) drifted.push({ file, path: dotted, staticText, expected });
  }
}

function visibleMarkers(html) {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')

    .replace(/<[a-zA-Z][^>]*>/g, ' ');
  const out = new Set();
  const hits = stripped.match(MARKER) || [];
  hits.forEach(h => out.add(h));
  return out;
}

const visibleSet = new Set();
for (const file of htmlFiles) {
  if (!file.endsWith('.html')) continue;
  visibleMarkers(fs.readFileSync(path.join(ROOT, file), 'utf8')).forEach(m => visibleSet.add(m));
}

const DEPLOY_BLOCKERS = [
  ['site.canonical', 'canonical, og:url, sitemap and robots all derive from it — a wrong value hands the ranking to another page'],
  ['org.phone', 'the site displays one number and dials another; the mobile Call button is wired to this'],
];

const FORM_WARN = 'FORM_ENDPOINT';

const line = '='.repeat(72);
console.log('\n' + line);
console.log(bold('  Pre-deploy check'));
console.log(line);

const blockerKeys = new Set(DEPLOY_BLOCKERS.map(b => b[0]));
const unresolvedBlockers = DEPLOY_BLOCKERS.filter(([k]) => {
  const v = lookup(k);
  return typeof v === 'string' && /\[\[CONFIRM:/.test(v);
});

const blocking = [];
const warning = [];
inData.forEach(d => {
  if (blockerKeys.has(d.path) || visibleSet.has(d.text)) blocking.push(d);
  else warning.push(d);
});
if (unresolvedBlockers.length) {
  console.log('\n' + red(bold('  BLOCKS DEPLOY  (' + unresolvedBlockers.length + ' of ' + DEPLOY_BLOCKERS.length + ')')));
  const bw = Math.max(...unresolvedBlockers.map(b => b[0].length));
  unresolvedBlockers.forEach(([k, why]) => console.log('     ' + red(k.padEnd(bw + 2)) + dim(why)));
} else {
  console.log('\n' + green(bold('  BLOCKS DEPLOY  (none)')));
}

const w1 = inData.length ? Math.max(...inData.map(d => d.path.length)) : 0;

console.log('\n' + bold(`  1a. BLOCKING — unconfirmed and either named above or visible on the page  (${blocking.length})`));
if (!blocking.length) {
  console.log('     ' + green('none'));
} else {
  blocking.forEach(d => {
    const why = blockerKeys.has(d.path)
      ? (visibleSet.has(d.text) ? 'named blocker, and renders on the page' : 'named blocker')
      : 'renders on the page as a red chip';
    console.log('     ' + red(d.path.padEnd(w1 + 2)) + dim(why));
    console.log('       ' + d.text);
  });
}

console.log('\n' + bold(`  1b. WARNING — unconfirmed but never rendered to a visitor  (${warning.length})`));
if (!warning.length) {
  console.log('     ' + green('none'));
} else {
  warning.forEach(d => console.log('     ' + d.path.padEnd(w1 + 2) + dim(d.text)));
}

console.log('\n' + bold(`  2. Every marker occurrence in the files  (${inMarkup.length}, informational)`));
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

    const sm = (robots.match(/^Sitemap:[ \t]*(.+?)[ \t]*$/m) || [])[1];
    if (sm !== base + 'sitemap.xml') seoDrift.push('robots.txt Sitemap line does not match the canonical');
    const blocked = robots.match(/^Disallow:\s*(\S+)/gm) || [];
    if (blocked.length) seoDrift.push('robots.txt disallows ' + blocked.join(', ') + ' — a blocked asset path stops the page rendering for the crawler');
  } else seoDrift.push('robots.txt missing — run: node build-seo.js');

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

console.log('\n' + bold('  Standing check'));
console.log('     re-verify §5.7 red hierarchy once markers clear');
console.log('     re-read §5.7 as a whole once markers clear — it is the most');
console.log('     important block on the page and it sits on ink, so the chips');
console.log('     are louder there than anywhere else');

const formValue = lookup(FORM_WARN);
const formUnset = typeof formValue === 'string' && /\[\[CONFIRM:/.test(formValue);
if (formUnset) {
  console.log('\n' + red(bold('  ' + '!'.repeat(68))));
  console.log(red(bold('  THE ENQUIRY FORM IS NOT CONNECTED.')));
  console.log(dim('  FORM_ENDPOINT in content.js is still a placeholder, so the form sends'));
  console.log(dim('  nowhere. It tells the visitor so rather than faking success, but this'));
  console.log(dim('  page exists to collect enquiries and right now it collects none.'));
  console.log(dim('  Do not run ads or hand this URL to the client as live until it is set.'));
  console.log(red(bold('  ' + '!'.repeat(68))));
}

const blockingCount = blocking.length + drifted.length + orphanHooks.length
  + faqDrift.length + seoDrift.length;
console.log('\n' + line);
if (blockingCount) {
  console.log('  ' + red(bold(`NOT READY TO SHIP — ${blockingCount} blocking`)) +
    (warning.length ? dim(`, ${warning.length} warning(s) not blocking`) : ''));
} else if (warning.length) {
  console.log('  ' + green(bold('Clear to ship')) +
    dim(`  — ${warning.length} unconfirmed value(s) outstanding, none of them visible to a visitor`));
} else {
  console.log('  ' + green(bold('Clear to ship')));
}
console.log(line + '\n');

process.exit(blockingCount ? 1 : 0);
