import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeChecklistProgress,
  extractSituationSignals,
  rankServicesDeterministic,
  toggleChecklistItem,
} from './eligibility';
import { OFFICIAL_SERVICES } from '../data/officialServices';
import { getGuideUiLabels } from './i18n';

test('getGuideUiLabels returns localized labels for Indian languages', () => {
  const hi = getGuideUiLabels('Hindi');
  assert.equal(hi.openOfficialPortal, 'आधिकारिक पोर्टल खोलें');
  assert.equal(hi.isRtl, false);

  const ta = getGuideUiLabels('Tamil');
  assert.ok(ta.openOfficialPortal.length > 0);
});

test('extractSituationSignals detects BTech girl student, income hardship, and food/ration signals', () => {
  const signals = extractSituationSignals(
    'I am a BTech first year female student with family income 3 lakh needing scholarship, hostel mess food support, and income certificate.'
  );
  assert.equal(signals.isStudent, true);
  assert.equal(signals.isTechnicalOrGirlStudent, true);
  assert.equal(signals.hasIncomeHardship, true);
  assert.equal(signals.needsFoodOrHostelAid, true);
  assert.equal(signals.needsCertificateOrId, true);
});

test('rankServicesDeterministic prioritizes AICTE Pragati, NSP PM-USP, and DigiLocker for BTech girl student', () => {
  const matches = rankServicesDeterministic(
    'I am a BTech female student with family income under 4 lakh needing tuition scholarship and income certificate on DigiLocker.'
  );
  const ids = matches.map((m) => m.serviceId);
  assert.ok(ids.includes('aicte-pragati-saksham'));
  assert.ok(ids.includes('nsp-pm-usp-csss'));
  assert.ok(ids.includes('digilocker-edistrict-certs'));
  assert.equal(matches[0].eligibilityStatus, 'Likely Eligible');
});

test('rankServicesDeterministic prioritizes PM-JAY, NFSA ration, and PM Internship for healthcare, food, and jobs', () => {
  const matches = rankServicesDeterministic(
    'I graduated recently, looking for a paid internship or job, need Ayushman Bharat hospital cover for parents and ration food grains.'
  );
  const ids = matches.map((m) => m.serviceId);
  assert.ok(ids.includes('pm-internship-scheme'));
  assert.ok(ids.includes('ayushman-pmjay'));
  assert.ok(ids.includes('nfsa-onorc-food'));
});

test('computeChecklistProgress and toggleChecklistItem track Indian portal readiness accurately', () => {
  const nsp = OFFICIAL_SERVICES.find((s) => s.id === 'nsp-pm-usp-csss')!;
  const initialProgress = computeChecklistProgress(nsp, []);
  assert.equal(initialProgress.readyCount, 0);
  assert.equal(initialProgress.totalCount, nsp.requiredDocuments.length);

  let map: Record<string, string[]> = {};
  map = toggleChecklistItem(map, nsp.id, nsp.requiredDocuments[0].id);
  map = toggleChecklistItem(map, nsp.id, nsp.requiredDocuments[1].id);
  const midProgress = computeChecklistProgress(nsp, map[nsp.id]);
  assert.equal(midProgress.readyCount, 2);
  assert.equal(midProgress.percent, 50);
  assert.equal(midProgress.nextMissingDocName, nsp.requiredDocuments[2].name);
});
