#!/usr/bin/env node
/* =============================================================================
   faq-jsonld.js — generate the FAQPage block FROM the visible markup.

     node faq-jsonld.js

   Google requires the structured answer to match the answer a visitor reads.
   Hand-maintaining two copies of twelve answers guarantees they drift, and
   the drift is invisible: the page looks right and the rich result quietly
   says something else. So the block is generated from the markup, and
   confirm.js re-checks the match on every run.

   Note what this means for [[CONFIRM]] markers: a marker inside a visible
   answer is copied into the JSON-LD verbatim rather than being papered over
   with a plausible value. confirm.js already refuses to ship any markup
   containing one, so the gate covers the structured data too.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');

/* Strip tags and decode the handful of entities this page actually uses. */
function textOf(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, '’')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&copy;/g, '©')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Pull the question/answer pairs out of the FAQ accordion only, so the
   programmes accordion higher up the page is never mistaken for one. */
function extract(html) {
  const section = html.match(/<div class="acc acc--faq">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/);
  if (!section) throw new Error('FAQ accordion not found in index.html');

  const items = [];
  const itemRe = /<span class="acc__name">([\s\S]*?)<\/span>[\s\S]*?<div class="acc__body">([\s\S]*?)<\/div>/g;
  let m;
  while ((m = itemRe.exec(section[1])) !== null) {
    items.push({ q: textOf(m[1]), a: textOf(m[2]) });
  }
  return items;
}

function build(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(it => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

if (require.main === module) {
  const html = fs.readFileSync(FILE, 'utf8');
  const items = extract(html);
  if (items.length !== 12) {
    console.error(`Expected 12 questions, found ${items.length}. Not writing.`);
    process.exit(1);
  }

  const block =
    '<!-- FAQPage. GENERATED from the visible answers by faq-jsonld.js — do not\n' +
    '     hand-edit. Run `node faq-jsonld.js` after changing any FAQ answer;\n' +
    '     confirm.js fails the build if the two fall out of step. -->\n' +
    '<script type="application/ld+json">\n' +
    JSON.stringify(build(items), null, 2) + '\n' +
    '</script>';

  const existing = /<!-- FAQPage\. GENERATED[\s\S]*?<\/script>/;
  let out;
  if (existing.test(html)) {
    out = html.replace(existing, block);
  } else {
    const anchor = '<script src="content.js"></script>';
    if (!html.includes(anchor)) throw new Error('script anchor not found');
    out = html.replace(anchor, block + '\n\n' + anchor);
  }
  fs.writeFileSync(FILE, out);

  const withMarkers = items.filter(it => /\[\[CONFIRM:/.test(it.a)).length;
  console.log(`FAQPage written: ${items.length} questions` +
    (withMarkers ? `, ${withMarkers} still carrying a [[CONFIRM]] marker` : ''));
}

module.exports = { extract, build, textOf };
