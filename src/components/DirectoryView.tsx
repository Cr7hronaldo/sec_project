import React, { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, Search } from 'lucide-react';
import { OFFICIAL_SERVICES } from '../data/officialServices';
import type { ServiceCategory } from '../types/civic';

interface DirectoryViewProps {
  onSelectService: (serviceId: string) => void;
}

const CATEGORIES: ServiceCategory[] = [
  'All',
  'Scholarships',
  'Benefits & Food',
  'Certificates & ID',
  'Healthcare',
  'Employment & Aid',
];

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  onSelectService,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OFFICIAL_SERVICES.filter((svc) => {
      const catOk =
        selectedCategory === 'All' || svc.category === selectedCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        svc.title.toLowerCase().includes(q) ||
        svc.summary.toLowerCase().includes(q) ||
        svc.issuingAuthority.toLowerCase().includes(q) ||
        svc.portalDomain.toLowerCase().includes(q) ||
        svc.docCode.toLowerCase().includes(q) ||
        svc.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, query]);

  return (
    <section className="mx-auto max-w-[1240px] px-6 py-10 lg:py-12">
      <div className="border-b border-neutral-200 pb-6">
        <p className="text-xs text-neutral-500">
          Verified Indian Student Portals · {OFFICIAL_SERVICES.length} Official Entries
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
          Official Portals &amp; Schemes Directory
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Direct official portals and verified eligibility guides for Indian
          scholarships, food &amp; hostel benefits, DigiLocker certificates,
          Ayushman healthcare, and paid internships or employment exchanges.
        </p>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter programs by category"
            className="flex flex-wrap items-center gap-1.5"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-950'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <label htmlFor="directory-search" className="sr-only">
              Search Indian student portals
            </label>
            <input
              id="directory-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search NSP, AICTE, DigiLocker, PM-JAY..."
              className="w-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-b border-neutral-200 py-14 text-center">
          <p className="font-serif text-xl text-neutral-950">
            No matching portals found
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Try clearing your search term or switching back to All categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setQuery('');
            }}
            className="mt-4 border border-neutral-950 px-4 py-2 text-xs font-medium text-neutral-950 hover:bg-neutral-950 hover:text-white cursor-pointer"
          >
            Reset Directory Filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 border-b border-neutral-200">
          {filtered.map((svc, idx) => (
            <article
              key={svc.id}
              className="grid grid-cols-1 items-start gap-4 py-6 lg:grid-cols-12 lg:items-center"
            >
              <div className="lg:col-span-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="font-mono tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{svc.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{svc.portalDomain}</span>
                </div>
                <h2 className="mt-1 font-serif text-xl font-medium text-neutral-950">
                  {svc.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  {svc.summary}
                </p>
              </div>

              <div className="lg:col-span-3">
                <p className="text-xs text-neutral-500">Support / Benefit</p>
                <p className="mt-0.5 text-sm font-semibold text-neutral-950 tabular-nums">
                  {svc.benefitEstimate}
                </p>
                <p className="mt-1.5 text-xs text-neutral-500">
                  {svc.requiredDocuments.length} docs ·{' '}
                  {svc.applicationSteps.length} steps
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:col-span-3 lg:justify-end">
                <a
                  href={svc.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-950 hover:border-neutral-950 whitespace-nowrap shrink-0"
                >
                  <span>Portal</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => onSelectService(svc.id)}
                  className="inline-flex items-center gap-1.5 bg-neutral-950 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Open Guide</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
