# B.Tech Admission Landing Page — Sandip University, Madhubani

Static HTML, CSS and vanilla JS. No build step, no framework, no dependencies
at runtime. Deployed on Vercel.

The page exists to collect enquiries. Every structural decision on it was made
against that, and most of them were measured rather than judged by eye.

## Running it

Open `index.html`, or serve the folder over HTTP so the fetch-based bits behave:

```
npx serve .
```

## The files that matter

| file | what it is |
|---|---|
| `index.html` | the whole page |
| `content.js` | every volatile value — fees, dates, counts, contact details |
| `assets/css/style.css` | one stylesheet, tokens at the top |
| `assets/js/main.js` | hydration, forms, gallery, marquee, map |
| `confirm.js` | the pre-deploy gate; Vercel runs this as its build command |
| `faq-jsonld.js`, `build-seo.js` | generate structured data from the page |

## content.js and the `[[CONFIRM]]` convention

Anything that could go stale lives in `content.js`, not in the markup. A value
that has not been verified is written as `[[CONFIRM: what is needed]]`, and it
renders on the page as a loud red chip so it cannot be missed.

`index.html` carries the current value as static text too, so the page is
correct before JavaScript runs. The gate checks the two have not drifted apart.

## The gate

```
node confirm.js
```

It fails the build (exit 1) if a marker would reach a visitor, and reports the
rest as warnings. It also checks that the FAQ structured data still matches the
visible answers, and that the generated SEO artefacts agree with `content.js`.

Two things block deploy today, and only the client can supply them:

- `site.canonical` — the production URL. Canonical, `og:url`, `sitemap.xml` and
  `robots.txt` all derive from it.
- `FORM_ENDPOINT` — the form refuses to submit while this is a marker, rather
  than thanking someone for an enquiry that went nowhere.

After changing any FAQ answer or any value in `content.js`, regenerate:

```
node faq-jsonld.js
node build-seo.js
node confirm.js
```

## Conventions worth knowing before editing

- **Colour is tokenised by role**, not by name: `--bg`, `--fg`, `--accent`,
  `--mark`, `--emphasis`, `--panel`. The palette entries above them are not to
  be used directly. Every value carries its measured contrast in a comment.
- **Two chromatics only.** Red for action, indigo for wayfinding. The red is
  the university's own hue at reduced chroma; the raw logo value is recorded in
  the file but is not used for type.
- **Nothing on the page links off it**, apart from the WhatsApp button. That is
  deliberate and there is a test for it.
- **Contrast is measured, not assumed.** Text over photographs cannot be judged
  from the DOM, so it is sampled from rendered pixels.
