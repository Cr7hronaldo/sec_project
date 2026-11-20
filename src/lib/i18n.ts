export interface GuideUiLabels {
  estimatedBenefit: string;
  filingWindow: string;
  translateLabel: string;
  listenAloud: string;
  preparingAudio: string;
  stopAudio: string;
  viewOfficialSource: string;
  tabEligibility: string;
  tabChecklist: string;
  tabGuide: string;
  whyMatches: string;
  officialCriteria: string;
  groundedCitation: string;
  documentReadiness: string;
  acceptedProof: string;
  whereToObtain: string;
  officialFilingPortal: string;
  officialPortalDesc: string;
  openOfficialPortal: string;
  avoidMistake: string;
  askQuestionTitle: string;
  askOfficialGuide: string;
  checkingRecord: string;
  nextStep: string;
  stepPrefix: string;
  isRtl: boolean;
}

const EN_LABELS: GuideUiLabels = {
  estimatedBenefit: 'Estimated Benefit',
  filingWindow: 'Application Window',
  translateLabel: 'Translate guide:',
  listenAloud: 'Listen Aloud',
  preparingAudio: 'Preparing Audio...',
  stopAudio: 'Stop Audio',
  viewOfficialSource: 'View Official Source',
  tabEligibility: '01. Eligibility Rules',
  tabChecklist: '02. Document Checklist',
  tabGuide: '03. Official Application Guide',
  whyMatches: 'Why this matches your situation',
  officialCriteria: 'Official Eligibility Criteria',
  groundedCitation: 'Grounded Citation',
  documentReadiness: 'Document Readiness',
  acceptedProof: 'Accepted proof:',
  whereToObtain: 'Where to obtain:',
  officialFilingPortal: 'Official Government Portal',
  officialPortalDesc:
    'Always apply directly through the official Indian government portal below—never pay private agents or lookalike websites.',
  openOfficialPortal: 'Open Official Portal',
  avoidMistake: 'Avoid common mistake:',
  askQuestionTitle: 'Ask a question about this scheme',
  askOfficialGuide: 'Ask Official Guide',
  checkingRecord: 'Checking Record...',
  nextStep: 'Next step:',
  stepPrefix: 'STEP',
  isRtl: false,
};

const LABELS_BY_LANGUAGE: Record<string, GuideUiLabels> = {
  English: EN_LABELS,
  Hindi: {
    estimatedBenefit: 'अनुमानित सहायता',
    filingWindow: 'आवेदन अवधि',
    translateLabel: 'गाइड अनुवाद करें:',
    listenAloud: 'सुनें (ऑडियो)',
    preparingAudio: 'ऑडियो तैयार हो रहा है...',
    stopAudio: 'ऑडियो रोकें',
    viewOfficialSource: 'आधिकारिक स्रोत देखें',
    tabEligibility: '01. पात्रता नियम',
    tabChecklist: '02. दस्तावेज़ सूची',
    tabGuide: '03. आधिकारिक आवेदन गाइड',
    whyMatches: 'यह आपकी स्थिति से क्यों मेल खाता है',
    officialCriteria: 'आधिकारिक पात्रता मानदंड',
    groundedCitation: 'सत्यापित आधिकारिक उद्धरण',
    documentReadiness: 'दस्तावेज़ तैयारी',
    acceptedProof: 'मान्य प्रमाण:',
    whereToObtain: 'कहाँ से प्राप्त करें:',
    officialFilingPortal: 'आधिकारिक सरकारी पोर्टल',
    officialPortalDesc:
      'हमेशा नीचे दिए गए आधिकारिक भारतीय सरकारी पोर्टल पर ही आवेदन करें—किसी एजेंट या नकली वेबसाइट को शुल्क न दें।',
    openOfficialPortal: 'आधिकारिक पोर्टल खोलें',
    avoidMistake: 'सामान्य गलती से बचें:',
    askQuestionTitle: 'इस योजना के बारे में प्रश्न पूछें',
    askOfficialGuide: 'आधिकारिक गाइड से पूछें',
    checkingRecord: 'रिकॉर्ड जाँचा जा रहा है...',
    nextStep: 'अगला कदम:',
    stepPrefix: 'चरण',
    isRtl: false,
  },
  Tamil: {
    estimatedBenefit: 'மதிப்பிடப்பட்ட உதவி',
    filingWindow: 'விண்ணப்ப காலம்',
    translateLabel: 'வழிகாட்டியை மொழிபெயர்:',
    listenAloud: 'ஒலி வழிகாட்டி',
    preparingAudio: 'ஒலி தயாராகிறது...',
    stopAudio: 'ஒலியை நிறுத்து',
    viewOfficialSource: 'அதிகாரப்பூர்வ ஆதாரம்',
    tabEligibility: '01. தகுதி விதிகள்',
    tabChecklist: '02. ஆவணப் பட்டியல்',
    tabGuide: '03. விண்ணப்ப வழிகாட்டி',
    whyMatches: 'உங்கள் சூழ்நிலைக்கு ஏன் பொருந்துகிறது',
    officialCriteria: 'அதிகாரப்பூர்வ தகுதி விதிமுறைகள்',
    groundedCitation: 'அதிகாரப்பூர்வ மேற்கோள்',
    documentReadiness: 'ஆவணத் தயார்நிலை',
    acceptedProof: 'ஏற்றுக்கொள்ளப்படும் சான்று:',
    whereToObtain: 'எங்கே பெறுவது:',
    officialFilingPortal: 'அதிகாரப்பூர்வ அரசு தளம்',
    officialPortalDesc:
      'எப்போதும் கீழே உள்ள அதிகாரப்பூர்வ அரசு இணையதளம் மூலம் மட்டுமே விண்ணப்பிக்கவும்—இடைத்தரகர்களுக்கு பணம் செலுத்த வேண்டாம்.',
    openOfficialPortal: 'அதிகாரப்பூர்வ தளம் திற',
    avoidMistake: 'தவிர்க்க வேண்டிய தவறு:',
    askQuestionTitle: 'இந்த திட்டம் பற்றி கேள்வி கேளுங்கள்',
    askOfficialGuide: 'வழிகாட்டியிடம் கேளுங்கள்',
    checkingRecord: 'சரிபார்க்கிறது...',
    nextStep: 'அடுத்த படி:',
    stepPrefix: 'படி',
    isRtl: false,
  },
  Bengali: {
    estimatedBenefit: 'আনুমানিক সহায়তা',
    filingWindow: 'আবেদনের সময়সীমা',
    translateLabel: 'ভাষা পরিবর্তন করুন:',
    listenAloud: 'শুনে নিন (অডিও)',
    preparingAudio: 'অডিও তৈরি হচ্ছে...',
    stopAudio: 'অডিও থামান',
    viewOfficialSource: 'অফিশিয়াল সূত্র দেখুন',
    tabEligibility: '01. যোগ্যতার নিয়ম',
    tabChecklist: '02. নথির তালিকা',
    tabGuide: '03. আবেদনের নির্দেশিকা',
    whyMatches: 'কেন এটি আপনার পরিস্থিতির সাথে মেলে',
    officialCriteria: 'অফিশিয়াল যোগ্যতার মানদণ্ড',
    groundedCitation: 'যাচাইকৃত সরকারি উদ্ধৃতি',
    documentReadiness: 'নথি প্রস্তুতি',
    acceptedProof: 'গৃহীত প্রমাণ:',
    whereToObtain: 'কোথায় পাবেন:',
    officialFilingPortal: 'অফিশিয়াল সরকারি পোর্টাল',
    officialPortalDesc:
      'সর্বদা নিচের অফিশিয়াল ভারতীয় সরকারি পোর্টালের মাধ্যমে সরাসরি আবেদন করুন—কোনো দালাল বা ভুয়া ওয়েবসাইটে টাকা দেবেন না।',
    openOfficialPortal: 'অফিশিয়াল পোর্টাল খুলুন',
    avoidMistake: 'সাধারণ ভুল এড়িয়ে চলুন:',
    askQuestionTitle: 'এই প্রকল্প সম্পর্কে প্রশ্ন করুন',
    askOfficialGuide: 'গাইডকে জিজ্ঞাসা করুন',
    checkingRecord: 'যাচাই করা হচ্ছে...',
    nextStep: 'পরবর্তী ধাপ:',
    stepPrefix: 'ধাপ',
    isRtl: false,
  },
  Telugu: {
    estimatedBenefit: 'అంచనా సహాయం',
    filingWindow: 'దరఖాస్తు గడువు',
    translateLabel: 'భాష మార్చండి:',
    listenAloud: 'వినండి (ఆడియో)',
    preparingAudio: 'ఆడియో సిద్ధమవుతోంది...',
    stopAudio: 'ఆడియో ఆపండి',
    viewOfficialSource: 'అధికారిక ఆధారం చూడండి',
    tabEligibility: '01. అర్హత నియమాలు',
    tabChecklist: '02. పత్రాల జాబితా',
    tabGuide: '03. దరఖాస్తు మార్గదర్శి',
    whyMatches: 'మీ పరిస్థితికి ఇది ఎందుకు సరిపోతుంది',
    officialCriteria: 'అధికారిక అర్హత ప్రమాణాలు',
    groundedCitation: 'అధికారిక ఆధారం',
    documentReadiness: 'పత్రాల సిద్ధత',
    acceptedProof: 'ఆమోదించబడిన రుజువు:',
    whereToObtain: 'ఎక్కడ పొందాలి:',
    officialFilingPortal: 'అధికారిక ప్రభుత్వ పోర్టల్',
    officialPortalDesc:
      'ఎల్లప్పుడూ క్రింద ఉన్న అధికారిక భారత ప్రభుత్వ పోర్టల్ ద్వారానే దరఖాస్తు చేయండి—మధ్యవర్తులకు డబ్బు చెల్లించవద్దు.',
    openOfficialPortal: 'అధికారిక పోర్టల్ తెరవండి',
    avoidMistake: 'సాధారణ తప్పును నివారించండి:',
    askQuestionTitle: 'ఈ పథకం గురించి ప్రశ్న అడగండి',
    askOfficialGuide: 'గైడ్‌ను అడగండి',
    checkingRecord: 'పరిశీలిస్తోంది...',
    nextStep: 'తదుపరి అడుగు:',
    stepPrefix: 'దశ',
    isRtl: false,
  },
  Marathi: {
    estimatedBenefit: 'अंदाजे मदत',
    filingWindow: 'अर्ज कालावधी',
    translateLabel: 'भाषा निवडा:',
    listenAloud: 'ऐका (ऑडिओ)',
    preparingAudio: 'ऑडिओ तयार होत आहे...',
    stopAudio: 'ऑडिओ थांबवा',
    viewOfficialSource: 'अधिकृत स्रोत पहा',
    tabEligibility: '01. पात्रता नियम',
    tabChecklist: '02. कागदपत्रे यादी',
    tabGuide: '03. अधिकृत अर्ज मार्गदर्शक',
    whyMatches: 'हे तुमच्या परिस्थितीशी का जुळते',
    officialCriteria: 'अधिकृत पात्रता निकष',
    groundedCitation: 'पडताळलेला अधिकृत संदर्भ',
    documentReadiness: 'कागदपत्रांची तयारी',
    acceptedProof: 'मान्य पुरावा:',
    whereToObtain: 'कोठे मिळेल:',
    officialFilingPortal: 'अधिकृत सरकारी पोर्टल',
    officialPortalDesc:
      'नेहमी खालील अधिकृत भारतीय सरकारी पोर्टलद्वारेच थेट अर्ज करा—कोणत्याही मध्यस्थाला शुल्क देऊ नका.',
    openOfficialPortal: 'अधिकृत पोर्टल उघडा',
    avoidMistake: 'सामान्य चूक टाळा:',
    askQuestionTitle: 'या योजनेबद्दल प्रश्न विचारा',
    askOfficialGuide: 'अधिकृत मार्गदर्शकाला विचारा',
    checkingRecord: 'तपासत आहे...',
    nextStep: 'पुढील पायरी:',
    stepPrefix: 'पायरी',
    isRtl: false,
  },
};

export function getGuideUiLabels(language: string): GuideUiLabels {
  return LABELS_BY_LANGUAGE[language] ?? EN_LABELS;
}
