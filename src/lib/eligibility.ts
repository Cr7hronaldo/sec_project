import { OFFICIAL_SERVICES } from '../data/officialServices';
import type {
  EligibilityStatus,
  MatchedServiceResult,
  OfficialService,
  RuleEvaluation,
} from '../types/civic';

export interface SituationSignals {
  isStudent: boolean;
  isTechnicalOrGirlStudent: boolean;
  hasCategoryOrReservation: boolean;
  hasIncomeHardship: boolean;
  needsFoodOrHostelAid: boolean;
  needsCertificateOrId: boolean;
  needsHealthcare: boolean;
  seeksEmploymentOrInternship: boolean;
  needsEducationLoan: boolean;
  keywordsMatched: string[];
}

export function extractSituationSignals(rawText: string): SituationSignals {
  const text = rawText.toLowerCase();
  const tokens = new Set<string>();

  const hasAny = (patterns: string[]): boolean => {
    let found = false;
    for (const p of patterns) {
      if (text.includes(p)) {
        tokens.add(p);
        found = true;
      }
    }
    return found;
  };

  const isStudent = hasAny([
    'student',
    'college',
    'university',
    'tuition',
    'scholarship',
    'nsp',
    'degree',
    'btech',
    'b.tech',
    'bsc',
    'bcom',
    'ba ',
    'mbbs',
    'diploma',
    'polytechnic',
    'class 12',
    '12th',
    'ug',
    'pg',
    'hostel',
    'study',
  ]);
  const isTechnicalOrGirlStudent = hasAny([
    'btech',
    'b.tech',
    'engineering',
    'polytechnic',
    'diploma',
    'aicte',
    'pragati',
    'saksham',
    'girl student',
    'female student',
    'woman',
    'b.e',
  ]);
  const hasCategoryOrReservation = hasAny([
    'sc ',
    'st ',
    'obc',
    'ews',
    'minority',
    'post matric',
    'post-matric',
    'caste',
    'reserved',
  ]);
  const hasIncomeHardship = hasAny([
    'low income',
    'low-income',
    'lakh',
    'bpl',
    'ews',
    'poor',
    'afford',
    'financial',
    'fee',
    'fees',
    'tuition',
    'rupee',
    'rs ',
    '₹',
  ]);
  const needsFoodOrHostelAid = hasAny([
    'food',
    'ration',
    'mess',
    'hostel',
    'groceries',
    'rice',
    'wheat',
    'nfsa',
    'onorc',
    'pg ',
    'meal',
    'eat',
  ]);
  const needsCertificateOrId = hasAny([
    'certificate',
    'income certificate',
    'caste certificate',
    'domicile',
    'birth certificate',
    'marksheet',
    'digilocker',
    'e-district',
    'edistrict',
    'abc id',
    'apaar',
    'lost documents',
    'aadhaar',
  ]);
  const needsHealthcare = hasAny([
    'health',
    'hospital',
    'medical',
    'ayushman',
    'pmjay',
    'pm-jay',
    'insurance',
    'doctor',
    'treatment',
    'illness',
    'surgery',
    'parents health',
  ]);
  const seeksEmploymentOrInternship = hasAny([
    'job',
    'jobs',
    'internship',
    'stipend',
    'employment',
    'career',
    'placement',
    'fresher',
    'graduate',
    'skill',
    'ncs',
    'pmkvy',
    'part-time',
    'part time',
    'work',
  ]);
  const needsEducationLoan = hasAny([
    'loan',
    'vidyalaxmi',
    'vidya lakshmi',
    'interest subsidy',
    'csis',
    'collateral',
  ]);

  return {
    isStudent,
    isTechnicalOrGirlStudent,
    hasCategoryOrReservation,
    hasIncomeHardship,
    needsFoodOrHostelAid,
    needsCertificateOrId,
    needsHealthcare,
    seeksEmploymentOrInternship,
    needsEducationLoan,
    keywordsMatched: Array.from(tokens),
  };
}

export function evaluateServiceAgainstSignals(
  service: OfficialService,
  signals: SituationSignals,
  rawText: string
): MatchedServiceResult {
  const lower = rawText.toLowerCase();
  let score = 0;

  for (const kw of service.keywords) {
    if (lower.includes(kw.toLowerCase())) {
      score += 13;
    }
  }

  if (service.category === 'Scholarships' && signals.isStudent) score += 32;
  if (service.id === 'aicte-pragati-saksham' && signals.isTechnicalOrGirlStudent) {
    score += 32;
  }
  if (service.id === 'nsp-post-matric' && signals.hasCategoryOrReservation) {
    score += 30;
  }
  if (service.id === 'vidyalakshmi-csis' && signals.needsEducationLoan) {
    score += 36;
  }
  if (service.category === 'Benefits & Food' && signals.needsFoodOrHostelAid) {
    score += 42;
  }
  if (service.category === 'Certificates & ID' && signals.needsCertificateOrId) {
    score += 46;
  }
  if (service.category === 'Healthcare' && signals.needsHealthcare) {
    score += 46;
  }
  if (
    service.category === 'Employment & Aid' &&
    signals.seeksEmploymentOrInternship
  ) {
    score += 46;
  }
  if (
    signals.hasIncomeHardship &&
    service.eligibilityRules.some((r) => r.ruleType === 'income')
  ) {
    score += 12;
  }

  const boundedScore = Math.min(98, Math.max(8, score));
  let eligibilityStatus: EligibilityStatus = 'Informational';
  if (boundedScore >= 52) {
    eligibilityStatus = 'Likely Eligible';
  } else if (boundedScore >= 26) {
    eligibilityStatus = 'Check Criteria';
  }

  const ruleEvaluations: RuleEvaluation[] = service.eligibilityRules.map(
    (rule) => {
      let metBySignal = false;
      if (rule.ruleType === 'student' && signals.isStudent) metBySignal = true;
      if (rule.ruleType === 'income' && signals.hasIncomeHardship) metBySignal = true;
      if (rule.ruleType === 'category' && (signals.hasCategoryOrReservation || signals.isTechnicalOrGirlStudent)) {
        metBySignal = true;
      }
      if (rule.ruleType === 'food' && signals.needsFoodOrHostelAid) metBySignal = true;
      if (rule.ruleType === 'certificate' && signals.needsCertificateOrId) metBySignal = true;
      if (rule.ruleType === 'employment' && signals.seeksEmploymentOrInternship) {
        metBySignal = true;
      }
      if (rule.ruleType === 'healthcare' && signals.needsHealthcare) metBySignal = true;

      return {
        ruleId: rule.ruleId,
        label: rule.label,
        status: metBySignal
          ? 'Met'
          : rule.required
            ? 'Verify'
            : 'Context Needed',
        explanation: metBySignal
          ? `Aligned with your description (${rule.description})`
          : rule.description,
        docCode: service.docCode,
      };
    }
  );

  return {
    serviceId: service.id,
    eligibilityStatus,
    confidenceScore: boundedScore,
    plainLanguageReason: service.summary,
    ruleEvaluations,
    customizedChecklistNote:
      'Keep Aadhaar, DigiLocker PDFs, and income/category proofs ready before opening the portal.',
    groundedCitationQuote: service.officialExcerpt,
  };
}

export function rankServicesDeterministic(
  situationText: string,
  services: OfficialService[] = OFFICIAL_SERVICES,
  limit = 6
): MatchedServiceResult[] {
  const signals = extractSituationSignals(situationText);
  return services
    .map((svc) => evaluateServiceAgainstSignals(svc, signals, situationText))
    .filter((m) => m.confidenceScore >= 22)
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit);
}

export interface ChecklistProgress {
  readyCount: number;
  totalCount: number;
  percent: number;
  nextMissingDocName: string | null;
}

export function computeChecklistProgress(
  service: OfficialService,
  checkedDocIds: string[]
): ChecklistProgress {
  const checkedSet = new Set(checkedDocIds);
  const totalCount = service.requiredDocuments.length;
  const readyCount = service.requiredDocuments.filter((d) =>
    checkedSet.has(d.id)
  ).length;
  const percent =
    totalCount === 0 ? 0 : Math.round((readyCount / totalCount) * 100);
  const nextMissing = service.requiredDocuments.find(
    (d) => !checkedSet.has(d.id)
  );

  return {
    readyCount,
    totalCount,
    percent,
    nextMissingDocName: nextMissing ? nextMissing.name : null,
  };
}

export function toggleChecklistItem(
  currentMap: Record<string, string[]>,
  serviceId: string,
  docId: string
): Record<string, string[]> {
  const existing = currentMap[serviceId] ?? [];
  const exists = existing.includes(docId);
  const updated = exists
    ? existing.filter((id) => id !== docId)
    : [...existing, docId];

  return {
    ...currentMap,
    [serviceId]: updated,
  };
}
