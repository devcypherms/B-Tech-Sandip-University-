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
| 2 | Last date to apply | `dates.lastDate`, `dates.lastDateISO` | 30 Sep 2026 | Drives the countdown in the hero form and the final CTA, the hero chip, the calendar and FAQ 11. `lastDateISO` must match `lastDate`. Set `lastDateISO` to `''` to remove every countdown from the page without touching markup. |
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
| 14 | Hostel photographs | The only interiors on file are 340px thumbnails, and the one filed as a room is a shared washroom. Hostel is ₹75,000 a year and the page sells it. |
| 15 | A Civil lab or workshop photograph | None exists in the image set, and Civil is one of the two largest placement groups. |
| 16 | Mechanical placements | The published list shows Civil 5, Electrical 6, CSE 2, Mechanical 0, while the page promotes a Mechanical branch. Is the list partial or out of date? |
| 17 | Engineering testimonials | All five video testimonials on the site are MBA students bar one. MBA testimonials on a B.Tech page are worse than none, so the page runs the named placement record instead. |
| 18 | Scholarship scope | The university's scholarship page is headed "for Maharashtra State" with a 2024-25 footnote. The bands are published and used here, and the page states the band is confirmed in writing before any payment — but confirm they apply at Sijoul. |

---

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
