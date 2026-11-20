import { useEffect, useState } from 'react';
import { DirectoryView } from './components/DirectoryView';
import { Header, type AppView } from './components/Header';
import { LatestUpdatesPanel } from './components/LatestUpdatesPanel';
import { OfficialSourcesView } from './components/OfficialSourcesView';
import { SavedChecklistView } from './components/SavedChecklistView';
import { ServiceWorkspace } from './components/ServiceWorkspace';
import { SituationDesk } from './components/SituationDesk';
import { SourceModal } from './components/SourceModal';
import { rankServicesDeterministic, toggleChecklistItem } from './lib/eligibility';
import type {
  LatestUpdatesResponse,
  OfficialService,
  SituationAnalysisResponse,
} from './types/civic';

const STORAGE_KEY_CHECKLIST = 'civicledger_checklist_v1';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('navigator');
  const [situationText, setSituationText] = useState('');
  const [language, setLanguage] = useState('English');

  const [analysis, setAnalysis] = useState<SituationAnalysisResponse | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [sourceModalService, setSourceModalService] =
    useState<OfficialService | null>(null);

  const [latestUpdates, setLatestUpdates] =
    useState<LatestUpdatesResponse | null>(null);
  const [isRefreshingUpdates, setIsRefreshingUpdates] = useState(false);
  const [updatesError, setUpdatesError] = useState<string | null>(null);
  const [updatesFocusQuery, setUpdatesFocusQuery] = useState('');

  const [checklistMap, setChecklistMap] = useState<Record<string, string[]>>(
    () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY_CHECKLIST);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch {
        return {};
      }
    }
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_CHECKLIST,
        JSON.stringify(checklistMap)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [checklistMap]);

  const savedChecklistCount = Object.values(checklistMap).filter(
    (docs) => docs.length > 0
  ).length;

  const runAnalysis = async (textToAnalyze: string, targetLang = language) => {
    const trimmed = textToAnalyze.trim();
    if (!trimmed) return;

    setActiveView('navigator');
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: trimmed,
          language: targetLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to analyze your situation.');
      }

      const typed = data as SituationAnalysisResponse;
      setAnalysis(typed);
      setSelectedServiceId(typed.matches[0]?.serviceId ?? null);

      window.setTimeout(() => {
        document
          .getElementById('workspace-anchor')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } catch (err) {
      setAnalysisError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while evaluating eligibility.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refreshLiveUpdates = async (focusOverride?: string) => {
    const query = (focusOverride ?? updatesFocusQuery).trim();
    setIsRefreshingUpdates(true);
    setUpdatesError(null);

    try {
      const res = await fetch('/api/latest-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusQuery: query,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to fetch live student updates.');
      }
      setLatestUpdates(data as LatestUpdatesResponse);
    } catch (err) {
      setUpdatesError(
        err instanceof Error
          ? err.message
          : 'Failed to search live official Indian student updates.'
      );
    } finally {
      setIsRefreshingUpdates(false);
    }
  };

  const handleOpenLiveUpdates = (contextText?: string) => {
    const trimmed = (contextText ?? '').trim();
    if (trimmed) {
      setUpdatesFocusQuery(trimmed);
    }
    setActiveView('updates');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (trimmed || (!latestUpdates && !isRefreshingUpdates)) {
      void refreshLiveUpdates(trimmed || undefined);
    }
  };

  const handleNavigate = (view: AppView) => {
    if (view === 'updates') {
      handleOpenLiveUpdates();
      return;
    }
    setActiveView(view);
  };

  const handleUseRuleFallback = () => {
    const matches = rankServicesDeterministic(situationText);
    setAnalysisError(null);
    setAnalysis({
      situationSummary:
        'Showing deterministic rule matches from the verified Indian student portal corpus.',
      detectedLanguage: 'English',
      followUpQuestions: [],
      matches,
    });
    setSelectedServiceId(matches[0]?.serviceId ?? null);
  };

  const handleSelectFollowUp = (questionPrompt: string) => {
    const augmented = `${situationText.trim()} (Context: ${questionPrompt})`;
    setSituationText(augmented);
    void runAnalysis(augmented, language);
  };

  const handleResetCase = () => {
    setActiveView('navigator');
    setSituationText('');
    setAnalysis(null);
    setAnalysisError(null);
    setSelectedServiceId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenServiceInNavigator = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setAnalysisError(null);
    setActiveView('navigator');
    window.setTimeout(() => {
      document
        .getElementById('workspace-anchor')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleToggleDoc = (serviceId: string, docId: string) => {
    setChecklistMap((prev) => toggleChecklistItem(prev, serviceId, docId));
  };

  const handleClearServiceChecklist = (serviceId: string) => {
    setChecklistMap((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950">
      <Header
        activeView={activeView}
        onNavigate={handleNavigate}
        onResetCase={handleResetCase}
        savedCount={savedChecklistCount}
      />

      <main className="flex-1">
        {activeView === 'navigator' && (
          <>
            <SituationDesk
              situationText={situationText}
              onSituationChange={setSituationText}
              language={language}
              onLanguageChange={setLanguage}
              onSubmitSituation={(override) =>
                void runAnalysis(override ?? situationText, language)
              }
              isAnalyzing={isAnalyzing}
              onBrowseDirectory={() => setActiveView('directory')}
              onOpenLiveUpdates={() => handleOpenLiveUpdates(situationText)}
            />
            <div id="workspace-anchor">
              <ServiceWorkspace
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
                onRetryAnalysis={() => void runAnalysis(situationText, language)}
                onUseRuleFallback={handleUseRuleFallback}
                selectedServiceId={selectedServiceId}
                onSelectService={setSelectedServiceId}
                checklistMap={checklistMap}
                onToggleDoc={handleToggleDoc}
                language={language}
                onLanguageChange={setLanguage}
                onSelectFollowUp={handleSelectFollowUp}
                onInspectSource={setSourceModalService}
                onOpenLiveUpdates={handleOpenLiveUpdates}
                situationText={situationText}
              />
            </div>
          </>
        )}

        {activeView === 'updates' && (
          <LatestUpdatesPanel
            updates={latestUpdates}
            isLoading={isRefreshingUpdates}
            error={updatesError}
            onRefresh={(focusQuery) => {
              setUpdatesFocusQuery(focusQuery);
              void refreshLiveUpdates(focusQuery);
            }}
            language={language}
            initialFocus={updatesFocusQuery}
          />
        )}

        {activeView === 'directory' && (
          <DirectoryView onSelectService={handleOpenServiceInNavigator} />
        )}

        {activeView === 'checklist' && (
          <SavedChecklistView
            checklistMap={checklistMap}
            onOpenService={handleOpenServiceInNavigator}
            onClearServiceChecklist={handleClearServiceChecklist}
            onExploreDirectory={() => setActiveView('directory')}
          />
        )}

        {activeView === 'sources' && (
          <OfficialSourcesView onOpenService={handleOpenServiceInNavigator} />
        )}
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-6 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-serif font-medium text-neutral-950">
              CivicLedger
            </span>{' '}
            · Indian Student Services &amp; Portal Navigator. Always verify final
            deadlines on official .gov.in / .org portals.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleOpenLiveUpdates()}
              className="hover:text-neutral-950 cursor-pointer"
            >
              Live Updates
            </button>
            <button
              type="button"
              onClick={() => setActiveView('directory')}
              className="hover:text-neutral-950 cursor-pointer"
            >
              Portals
            </button>
            <button
              type="button"
              onClick={() => setActiveView('sources')}
              className="hover:text-neutral-950 cursor-pointer"
            >
              Verified Sources
            </button>
          </div>
        </div>
      </footer>

      <SourceModal
        service={sourceModalService}
        onClose={() => setSourceModalService(null)}
      />
    </div>
  );
}
