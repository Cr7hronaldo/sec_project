import React from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { OFFICIAL_SERVICES } from '../data/officialServices';
import { computeChecklistProgress } from '../lib/eligibility';

interface SavedChecklistViewProps {
  checklistMap: Record<string, string[]>;
  onOpenService: (serviceId: string) => void;
  onClearServiceChecklist: (serviceId: string) => void;
  onExploreDirectory: () => void;
}

export const SavedChecklistView: React.FC<SavedChecklistViewProps> = ({
  checklistMap,
  onOpenService,
  onClearServiceChecklist,
  onExploreDirectory,
}) => {
  const activeEntries = OFFICIAL_SERVICES.filter(
    (svc) => (checklistMap[svc.id]?.length ?? 0) > 0
  );

  return (
    <section className="mx-auto max-w-[1240px] px-6 py-10 lg:py-12">
      <div className="border-b border-neutral-200 pb-6">
        <p className="text-xs text-neutral-500">
          Personal Preparation Ledger · Saved Locally
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
          My Document Checklists
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Track the official documents you have gathered for each program before
          submitting your application. Your progress remains saved across reloads.
        </p>
      </div>

      {activeEntries.length === 0 ? (
        <div className="border-b border-neutral-200 py-16 text-center">
          <h2 className="font-serif text-2xl font-medium text-neutral-950">
            No checklists started yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
            Analyze your situation in the Navigator or open any program from the
            Directory and check off a required document to track it here.
          </p>
          <button
            type="button"
            onClick={onExploreDirectory}
            className="mt-6 bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 cursor-pointer"
          >
            Browse Public Services
          </button>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 border-b border-neutral-200">
          {activeEntries.map((svc) => {
            const checked = checklistMap[svc.id] ?? [];
            const progress = computeChecklistProgress(svc, checked);
            const missingDocs = svc.requiredDocuments.filter(
              (d) => !checked.includes(d.id)
            );

            return (
              <div
                key={svc.id}
                className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-12 lg:items-center"
              >
                <div className="lg:col-span-5">
                  <p className="font-mono text-xs text-neutral-500">
                    {svc.docCode} · {svc.category}
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-medium text-neutral-950">
                    {svc.title}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-600">
                    {svc.issuingAuthority}
                  </p>
                </div>

                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="font-semibold text-neutral-950">
                      {progress.readyCount} / {progress.totalCount} documents ready
                    </span>
                    <span className="text-neutral-500">{progress.percent}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-neutral-200">
                    <div
                      className="h-full bg-neutral-950"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">
                    {missingDocs.length === 0
                      ? 'All required documents checked ready for submission.'
                      : `Remaining: ${missingDocs.map((d) => d.name).join(', ')}`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:col-span-3 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenService(svc.id)}
                    className="inline-flex items-center gap-2 bg-neutral-950 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Resume Checklist</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onClearServiceChecklist(svc.id)}
                    aria-label={`Clear checklist progress for ${svc.title}`}
                    className="inline-flex items-center gap-1.5 border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
