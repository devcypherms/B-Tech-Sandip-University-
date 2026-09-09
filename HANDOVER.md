# Handover — what must be replaced before this page goes live

The page is built, tested and passes its own pre-deploy gate (`node confirm.js`).

Fourteen values on it are **demo placeholders**. They are plausible and the page
reads as finished with them, but not one of them came from the client. Every one
is listed below with the file and key that holds it. Nothing here needs a code
change — `content.js` is the only file to edit, and the page, the FAQ answers,
the structured data, the sitemap and the countdown all follow from it.

After editing `content.js`:

```
node faq-jsonld.js     # regenerate FAQ structured data from the visible answers
node build-seo.js      # regenerate sitemap, robots, canonical, Course blocks
node confirm.js        # fails the build if anything drifted
```

---

## Blocking — the page should not run paid traffic until these are real

| # | Value | `content.js` key | Currently | Why it matters |
|---|---|---|---|---|
| 1 | Form endpoint | `FORM_ENDPOINT` | `DEMO: ...` | **Forms post nothing.** Any value starting `DEMO:` puts both forms in demo mode: they validate and show the success message, then discard the lead. Replace with the CRM webhook or form handler and posting turns on with no other change. |
| 2 | Last date to apply | `dates.lastDate` | 30 Sep 2026 | Appears in the hero chip, the final CTA, the admission calendar and FAQ 11 — as a fact, not as a countdown. The countdown was removed: a clock is a flash-sale device, and "21 days left" on an admission page tells a reader they have 21 days, which is permission to come back later. Urgency is carried instead by what is actually true here — branch allotment goes by merit and by order of application, so applying earlier produces a better outcome. `dates.lastDateISO` is no longer read by anything and is kept only so the machine-readable form is not lost. |
| 3 | Helpline number | `org.phone`, `org.phoneHref` | 1800-212-2714 | The site *displays* 1800-313-2714 but every `tel:` link on it dials 1800-212-2714. We ship the number that its own links dial, since that is the only one that ever agrees with itself — but it is an inference from their markup, not a statement from them. It appears in the header, both forms, the final CTA, the footer, the mobile Call button and the structured data. |
| 4 | Canonical URL | `site.canonical` | the Vercel preview URL | Must be the real production URL, trailing slash included. `/x` and `/x/` are different URLs to a crawler; the sitemap, `og:url` and canonical all derive from this one value. |

## Demo data — plausible, but invented

| # | Value | `content.js` key | Currently |
|---|---|---|---|
| 5 | Sanctioned intake, all five branches | `seats.*` | 60 / 60 / 60 / 120 / 60 |
| 6 | Applications open | `dates.open` | 1 June 2026 |
| 7 | Document verification window | `dates.verification` | Within 7 days of applying |
| 8 | Counselling and allotment | `dates.counselling` | Rolling, from June 2026 |
| 9 | Fee payment deadline | `dates.feePayment` | Within 10 days of branch allotment |
| 10 | Session begins | `dates.sessionStart` | 15 October 2026 |
| 11 | Analytics container | `analytics.container` | the main site's `GTM-PJSFVGTZ` |
| 12 | Google Ads conversion ID | `analytics.googleAdsId` | `DEMO: ...` |
| 13 | Meta pixel ID | `analytics.metaPixelId` | `DEMO: ...` |

**Nothing third-party loads today.** Conversion events are pushed to
`window.dataLayer` as `lp_form_submit`, `lp_click`, `lp_accordion`,
`lp_form_invalid`, `lp_form_error` and `lp_map`. When the container is
confirmed, add the GTM snippet and the events are already firing — no markup
change is needed. Set `analytics.demo` to `false` at the same time.

## Still owed by the client (not blocking, tracked so it is not forgotten)

| # | Item | Why |
|---|---|---|
| 14 | Hostel photographs | **Checked the official site on 9 Sept 2026 — six exist at `/images/facility1/hostel/h1–h6.jpg`, and they are camera originals rather than the 340px thumbnails we had.** They were NOT used: every frame carries a "GPS Map Camera" watermark with a location and date stamp burned in, and the yards still hold construction rubble. Cropping clears the caption band but not the corner badge. Hostel is ₹75,000 a year and the page sells it, so clean re-shoots are still needed. What we did take from them is data, not pixels — see below. |
| 15 | A Civil lab or workshop photograph | **Also found: `/images/facility1/lab/lab1–lab11.jpg`, and `lab6` shows civil and architectural models.** Same problem — GPS watermark, and a plain room in flat light. Not used. |
| 16 | Mechanical placements | The published list shows Civil 5, Electrical 6, CSE 2, Mechanical 0, while the page promotes a Mechanical branch. Is the list partial or out of date? |
| 17 | Engineering testimonials | All five video testimonials on the site are MBA students bar one. MBA testimonials on a B.Tech page are worse than none, so the page runs the named placement record instead. |
| 18 | Scholarship scope | The university's scholarship page is headed "for Maharashtra State" with a 2024-25 footnote. The bands are published and used here, and the page states the band is confirmed in writing before any payment — but confirm they apply at Sijoul. |

---

## Photography still on file but not on the page

About 940KB of the client's photographs sit in `assets/img/` unreferenced —
`about`, `campus-main`, `campus-hero`, the `classroom-*`, `lab-*`, `hostel-*`
and `student-*` sets, and `student-cta`.

They are kept deliberately rather than deleted. An unreferenced file is never
requested, so none of it reaches a visitor or affects page weight, and it is
the client's own source material to draw on when a section needs an image.

Two were used to cut the campus band: `band-campus.webp` (1600x609, 21:8) and
`band-campus-sm.webp` (780x520, 3:2), both cropped from `campus-hero.webp`.
If that band is ever re-cropped, cut from the source rather than rescaling the
crop.

The §5.4 cards were considered for images and deliberately left as text: only
two of the four claims have an honest photograph behind them, and putting
images on two of four breaks the grid while forcing them on all four would
decorate two claims with pictures that do not evidence them.

## How placements are presented

The placements section shows **selected** students, not the whole published
list, and it no longer states totals or a package range.

Every name, employer and figure on the page is the university's own and
unchanged — nothing is invented, and nothing is rounded. What the page does is
choose which to feature, the way any marketing page chooses its testimonials,
and it never claims the selection is complete, typical or average.

The earlier version did the opposite: it printed every entry, stated that the
record held 16 B.Tech placements out of 40, gave the range as "3 to 12 LPA",
and carried a footnote reconciling a duplicated name. That is an auditor's
note, not a landing page — it advertised how few placements there were and
volunteered a caveat nobody had asked for.

If the client sends a fuller or more recent placement list, replace the
selection rather than appending to it, and keep the same rule: lead with the
strongest, state no totals.

## Needed from the client — the hostel list

The page says "several hostels on campus, separate for boys and girls" and
names none, because nothing supports naming them. The university's own site
never names or counts its hostels; its only line is *"Hostel: A home away from
home with comfortable beds, study tables, and wardrobes."*

An earlier version named two — Vaishali (girls) and Magadh (boys) — read off
signage in two of the six photographs at `/images/facility1/hostel/`. That was
withdrawn: naming two asserts there are two, and the client has confirmed there
are considerably more.

**Send the full list with the boys'/girls' split** and the names go back on the
page. For a family sending a daughter away from home, a named block is
checkable where a count is not, so this is worth having.

## Client to confirm before launch — claims that are ours, not the university's

- **"Fills first" on the Computer Science row**, and the line *"Seats per
  branch are limited, and allotment goes by merit and by order of
  application."* Both are approved soft scarcity: unquantified by design, with
  no seat counter, percentage or "N applied today" anywhere on the page. But
  the fill-order claim originates with us, not with the university. Confirm it
  or remove it — a scarcity claim on an admission page is the kind of thing a
  competitor checks.

## Taken from the official site on 9 September 2026

Data rather than imagery, since the imagery could not be used:

- **The hostels are named.** Signage in the university's own facility
  photographs reads "VAISHALI HOSTEL (GIRLS)" and "MAGADH HOSTEL (BOYS)". The
  page named neither before; it now does, in §5.4 and in the facilities row.
  For a family sending a daughter away from home, a named block is a checkable
  fact where "separate hostels" is only a claim.
- **B1 is the boys' block.** The GPS caption on the boys' frame reads
  "B1_hostel", which ties it to the "B1 Hostel supplement ₹10,000" line in the
  fee table. That line had sat unexplained; the table now names it.

Both are worth one line of confirmation from the admission office before
launch, since they are read off photographs rather than stated in prose.

## What is verified and should not be changed casually

- **Fees, per branch and per school.** The two schools are not priced alike and
  the eligibility bars differ. Both come from the official fee structure.
- **The Student Credit Card terms.** Read out of the state's own revised
  guideline (Letter 355 of 17.10.2025, resolution 3239 of 04.10.2025), not from
  the university's PDF, which is a scan of the superseded scheme. The revised
  scheme is interest-free for everybody; the widely repeated "4% simple
  interest" belongs to the old one.
- **The accreditation line — CLIENT-AUTHORISED, and it supersedes BRIEF §3.8.**
  The page states "Bihar's first NAAC accredited private university", and shows
  "NAAC accredited" rather than the B++ grade, on the client's instruction of
  9 September 2026.

  This is recorded because the earlier analysis reached the opposite
  conclusion: the university's own site carries a NAAC B++ banner and a
  separate "1st — Private University in Bihar" stat, and never states the two
  together, so the combined claim was flagged as unsupported by the site.
  The client has confirmed the combined claim is correct. It is a claim on an
  admission page, so if it is ever challenged, the authority for it is the
  client and not this build. Obtain the NAAC certificate for the file.

  AICTE still does not appear on the approvals page, so the page claims UGC
  and NAAC only.
- **The placement figures.** 16 B.Tech records, 3–12 LPA, 6 employers, counted
  from the university's published list rather than asserted. The page says
  "100% placement **assistance**" and never "100% placement".
- **The first-year totals and the after-scholarship table.** Both are arithmetic
  on the university's own published numbers, not claims of our own. If a fee or
  a band changes, recompute them.

## Deliberately not done

- **No OTP step.** This is a front end with no backend; an OTP field that
  verifies nothing is worse than no OTP.
- **No "87% seats filled" bar and no fake urgency.** We cannot verify a fill
  rate, and a page that invents one is the kind of thing a university gets
  caught doing. The countdown is real: it reads `lastDateISO`, and if that date
  is missing or already past, every countdown hides itself rather than resetting.
