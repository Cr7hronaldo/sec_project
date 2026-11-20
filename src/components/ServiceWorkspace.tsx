import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Send,
  Square,
  Volume2,
} from 'lucide-react';
import { OFFICIAL_SERVICES } from '../data/officialServices';
import { computeChecklistProgress } from '../lib/eligibility';
import { getGuideUiLabels } from '../lib/i18n';
import type {
  GroundedAnswerResponse,
  MatchedServiceResult,
  OfficialService,
  SituationAnalysisResponse,
  TranslatedGuidePayload,
} from '../types/civic';
import { SUPPORTED_LANGUAGES } from '../types/civic';

type WorkspaceTab = 'eligibility' | 'checklist' | 'guide';

interface ServiceWorkspaceProps {
  analysis: SituationAnalysisResponse | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  onRetryAnalysis: () => void;
  onUseRuleFallback: () => void;
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
  checklistMap: Record<string, string[]>;
  onToggleDoc: (serviceId: string, docId: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onSelectFollowUp: (prompt: string) => void;
  onInspectSource: (service: OfficialService) => void;
  onOpenLiveUpdates?: (contextText?: string) => void;
  situationText: string;
}

export const ServiceWorkspace: React.FC<ServiceWorkspaceProps> = ({
  analysis,
  isAnalyzing,
  analysisError,
  onRetryAnalysis,
  onUseRuleFallback,
  selectedServiceId,
  onSelectService,
  checklistMap,
  onToggleDoc,
  language,
  onLanguageChange,
  onSelectFollowUp,
  onInspectSource,
  onOpenLiveUpdates,
  situationText,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('eligibility');
  const [translations, setTranslations] = useState<
    Record<string, TranslatedGuidePayload>
  >({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const [qaInput, setQaInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaAnswers, setQaAnswers] = useState<
    Record<string, GroundedAnswerResponse>
  >({});

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const matches: MatchedServiceResult[] = analysis?.matches ?? [];
  const activeService =
    OFFICIAL_SERVICES.find((s) => s.id === selectedServiceId) ??
    (matches.length > 0
      ? OFFICIAL_SERVICES.find((s) => s.id === matches[0].serviceId) ?? null
      : null);

  const activeMatch = activeService
    ? matches.find((m) => m.serviceId === activeService.id) ?? null
    : null;

  // Stop any playing audio when switching service
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    setAudioError(null);
    setQaError(null);
    setTranslationError(null);
  }, [activeService?.id]);

  // Translate guide whenever non-English language is selected for an active service
  useEffect(() => {
    if (!activeService || language === 'English') {
      setTranslationError(null);
      return;
    }
    const cacheKey = `${activeService.id}:${language}`;
    if (translations[cacheKey]) return;

    let cancelled = false;
    setIsTranslating(true);
    setTranslationError(null);

    fetch('/api/translate-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: activeService.id,
        targetLanguage: language,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Translation failed.');
        return data as TranslatedGuidePayload;
      })
      .then((payload) => {
        if (!cancelled) {
          setTranslations((prev) => ({ ...prev, [cacheKey]: payload }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTranslationError(
            err instanceof Error ? err.message : 'Unable to translate guide.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsTranslating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeService, language, translations]);

  const activeTranslation =
    activeService && language !== 'English'
      ? translations[`${activeService.id}:${language}`] ?? null
      : null;

  const handlePlayAudio = async () => {
    if (!activeService) return;
    setAudioError(null);

    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingAudio(false);
      return;
    }

    const displayTitle = activeTranslation?.title ?? activeService.title;
    const displaySummary = activeTranslation?.summary ?? activeService.summary;
    const firstStep =
      activeTranslation?.applicationSteps[0] ?? activeService.applicationSteps[0];

    const narrationText = `${displayTitle}. ${displaySummary} First official step: ${firstStep.title}. ${firstStep.instruction}`;

    setIsGeneratingAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: narrationText }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to generate audio narration.');
      }

      const audio = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setAudioError('Audio playback failed in this browser.');
      };
      await audio.play();
      setIsPlayingAudio(true);
    } catch (err) {
      setAudioError(
        err instanceof Error ? err.message : 'Unable to play audio guide.'
      );
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeService || !qaInput.trim() || isAsking) return;

    setIsAsking(true);
    setQaError(null);
    try {
      const res = await fetch('/api/ask-grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: activeService.id,
          question: qaInput.trim(),
          language,
          situationContext: situationText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not answer question.');
      }
      setQaAnswers((prev) => ({
        ...prev,
        [`${activeService.id}:${language}`]: data as GroundedAnswerResponse,
      }));
      setQaInput('');
    } catch (err) {
      setQaError(
        err instanceof Error ? err.message : 'Failed to query official record.'
      );
    } finally {
      setIsAsking(false);
    }
  };

  // Loading State
  if (isAnalyzing) {
    return (
      <section
        aria-live="polite"
        className="mx-auto max-w-[1240px] px-6 py-10"
      >
        <div className="border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-950" aria-hidden="true" />
            <p className="text-sm font-medium text-neutral-950">
              Evaluating your situation against 11 verified Indian student
              portals...
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-24 animate-pulse border border-neutral-200 bg-white"
                />
              ))}
            </div>
            <div className="h-80 animate-pulse border border-neutral-200 bg-white lg:col-span-8" />
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (analysisError) {
    return (
      <section className="mx-auto max-w-[1240px] px-6 py-10">
        <div
          role="alert"
          className="border border-neutral-950 bg-neutral-50 p-6 sm:p-8"
        >
          <p className="font-mono text-xs text-neutral-500">
            ELIGIBILITY ENGINE NOTICE
          </p>
          <h2 className="mt-1 font-serif text-2xl font-medium text-neutral-950">
            Unable to complete AI analysis
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-700">{analysisError}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRetryAnalysis}
              className="bg-neutral-950 px-4 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer"
            >
              Retry AI Analysis
            </button>
            <button
              type="button"
              onClick={onUseRuleFallback}
              className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-medium text-neutral-900 hover:border-neutral-950 cursor-pointer"
            >
              Preview Rule-Based Matches
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Initial Empty / Overview State (before analysis or selection)
  if (!analysis && !activeService) {
    const featured = OFFICIAL_SERVICES.slice(0, 4);
    return (
      <section className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid grid-cols-1 gap-8 border-b border-neutral-200 pb-10 md:grid-cols-3">
          <div>
            <p className="font-mono text-xs text-neutral-500">01</p>
            <h2 className="mt-1 font-serif text-xl font-medium text-neutral-950">
              Ordinary language or voice
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              No scheme codes needed. Explain what you need—college tuition,
              hostel food or ration, DigiLocker certificates, healthcare, or
              internships—in English, Hindi, or regional languages.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-neutral-500">02</p>
            <h2 className="mt-1 font-serif text-xl font-medium text-neutral-950">
              Rule-grounded eligibility
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Every matched scheme explains which official criteria appear met,
              what needs confirmation, and cites the exact portal guideline.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-neutral-500">03</p>
            <h2 className="mt-1 font-serif text-xl font-medium text-neutral-950">
              Checklist &amp; official portals
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Check off Aadhaar, income, and academic records, translate steps,
              listen aloud, or jump straight to the official government portal.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-medium text-neutral-950">
              Frequently navigated Indian student portals
            </h2>
            <p className="font-mono text-xs text-neutral-500">
              Select a scheme to inspect rules or open its portal directly
            </p>
          </div>

          <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
            {featured.map((svc, idx) => (
              <div
                key={svc.id}
                className="grid grid-cols-1 items-center gap-4 py-4 sm:grid-cols-12"
              >
                <div className="sm:col-span-5">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="font-mono tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{svc.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{svc.docCode}</span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-neutral-950">
                    {svc.title}
                  </h3>
                </div>
                <div className="text-xs text-neutral-600 sm:col-span-4">
                  {svc.benefitEstimate}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:col-span-3">
                  <a
                    href={svc.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-950 whitespace-nowrap shrink-0"
                  >
                    <span>Portal</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onSelectService(svc.id)}
                    className="border border-neutral-950 bg-neutral-950 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Open Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Populated Workspace (AI matches OR single service opened from Directory)
  const sidebarServices: Array<{
    service: OfficialService;
    match: MatchedServiceResult | null;
  }> =
    matches.length > 0
      ? matches
          .map((m) => {
            const svc = OFFICIAL_SERVICES.find((s) => s.id === m.serviceId);
            return svc ? { service: svc, match: m } : null;
          })
          .filter(
            (
              item
            ): item is { service: OfficialService; match: MatchedServiceResult } =>
              item !== null
          )
      : activeService
        ? [{ service: activeService, match: null }]
        : [];

  if (!activeService) return null;

  const checkedDocs = checklistMap[activeService.id] ?? [];
  const progress = computeChecklistProgress(activeService, checkedDocs);
  const activeQa = qaAnswers[`${activeService.id}:${language}`];
  const ui = getGuideUiLabels(language);

  const relatedPrograms =
    sidebarServices.length <= 1
      ? OFFICIAL_SERVICES.filter(
          (s) => s.id !== activeService.id && s.category === activeService.category
        )
          .concat(
            OFFICIAL_SERVICES.filter(
              (s) => s.id !== activeService.id && s.category !== activeService.category
            )
          )
          .slice(0, 3)
      : [];

  const displayTitle = activeTranslation?.title ?? activeService.title;
  const displaySummary = activeTranslation?.summary ?? activeService.summary;
  const displayBenefit =
    activeTranslation?.benefitEstimate ?? activeService.benefitEstimate;
  const displayDeadline = activeTranslation?.deadline ?? activeService.deadline;

  const displayRules = activeService.eligibilityRules.map((rule) => {
    const tr = activeTranslation?.eligibilityRules.find(
      (r) => r.ruleId === rule.ruleId
    );
    return {
      ...rule,
      label: tr?.label ?? rule.label,
      description: tr?.description ?? rule.description,
    };
  });

  const displayDocs = activeService.requiredDocuments.map((doc) => {
    const tr = activeTranslation?.requiredDocuments.find((d) => d.id === doc.id);
    return {
      ...doc,
      name: tr?.name ?? doc.name,
      acceptedProofs: tr?.acceptedProofs ?? doc.acceptedProofs,
      whereToObtain: tr?.whereToObtain ?? doc.whereToObtain,
      processingTime: tr?.processingTime ?? doc.processingTime,
    };
  });

  const displaySteps = activeService.applicationSteps.map((step) => {
    const tr = activeTranslation?.applicationSteps.find(
      (s) => s.stepNumber === step.stepNumber
    );
    return {
      ...step,
      title: tr?.title ?? step.title,
      instruction: tr?.instruction ?? step.instruction,
      portalActionLabel: tr?.portalActionLabel ?? step.portalActionLabel,
      pitfallWarning: tr?.pitfallWarning ?? step.pitfallWarning,
    };
  });

  return (
    <section
      data-testid="service-workspace"
      className="mx-auto max-w-[1240px] px-6 py-10"
    >
      {/* Situation Analysis Summary Banner */}
      {analysis && (
        <div className="mb-8 border border-neutral-200 bg-neutral-50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-neutral-950">
                Situation Assessment
              </span>
              <span aria-hidden="true">·</span>
              <span>Detected input: {analysis.detectedLanguage}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {sidebarServices.length} portals matched
              </span>
            </div>

            {onOpenLiveUpdates && (
              <button
                type="button"
                onClick={() => onOpenLiveUpdates(situationText)}
                className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-950 transition-colors hover:border-neutral-950 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                <span>Refresh Live Web Updates</span>
              </button>
            )}
          </div>

          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-neutral-900">
            {analysis.situationSummary}
          </p>

          {analysis.followUpQuestions.length > 0 && (
            <div className="mt-4 border-t border-neutral-200 pt-4">
              <p className="text-xs font-medium text-neutral-600">
                Refine your match by adding details:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.followUpQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSelectFollowUp(q)}
                    className="border border-neutral-300 bg-white px-3 py-1.5 text-left text-xs text-neutral-800 transition-colors hover:border-neutral-950 hover:text-neutral-950 cursor-pointer"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Rail: Matched Services List */}
        <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
          <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
            <h2 className="font-serif text-lg font-medium text-neutral-950">
              {matches.length > 0 ? 'Matched Services' : 'Selected Program'}
            </h2>
            <span className="font-mono text-xs text-neutral-500 tabular-nums">
              {sidebarServices.length} total
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {sidebarServices.map(({ service, match }, idx) => {
              const isSelected = service.id === activeService.id;
              const svcProgress = computeChecklistProgress(
                service,
                checklistMap[service.id] ?? []
              );
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onSelectService(service.id)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`w-full border p-4 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-neutral-950 ${
                    isSelected
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-200 bg-white text-neutral-950 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-mono tabular-nums ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')} · {service.docCode}
                    </span>
                    {match && (
                      <span
                        className={`inline-flex items-center gap-1.5 font-medium ${
                          isSelected ? 'text-white' : 'text-neutral-900'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-block h-2 w-2 border ${
                            match.eligibilityStatus === 'Likely Eligible'
                              ? isSelected
                                ? 'border-white bg-white'
                                : 'border-neutral-950 bg-neutral-950'
                              : isSelected
                                ? 'border-white bg-transparent'
                                : 'border-neutral-950 bg-transparent'
                          }`}
                        />
                        {match.eligibilityStatus}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-semibold leading-snug">
                    {service.title}
                  </h3>

                  <div
                    className={`mt-3 flex items-center justify-between text-xs font-mono tabular-nums ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    <span>{service.category}</span>
                    <span>
                      Docs {svcProgress.readyCount}/{svcProgress.totalCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {relatedPrograms.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 pt-5">
              <p className="text-xs font-semibold text-neutral-700">
                Other Verified Programs
              </p>
              <div className="mt-2.5 divide-y divide-neutral-200 border-y border-neutral-200">
                {relatedPrograms.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onSelectService(rel.id)}
                    className="block w-full py-3 text-left transition-colors hover:bg-neutral-50 cursor-pointer"
                  >
                    <p className="font-mono text-[11px] text-neutral-500">
                      {rel.docCode} · {rel.category}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-neutral-900">
                      {rel.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Detail Panel */}
        <div
          dir={ui.isRtl ? 'rtl' : 'ltr'}
          className="border border-neutral-200 bg-white p-6 sm:p-8 lg:col-span-8"
        >
          {/* Program Header */}
          <div className="border-b border-neutral-200 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="font-mono text-neutral-900">
                  {activeService.docCode}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeService.issuingAuthority}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onInspectSource(activeService)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 underline underline-offset-4 hover:text-neutral-950 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{ui.viewOfficialSource}</span>
                </button>
                <a
                  href={activeService.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 whitespace-nowrap shrink-0"
                >
                  <span>Open {activeService.portalDomain}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            <h2 className="mt-3 font-serif text-2xl font-medium tracking-tight text-neutral-950 sm:text-3xl">
              {displayTitle}
            </h2>

            <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
              {displaySummary}
            </p>

            {/* Key Facts Row */}
            <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-neutral-500">{ui.estimatedBenefit}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-neutral-950 tabular-nums">
                  {displayBenefit}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">{ui.filingWindow}</dt>
                <dd className="mt-0.5 text-sm font-medium text-neutral-900">
                  {displayDeadline}
                </dd>
              </div>
            </dl>

            {/* Translation & Audio Guide Action Bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <label
                  htmlFor="workspace-language-select"
                  className="text-xs font-medium text-neutral-700"
                >
                  {ui.translateLabel}
                </label>
                <select
                  id="workspace-language-select"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-950 focus-visible:outline-2 focus-visible:outline-neutral-950"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeLabel} ({lang.label})
                    </option>
                  ))}
                </select>
                {isTranslating && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Translating...
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handlePlayAudio}
                disabled={isGeneratingAudio}
                className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-950 transition-colors hover:border-neutral-950 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    <span>{ui.preparingAudio}</span>
                  </>
                ) : isPlayingAudio ? (
                  <>
                    <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                    <span>{ui.stopAudio}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{ui.listenAloud}</span>
                  </>
                )}
              </button>
            </div>

            {translationError && (
              <p className="mt-2 text-xs text-neutral-700">{translationError}</p>
            )}
            {audioError && (
              <p className="mt-2 text-xs text-neutral-700">{audioError}</p>
            )}
          </div>

          {/* 3-Tab Navigation */}
          <div
            role="tablist"
            aria-label="Program guidance sections"
            className="mt-6 flex items-center gap-6 overflow-x-auto border-b border-neutral-200"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'eligibility'}
              onClick={() => setActiveTab('eligibility')}
              className={`pb-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'eligibility'
                  ? 'border-b-2 border-neutral-950 text-neutral-950'
                  : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-950'
              }`}
            >
              {ui.tabEligibility}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'checklist'}
              onClick={() => setActiveTab('checklist')}
              className={`pb-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'border-b-2 border-neutral-950 text-neutral-950'
                  : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-950'
              }`}
            >
              {ui.tabChecklist} ({progress.readyCount}/{progress.totalCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'guide'}
              onClick={() => setActiveTab('guide')}
              className={`pb-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-b-2 border-neutral-950 text-neutral-950'
                  : 'border-b-2 border-transparent text-neutral-500 hover:text-neutral-950'
              }`}
            >
              {ui.tabGuide}
            </button>
          </div>

          {/* Tab Panel 1: Eligibility */}
          {activeTab === 'eligibility' && (
            <div role="tabpanel" className="mt-6 space-y-6">
              {activeMatch && (
                <div className="border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-950">
                      {ui.whyMatches}
                    </span>
                    <span className="font-mono text-xs text-neutral-600 tabular-nums">
                      {activeMatch.eligibilityStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                    {activeMatch.plainLanguageReason}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-neutral-950">
                  {ui.officialCriteria}
                </h3>
                <div className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
                  {displayRules.map((rule) => {
                    const evalItem = activeMatch?.ruleEvaluations.find(
                      (r) => r.ruleId === rule.ruleId
                    );
                    const statusLabel = evalItem?.status ?? (rule.required ? 'Required' : 'Optional');
                    return (
                      <div
                        key={rule.ruleId}
                        className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:gap-4"
                      >
                        <div className="sm:col-span-4">
                          <span className="font-mono text-xs text-neutral-500">
                            {rule.ruleId}
                          </span>
                          <p className="mt-0.5 text-sm font-semibold text-neutral-950">
                            {rule.label}
                          </p>
                        </div>
                        <div className="sm:col-span-6">
                          <p className="text-sm leading-relaxed text-neutral-700">
                            {evalItem?.explanation ?? rule.description}
                          </p>
                        </div>
                        <div className="flex sm:justify-end sm:col-span-2">
                          <span className="inline-flex h-fit items-center gap-1.5 border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-900 whitespace-nowrap">
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <p className="text-xs font-semibold text-neutral-500">
                  {ui.groundedCitation} ({activeService.docCode})
                </p>
                <p className="mt-1.5 font-serif text-sm italic leading-relaxed text-neutral-700">
                  “{activeMatch?.groundedCitationQuote ?? activeService.officialExcerpt}”
                </p>
              </div>
            </div>
          )}

          {/* Tab Panel 2: Document Checklist */}
          {activeTab === 'checklist' && (
            <div role="tabpanel" className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 bg-neutral-50 p-4">
                <div>
                  <p className="text-xs font-semibold text-neutral-950">
                    {ui.documentReadiness}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    {activeMatch?.customizedChecklistNote ??
                      'Check off each record below as you gather it. Progress saves automatically.'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-neutral-950 tabular-nums">
                    {progress.readyCount} / {progress.totalCount} (
                    {progress.percent}%)
                  </p>
                  <div className="mt-1.5 h-1.5 w-36 bg-neutral-200">
                    <div
                      className="h-full bg-neutral-950 transition-all duration-200"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                {displayDocs.map((doc) => {
                  const isChecked = checkedDocs.includes(doc.id);
                  return (
                    <label
                      key={doc.id}
                      className="flex cursor-pointer items-start gap-4 py-4 transition-colors hover:bg-neutral-50/70"
                    >
                      <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-neutral-950 bg-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleDoc(activeService.id, doc.id)}
                          aria-label={`Mark ${doc.name} as ready`}
                          className="peer sr-only"
                        />
                        {isChecked && (
                          <span className="flex h-full w-full items-center justify-center bg-neutral-950 text-white">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </span>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isChecked
                                ? 'text-neutral-500 line-through'
                                : 'text-neutral-950'
                            }`}
                          >
                            {doc.name}
                          </span>
                          <span className="font-mono text-xs text-neutral-500">
                            {doc.processingTime}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-700">
                          <span className="font-semibold text-neutral-900">
                            {ui.acceptedProof}{' '}
                          </span>
                          {doc.acceptedProofs}
                        </p>
                        <p className="mt-1 text-xs text-neutral-600">
                          <span className="font-semibold text-neutral-800">
                            {ui.whereToObtain}{' '}
                          </span>
                          {doc.whereToObtain}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Panel 3: Official Application Guide + Grounded Q&A */}
          {activeTab === 'guide' && (
            <div role="tabpanel" className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 bg-neutral-50 p-4">
                <div>
                  <p className="text-xs font-semibold text-neutral-950">
                    {ui.officialFilingPortal}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    {ui.officialPortalDesc}
                  </p>
                </div>
                <a
                  href={activeService.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-neutral-950 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 whitespace-nowrap shrink-0"
                >
                  <span>{ui.openOfficialPortal}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>

              <ol className="space-y-4">
                {displaySteps.map((step) => (
                  <li
                    key={step.stepNumber}
                    className="border border-neutral-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-mono text-xs font-medium text-neutral-500">
                        {ui.stepPrefix} {String(step.stepNumber).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-medium text-neutral-600">
                        {step.portalActionLabel}
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-base font-semibold text-neutral-950">
                      {step.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                      {step.instruction}
                    </p>
                    <p className="mt-3 border-t border-neutral-100 pt-2.5 text-xs text-neutral-600">
                      <span className="font-semibold text-neutral-900">
                        {ui.avoidMistake}{' '}
                      </span>
                      {step.pitfallWarning}
                    </p>
                  </li>
                ))}
              </ol>

              {/* Grounded Follow-up Question Form */}
              <div className="border border-neutral-300 bg-neutral-50 p-5">
                <h4 className="text-sm font-semibold text-neutral-950">
                  {ui.askQuestionTitle}
                </h4>
                <p className="mt-1 text-xs text-neutral-600">
                  {activeService.docCode} · {language}
                </p>

                <form
                  onSubmit={handleAskQuestion}
                  className="mt-3 flex flex-col gap-2.5 sm:flex-row"
                >
                  <label htmlFor="grounded-qa-input" className="sr-only">
                    Ask a question about {activeService.title}
                  </label>
                  <input
                    id="grounded-qa-input"
                    type="text"
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    placeholder="e.g., What if my family income certificate is from last year or Aadhaar bank seeding is pending?"
                    className="flex-1 border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!qaInput.trim() || isAsking}
                    className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {isAsking ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        <span>{ui.checkingRecord}</span>
                      </>
                    ) : (
                      <>
                        <span>{ui.askOfficialGuide}</span>
                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>

                {qaError && (
                  <p className="mt-2.5 text-xs text-neutral-700">{qaError}</p>
                )}

                {activeQa && (
                  <div className="mt-4 border border-neutral-200 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-500">
                      <span>{activeQa.citedDocCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeQa.citedSection}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-900">
                      {activeQa.answer}
                    </p>
                    <p className="mt-2.5 border-t border-neutral-100 pt-2 text-xs font-medium text-neutral-800">
                      {ui.nextStep} {activeQa.nextAction}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
