# Sandip University — B.Tech Admission 2026 Landing Page

Complete build brief. This supersedes any earlier brief or data file.
Re-read whenever context gets tight.

## 0. Task

Build a single-page B.Tech admission landing page for Sandip University, Sijoul,
Madhubani (Bihar) from scratch.

Delete everything in the existing folder first. The current page is basic and
nothing in it should be salvaged. Back it up outside the repo, then start clean.

```
index.html
assets/css/style.css
assets/js/main.js
assets/img/
content.js
vercel.json
robots.txt
sitemap.xml
```

Stack: static HTML + CSS + vanilla JS. No React, no Tailwind, no build step, no
jQuery, no Bootstrap. Deployed on Vercel.

## 1. Quality bar

This should feel like a luxury real-estate site, not a college site. The
benchmark is the Venus Capital Heights page — the same discipline applied to a
dark theme.

- One accent colour, used almost nowhere except hover states and small marks.
- Section padding of 120px+ on desktop. Space is what separates premium from cheap.
- Numbers instead of adjectives. No "world-class", "state-of-the-art", "cutting-edge".
- Photography carries the page. Type sits on top of it, never fights it.
- One orchestrated motion moment on load. Everything else is user-triggered.

Avoid: per-section gradients; identical rounded cards repeated down the page;
drop shadows on everything; generic icon packs; scroll-reveal fade-up on every
block; competing CTAs in one viewport.

Assume 85% of traffic is a mid-range Android phone on patchy data. Mobile-first
throughout.

## 2. Design tokens

```css
--ink-900: #070C12;   /* hero backdrop */
--ink-800: #0D1520;   /* page background */
--ink-700: #16202C;   /* raised surfaces, form fields */
--paper:   #F2EFE9;   /* primary text */
--muted:   #8B98A6;   /* secondary text — measured 6.2:1 on --ink-800, don't change */
--brass:   #C79A4B;   /* accent: hover states, underlines, small marks only */
--hairline: rgba(242, 239, 233, 0.10);
```

`--brass` never fills a large area. Primary buttons are `--paper` on ink, going
`--brass` on hover. Dividers are 1px hairlines, never thick bars.

**Type.** Display: Fraunces (variable, `opsz` axis — 144 for hero, 48 for
headings; SOFT low, WONK off). Body: Instrument Sans. Big statistics use
Fraunces. Both self-hosted as WOFF2 subsets, `font-display: swap`, no
render-blocking Google Fonts request. Verify ₹ (U+20B9) survives in both
subsets — the fees section depends on it.

Do not use Inter, Poppins, Montserrat, or Playfair Display.

```css
--fs-hero:  clamp(2.75rem, 7vw, 6.5rem);
--fs-h2:    clamp(1.875rem, 3.5vw, 3.25rem);
--fs-h3:    clamp(1.25rem, 2vw, 1.75rem);
--fs-body:  clamp(1rem, 1.1vw, 1.125rem);
--fs-small: 0.875rem;

--space-section: clamp(5rem, 12vh, 9rem);
--space-block:   clamp(2rem, 5vw, 4rem);
--gutter:        clamp(1.25rem, 5vw, 5rem);
```

Body line length capped at 68ch, line height 1.6. Hero line height 1.05. Max
content width 1320px, centred.

Typographic don'ts: no tracked-out ALL-CAPS eyebrow labels above headings; no →
glued onto button text; no A · B · C middle-dot strings; no single word in a
headline coloured differently.

## 3. Verified data

Everything in this section is confirmed from the official site
(sijoul.sandipuniversity.edu.in, checked 4 Sept 2026). Use it as written.
Anything not here is `[[CONFIRM]]`.

### 3.1 Branches — fees and eligibility differ by branch

B.Tech sits under two schools and the numbers are not uniform. Build the
programmes accordion, the fee table and the eligibility block per-branch.

**School of Engineering & Technology**

| Branch | Fees / year | Eligibility |
|---|---|---|
| B.Tech Civil Engineering | ₹90,000 | 45% in 10+2 and 45% in PCM |
| B.Tech Electrical Engineering | ₹90,000 | 45% in 10+2 and 45% in PCM |
| B.Tech Mechanical Engineering | ₹90,000 | 45% in 10+2 and 45% in PCM |

**School of Computer Science & Engineering**

| Branch | Fees / year | Eligibility |
|---|---|---|
| B.Tech Computer Science and Engineering | ₹1,05,000 | 50% in 10+2 and 45% in PCM |
| B.Tech CSE with AI & ML | ₹1,25,000 | 50% in 10+2 and 45% in PCM |

All five: 8 semesters, 4 years, semester mode. Fee is per year.

Lateral entry / Direct Second Year is available on all five branches — 3-year
Diploma with at least 50%, same fee as first year. The university also runs its
own Polytechnic (Civil, Electrical, Mechanical, Computer Science) at
₹78,000/year, so there's an internal feeder path worth naming.

**There is no Electronics Engineering programme.** Not in B.Tech, not in the
Polytechnic. Do not create a branch for it and do not imply one.

### 3.2 Other costs

Parents search "total fees", not "tuition fees". Show this as a second table
under the branch fees.

| Item | Amount | When |
|---|---|---|
| Forms and prospectus | ₹500 | One time |
| Registration fee | ₹2,500 | One time |
| Uniform | ₹5,500 | At admission |
| Hostel | ₹75,000 | Per year |
| Hostel security deposit | ₹5,000 | One time |
| B1 Hostel supplement | ₹10,000 | Per year, subject to availability |
| University caution money | ₹3,000 | Refundable |
| Convocation and certificate | ₹3,000 | Final year |

Hostel rooms have bunk beds and allotment is at the Hostel Supervisor's
discretion. Don't repeat that on a marketing page, but don't imply private
rooms either.

### 3.3 University stats

| Value | Label |
|---|---|
| 1st | Private university in Bihar |
| 125+ | Acres of campus |
| 250+ | Faculty members |
| 4,000+ | Students |
| 20+ | Programmes offered |
| 100+ | Global recruitment partners |

Leave "95% student satisfaction" and "55+ research publications" off the page.
The first has no stated methodology; the second is a low number that invites
unflattering comparison.

### 3.4 Selling points, in the university's own words

- 100% placement assistance
- Faculty with IIT / NIT experience
- 125+ acre campus
- 4,000+ alumni network
- 100+ global recruitment partners

The IIT/NIT faculty line is the strongest thing available. It answers the exact
objection the client's ad campaign is built around — that studying in Bihar
means second-rate teaching. Lead §5.4 with it.

### 3.5 Recruiters

Asian Paints, Cognizant, TCS, Godrej, GeBBS, Atos, Mahindra, Infosys, Amazon.

Nine real logos. These are university-wide, not engineering-specific — the
section heading must not imply otherwise.

### 3.6 Scholarships — do not publish yet

The university's scholarship page is headed "Sandip University Scholarships
Scheme for Maharashtra State." Sijoul is in Bihar. The table is also broken,
with the third slab sitting as loose text outside it, and the footnote still
references SU-JEE 2024-25.

The page has been copied from the Nashik campus and not localised. Keep every
scholarship figure as `[[CONFIRM]]`. Build the block, leave the numbers out.

For reference, what it currently states: merit slabs of 85%+ → 100% tuition
waiver, 80–84.99% → 50%, 75–79.99% → 25%; sports scholarship at 2% of intake;
30% of intake reserved for merit via the SU-JEE exam; awards finalised within
20 days of the SU-JEE result.

### 3.7 Bihar Student Credit Card

The university's BSCC page has almost no content — an image, a PDF, and a link
to the state portal. Write this block from the government scheme, not from
their page.

- State portal: https://www.7nishchay-yuvaupmission.bihar.gov.in
- University's PDF: https://sijoul.sandipuniversity.edu.in/pdf/BSCC-Loan-Scheme.pdf

Fetch that PDF and use what it states. The ₹4 lakh limit and zero-collateral
terms are widely reported but must be verified against the current notification
before publishing — this is a money claim on an admission page.

### 3.8 Accreditation — the client's current ad claim is wrong

The homepage carries a NAAC banner reading **NAAC B++**. Separately, its stat
block says "1st — Private University in Bihar", which is a claim about being
established first, not about accreditation.

The client's Google Ads and video scripts say "Bihar's first NAAC accredited
university", merging two facts into a claim the site never makes.

Supported phrasing, use either:

- "Bihar's first private university, NAAC B++ accredited"
- "NAAC B++ accredited"

AICTE is unverified. The footer says only "UGC Approved" and the homepage CTA
says "Bihar's Top UGC-recognised University". Check `/approvals.php` and
`/pdf/Mandatory-Self-Disclosure.pdf`. Until confirmed, the trust strip runs
UGC + NAAC B++ only.

### 3.9 Testimonials — a gap

Five video testimonials exist: Nutan Jha (MBA), Madhu Kumari (MBA), Randhir
Kumar (MBA), Rishav Kumar (MBA), Gulshan Shah (B.Tech Agriculture). YouTube IDs
`GJHVlPtceb8`, `SL7AI67WIjE`, `UU5kbCH3VlU`, `fauWoVnX9RY`, `8zPDxjxPClo`.

None are engineering students. MBA testimonials on a B.Tech page are worse than
no testimonials — applicants notice immediately. Build the markup, leave it
empty and flagged. Check `/testimonials-stud.php` in case engineering ones exist
that didn't reach the homepage.

### 3.10 The phone number contradicts itself

Every page displays **1800-313-2714**. Every `tel:` link behind it points to
**1800-212-2714**. Sitewide, two different numbers.

On our page the number sits in the header, the mobile sticky bar and the final
CTA. If the wrong one ships, every mobile tap fails silently. Keep it
`[[CONFIRM]]` until the client answers.

### 3.11 Contact and links

```
Address       Neelam Vidya Vihar, Village Sijoul, P.O. Mailam,
              Madhubani, Bihar 847235, India
Email         info.sijoul@sandipuniversity.edu.in
Phone         [[CONFIRM — see §3.10]]
WhatsApp      +91 89565 30828
Coordinates   26.3506102, 86.2405787
```

| Purpose | URL |
|---|---|
| Apply | https://sijouladmission.sandipuniversity.edu.in/ |
| Enquiry form | https://sijoul.sandipuniversity.edu.in/admission.php |
| Download brochure | https://sijoul.sandipuniversity.edu.in/pdf/All-courses-details.pdf |
| BSCC PDF | https://sijoul.sandipuniversity.edu.in/pdf/BSCC-Loan-Scheme.pdf |
| Fee structure | https://sijoul.sandipuniversity.edu.in/fees-structure.php |
| Approvals | https://sijoul.sandipuniversity.edu.in/approvals.php |
| EV Lab | https://sijoul.sandipuniversity.edu.in/ev-lab.php |
| Placements | https://sijoul.sandipuniversity.edu.in/placement.php |
| Testimonials | https://sijoul.sandipuniversity.edu.in/testimonials-stud.php |
| Academic calendar | https://sijoul.sandipuniversity.edu.in/pdf/nc/Central Academic Calendar AY 2026-27.pdf |

Social — use the Sijoul campus handles, not the group-level ones: Facebook
`SandipUnivsijoul`, Instagram `sandipunivsijoul`, YouTube `@SandipUnivsijoul`.

Analytics: the main site uses container `GTM-PJSFVGTZ`. Ask which container this
page should report into before adding any tag.

### 3.12 Fetch these before building the sections that need them

- `/placement.php` — placement figures, named packages, engineering-specific recruiters (§5.6)
- `/ev-lab.php` — the EV Lab is promoted in the top bar of every page and is a specific, pictureable facility. Use it instead of "modern labs" (§5.4, §5.8)
- `/approvals.php` and the Mandatory Self Disclosure PDF — accreditation (§3.8)
- The Central Academic Calendar PDF — 2026-27 dates (§5.10)

## 4. Content handling

Static HTML is the source of truth for everything indexable — headings, body
copy, programme descriptions, FAQ questions and answers. Write it directly in
index.html.

content.js holds volatile values only: fees, dates, seat counts, phone,
WhatsApp, form endpoint. These inject into `<span data-c="fees.cse">₹1,05,000</span>`
hooks that already contain the real value as static text. With JS disabled the
page is still complete and still indexable.

For any number not in §3, write `[[CONFIRM: annual fee CSE]]` rather than
inventing a plausible-looking value. List every marker in one block at the end
of the build.

Do not invent statistics. A wrong fee on a live admission page is a real problem.

## 5. Page structure

Sixteen blocks, in this order.

**5.1 Header (sticky).** Transparent over the hero, then solid `--ink-800` with
a hairline bottom border after 80px of scroll. Logo, phone (`tel:`), and one
button — "Apply for B.Tech". No nav menu. Phone hides below 768px; the sticky
bar handles calls there. Button label comes from `cta` / `ctaShort` variants so
it never wraps.

**5.2 Hero.** Full-viewport `--ink-900`. Full-bleed campus photograph with
`linear-gradient(180deg, rgba(7,12,18,.45) 0%, rgba(7,12,18,.92) 100%)` overlay.

H1 in Fraunces: "Engineering ki padhai, Bihar mein hi." Subline: "B.Tech
Admission 2026 at Sandip University, Madhubani." Two buttons: "Apply now"
(primary), "Download brochure" (ghost).

Stat rail pinned to the bottom of the viewport, four items on hairlines:
4 Years / 10+2 with PCM / 5 Branches / 125+ acre campus. Labels in `--muted`
above, values in Fraunces below.

Serve the hero image art-directed, not just repositioned: a portrait crop for
narrow viewports via `<picture>` with `max-aspect-ratio: 1/1`, and split the
preload by aspect ratio so phones never download the landscape file.
`object-position` does not solve this — a 1.7:1 image in a 0.46:1 viewport shows
its full height and crops only the sides.

The one motion moment: H1 mask-reveals upward line by line on load (80ms
stagger), stat rail fades in once, 400ms later. That is the entire
non-user-triggered animation budget. Respect `prefers-reduced-motion`.

**5.3 Trust strip.** One quiet row: UGC recognised · NAAC B++ accredited. Add
AICTE only if §3.8 confirms it. Logos greyscale at 55% opacity, full opacity on
hover. No heading.

**5.4 Why Sandip.** Two-column editorial layout, not cards. Left column a short
paragraph. Right column four points on hairline borders:

- Faculty with IIT and NIT experience
- Bihar Student Credit Card accepted
- 125+ acre residential campus with separate boys' and girls' hostels
- [EV Lab line — write after fetching /ev-lab.php]

Not numbered. This is not a sequence.

**5.5 Programmes.** Five expandable rows, not a card grid. Collapsed: branch
name, duration, annual fee. Expanded: eligibility (per §3.1 — they differ), what
you'll study, career paths, and a lateral-entry line. Height animates; this is
user-triggered so motion is welcome.

**5.6 Placements.** Heading: "Placement assistance that starts in year one."
Copy stays at "100% placement assistance" — never "100% placement". Named
student cards if /placement.php provides them, otherwise `[[CONFIRM]]`. Below,
the nine-logo recruiter wall, greyscale, marquee pausing on hover and stopping
under `prefers-reduced-motion`.

**5.7 Fees, scholarship and Student Credit Card.** The most important section on
the page for this audience — give it the most space.

Branch fee table (§3.1), then the additional costs table (§3.2), then the
Student Credit Card block (§3.7), then the scholarship block with figures held
back (§3.6). Hairline borders, no zebra stripes, no cards. One CTA at the end:
"Talk to an admission counsellor".

**5.8 Campus and labs.** Horizontal scroll gallery, drag and arrow-key
navigable, 8–10 frames. Captions in `--muted` at 14px. Facilities available:
hostels, canteens, high-tech classrooms, gymnasium, library, 24×7 security,
on-campus ambulance, EV Lab. No lightbox.

Note: the university's own site files its library tile under a swimming-pool
image. Don't inherit that error.

**5.9 Admission process.** Four steps — numbering is correct here because it
genuinely is a sequence. Apply online or call → submit documents and verify
eligibility → counselling and branch allotment (JEE Main considered; direct
admission also available) → fee payment and enrolment. Vertical on mobile,
horizontal on desktop, connected by a hairline.

**5.10 Eligibility and important dates.** Eligibility per-branch on the left
(§3.1), 2026-27 dates on the right once the academic calendar is read. Plain
text, hairline separators.

**5.11 Location.** "Getting here" — Sijoul, Madhubani. Real road distances from
Madhubani, Darbhanga, Muzaffarpur and Patna. Google Map loaded only on click,
behind a static placeholder, so it costs nothing on first paint. Coordinates in
§3.11.

**5.12 Student voices.** Build the markup, leave it empty and flagged. See §3.9.

**5.13 FAQ.** Twelve questions, accordion, FAQPage JSON-LD. Phrased the way a
parent or student in Bihar actually searches, answered in the same Hinglish
register, two to four sentences each:

1. Bihar mein best private engineering college kaun sa hai?
2. Sandip University Madhubani ki B.Tech fees kitni hai?
3. Kya Student Credit Card se yahan admission le sakte hain?
4. JEE Main ke bina B.Tech admission ho sakta hai?
5. Diploma ke baad direct second year mein admission milega?
6. Hostel facility available hai, aur hostel fees kitni hai?
7. Placement kaisa hai?
8. Patna se campus kitni door hai?
9. Kaun kaun si branches available hain?
10. CSE aur CSE AI-ML mein kya farq hai?
11. Admission 2026 ki last date kya hai?
12. Scholarship kaise milegi?

**5.14 Final CTA and enquiry form.** Full-width `--ink-900`. Short headline, then
Name, Mobile, Email, Branch (select), District (select), consent checkbox.
Client-side validation, inline errors under each field, submit disabled while
posting. Endpoint from a `FORM_ENDPOINT` constant — leave it a placeholder and
tell me what to fill in.

**5.15 Footer.** Address, phone, email, three social links, copyright. Nothing else.

**5.16 Mobile sticky bar.** Under 768px only: Call | WhatsApp | Apply, three
equal columns, 56px tall, `--ink-700` with a hairline top border. Matching
`padding-bottom` on the body so it never covers content.

## 6. SEO

```html
<title>Best Private Engineering College in Bihar | B.Tech Admission 2026 — Sandip University Madhubani</title>
<meta name="description" content="B.Tech admission 2026 open at Sandip University, Madhubani. Civil, Mechanical, Electrical, CSE & AI-ML branches. Bihar's first private university, NAAC B++ accredited. 125+ acre campus, hostel, Student Credit Card accepted.">
```

Each keyword gets exactly one home. Don't repeat across sections, and don't
force one into copy where it reads unnaturally — leave it for the FAQ instead.

| Section | Keywords |
|---|---|
| Title + H1 area | best private engineering college in bihar, b.tech admission 2026, engineering college in bihar |
| 5.4 Why Sandip | private engineering college in bihar, private btech college, engineering college with scholarship, engineering college with hostel |
| 5.5 Programmes | computer science engineering, civil engineering college, mechanical engineering college, electrical engineering college |
| 5.6 Placements | engineering college with placement, best engineering college in bihar |
| 5.7 Fees | engineering college with student credit card |
| 5.9 Admission process | jee counselling college, engineering admission, engineering admission 2026, btech admission |
| 5.11 Location | engineering college near patna, engineering college in north bihar, engineering college near me |
| 5.13 FAQ | btech college in bihar, btech admission bihar, engineering college admission, engineering after 12th, btech admission 2026, lateral entry btech bihar, diploma to btech admission |

`electronics engineering` is dropped from the keyword set — the programme does
not exist and one keyword is not worth a line a parent could read as a promise.

Structured data: `CollegeOrUniversity` (address, phone, geo), `Course` per branch
using `hasCourseInstance`, and `FAQPage`. All three in static HTML.

One `<h1>`, logical `<h2>` order, real `<section>` elements. Descriptive alt text
on every image — alt text is not a keyword dump. `og:` and `twitter:` tags with a
purpose-built share image. Canonical URL.

## 7. Performance and accessibility

WebP with explicit width/height. `loading="lazy"` below the hero,
`fetchpriority="high"` on the hero image. Critical CSS for the hero inlined, the
rest deferred. No third-party scripts except the GA/Meta pixel, deferred. Target
LCP under 2.5s on 4G, CLS under 0.1, total weight under 1.2MB.

Visible `--brass` focus rings on every interactive element. Accordions are real
`<button>` elements with `aria-expanded`. Form fields have real `<label>`s, not
placeholder-only labels. `prefers-reduced-motion` disables the load reveal, the
logo marquee, and smooth scrolling.

## 8. How to work

1. Before writing code, produce a design plan: palette as named hex values, the
   two typefaces and their roles, ASCII wireframes of the hero and one other
   section, and three sentences on what makes this page specific to Sandip
   rather than to any engineering college.
2. Check that plan against §1's avoid-list. If any part is a default you'd
   produce for any college page, change it and say what you changed.
3. Build section by section in §5 order. Show me each one before moving on.
4. After every two sections, screenshot at 390px and 1440px and critique against
   the brief.
5. Commit after each approved section.

Ask before guessing — especially on fees, placement figures, accreditation, and
the phone number.
