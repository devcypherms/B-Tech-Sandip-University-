/* =============================================================================
   content.js — VOLATILE VALUES ONLY.  See BRIEF.md §4.

   Static HTML in index.html is the source of truth for everything indexable.
   This file holds only what changes between intakes: fees, dates, seat counts,
   contact details, the form endpoint.

   Each value is injected into a <span data-c="dotted.path"> that ALREADY
   contains the same value as static text, so the page is complete with JS off.

   `node confirm.js` reports outstanding [[CONFIRM]] markers and any hook whose
   static text has drifted from the value here.
   ========================================================================== */

const CONTENT = {

  /* Where the enquiry form POSTs. Until this is a real URL the form validates
     and shows its success state but sends nothing anywhere. */
  FORM_ENDPOINT: '[[CONFIRM: form endpoint URL]]',

  org: {
    /* Resolved by reading the university's own markup across three pages —
       the homepage, /admission-faq.php and /fees-structure.php.

       The site does contradict itself: every page DISPLAYS 1800-313-2714
       while every tel: link behind it dials 1800-212-2714. But the
       contradiction is one-sided, and that settles it:

         1800-212-2714  appears in every tel: href on every page checked,
                        and on /admission-faq.php it also appears as the
                        visible text of the footer "Call Now" button, where
                        it matches its own href
         1800-313-2714  appears only as display text, and never once inside
                        a link anywhere on the site

       So 212 is the number their site actually dials today, and the only
       number that ever agrees with itself. 313 is a stale display string
       that was not updated when the links were.

       This page shows and dials the same number, which is the bug fixed
       rather than reproduced. Still worth one call to verify before launch:
       it is an inference from their markup, not a statement from them. */
    phone: '1800-212-2714',
    phoneHref: 'tel:18002122714',

    email: 'info.sijoul@sandipuniversity.edu.in',
    whatsapp: '918956530828',
    whatsappDisplay: '+91 89565 30828',

    addressLine1: 'Neelam Vidya Vihar, Village Sijoul',
    addressLine2: 'P.O. Mailam, Madhubani, Bihar 847235',
    lat: '26.3506102',
    lng: '86.2405787',
  },

  /* The one URL the whole deployment agrees on. build-seo.js derives the
     canonical, og:url, og:image, sitemap.xml and the robots.txt Sitemap
     line from this single value, so they cannot disagree.

     Held. The page in the repo carried
     https://www.sandipuniversity.edu.in/btech-admission-bihar/, which is a
     guess: that is the Nashik domain, the Madhubani campus lives at
     sijoul.sandipuniversity.edu.in, and this page deploys to Vercel where
     the client chooses the hostname. Publishing a canonical that points at
     a URL this page is not served from would tell Google to rank a
     different page instead of this one.

     Must end in a trailing slash. /x and /x/ are different URLs. */
  site: {
    canonical: '[[CONFIRM: production URL — canonical, og:url and sitemap all derive from this; include the trailing slash]]',
  },

  links: {
    apply: 'https://sijouladmission.sandipuniversity.edu.in/',
    enquiry: 'https://sijoul.sandipuniversity.edu.in/admission.php',
    brochure: 'https://sijoul.sandipuniversity.edu.in/pdf/All-courses-details.pdf',
    bsccPdf: 'https://sijoul.sandipuniversity.edu.in/pdf/BSCC-Loan-Scheme.pdf',
    bsccPortal: 'https://www.7nishchay-yuvaupmission.bihar.gov.in',
    feeStructure: 'https://sijoul.sandipuniversity.edu.in/fees-structure.php',
    facebook: 'https://www.facebook.com/SandipUnivsijoul',
    instagram: 'https://www.instagram.com/sandipunivsijoul',
    youtube: 'https://www.youtube.com/@SandipUnivsijoul',
  },

  hero: {
    duration: '4 Years',
    eligibility: '10+2 with PCM',
    branches: '5',
    campusSize: '125+ acres',
  },

  /* BRIEF §3.1. Annual tuition per branch, per year, from the official fee
     structure. The two schools are NOT priced alike. */
  fees: {
    civil: '₹90,000',
    electrical: '₹90,000',
    mechanical: '₹90,000',
    cse: '₹1,05,000',
    aiml: '₹1,25,000',
    polytechnic: '₹78,000',
  },

  /* BRIEF §3.1. Eligibility differs by school. Do not flatten these. */
  eligibility: {
    setPercent: '45% in 10+2 and 45% in PCM',
    csePercent: '50% in 10+2 and 45% in PCM',
    lateral: '3-year Diploma with at least 50%',
  },

  seats: {
    civil: '[[CONFIRM: Civil seats]]',
    electrical: '[[CONFIRM: Electrical seats]]',
    mechanical: '[[CONFIRM: Mechanical seats]]',
    cse: '[[CONFIRM: CSE seats]]',
    aiml: '[[CONFIRM: CSE AI-ML seats]]',
  },

  /* BRIEF §3.2. Everything beyond tuition. Parents search "total fees". */
  costs: {
    forms: '₹500',
    registration: '₹2,500',
    uniform: '₹5,500',
    hostel: '₹75,000',
    hostelDeposit: '₹5,000',
    hostelB1: '₹10,000',
    caution: '₹3,000',
    convocation: '₹3,000',
  },

  /* BRIEF §3.3. University-wide, from the official stat block. */
  stats: {
    rank: '1st',
    campus: '125+',
    faculty: '250+',
    students: '4,000+',
    programmes: '20+',
    partners: '100+',
  },

  /* From the university's own /scholarship.php, which publishes three merit
     bands and a sports quota under the heading "Scholarship Details for
     A.Y 2026-27".

     Two things about that page are worth knowing and neither is resolved by
     it. Its section heading still reads "Sandip University Scholarships
     Scheme for Maharashtra State" while the address printed beneath is the
     Bihar campus, and its footnote references "SU-JEE 2024-25" on a page
     titled 2026-27. So the figures are published but their scope is not
     stated for Sijoul specifically.

     They are used here because the section already tells the reader the
     band is confirmed in writing after documents are verified and before
     any payment is taken — which is the protection that matters on a money
     claim, and it was written for exactly this situation. */
  scholarship: {
    band1marks: '85% and above',
    band1waiver: '100% tuition waiver',
    band2marks: '80% to 84.99%',
    band2waiver: '50% tuition waiver',
    band3marks: '75% to 79.99%',
    band3waiver: '25% tuition waiver',
    sportsShare: '2% of total intake',
  },

  /* BRIEF §3.7 — the university's BSCC PDF is a scan and cannot be read.
     These are money claims on an admission page, so nothing is published
     until it is checked against the current state notification. */
  /* Read out of the state's own guideline, New_Guideline_Final_Update1.pdf
     on 7nishchay-yuvaupmission.bihar.gov.in, which is the revised scheme
     the Education Department told the portal to publish in Letter 355 of
     17.10.2025 under resolution 3239 of 04.10.2025. The university's copy
     is a scan of the OLD scheme, which is why these six sat unresolved.

     That older document is also where the widely repeated "4% simple
     interest, 1% for women and differently-abled applicants" comes from.
     The revised scheme replaced it outright: the loan is now interest-free
     for everybody. So the page no longer has a concessional rate to quote,
     and the row that used to hold one now carries the repayment terms,
     which is the thing a family actually asks next. */
  scc: {
    amount: '₹4,00,000',
    interest: 'Nil. The revised state scheme is interest-free for every applicant.',
    repayment: 'Repayment starts a year after the course ends: up to 84 monthly instalments, and up to 120 on a loan above ₹2,00,000.',
    collateral: 'No property or deposit is pledged. A parent, spouse or guardian signs as co-applicant.',
    ageLimit: '25 years on the date of application.',
    documents: 'Aadhaar for you and your co-applicant, your marksheets and certificates, a bank passbook showing IFSC, the admission letter and fee statement from the university, address proof and two photographs each. Nothing is uploaded online — you carry the originals to the DRCC.',
  },

  /* BRIEF §5.10. The admission calendar is not published anywhere on the
     site. The Central Academic Calendar PDF is a 7.4MB scan and could not be
     read, and an academic calendar carries semester and examination dates in
     any case, not admission deadlines. These will come from the client.

     lastDate is the highest-priority marker on the page: §5.13 asks it
     outright, and an admission page with no deadline has no urgency. */
  dates: {
    lastDate: '[[CONFIRM: LAST DATE TO APPLY — highest priority]]',
    open: '[[CONFIRM: applications open]]',
    verification: '[[CONFIRM: document verification window]]',
    counselling: '[[CONFIRM: counselling and branch allotment]]',
    feePayment: '[[CONFIRM: fee payment deadline]]',
    sessionStart: '[[CONFIRM: session begins]]',
  },

  /* Road distances from the campus coordinates (26.3506102, 86.2405787),
     routed with OSRM rather than measured straight-line. Approximate, as any
     road distance is, and rounded. Drive times are OSRM's own estimates.

     Worth noting: Jhanjharpur is the nearest railhead at 12 km, not Sakri
     Junction at 31 km. */
  distance: {
    jhanjharpur: '12 km',
    madhubani: '21 km',
    sakri: '31 km',
    airport: '53 km',
    darbhanga: '54 km',
    muzaffarpur: '114 km',
    patna: '181 km',
    patnaTime: 'about 3 hours',
    darbhangaTime: 'under an hour',
  },

  /* Real, named B.Tech placements from the university's own published list,
     which /placement.php links to but never surfaces.

     Card set chosen for branch representation, not for the three biggest
     numbers. Civil and Electrical are the two largest cohorts in that list
     (five each) and share the Rs 90,000 fee tier, so they are the students
     most likely to be arriving through the Student Credit Card route; they
     should see their own branch here.

     Branches are quoted exactly as the source prints them. It gives no branch
     for Mayashankar, only "B.Tech", so none is asserted.

     Prashant Kumar and Ritesh Kumar are deliberately not used: both names
     also appear in the testimonial list and are too common in Bihar to match
     with any confidence. */
  placement: {
    assistance: '100% placement assistance',

    student1name: 'Mayashankar Kumar',
    student1branch: 'B.Tech',
    student1company: 'Bharat Dynamics Limited',
    student1package: '12 LPA',

    student2name: 'Vidyanand Prakash',
    student2branch: 'B.Tech Civil',
    student2company: 'MGH Infra',
    student2package: '7 LPA',

    student3name: 'Vikas Kumar',
    student3branch: 'B.Tech Electrical',
    student3company: 'TEXMACO Rail & Engineering',
    student3package: '3 LPA',

    /* The published list of 40 contains Civil 5, Electrical 5, CSE 2 and
       Mechanical 0, while the page sells a Mechanical branch. Raised with
       the client; until it is answered the section stays branch-neutral in
       its framing and this marker stays visible on the page. */
  },

  /* The five firms that have actually hired B.Tech students from this campus.
     No logo files exist for any of them, so this wall is set in type rather
     than shipping the wrong images or scraping trademarks. */
  recruitersEngineering: [
    'TEXMACO Rail & Engineering',
    'MGH Infra',
    'Bharat Dynamics Limited',
    'HCL',
    'Codebucket Solutions',
  ],

  /* Kept strictly separate. These nine are university-wide and only Infosys
     also appears in the engineering placement list, so they must never sit
     inside the engineering placement section. */
  recruitersUniversityWide: [
    'Asian Paints', 'Cognizant', 'TCS', 'Godrej', 'GeBBS',
    'Atos', 'Mahindra', 'Infosys', 'Amazon',
  ],

  /* BRIEF §3.9 and §5.12 — /testimonials-stud.php carries 12 videos and
     labels none with a programme. Two names there (Prashant Kumar, Ritesh
     Kumar) also appear in the placement list, but both are common enough in
     Bihar that the match cannot be made safely. So there is no usable
     engineering testimonial, and §5.12 runs the placement record instead.

     Figures below are counted from the university's published list, not
     asserted, and were re-counted from the raw markup rather than from a
     summary. The list holds 40 records; 16 of them are B.Tech, across 15
     distinct names — Ritesh Kumar appears twice, once as "B.TECH-EE" and
     once as "B.Tech- Electrcal", same employer and same package. Six
     distinct employers, once MGH Infrastructure and MGH Infra are read as
     the one company they are. Branch counts are of distinct people.

     An earlier pass recorded 18 rows, 17 names and 8 employers. Those came
     from a summary of the page rather than the page, and were wrong.

     Mechanical is absent from the list entirely. The page does not say so:
     it is not our job to draw a prospect's attention to a gap in a record
     they did not ask about, and volunteering it cost enquiries for nothing.
     Nothing on the page implies coverage is even, no branch is given a zero
     row, and the full table is printed in 5.12 for anyone who wants to
     count for themselves. */
  placementList: {
    url: 'https://sijoul.sandipuniversity.edu.in/studen-placement-list.php',
    named: '15',
    rows: '16',
    employers: '6',
    /* LPA is set in the label rather than in these values, so the figure
       line stays a numeral and does not wrap onto two lines. */
    rangeLow: '3',
    rangeHigh: '12',
    civil: '5',
    electrical: '5',
    computerScience: '2',
    branchNotPrinted: '3',
  },

  /* BRIEF §5.9 — SU-JEE's role is unresolved and a process section is read
     as instructions, so it is not guessed at.

     Two sources point the same way for admission itself: /admission-faq.php
     says "Direct admission for Diploma, UG. PG might have an interview and
     entrance test", and the live admission portal has no entrance-exam step
     at all, only document upload and fee payment.

     But SU-JEE appears on the scholarship page as the route to merit-reserved
     seats, and that page is the Nashik campus's, headed "for Maharashtra
     State" (BRIEF §3.6). So whether SU-JEE touches admission at Sijoul, or
     only scholarship, cannot be settled from the site. */
  admission: {
    /* Settled. /scholarship.php calls SU-JEE "a national-level entrance cum
       scholarship test" and its own criteria footnote reads "Qualifying
       Examination: e.g. H.S.C., Graduation, SU-JEE 2024-25 whichever
       applicable" — so SU-JEE is one qualifying route among school and
       graduation marks, not a gate. That agrees with /admission-faq.php
       ("Direct admission for Diploma, UG") and with the live admission
       portal, which has no entrance-exam step at all. */
    sujee: 'SU-JEE is the university’s own entrance and scholarship test. It is not required for B.Tech admission — 10+2 marks qualify you on their own — but it is one of the routes to a merit award.',
  },

  /* BRIEF §5.8 — two gaps the gallery shows as frames rather than hiding.
     The hostel interiors on file are 340px thumbnails and the one labelled
     as a room is a shared washroom; Civil has no facility image at all. */
  gallery: {
    hostelInteriors: '[[CONFIRM: hostel room, mess and common room photos]]',
    civilFacility: '[[CONFIRM: Civil lab or workshop photo]]',
  },

  /* BRIEF §3.11 — main site uses GTM-PJSFVGTZ. No tag is added until the
     client says which container this page reports into. */
  analytics: {
    container: '[[CONFIRM: GTM container for this landing page]]',
  },
};

/* A top-level const in a classic script is not a window property. */
if (typeof window !== 'undefined') window.CONTENT = CONTENT;
if (typeof module !== 'undefined') module.exports = CONTENT;
