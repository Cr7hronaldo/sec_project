import type { OfficialService } from '../types/civic';

export const OFFICIAL_SERVICES: OfficialService[] = [
  {
    id: 'nsp-pm-usp-csss',
    docCode: 'NSP-CSSS-2026',
    title: 'PM-USP Central Sector Scheme of Scholarship (College & University)',
    category: 'Scholarships',
    issuingAuthority: 'Ministry of Education, Govt. of India (National Scholarship Portal)',
    officialUrl: 'https://scholarships.gov.in/',
    portalDomain: 'scholarships.gov.in',
    benefitEstimate: '₹12,000 / year (UG) · ₹20,000 / year (PG / 4th–5th Year)',
    deadline: 'Annual NSP cycle (typically Aug – Oct/Nov) · Renewals open online',
    verifiedUpdated: '2026–27 Academic Cycle',
    summary:
      'Merit-cum-means central scholarship for Indian college and university students who scored above the 80th percentile in Class 12 board exams with family income up to ₹4.5 lakh per annum.',
    officialExcerpt:
      'Under the PM-USP Central Sector Scheme of Scholarship for College and University Students, regular full-time undergraduate students in recognized institutions above the 80th percentile of Class XII board streams with gross parental annual income up to ₹4,50,000 are eligible for ₹12,000 p.a. for the first three years and ₹20,000 p.a. at postgraduate or 4th/5th-year professional levels via DBT through NSP.',
    eligibilityRules: [
      {
        ruleId: 'CSSS-R1',
        label: 'Class 12 Merit Percentile (80th+)',
        description:
          'Scored above the 80th percentile of successful candidates in the relevant Class XII State/CBSE/ISC board examination.',
        ruleType: 'student',
        required: true,
      },
      {
        ruleId: 'CSSS-R2',
        label: 'Annual Family Income ≤ ₹4.5 Lakh',
        description:
          'Gross annual parental/family income from all sources does not exceed ₹4,50,000.',
        ruleType: 'income',
        required: true,
      },
      {
        ruleId: 'CSSS-R3',
        label: 'Regular Full-Time Degree & Aadhaar DBT',
        description:
          'Enrolled in a regular (non-correspondence) UG/PG course at an AISHE-registered college with Aadhaar-seeded bank account and OTR.',
        ruleType: 'student',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'csss-doc-1',
        name: 'NSP One Time Registration (OTR) & Aadhaar eKYC',
        acceptedProofs: '14-digit NSP OTR number linked with Aadhaar face/OTP authentication',
        whereToObtain: 'National Scholarship Portal (scholarships.gov.in) & NSP OTR App',
        processingTime: 'Immediate online generation',
      },
      {
        id: 'csss-doc-2',
        name: 'Valid Family Income Certificate',
        acceptedProofs: 'Digitally signed Income Certificate issued by Tehsildar / Revenue Officer / e-District',
        whereToObtain: 'State e-District portal or DigiLocker fetched certificate',
        processingTime: '7–15 working days',
      },
      {
        id: 'csss-doc-3',
        name: 'Class 12 Marksheet & College Bonafide Certificate',
        acceptedProofs: 'Board marksheet (DigiLocker verified) and current year admission/fee receipt',
        whereToObtain: 'DigiLocker / School Board & College Nodal Officer',
        processingTime: 'Immediate on DigiLocker · 1–3 days from college',
      },
      {
        id: 'csss-doc-4',
        name: 'Aadhaar-Seeded Bank Account (NPCI DBT Enabled)',
        acceptedProofs: 'Student bank passbook / NPCI Aadhaar mapper status active',
        whereToObtain: 'Your bank branch or UIDAI Bank Mapper portal',
        processingTime: '2–5 working days for NPCI seeding',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Generate Your NSP One Time Registration (OTR)',
        instruction:
          'Visit scholarships.gov.in, register using your mobile number and Aadhaar, and complete face authentication via the NSP OTR mobile app to lock your permanent student OTR ID.',
        portalActionLabel: 'Open NSP Portal',
        pitfallWarning:
          'Use the student’s own Aadhaar-linked bank account—joint or unseeded accounts fail PFMS DBT payout.',
      },
      {
        stepNumber: 2,
        title: 'Submit PM-USP Application & Upload Bonafide',
        instruction:
          'Log in with your OTR, select PM-USP Central Sector Scheme, enter Class 12 roll number and AISHE institute code, and upload your income certificate.',
        portalActionLabel: 'Apply on NSP',
        pitfallWarning:
          'After final submit, inform your college’s Institute Nodal Officer (INO) immediately; unverified forms expire at deadline.',
      },
    ],
    keywords: ['nsp', 'pm-usp', 'scholarship', 'college', 'degree', 'ug', 'pg', 'class 12', 'tuition', 'merit', 'income'],
  },
  {
    id: 'aicte-pragati-saksham',
    docCode: 'AICTE-TECH-2026',
    title: 'AICTE Pragati (Girls), Saksham & Swanath Technical Scholarships',
    category: 'Scholarships',
    issuingAuthority: 'All India Council for Technical Education (AICTE) via NSP',
    officialUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
    portalDomain: 'aicte-india.org / scholarships.gov.in',
    benefitEstimate: '₹50,000 / year (Lump sum for tuition, books, laptop & fees)',
    deadline: 'Annual NSP Technical Window · Renewable up to 4 years',
    verifiedUpdated: '2026–27 Academic Cycle',
    summary:
      'Dedicated ₹50,000/year support for Indian students admitted to AICTE-approved technical diploma or B.Tech/B.E. courses—covering girl students (Pragati), differently-abled students (Saksham), and orphan/ward students (Swanath).',
    officialExcerpt:
      'AICTE Pragati awards ₹50,000 per annum to up to two girl children per family admitted to the 1st year (or 2nd year lateral entry) of an AICTE-approved Technical Degree or Diploma program with family income not exceeding ₹8,00,000 p.a. Saksham covers students with ≥40% benchmark disability under the same ₹8 lakh income cap.',
    eligibilityRules: [
      {
        ruleId: 'AICTE-R1',
        label: 'AICTE-Approved Technical Degree / Diploma',
        description:
          'Admitted to 1st year or 2nd year (lateral entry) of a technical B.Tech, B.E., B.Pharm, or Polytechnic Diploma.',
        ruleType: 'student',
        required: true,
      },
      {
        ruleId: 'AICTE-R2',
        label: 'Family Income ≤ ₹8.0 Lakh / Year',
        description:
          'Annual family income from all sources is at or below ₹8,00,000.',
        ruleType: 'income',
        required: true,
      },
      {
        ruleId: 'AICTE-R3',
        label: 'Pragati / Saksham / Swanath Category',
        description:
          'Female student (max 2 per family for Pragati), ≥40% disability UDID (Saksham), or eligible orphan/COVID/armed-forces ward (Swanath).',
        ruleType: 'category',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'aicte-doc-1',
        name: 'Class 10 & 12 / ITI Marksheets',
        acceptedProofs: 'Board certificates fetched via DigiLocker or attested copies',
        whereToObtain: 'DigiLocker (digilocker.gov.in)',
        processingTime: 'Immediate',
      },
      {
        id: 'aicte-doc-2',
        name: 'Parental Income Certificate (≤ ₹8 Lakh)',
        acceptedProofs: 'Official state revenue income certificate for current financial year',
        whereToObtain: 'State e-District / Tehsildar office',
        processingTime: '7–15 days',
      },
      {
        id: 'aicte-doc-3',
        name: 'Admission Allotment Letter & Tuition Fee Receipt',
        acceptedProofs: 'JoSAA / State CET / Counselling allotment letter & college fee receipt',
        whereToObtain: 'College admission office or counselling portal',
        processingTime: 'Immediate',
      },
      {
        id: 'aicte-doc-4',
        name: 'Category / Disability / Swanath Certificate (If Applicable)',
        acceptedProofs: 'UDID card (≥40% for Saksham) or death certificate/parental status proof for Swanath',
        whereToObtain: 'swavlambancard.gov.in or District Magistrate office',
        processingTime: '7–21 days',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Verify Your Institute’s AICTE Approval & AISHE Code',
        instruction:
          'Confirm on aicte-india.org and scholarships.gov.in that your engineering college or polytechnic has active AICTE approval for your admission batch.',
        portalActionLabel: 'Check AICTE Schemes',
        pitfallWarning:
          'Do not apply under general university schemes if your course is AICTE-approved; Pragati offers ₹50,000/yr instead of ₹12,000/yr.',
      },
      {
        stepNumber: 2,
        title: 'Apply Through NSP Under AICTE Schemes',
        instruction:
          'Log into scholarships.gov.in using your OTR, select Pragati/Saksham/Swanath, upload your bonafide + income proof, and verify via your Institute Nodal Officer.',
        portalActionLabel: 'Open NSP Application',
        pitfallWarning:
          'Pragati requires the declaration that no more than two girl children from the family are claiming the award.',
      },
    ],
    keywords: ['btech', 'engineering', 'polytechnic', 'diploma', 'girl', 'female', 'aicte', 'pragati', 'saksham', 'disability', 'technical'],
  },
  {
    id: 'nsp-post-matric',
    docCode: 'NSP-PMS-2026',
    title: 'Post-Matric Scholarship (SC / ST / OBC / EBC / Minority Students)',
    category: 'Scholarships',
    issuingAuthority: 'Ministries of Social Justice, Tribal Affairs & Minority Affairs (NSP / State Portals)',
    officialUrl: 'https://scholarships.gov.in/',
    portalDomain: 'scholarships.gov.in',
    benefitEstimate: 'Full compulsory tuition fee reimbursement + ₹2,300–₹13,500/yr maintenance',
    deadline: 'Central & State Portals · Typically Oct – Jan cycles',
    verifiedUpdated: '2026–27 Academic Cycle',
    summary:
      'Compulsory non-refundable tuition fee waiver plus monthly hostel/day-scholar maintenance allowance for Class 11, Class 12, UG, PG, medical, and vocational Indian students from SC, ST, OBC, EBC, DNT, or notified Minority categories.',
    officialExcerpt:
      'Post-Matric Scholarship schemes reimburse compulsory non-refundable tuition and exam fees directly to the student’s Aadhaar-linked bank account (or split institution/student DBT) along with academic allowance for hostellers and day scholars whose parental annual income is within ₹2.5 lakh (SC/ST/Minority) or ₹2.5 lakh (OBC/EBC).',
    eligibilityRules: [
      {
        ruleId: 'PMS-R1',
        label: 'Category & Domicile Eligibility',
        description:
          'Valid SC, ST, OBC, EBC, DNT, or notified Minority community certificate from your home state.',
        ruleType: 'category',
        required: true,
      },
      {
        ruleId: 'PMS-R2',
        label: 'Annual Family Income ≤ ₹2.5 Lakh',
        description:
          'Parental/guardian annual income within ₹2,50,000 (may vary slightly by state OBC/EBC top-up portals).',
        ruleType: 'income',
        required: true,
      },
      {
        ruleId: 'PMS-R3',
        label: 'Post-Class 10 Enrollment',
        description:
          'Studying in Class 11–12, ITI, Diploma, BA/BSc/BCom, MBBS, BTech, or PhD in a recognized institution.',
        ruleType: 'student',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'pms-doc-1',
        name: 'Caste / Community Certificate',
        acceptedProofs: 'Digitally signed Caste/Minority declaration or e-District certificate',
        whereToObtain: 'State e-District / Tehsil portal or DigiLocker',
        processingTime: '7–15 days',
      },
      {
        id: 'pms-doc-2',
        name: 'Parental Income Certificate (≤ ₹2.5 Lakh)',
        acceptedProofs: 'Current financial year income certificate signed by competent authority',
        whereToObtain: 'State Revenue / e-District portal',
        processingTime: '7–15 days',
      },
      {
        id: 'pms-doc-3',
        name: 'Fee Structure Receipt & Hostel Certificate (If Hosteller)',
        acceptedProofs: 'College tuition receipt + warden-signed hostel residency proof',
        whereToObtain: 'College accounts & hostel office',
        processingTime: '1–3 days',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Check Whether Your State Uses NSP or a Dedicated State Portal',
        instruction:
          'Some states (e.g., UP Scholarship, MahaDBT, SSP Karnataka, Post-Matric Bihar/MP/Rajasthan) run state portals while Central/UT & Minority schemes run on scholarships.gov.in.',
        portalActionLabel: 'Check NSP & State Links',
        pitfallWarning:
          'Never submit duplicate applications on both State and NSP portals for the same academic year; de-duplication automatically rejects both.',
      },
      {
        stepNumber: 2,
        title: 'Link Aadhaar NPCI Seeding & Submit Before Institute Cut-off',
        instruction:
          'Upload caste, income, and fee receipts, then submit the printout/online verification to your college scholarship desk.',
        portalActionLabel: 'Open NSP Login',
        pitfallWarning:
          'Ensure at least 75% attendance where mandated by scheme guidelines for renewal.',
      },
    ],
    keywords: ['sc', 'st', 'obc', 'ebc', 'minority', 'post matric', 'post-matric', 'tuition', 'hostel', 'fee waiver', 'caste'],
  },
  {
    id: 'vidyalakshmi-csis',
    docCode: 'VLX-CSIS-2026',
    title: 'PM-Vidyalaxmi & Vidya Lakshmi Education Loan + Interest Subsidy (CSIS)',
    category: 'Scholarships',
    issuingAuthority: 'Department of Higher Education & Ministry of Finance, Govt. of India',
    officialUrl: 'https://www.vidyalakshmi.co.in/',
    portalDomain: 'vidyalakshmi.co.in / pmvidyalaxmi.co.in',
    benefitEstimate: 'Collateral-free loans + 100% / 3% interest subsidy during study moratorium',
    deadline: 'Open year-round for admissions · Apply before first loan disbursement',
    verifiedUpdated: '2026–27 Academic Cycle',
    summary:
      'Single-window government portal connecting Indian students to multiple public & private banks for education loans—paired with 100% interest subsidy during study + 1 year moratorium (CSIS) for family income ≤ ₹4.5L, or 3% subvention up to ₹8L under PM-Vidyalaxmi.',
    officialExcerpt:
      'Under PM-Vidyalaxmi and the PM-USP Central Sector Interest Subsidy (CSIS) scheme, students admitted to Quality Higher Education Institutions (QHEIs) or accredited technical/professional courses with family income up to ₹4.5 lakh receive full interest subsidy during the moratorium period, and up to ₹8 lakh receive 3% interest subvention on loans up to ₹10 lakh.',
    eligibilityRules: [
      {
        ruleId: 'VLX-R1',
        label: 'Admitted to Recognized Higher Education Course',
        description:
          'Confirmed admission via merit/entrance test in a recognized Indian university, IIT/NIT/IIM, medical, or professional institute.',
        ruleType: 'student',
        required: true,
      },
      {
        ruleId: 'VLX-R2',
        label: 'Income Threshold for Interest Subsidy',
        description:
          'Family income ≤ ₹4.5 lakh (100% CSIS moratorium subsidy) or ≤ ₹8 lakh (3% PM-Vidyalaxmi interest subvention).',
        ruleType: 'income',
        required: false,
      },
    ],
    requiredDocuments: [
      {
        id: 'vlx-doc-1',
        name: 'Institute Admission Letter & Fee Schedule',
        acceptedProofs: 'Official admission offer + semester-wise tuition/hostel fee breakdown',
        whereToObtain: 'University / College admissions office',
        processingTime: 'Immediate',
      },
      {
        id: 'vlx-doc-2',
        name: 'Parental Income Certificate & KYC',
        acceptedProofs: 'Tehsildar/Revenue Income Certificate + student & co-borrower Aadhaar/PAN',
        whereToObtain: 'State e-District & UIDAI/Income Tax portal',
        processingTime: '7–15 days',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Fill the Common Education Loan Application Form (CELAF)',
        instruction:
          'Register on vidyalakshmi.co.in (or pmvidyalaxmi.co.in for QHEI institutions), complete CELAF once, and apply to up to 3 banks simultaneously.',
        portalActionLabel: 'Open Vidya Lakshmi Portal',
        pitfallWarning:
          'Always attach your official e-District Income Certificate at loan sanction time so your bank tags your loan for CSIS/PM-Vidyalaxmi interest subsidy.',
      },
      {
        stepNumber: 2,
        title: 'Track Bank Sanction & Interest Subsidy Claim',
        instruction:
          'Track sanction status online and confirm with your lending bank branch that CSIS subsidy is claimed annually via Canara Bank (nodal bank).',
        portalActionLabel: 'Track Loan Status',
        pitfallWarning:
          'Loans up to ₹7.5 lakh require zero collateral and zero third-party guarantee under IBA Model Scheme.',
      },
    ],
    keywords: ['education loan', 'loan', 'vidyalaxmi', 'vidya lakshmi', 'interest subsidy', 'csis', 'fees', 'iit', 'nit', 'mbbs', 'college'],
  },
  {
    id: 'nfsa-onorc-food',
    docCode: 'NFSA-ONORC-2026',
    title: 'NFSA One Nation One Ration Card (Subsidized Food Grains Anywhere in India)',
    category: 'Benefits & Food',
    issuingAuthority: 'Department of Food & Public Distribution, Govt. of India',
    officialUrl: 'https://nfsa.gov.in/',
    portalDomain: 'nfsa.gov.in',
    benefitEstimate: 'Free / subsidized wheat, rice & coarse grains (5 kg–35 kg/month per family/member)',
    deadline: 'Open year-round · Instant biometric portability across all states/UTs',
    verifiedUpdated: '2026 Policy Cycle',
    summary:
      'Allows students studying away from home in another city or state to draw their individual quota of NFSA ration grains at any local Fair Price Shop (FPS) using Aadhaar biometric authentication, without cancelling their family’s home ration card.',
    officialExcerpt:
      'Under the One Nation One Ration Card (ONORC) framework of the National Food Security Act, Priority Household (PHH) and Antyodaya Anna Yojana (AAY) beneficiaries—including students and migrant youth living away from their home state—can lift their entitled monthly quota of food grains from any electronic Point of Sale (e-PoS) enabled Fair Price Shop nationwide using Aadhaar authentication.',
    eligibilityRules: [
      {
        ruleId: 'NFSA-R1',
        label: 'Listed on Family PHH / AAY Ration Card',
        description:
          'Student’s name and Aadhaar are seeded on a valid state Priority Household or Antyodaya Ration Card.',
        ruleType: 'food',
        required: true,
      },
      {
        ruleId: 'NFSA-R2',
        label: 'Aadhaar Seeding & Biometric Verification',
        description:
          'Aadhaar number linked with the ration card database for e-PoS fingerprint/OTP authentication.',
        ruleType: 'certificate',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'nfsa-doc-1',
        name: 'Family Ration Card Number or Digital Ration Card',
        acceptedProofs: '12-digit Ration Card number or DigiLocker/Mera Ration 2.0 digital card',
        whereToObtain: 'State PDS portal, DigiLocker, or Mera Ration 2.0 app',
        processingTime: 'Immediate lookup',
      },
      {
        id: 'nfsa-doc-2',
        name: 'Student Aadhaar Card',
        acceptedProofs: 'Original Aadhaar or e-Aadhaar linked to the ration card',
        whereToObtain: 'UIDAI (myaadhaar.uidai.gov.in) or DigiLocker',
        processingTime: 'Immediate',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Check Aadhaar Seeding & Nearest Ration Shop via NFSA / Mera Ration',
        instruction:
          'Verify on nfsa.gov.in or the Mera Ration 2.0 app that your Aadhaar is seeded on your family ration card and locate the nearest Fair Price Shop near your hostel or PG.',
        portalActionLabel: 'Open NFSA Portal',
        pitfallWarning:
          'You do NOT need a new ration card in your college city; ONORC lets you draw your personal share while your family draws theirs back home.',
      },
      {
        stepNumber: 2,
        title: 'Collect Monthly Quota with Biometric Auth',
        instruction:
          'Visit the local e-PoS Fair Price Shop with your Aadhaar/ration number and authenticate via thumbprint to receive your monthly grain quota.',
        portalActionLabel: 'Find Nearby FPS',
        pitfallWarning:
          'If Aadhaar is not yet seeded to the ration card, ask your home state Food & Civil Supplies office or e-Mitra/CSC to link it first.',
      },
    ],
    keywords: ['food', 'ration', 'grains', 'rice', 'wheat', 'nfsa', 'onorc', 'hostel', 'pg', 'migrant student', 'groceries', 'mess'],
  },
  {
    id: 'myscheme-student-welfare',
    docCode: 'MYS-WELFARE-2026',
    title: 'myScheme Central & State Student Hostel, Mess & Stipend Finder',
    category: 'Benefits & Food',
    issuingAuthority: 'National e-Governance Division (NeGD), MeitY, Govt. of India',
    officialUrl: 'https://www.myscheme.gov.in/',
    portalDomain: 'myscheme.gov.in',
    benefitEstimate: '₹1,000–₹3,500/month hostel/mess stipends, free books & travel passes (varies by state)',
    deadline: 'Varies by state scheme · Open continuously',
    verifiedUpdated: '2026 Policy Cycle',
    summary:
      'Official Government of India eligibility discovery portal matching Indian students by state, caste/EWS category, age, and income to state hostel food allowances, Dr. Ambedkar/State Hostel schemes, free laptop/tablet programs, and student bus/rail concessions.',
    officialExcerpt:
      'myScheme is a National Platform that aims to offer one-stop search and discovery of Government schemes across Central and State ministries, enabling students to filter verified welfare, hostel mess subsidy, book bank, and social security schemes based on domicile state, age, income, and academic level.',
    eligibilityRules: [
      {
        ruleId: 'MYS-R1',
        label: 'State Domicile & Academic Level',
        description:
          'Eligibility for state hostel mess subsidies and book grants depends on your state of domicile and current course.',
        ruleType: 'residency',
        required: true,
      },
      {
        ruleId: 'MYS-R2',
        label: 'Income / Category Match',
        description:
          'Most state food/hostel allowances cover SC/ST/OBC/EWS/BPL students studying away from home.',
        ruleType: 'income',
        required: false,
      },
    ],
    requiredDocuments: [
      {
        id: 'mys-doc-1',
        name: 'Domicile / Residence Certificate',
        acceptedProofs: 'State e-District Domicile Certificate',
        whereToObtain: 'State e-District or DigiLocker',
        processingTime: '7–15 days',
      },
      {
        id: 'mys-doc-2',
        name: 'College ID / Hostel Allotment Letter',
        acceptedProofs: 'Valid student ID card or hostel mess enrollment proof',
        whereToObtain: 'College / University hostel office',
        processingTime: '1–2 days',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Run the 3-Minute Eligibility Check on myScheme.gov.in',
        instruction:
          'Open myscheme.gov.in, select "Education & Learning" and "Social Welfare", enter your state, category, and income bracket to list state-specific hostel mess and stipend portals.',
        portalActionLabel: 'Open myScheme Portal',
        pitfallWarning:
          'Always click the "Apply" redirect inside myScheme to reach your authentic State Welfare department portal.',
      },
    ],
    keywords: ['hostel', 'mess', 'food', 'stipend', 'state scheme', 'myscheme', 'books', 'allowance', 'ews', 'bpl'],
  },
  {
    id: 'digilocker-edistrict-certs',
    docCode: 'DLK-CERT-2026',
    title: 'DigiLocker & State e-District (Income, Caste, Domicile & Marksheets)',
    category: 'Certificates & ID',
    issuingAuthority: 'Ministry of Electronics & IT (MeitY) & State e-District Portals',
    officialUrl: 'https://www.digilocker.gov.in/',
    portalDomain: 'digilocker.gov.in / services.india.gov.in',
    benefitEstimate: 'Legally valid digital certificates (₹0–₹30 nominal e-District fee)',
    deadline: 'Available 24×7 · Required for all NSP, JEE/NEET, & State Scholarships',
    verifiedUpdated: '2026 Policy Cycle',
    summary:
      'Official platform to fetch legally valid digital Class 10/12 marksheets, Aadhaar, PAN, and state-issued Income, Caste, EWS, Birth, and Domicile certificates accepted directly by Indian universities and scholarship portals.',
    officialExcerpt:
      'Under Rule 9A of the Information Technology (Preservation and Retention of Information by Intermediaries Providing Digital Locker Facilities) Rules, electronic certificates issued or fetched in DigiLocker are at par with original physical documents for college admissions, scholarship verification, and employment.',
    eligibilityRules: [
      {
        ruleId: 'DLK-R1',
        label: 'Aadhaar & Mobile Linked Account',
        description:
          'Any Indian resident or student with Aadhaar and mobile number can activate DigiLocker immediately.',
        ruleType: 'certificate',
        required: true,
      },
      {
        ruleId: 'DLK-R2',
        label: 'e-District Issuance (For Fresh Income/Caste/Domicile)',
        description:
          'If you do not yet have an Income, Caste, EWS, or Domicile certificate, apply via your state e-District / CSC portal first, then pull it into DigiLocker.',
        ruleType: 'certificate',
        required: false,
      },
    ],
    requiredDocuments: [
      {
        id: 'dlk-doc-1',
        name: 'Aadhaar Number & Registered Mobile OTP',
        acceptedProofs: '12-digit Aadhaar linked to active mobile number',
        whereToObtain: 'UIDAI / nearest Aadhaar Seva Kendra if mobile update needed',
        processingTime: 'Immediate if linked · 3–7 days for mobile update',
      },
      {
        id: 'dlk-doc-2',
        name: 'Self-Declaration & Residence/Salary Proof (For Fresh e-District Certs)',
        acceptedProofs: 'Ration card/electricity bill + parent salary slip or Tehsil patwari report',
        whereToObtain: 'services.india.gov.in (locate your State e-District) or local CSC',
        processingTime: '7–15 working days',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Sign Into DigiLocker & Pull Board Marksheets',
        instruction:
          'Visit digilocker.gov.in, sign in with Aadhaar/mobile, and search "CBSE / State Board" and your State Revenue Department to pull digital marksheets and certificates.',
        portalActionLabel: 'Open DigiLocker',
        pitfallWarning:
          'Ensure the spelling of your name and Date of Birth in Aadhaar matches your Class 10 marksheet before applying for scholarships.',
      },
      {
        stepNumber: 2,
        title: 'Apply for Fresh Income / Caste / Domicile via State e-District',
        instruction:
          'If you need a new Income (valid 1 year in most states) or Caste/EWS certificate, visit services.india.gov.in to open your state e-District portal or visit a nearby Common Service Centre (CSC).',
        portalActionLabel: 'Find State e-District',
        pitfallWarning:
          'Income certificates expire every financial year or 6–12 months depending on state rules—renew before NSP opens.',
      },
    ],
    keywords: ['certificate', 'income certificate', 'caste certificate', 'domicile', 'ews', 'birth certificate', 'marksheet', 'digilocker', 'lost documents', 'edistrict'],
  },
  {
    id: 'abc-apaar-id',
    docCode: 'ABC-APAAR-2026',
    title: 'Academic Bank of Credits (ABC ID) & APAAR Student ID',
    category: 'Certificates & ID',
    issuingAuthority: 'University Grants Commission (UGC) & Ministry of Education',
    officialUrl: 'https://www.abc.gov.in/',
    portalDomain: 'abc.gov.in / digilocker.gov.in',
    benefitEstimate: 'Mandatory ₹0 digital academic credit & verification ID',
    deadline: 'Required immediately for college exams, degree verification & NSP',
    verifiedUpdated: '2026–27 Academic Cycle',
    summary:
      'Mandatory 12-digit permanent digital student ID under NEP 2020 used by Indian universities, CUET/admission portals, and scholarship verification desks to store credits and prevent document delays.',
    officialExcerpt:
      'The Academic Bank of Credits (ABC) and APAAR (Automated Permanent Academic Account Registry) assign each student a unique 12-digit ID linked via DigiLocker, enabling seamless credit transfer across HEIs and instant academic verification for scholarships and employers.',
    eligibilityRules: [
      {
        ruleId: 'ABC-R1',
        label: 'Enrolled or Entering Indian Higher Education',
        description:
          'Any student enrolled in or applying to a UGC/AICTE-recognized college, university, or skill institution.',
        ruleType: 'student',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'abc-doc-1',
        name: 'DigiLocker Account & University Roll/Admission Number',
        acceptedProofs: 'Active DigiLocker login + college admission or enrolment number',
        whereToObtain: 'digilocker.gov.in & college admission desk',
        processingTime: 'Instant online generation',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Generate Your 12-Digit ABC / APAAR ID via DigiLocker',
        instruction:
          'Log into digilocker.gov.in (or abc.gov.in), search "Academic Bank of Credits", select your university/institution name, enter your admission year and roll number, and download your ABC ID card.',
        portalActionLabel: 'Open ABC Portal',
        pitfallWarning:
          'Submit your 12-digit ABC ID to your college exam cell so semester marksheets auto-sync to DigiLocker.',
      },
    ],
    keywords: ['abc id', 'apaar', 'college id', 'credits', 'exam form', 'marksheet', 'ugc', 'certificate'],
  },
  {
    id: 'ayushman-pmjay',
    docCode: 'AB-PMJAY-2026',
    title: 'Ayushman Bharat PM-JAY (₹5 Lakh Cashless Health Cover)',
    category: 'Healthcare',
    issuingAuthority: 'National Health Authority (NHA), Ministry of Health & Family Welfare',
    officialUrl: 'https://beneficiary.nha.gov.in/',
    portalDomain: 'beneficiary.nha.gov.in / pmjay.gov.in',
    benefitEstimate: '₹5,00,000 / family / year cashless hospitalization across India',
    deadline: 'Open year-round · Instant e-KYC Ayushman Card download',
    verifiedUpdated: '2026 Policy Cycle',
    summary:
      'Free cashless secondary and tertiary hospital care up to ₹5 lakh per family per year at empanelled public and private hospitals across India—covering students and families listed under SECC, NFSA Ration Card (in participating states), or senior citizen (70+) Vaya Vandana criteria.',
    officialExcerpt:
      'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) provides health assurance cover of ₹5 lakh per eligible family per year across more than 29,000 empanelled hospitals nationwide with zero restriction on family size, age, or pre-existing medical conditions.',
    eligibilityRules: [
      {
        ruleId: 'PMJAY-R1',
        label: 'SECC / State Ration / Senior Citizen Eligibility',
        description:
          'Family appears in SECC 2011 database, holds an eligible state PHH/AAY ration card (in expanded states), or covers senior family members aged 70+.',
        ruleType: 'healthcare',
        required: true,
      },
      {
        ruleId: 'PMJAY-R2',
        label: 'Aadhaar e-KYC Verification',
        description:
          'Individual family members complete Aadhaar OTP/biometric eKYC to activate their Ayushman Card.',
        ruleType: 'certificate',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'pmjay-doc-1',
        name: 'Aadhaar Card & Mobile Number',
        acceptedProofs: 'Aadhaar number for OTP or biometric e-KYC',
        whereToObtain: 'UIDAI / CSC / Ayushman Kendra',
        processingTime: 'Immediate online check',
      },
      {
        id: 'pmjay-doc-2',
        name: 'Family Ration Card / PM-JAY Family ID',
        acceptedProofs: 'State Ration Card or PM-JAY family search ID',
        whereToObtain: 'beneficiary.nha.gov.in',
        processingTime: 'Immediate search',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Check Eligibility & Download Ayushman Card Online',
        instruction:
          'Visit beneficiary.nha.gov.in, log in with your mobile OTP, search by State + Aadhaar / Ration Card / Name, and complete eKYC to download your Ayushman Card.',
        portalActionLabel: 'Check PM-JAY Eligibility',
        pitfallWarning:
          'PM-JAY covers hospitalization (in-patient procedures and 3-day pre / 15-day post hospitalization medicines), not standalone OPD visits.',
      },
      {
        stepNumber: 2,
        title: 'Locate Empanelled Hospitals Anywhere You Study',
        instruction:
          'Because PM-JAY is nationally portable, students studying in another city can search empanelled hospitals at hospitals.pmjay.gov.in and present their Ayushman Card at the Ayushman Mitra desk.',
        portalActionLabel: 'Find Empanelled Hospitals',
        pitfallWarning:
          'Never pay cash deposits at an empanelled hospital before speaking to the Ayushman Mitra coordinator.',
      },
    ],
    keywords: ['health', 'hospital', 'medical', 'insurance', 'ayushman', 'pmjay', 'pm-jay', 'treatment', 'doctor', 'illness', 'parents'],
  },
  {
    id: 'pm-internship-scheme',
    docCode: 'MCA-PMI-2026',
    title: 'PM Internship Scheme (₹5,000/Month Stipend in Top Companies)',
    category: 'Employment & Aid',
    issuingAuthority: 'Ministry of Corporate Affairs (MCA), Govt. of India',
    officialUrl: 'https://pminternship.mca.gov.in/',
    portalDomain: 'pminternship.mca.gov.in',
    benefitEstimate: '₹5,000 / month (12 months) + ₹6,000 joining grant + insurance',
    deadline: 'Cohort rounds open periodically · Apply online via MCA portal',
    verifiedUpdated: '2026–27 Cycle',
    summary:
      'Paid 12-month real-world corporate internships across India’s top 500 companies for Indian youth aged 21–24 who have completed Class 10, 12, ITI, Polytechnic Diploma, or UG degree and are not currently in full-time employment or full-time study.',
    officialExcerpt:
      'Under the Prime Minister’s Internship Scheme administered by the Ministry of Corporate Affairs, eligible Indian youth aged 21 to 24 years with family income not exceeding ₹8 lakh per annum and not enrolled in full-time education/employment receive 12-month internship placements with ₹5,000 monthly assistance (₹4,500 DBT from Govt. + ₹500 from company) and a ₹6,000 one-time grant.',
    eligibilityRules: [
      {
        ruleId: 'PMI-R1',
        label: 'Age 21–24 Years & Not Full-Time Employed/Enrolled',
        description:
          'Indian citizen aged 21–24; graduates or ITI/Diploma holders not currently in full-time regular employment or full-time campus degree (online/distance learners are eligible).',
        ruleType: 'employment',
        required: true,
      },
      {
        ruleId: 'PMI-R2',
        label: 'Family Income ≤ ₹8 Lakh & No Govt. Job in Family',
        description:
          'No family member earns over ₹8 lakh/year and no parent/spouse is a permanent government employee.',
        ruleType: 'income',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'pmi-doc-1',
        name: 'Aadhaar Card & Aadhaar-Linked Bank Account',
        acceptedProofs: 'Aadhaar eKYC + active NPCI DBT bank account',
        whereToObtain: 'UIDAI / DigiLocker / Bank',
        processingTime: 'Immediate',
      },
      {
        id: 'pmi-doc-2',
        name: 'Highest Educational Qualification Certificate',
        acceptedProofs: 'Class 10/12, ITI, Polytechnic Diploma, or BA/BSc/BCom/BBA/BCA/BPharma marksheet',
        whereToObtain: 'DigiLocker or University',
        processingTime: 'Immediate',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Register Profile & Build Resume on PM Internship Portal',
        instruction:
          'Visit pminternship.mca.gov.in, verify Aadhaar eKYC, enter your qualifications and preferred districts/sectors, and generate your portal resume.',
        portalActionLabel: 'Open PM Internship Portal',
        pitfallWarning:
          'Full-time regular college students are excluded, whereas distance/online learners and recent graduates aged 21–24 qualify.',
      },
      {
        stepNumber: 2,
        title: 'Apply to Up to 3–5 Opportunities Per Round',
        instruction:
          'Filter internships by city, state, or sector (IT, Finance, Manufacturing, Healthcare, Retail) and submit preferences before the cohort cutoff.',
        portalActionLabel: 'Browse Internships',
        pitfallWarning:
          'Check portal alerts regularly; shortlist offers require acceptance within the specified window.',
      },
    ],
    keywords: ['internship', 'pm internship', 'stipend', 'graduate', 'diploma', 'iti', 'job', 'experience', 'company', 'career', 'employment'],
  },
  {
    id: 'ncs-skill-india',
    docCode: 'NCS-SIDH-2026',
    title: 'National Career Service (NCS) & Skill India Digital Hub (PMKVY)',
    category: 'Employment & Aid',
    issuingAuthority: 'Ministry of Labour & Employment / Ministry of Skill Development (MSDE)',
    officialUrl: 'https://www.ncs.gov.in/',
    portalDomain: 'ncs.gov.in / skillindiadigital.gov.in',
    benefitEstimate: 'Free government job matching, career counselling & certified skill courses',
    deadline: 'Open 365 days a year · Free registration',
    verifiedUpdated: '2026 Policy Cycle',
    summary:
      'Free official employment exchange, verified private & PSU job listings, resume builder, and Skill India Digital Hub (PMKVY) short-term industry certifications with placement support for Indian students and fresh graduates.',
    officialExcerpt:
      'The National Career Service (NCS) portal provides free job-matching, career counseling, and vocational guidance for Indian youth, integrated with Skill India Digital Hub (SIDH) and Pradhan Mantri Kaushal Vikas Yojana (PMKVY) 4.0 offering NSQF-certified free short-term training and apprenticeship connections.',
    eligibilityRules: [
      {
        ruleId: 'NCS-R1',
        label: 'Indian Student / Job Seeker',
        description:
          'Any Indian youth (typically 15–45 years) seeking part-time/full-time employment, apprenticeships, or free certified skill training.',
        ruleType: 'employment',
        required: true,
      },
    ],
    requiredDocuments: [
      {
        id: 'ncs-doc-1',
        name: 'Aadhaar / UAN / PAN & Academic Details',
        acceptedProofs: 'Aadhaar number or e-Shram / PAN ID + highest passed exam details',
        whereToObtain: 'UIDAI / DigiLocker',
        processingTime: 'Immediate',
      },
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: 'Create a Verified Jobseeker ID on NCS.gov.in',
        instruction:
          'Register on ncs.gov.in as a Jobseeker, build your CV, and filter verified openings by state, qualification, and fresher status.',
        portalActionLabel: 'Open NCS Portal',
        pitfallWarning:
          'Legitimate government employment exchanges and NCS job fairs never charge registration or interview fees.',
      },
      {
        stepNumber: 2,
        title: 'Enroll in Free PMKVY / Skill Courses on Skill India Digital Hub',
        instruction:
          'Visit skillindiadigital.gov.in with the same mobile/Aadhaar to join free online or nearby centre-based skill programs in IT, electronics, healthcare, or logistics.',
        portalActionLabel: 'Open Skill India Digital',
        pitfallWarning:
          'Verify the training centre is active on SIDH before attending in-person batches.',
      },
    ],
    keywords: ['job', 'jobs', 'employment', 'career', 'ncs', 'skill india', 'pmkvy', 'training', 'fresher', 'part time', 'placement', 'unemployed'],
  },
];
