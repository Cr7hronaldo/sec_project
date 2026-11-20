import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { OFFICIAL_SERVICES } from '../data/officialServices';

interface OfficialSourcesViewProps {
  onOpenService: (serviceId: string) => void;
}

export const OfficialSourcesView: React.FC<OfficialSourcesViewProps> = ({
  onOpenService,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <section className="mx-auto max-w-[1240px] px-6 py-10 lg:py-12">
      <div className="grid grid-cols-1 gap-10 border-b border-neutral-200 pb-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="text-xs text-neutral-500">
            Source Verification · 2026 Indian Student Corpus
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
            Verified Official Documents &amp; Grounding
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
            Every eligibility breakdown, document list, and application answer on
            CivicLedger is grounded against this indexed set of statutory program
            excerpts and official agency guidelines. Inspect any record below or
            open its official portal directly.
          </p>
        </div>

        <div className="lg:col-span-5">
          <figure className="border border-neutral-200 bg-neutral-100">
            {!imgFailed ? (
              <img
                src="/src/assets/images/monochrome_archive_folio_1795157443605.jpg"
                alt="Monochrome still life of archival document folios and matte pen representing verified policy records"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="aspect-[4/3] w-full object-cover grayscale"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-neutral-950 p-6 text-white">
                <span className="font-serif text-xl">
                  Official Policy Archive
                </span>
              </div>
            )}
            <figcaption className="border-t border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-500">
              <span className="font-serif italic text-neutral-700">
                Fig. 2 — Official Portal Reference Corpus.
              </span>{' '}
              Indexed central &amp; state Indian student portal guidelines.
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="divide-y divide-neutral-200 border-b border-neutral-200">
        {OFFICIAL_SERVICES.map((svc) => (
          <article key={svc.id} className="py-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="font-mono font-medium text-neutral-950">
                  {svc.docCode}
                </span>
                <span aria-hidden="true">·</span>
                <span>{svc.issuingAuthority}</span>
                <span aria-hidden="true">·</span>
                <span>{svc.verifiedUpdated}</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onOpenService(svc.id)}
                  className="text-xs font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-600 cursor-pointer"
                >
                  Open Guided Checklist
                </button>
                <a
                  href={svc.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-neutral-950"
                >
                  <span>{svc.portalDomain}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </div>

            <h2 className="mt-2 font-serif text-xl font-medium text-neutral-950">
              {svc.title}
            </h2>

            <blockquote className="mt-3 max-w-4xl border border-neutral-200 bg-neutral-50 p-4 font-serif text-sm leading-relaxed text-neutral-800">
              “{svc.officialExcerpt}”
            </blockquote>
          </article>
        ))}
      </div>
    </section>
  );
};
