import React from 'react';

export type AppView =
  | 'navigator'
  | 'updates'
  | 'directory'
  | 'checklist'
  | 'sources';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onResetCase: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onResetCase,
  savedCount,
}) => {
  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'navigator', label: 'Navigator' },
    { id: 'updates', label: 'Live Updates' },
    { id: 'directory', label: 'Portals' },
    {
      id: 'checklist',
      label: savedCount > 0 ? `Checklist (${savedCount})` : 'Checklist',
    },
    { id: 'sources', label: 'Sources' },
  ];

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('navigator')}
          className="font-serif text-xl font-semibold tracking-tight text-neutral-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 cursor-pointer"
        >
          CivicLedger
        </button>

        {/* Zone 2: 5 Single-line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1 text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 ${
                  isActive
                    ? 'border-b-2 border-neutral-950 font-semibold text-neutral-950'
                    : 'border-b-2 border-transparent font-medium text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onResetCase}
            className="bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
          >
            New Situation
          </button>
        </div>
      </div>

      {/* Compact Mobile Navigation Row */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center gap-5 overflow-x-auto border-t border-neutral-100 px-6 py-2.5"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'font-semibold text-neutral-950 underline underline-offset-4'
                  : 'font-medium text-neutral-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
