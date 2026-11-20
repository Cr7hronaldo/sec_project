import React, { useState } from 'react';
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { LatestUpdatesResponse, ServiceCategory } from '../types/civic';

interface LatestUpdatesPanelProps {
  updates: LatestUpdatesResponse | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: (focusQuery: string) => void;
  language: string;
  initialFocus?: string;
}

const FOCUS_PRESETS: Array<{ label: string; category: ServiceCategory; query: string }> = [
  {
    label: 'All Student Opportunities',
    category: 'All',
    query:
      'Latest Indian student scholarships (NSP, AICTE, PM-USP), NFSA ration/hostel food aid, DigiLocker certificates, Ayushman PM-JAY healthcare, and PM Internship / NCS jobs',
  },
  {
    label: 'Scholarships (NSP / AICTE)',
    category: 'Scholarships',
    query:
      'Latest 2026-2027 Indian student scholarships open on NSP scholarships.gov.in, PM-USP, AICTE Pragati Saksham, UGC, and Vidya Lakshmi',
  },
  {
    label: 'Food & Hostel Benefits',
    category: 'Benefits & Food',
    query:
      'Latest Indian student hostel mess subsidy, myScheme student welfare stipends, and NFSA One Nation One Ration Card updates',
  },
  {
    label: 'Certificates & DigiLocker',
    category: 'Certificates & ID',
    query:
      'Latest DigiLocker, State e-District income caste domicile certificate updates, and ABC / APAAR student ID announcements in India',
  },
  {
    label: 'Healthcare (PM-JAY)',
    category: 'Healthcare',
    query:
      'Latest Ayushman Bharat PM-JAY health card eligibility and beneficiary portal updates for Indian families and youth',
  },
  {
    label: 'Internships & Jobs',
    category: 'Employment & Aid',
    query:
      'Latest PM Internship Scheme pminternship.mca.gov.in rounds, National Career Service ncs.gov.in jobs, and Skill India Digital PMKVY courses',
  },
];

export const LatestUpdatesPanel: React.FC<LatestUpdatesPanelProps> = ({
  updates,
  isLoading,
  error,
  onRefresh,
  language,
  initialFocus = '',
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('All Student Opportunities');
  const [customQuery, setCustomQuery] = useState(initialFocus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activePreset = FOCUS_PRESETS.find((p) => p.label === selectedPreset);
    const query = customQuery.trim() || activePreset?.query || '';
    onRefresh(query);
  };

  const formatTimestamp = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  return (
    <section className="mx-auto max-w-[1240px] px-6 py-10 lg:py-12">
      <div className="border-b border-neutral-200 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>Live Web Grounding · Gemini Search</span>
          <span aria-hidden="true">·</span>
          <span>Indian Student Portals</span>
          <span aria-hidden="true">·</span>
          <span>Language: {language}</span>
        </div>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
              Latest Student Opportunities &amp; Portal Updates
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
              Refresh live web search results using Gemini to check current
              scholarship deadlines, NSP/AICTE announcements, food &amp; hostel
              benefits, certificate portals, Ayushman PM-JAY updates, and paid
              internships across India.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const activePreset = FOCUS_PRESETS.find(
                (p) => p.label === selectedPreset
              );
              onRefresh(customQuery.trim() || activePreset?.query || '');
            }}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-400 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>Searching Official Portals...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Refresh Latest Updates</span>
              </>
            )}
          </button>
        </div>

        {/* Category Focus & Custom Query Bar */}
        <div className="mt-6 space-y-3">
          <div
            role="group"
            aria-label="Choose update topic"
            className="flex flex-wrap items-center gap-1.5"
          >
            {FOCUS_PRESETS.map((preset) => {
              const active = selectedPreset === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(preset.label);
                    setCustomQuery('');
                    onRefresh(preset.query);
                  }}
                  disabled={isLoading}
                  className={`border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-950'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <label htmlFor="live-updates-query" className="sr-only">
                Search specific Indian student schemes or state updates
              </label>
              <input
                id="live-updates-query"
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Optional: search a specific state or scheme (e.g., Maharashtra MahaDBT, UP Scholarship, BTech internship 2026)..."
                className="w-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="border border-neutral-950 bg-white px-4 py-2 text-xs font-medium text-neutral-950 hover:bg-neutral-950 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search Topic
            </button>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 border border-neutral-200 bg-neutral-50 p-5">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-950" aria-hidden="true" />
            <p className="text-sm font-medium text-neutral-950">
              Searching live Indian government and education portals for latest
              deadlines and openings...
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-44 animate-pulse border border-neutral-200 bg-neutral-50"
              />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div
          role="alert"
          className="mt-8 border border-neutral-950 bg-neutral-50 p-6"
        >
          <p className="font-mono text-xs text-neutral-500">LIVE SEARCH NOTICE</p>
          <h2 className="mt-1 font-serif text-xl font-medium text-neutral-950">
            Could not refresh live developments
          </h2>
          <p className="mt-1.5 text-sm text-neutral-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              const activePreset = FOCUS_PRESETS.find(
                (p) => p.label === selectedPreset
              );
              onRefresh(customQuery.trim() || activePreset?.query || '');
            }}
            className="mt-4 bg-neutral-950 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty Initial State */}
      {!isLoading && !error && !updates && (
        <div className="mt-8 border border-neutral-200 bg-neutral-50 p-8 text-center">
          <h2 className="font-serif text-2xl font-medium text-neutral-950">
            Ready to fetch the latest 2026–2027 student updates
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-600">
            Click “Refresh Latest Updates” above to query live search via Gemini
            for newly opened scholarship windows, PM Internship rounds, food &amp;
            ration updates, and direct official portal links.
          </p>
          <button
            type="button"
            onClick={() => onRefresh(FOCUS_PRESETS[0].query)}
            className="mt-5 inline-flex items-center gap-2 bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Load Latest Updates Now</span>
          </button>
        </div>
      )}

      {/* Populated Live Results */}
      {!isLoading && !error && updates && (
        <div className="mt-8 space-y-8">
          <div className="border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-950">
                Latest Developments Summary
              </span>
              <span className="font-mono tabular-nums">
                Refreshed: {formatTimestamp(updates.refreshedAt)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-800">
              {updates.overviewNote}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {updates.opportunities.map((item, idx) => (
              <article
                key={`${item.title}-${idx}`}
                className="flex flex-col justify-between border border-neutral-200 bg-white p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                    <span className="font-mono tabular-nums">
                      {String(idx + 1).padStart(2, '0')} · {item.category}
                    </span>
                    <span className="font-mono font-medium text-neutral-900">
                      {item.statusOrDeadline}
                    </span>
                  </div>

                  <h2 className="mt-2 font-serif text-xl font-medium text-neutral-950">
                    {item.title}
                  </h2>

                  {item.eligibilityHighlight && (
                    <p className="mt-2 text-xs font-medium text-neutral-700">
                      Eligibility: {item.eligibilityHighlight}
                    </p>
                  )}

                  <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                  <span className="font-mono text-xs text-neutral-500 flex-1 min-w-0 truncate">
                    {item.portalName}
                  </span>
                  <a
                    href={item.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-neutral-950 px-3.5 py-2 text-xs font-medium text-white hover:bg-neutral-800 whitespace-nowrap shrink-0"
                  >
                    <span>Open Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {updates.groundingSources.length > 0 && (
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Verified Search Grounding Sources
              </h3>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {updates.groundingSources.map((src) => (
                  <li key={src.uri}>
                    <a
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 hover:decoration-neutral-950"
                    >
                      <span className="truncate max-w-[420px]">{src.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
