export type ServiceCategory =
  | 'All'
  | 'Scholarships'
  | 'Benefits & Food'
  | 'Certificates & ID'
  | 'Healthcare'
  | 'Employment & Aid';

export type EligibilityRuleType =
  | 'income'
  | 'student'
  | 'category'
  | 'food'
  | 'employment'
  | 'healthcare'
  | 'certificate'
  | 'residency';

export interface EligibilityRule {
  ruleId: string;
  label: string;
  description: string;
  ruleType: EligibilityRuleType;
  required: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  acceptedProofs: string;
  whereToObtain: string;
  processingTime: string;
  optional?: boolean;
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  instruction: string;
  portalActionLabel: string;
  pitfallWarning: string;
}

export interface OfficialService {
  id: string;
  docCode: string;
  title: string;
  category: Exclude<ServiceCategory, 'All'>;
  issuingAuthority: string;
  officialUrl: string;
  portalDomain: string;
  benefitEstimate: string;
  deadline: string;
  verifiedUpdated: string;
  summary: string;
  officialExcerpt: string;
  eligibilityRules: EligibilityRule[];
  requiredDocuments: DocumentItem[];
  applicationSteps: ApplicationStep[];
  keywords: string[];
}

export type EligibilityStatus =
  | 'Likely Eligible'
  | 'Check Criteria'
  | 'Informational';

export interface RuleEvaluation {
  ruleId: string;
  label: string;
  status: 'Met' | 'Verify' | 'Context Needed';
  explanation: string;
  docCode: string;
}

export interface MatchedServiceResult {
  serviceId: string;
  eligibilityStatus: EligibilityStatus;
  confidenceScore: number;
  plainLanguageReason: string;
  ruleEvaluations: RuleEvaluation[];
  customizedChecklistNote: string;
  groundedCitationQuote: string;
}

export interface SituationAnalysisResponse {
  situationSummary: string;
  detectedLanguage: string;
  followUpQuestions: string[];
  matches: MatchedServiceResult[];
}

export interface TranslatedGuidePayload {
  serviceId: string;
  targetLanguage: string;
  title: string;
  summary: string;
  benefitEstimate: string;
  deadline: string;
  eligibilityRules: Array<{
    ruleId: string;
    label: string;
    description: string;
  }>;
  requiredDocuments: Array<{
    id: string;
    name: string;
    acceptedProofs: string;
    whereToObtain: string;
    processingTime: string;
  }>;
  applicationSteps: Array<{
    stepNumber: number;
    title: string;
    instruction: string;
    portalActionLabel: string;
    pitfallWarning: string;
  }>;
}

export interface GroundedAnswerResponse {
  answer: string;
  citedDocCode: string;
  citedSection: string;
  nextAction: string;
}

export interface LatestOpportunityItem {
  title: string;
  category: Exclude<ServiceCategory, 'All'>;
  statusOrDeadline: string;
  eligibilityHighlight: string;
  summary: string;
  portalName: string;
  portalUrl: string;
}

export interface GroundingSourceLink {
  title: string;
  uri: string;
}

export interface LatestUpdatesResponse {
  queryFocus: string;
  language: string;
  refreshedAt: string;
  overviewNote: string;
  opportunities: LatestOpportunityItem[];
  groundingSources: GroundingSourceLink[];
}

export interface SupportedLanguage {
  code: string;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'English', label: 'English', nativeLabel: 'English' },
  { code: 'Hindi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'Tamil', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'Bengali', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'Telugu', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'Marathi', label: 'Marathi', nativeLabel: 'मराठी' },
];
