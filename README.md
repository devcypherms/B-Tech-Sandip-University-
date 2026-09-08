# B.Tech Admission Landing Page — Sandip University, Madhubani

Static HTML, CSS and vanilla JS. No build step, no framework, no dependencies
at runtime. Deployed on Vercel.

The page exists to collect enquiries from Google and Meta ads in Bihar. Every
structural decision on it was made against that, and most of them were measured
rather than judged by eye.

Read `HANDOVER.md` first: fourteen values on the page are demo placeholders and
the forms post nothing until `FORM_ENDPOINT` is real.

## How it is put together

- **Two grounds.** Ink carries the hero panel, the placement band and the final
  CTA; paper carries everything a family reads slowly. The three conversion
  moments sit on the darker field.
- **The hero is an inset panel**, not a full-bleed band, and on a phone the
  campus photograph is a bounded image in the flow rather than a backdrop —
  `object-fit: cover` on a 2,400px-tall panel was cropping it to a sliver of sky.
- **The Student Credit Card is above the fold.** For a family weighing ₹90,000 a
  year, "₹4,00,000, interest-free, no property pledged" is the fact that decides
  whether they read on. It used to sit at 55% scroll depth.
- **Critical CSS is inlined** for the header and hero; the rest of the
  stylesheet loads async. There are zero render-blocking resources.
- **The hero preload is split by aspect ratio.** Preloading the landscape crop
  unconditionally cost a phone 210KB it never renders.
- **The countdown is real.** It reads `dates.lastDateISO`, and hides itself if
  that date is missing or already past. It never resets.

Measured on a 390px viewport, cache disabled: 434KB across 17 requests, no
render-blocking resources, no horizontal overflow, every image with alt text,
every input with a label, one `h1`.

## Running it

Open `index.html`, or serve the folder over HTTP so the fetch-based bits behave:

```
npx serve .
```

## The files that matter

| file | what it is |
|---|---|
| `index.html` | the whole page, including the inlined critical CSS |
| `HANDOVER.md` | every demo placeholder, and what must be replaced before launch |
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

- **Colour is tokenised by role**, not by name. The palette entries above the
  role tokens are not to be used directly. Every value carries its measured
  contrast against the ground it is actually used on, in a comment. Nothing on
  the page is under 4.5:1.
- **Two chromatics.** Red is action and nothing else. Amber marks a figure that
  saves the reader money — the credit card, the scholarship, the spec rail —
  and is not allowed anywhere else. `--brand` is the raw logo red, kept for
  reference and never used for type.
- **Nothing on the page links off it**, apart from the WhatsApp button. That is
  deliberate and there is a test for it.
- **Contrast is measured, not assumed.** Text over photographs cannot be judged
  from the DOM, so it is sampled from rendered pixels.
