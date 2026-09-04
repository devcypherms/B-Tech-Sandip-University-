/* =============================================================================
   content.js — VOLATILE VALUES ONLY.

   Static HTML in index.html is the source of truth for everything indexable:
   headings, body copy, programme descriptions, FAQ questions and answers.
   This file holds only the values that change between intakes — fees, dates,
   seat counts, contact details, the form endpoint.

   Each value is injected into a <span data-c="dotted.path"> that ALREADY
   contains the same value as static text. So:
     - with JS off the page is complete and correct,
     - with JS on the span is refreshed from here,
     - and editing a fee never means touching layout.

   `node confirm.js` reports outstanding [[CONFIRM]] markers and any hook whose
   static text has drifted from the value below.
   ========================================================================== */

const CONTENT = {

  /* Where the enquiry form POSTs. Until this is a real URL the form
     validates and shows its success state but sends nothing anywhere. */
  FORM_ENDPOINT: '[[CONFIRM: form endpoint URL]]',

  org: {
    phone: '1800 313 2714',
    phoneHref: 'tel:+9118003132714',
    email: 'info.sijoul@sandipuniversity.edu.in',
    /* Digits only, country code first, no '+'. e.g. 919876543210.
       Left empty, the WhatsApp button stays hidden. */
    whatsapp: '',
  },

  /* Hero stat rail. Acres sits here rather than in static copy because the
     figure is disputed: marketing material says 125+ acres, several public
     listings say 75+. */
  hero: {
    duration: '4 Years',
    eligibility: '10+2 with PCM',
    branches: '5',
    campusSize: '125+ acres',
  },

  seats: {
    cse: '[[CONFIRM: CSE seats]]',
    aiml: '[[CONFIRM: CSE AI-ML seats]]',
    civil: '[[CONFIRM: Civil seats]]',
    mechanical: '[[CONFIRM: Mechanical seats]]',
    electrical: '[[CONFIRM: Electrical seats]]',
  },

  fees: {
    cse: '[[CONFIRM: annual fee CSE]]',
    aiml: '[[CONFIRM: annual fee CSE AI-ML]]',
    civil: '[[CONFIRM: annual fee Civil]]',
    mechanical: '[[CONFIRM: annual fee Mechanical]]',
    electrical: '[[CONFIRM: annual fee Electrical]]',
  },

  scholarship: {
    band1marks: '[[CONFIRM: slab 1 marks]]',
    band1waiver: '[[CONFIRM: slab 1 waiver]]',
    band2marks: '[[CONFIRM: slab 2 marks]]',
    band2waiver: '[[CONFIRM: slab 2 waiver]]',
    band3marks: '[[CONFIRM: slab 3 marks]]',
    band3waiver: '[[CONFIRM: slab 3 waiver]]',
  },

  /* Bihar Student Credit Card. Terms set by the Government of Bihar. */
  scc: {
    amount: '₹4,00,000',
    interest: '4% simple',
    concession: '1%',
    ageLimit: '25 years',
  },

  dates: {
    open: '[[CONFIRM: application open date]]',
    lastDate: '[[CONFIRM: last date to apply]]',
    counselling: '[[CONFIRM: counselling start date]]',
    verification: '[[CONFIRM: document verification date]]',
    sessionStart: '[[CONFIRM: session start date]]',
  },

  distance: {
    madhubani: '[[CONFIRM: km from Madhubani]]',
    darbhanga: '[[CONFIRM: km from Darbhanga]]',
    muzaffarpur: '[[CONFIRM: km from Muzaffarpur]]',
    patna: '[[CONFIRM: km from Patna]]',
  },

  placement: {
    highest: '12 LPA',
    recruiters: '250+',
    placed: '3,121+',
    student1name: '[[CONFIRM: placed student 1 name]]',
    student1branch: '[[CONFIRM: branch]]',
    student1package: '[[CONFIRM: package]]',
    student1company: '[[CONFIRM: company]]',
    student2name: '[[CONFIRM: placed student 2 name]]',
    student2branch: '[[CONFIRM: branch]]',
    student2package: '[[CONFIRM: package]]',
    student2company: '[[CONFIRM: company]]',
    student3name: '[[CONFIRM: placed student 3 name]]',
    student3branch: '[[CONFIRM: branch]]',
    student3package: '[[CONFIRM: package]]',
    student3company: '[[CONFIRM: company]]',
  },

  /* Quotes are static copy in index.html; only attributions live here. */
  voices: {
    name1: '[[CONFIRM: student name]]',
    year1: '[[CONFIRM: year]]',
    name2: '[[CONFIRM: student name]]',
    year2: '[[CONFIRM: year]]',
  },

  social: {
    facebook: '[[CONFIRM: Facebook URL]]',
    instagram: '[[CONFIRM: Instagram URL]]',
    youtube: '[[CONFIRM: YouTube URL]]',
  },
};

/* A top-level const in a classic script is not a window property. */
if (typeof window !== 'undefined') window.CONTENT = CONTENT;
if (typeof module !== 'undefined') module.exports = CONTENT;
