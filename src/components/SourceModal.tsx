import React, { useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import type { OfficialService } from '../types/civic';

interface SourceModalProps {
  service: OfficialService | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ service, onClose }) => {
  useEffect(() => {
    if (!service) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [service, onClose]);

  if (!service) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-neutral-950 bg-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <p className="font-mono text-xs text-neutral-500">
              {service.docCode} · {service.verifiedUpdated}
            </p>
            <h2
              id="source-modal-title"
              className="mt-1 font-serif text-2xl font-medium text-neutral-950"
            >
              {service.title}
            </h2>
            <p className="mt-1 text-xs text-neutral-600">
              {service.issuingAuthority}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close official source dialog"
            className="border border-neutral-200 p-2 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950 cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Verified Official Policy Excerpt
            </h3>
            <blockquote className="mt-2 border border-neutral-200 bg-neutral-50 p-4 font-serif text-[15px] leading-relaxed text-neutral-900">
              “{service.officialExcerpt}”
            </blockquote>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Statutory Rule Index
            </h3>
            <dl className="mt-2 divide-y divide-neutral-200 border-y border-neutral-200">
              {service.eligibilityRules.map((rule) => (
                <div
                  key={rule.ruleId}
                  className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-12 sm:gap-4"
                >
                  <dt className="font-mono text-xs text-neutral-500 sm:col-span-3">
                    {rule.ruleId} · {rule.required ? 'Required' : 'Optional'}
                  </dt>
                  <dd className="text-sm text-neutral-800 sm:col-span-9">
                    <span className="font-semibold">{rule.label}: </span>
                    {rule.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <a
              href={service.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-neutral-950 px-4 py-2.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              <span>Visit Official Agency Website</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="border border-neutral-300 px-4 py-2.5 text-xs font-medium text-neutral-900 hover:border-neutral-950 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
