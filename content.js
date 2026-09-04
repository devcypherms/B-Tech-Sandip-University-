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
    /* BRIEF §3.10 — the university's own site contradicts itself sitewide:
       every page DISPLAYS 1800-313-2714 but every tel: link behind it points
       to 1800-212-2714. This number appears in the header, the mobile sticky
       bar and the final CTA; if the wrong one ships, every mobile tap fails
       silently. Held until the client answers. */
    phone: '[[CONFIRM: phone — site shows 1800-313-2714, tel: links use 1800-212-2714]]',
    phoneHref: '[[CONFIRM: tel href]]',

    email: 'info.sijoul@sandipuniversity.edu.in',
    whatsapp: '918956530828',
    whatsappDisplay: '+91 89565 30828',

    addressLine1: 'Neelam Vidya Vihar, Village Sijoul',
    addressLine2: 'P.O. Mailam, Madhubani, Bihar 847235',
    lat: '26.3506102',
    lng: '86.2405787',
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

  /* BRIEF §3.6 — the scholarship page is the Nashik campus's, headed
     "for Maharashtra State", with a broken table and a 2024-25 footnote.
     Every figure is held back until the Sijoul numbers are confirmed. */
  scholarship: {
    band1marks: '[[CONFIRM: scholarship slab 1 marks]]',
    band1waiver: '[[CONFIRM: scholarship slab 1 waiver]]',
    band2marks: '[[CONFIRM: scholarship slab 2 marks]]',
    band2waiver: '[[CONFIRM: scholarship slab 2 waiver]]',
    band3marks: '[[CONFIRM: scholarship slab 3 marks]]',
    band3waiver: '[[CONFIRM: scholarship slab 3 waiver]]',
  },

  /* BRIEF §3.7 — the university's BSCC PDF is a scan and cannot be read.
     These are money claims on an admission page, so nothing is published
     until it is checked against the current state notification. */
  scc: {
    amount: '[[CONFIRM: BSCC maximum loan amount]]',
    interest: '[[CONFIRM: BSCC interest rate]]',
    concession: '[[CONFIRM: BSCC concessional rate]]',
    collateral: '[[CONFIRM: BSCC collateral requirement]]',
    ageLimit: '[[CONFIRM: BSCC age limit]]',
    /* Neither the university's scanned PDF nor the state portal landing page
       publishes a document list. Note also that the portal calls it an
       "interest free loan" while the figure reported everywhere else is 4%
       simple, which is a further reason to hold all of these. */
    documents: '[[CONFIRM: BSCC document checklist]]',
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

  distance: {
    madhubani: '[[CONFIRM: km from Madhubani]]',
    darbhanga: '[[CONFIRM: km from Darbhanga]]',
    muzaffarpur: '[[CONFIRM: km from Muzaffarpur]]',
    patna: '[[CONFIRM: km from Patna]]',
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
    mechanicalNote: '[[CONFIRM: Mechanical placement records]]',
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

  /* BRIEF §3.9 — /testimonials-stud.php carries 12 videos and labels none of
     them with a programme. Two names (Prashant Kumar, Ritesh Kumar) also
     appear in the placement list, but these are common names in Bihar and the
     match cannot be verified. So there is no usable engineering testimonial,
     and §5.12 runs the named placement list instead of an empty block. */
  placementList: {
    url: 'https://sijoul.sandipuniversity.edu.in/studen-placement-list.php',
    btechCount: '18',
    totalCount: '40',
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
    sujee: '[[CONFIRM: is SU-JEE required for B.Tech admission, or scholarship only]]',
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
