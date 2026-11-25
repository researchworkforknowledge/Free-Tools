import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ConverterToolConfig } from '../data/tools';

interface SeoGuideProps {
  tool: ConverterToolConfig;
}

export function SeoGuide({ tool }: SeoGuideProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { seoGuide } = tool;

  return (
    <section aria-labelledby="guide-heading" className="bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-8">
          <h2 id="guide-heading" className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
            How to Use This Tool
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {seoGuide.intro}
          </p>

          <ol className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {seoGuide.howToUse.map((step, idx) => (
              <li
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <span className="font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                  0{idx + 1}.
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-b border-slate-200 py-8">
          <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
            Common Use Cases
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3">
            {seoGuide.useCases.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8">
          <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
            {seoGuide.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white first:rounded-t-xl last:rounded-b-xl">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 py-3.5 text-sm leading-relaxed text-slate-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
