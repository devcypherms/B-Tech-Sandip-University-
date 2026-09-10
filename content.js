const CONTENT = {

  FORM_ENDPOINT: '',

  org: {

    phone: '1800-313-2714',

    email: 'info.sijoul@sandipuniversity.edu.in',

    addressLine1: 'Neelam Vidya Vihar, Village Sijoul',
    addressVisible: 'Village Sijoul, P.O. Mailam',
    addressLine2: 'Madhubani, Bihar 847235',
    lat: '26.3506102',
    lng: '86.2405787',
  },

  site: {
    canonical: 'https://b-tech-sandip-university.vercel.app/',
  },

  links: {
    enquiry: 'https://sijoul.sandipuniversity.edu.in/admission.php',
    facebook: 'https://www.facebook.com/SandipUnivsijoul',
    instagram: 'https://www.instagram.com/sandipunivsijoul',
    youtube: 'https://www.youtube.com/@SandipUnivsijoul',
  },

  hero: {
    duration: '4 Years',
    eligibility: '10+2 with PCM',
    branches: '5',
  },

  fees: {
    mechanical: '₹90,000',
    cse: '₹1,05,000',
    aiml: '₹1,25,000',
  },

  eligibility: {
    setPercent: '45% in 10+2 and 45% in PCM',
    csePercent: '50% in 10+2 and 45% in PCM',
    lateral: '3-year Diploma with at least 50%',
  },

  seats: {
    civil: '60',
    electrical: '60',
    mechanical: '60',
    cse: '120',
    aiml: '60',
  },

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

  stats: {
    campus: '125+',
    faculty: '250+',
    students: '4,000+',
    programmes: '20+',
    partners: '100+',
  },

  scholarship: {
    band1marks: '85% and above',
    band2marks: '80% to 84.99%',
    band3marks: '75% to 79.99%',
    sportsShare: '2% of total intake',
  },

  scc: {
    amount: '₹4,00,000',
    interest: 'Nil. The revised state scheme is interest-free for every applicant.',
    repayment: 'Repayment starts a year after the course ends: up to 84 monthly instalments, and up to 120 on a loan above ₹2,00,000.',
    collateral: 'No property or deposit is pledged. A parent, spouse or guardian signs as co-applicant.',
    ageLimit: '25 years on the date of application.',
    documents: 'Aadhaar for you and your co-applicant, your marksheets and certificates, a bank passbook showing IFSC, the admission letter and fee statement from the university, address proof and two photographs each. Nothing is uploaded online — you carry the originals to the DRCC.',
  },

  dates: {
    lastDate: '30 September 2026',
    open: '1 June 2026',
    verification: 'Within 7 days of applying',
    counselling: 'Rolling, from June 2026',
    feePayment: 'Within 10 days of branch allotment',
    sessionStart: '15 October 2026',
  },

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

  placement: {

    student1name: 'Mayashankar Kumar',
    student1branch: 'B.Tech',
    student1company: 'Bharat Dynamics Limited',
    student1package: '12 LPA',

    student2name: 'Krishna Kumar',
    student2branch: 'B.Tech',
    student2company: 'Icertis, Pune',
    student2package: '7 LPA',

    student3name: 'Abhay Kumar Tibrewal',
    student3branch: 'B.Tech',
    student3company: 'Infosys',
    student3package: '5 LPA',
  },

  placementList: {
    url: 'https://sijoul.sandipuniversity.edu.in/studen-placement-list.php',
    named: '16',
    rangeHigh: '12',
    civil: '5',
    electrical: '6',
  },

  analytics: {
    container: 'GTM-PJSFVGTZ',
  },
};

if (typeof window !== 'undefined') window.CONTENT = CONTENT;
if (typeof module !== 'undefined') module.exports = CONTENT;
