import { useState } from 'react';
import { Check, Menu, Share2, Table2, X } from 'lucide-react';
import { CONVERTER_TOOLS } from '../data/tools';

interface HeaderProps {
  currentSlug: string;
  onNavigate: (slug: string) => void;
}

export function Header({ currentSlug, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    onNavigate(slug);
    setMobileMenuOpen(false);
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setCopiedUrl(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="flex items-center gap-2.5 text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Table2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">CleanSheet AI</span>
        </a>

        <nav aria-label="Converter tools" className="hidden lg:flex items-center gap-5">
          {CONVERTER_TOOLS.map((tool) => {
            const isActive = tool.slug === currentSlug;
            return (
              <a
                key={tool.slug}
                href={tool.slug}
                onClick={(e) => handleLinkClick(e, tool.slug)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded ${
                  isActive
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tool.navLabel}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[15px] h-0.5 bg-emerald-600"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShareClick}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {copiedUrl ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>Share Tool</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close converter menu' : 'Open converter menu'}
            className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile converter tools"
          className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden"
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CONVERTER_TOOLS.map((tool) => {
              const isActive = tool.slug === currentSlug;
              return (
                <a
                  key={tool.slug}
                  href={tool.slug}
                  onClick={(e) => handleLinkClick(e, tool.slug)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{tool.navLabel}</span>
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
