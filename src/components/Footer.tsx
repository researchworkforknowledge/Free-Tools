import { useState } from 'react';
import { ArrowUpRight, Check, Share2, Table2 } from 'lucide-react';
import { CONVERTER_TOOLS } from '../data/tools';

interface FooterProps {
  onNavigate: (slug: string) => void;
}

const UPCOMING_TOOLS = [
  {
    name: 'Document & Rent Agreement Red-Flag Checker',
    description: 'Spot hidden lock-in clauses, deposit traps, and notice-period risks in rental agreements.',
    href: '#document-red-flag-checker',
  },
  {
    name: 'Resume ATS Keyword Matcher',
    description: 'Compare your resume against any job description to surface missing skills and phrasing.',
    href: '#resume-ats-keyword-matcher',
  },
];

export function Footer({ onNavigate }: FooterProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      setCopiedLink(false);
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Brand & Share */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
                <Table2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-bold tracking-tight">CleanSheet AI</span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
              Fast, ad-free unstructured text to spreadsheet converter. Processed in memory with zero accounts and zero data retention.
            </p>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">Link Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  <span>Copy Link to Share</span>
                </>
              )}
            </button>
          </div>

          {/* All 6 Converters */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold text-slate-900">CleanSheet AI Converters</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {CONVERTER_TOOLS.map((tool) => (
                <li key={tool.slug}>
                  <a
                    href={tool.slug}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-slate-600 transition-colors hover:text-emerald-700"
                  >
                    {tool.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem Links */}
          <div id="more-free-tools" className="lg:col-span-4">
            <h3 className="text-xs font-semibold text-slate-900">More Free Ad-Free Tools by Us</h3>
            <ul className="mt-3 space-y-3">
              {UPCOMING_TOOLS.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group block rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-emerald-300"
                  >
                    <div className="flex items-center justify-between gap-2 text-sm font-medium text-slate-800 group-hover:text-emerald-700">
                      <span>{item.name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-emerald-600" aria-hidden="true" />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>CleanSheet AI · Free, Ad-Free Data Utility</span>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" className="hover:text-slate-800 transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
