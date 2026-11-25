import { useCallback, useEffect, useState } from 'react';
import { getToolByPath } from './data/tools';
import { Header } from './components/Header';
import { ConverterWorkspace } from './components/ConverterWorkspace';
import { SeoGuide } from './components/SeoGuide';
import { Footer } from './components/Footer';

function syncClientDocumentMeta(pathname: string) {
  const tool = getToolByPath(pathname);
  document.title = tool.metaTitle;

  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.setAttribute('content', content);
    }
  };

  setMeta('meta[name="description"]', tool.metaDescription);
  setMeta('meta[property="og:title"]', tool.metaTitle);
  setMeta('meta[property="og:description"]', tool.metaDescription);
  setMeta('meta[name="twitter:title"]', tool.metaTitle);
  setMeta('meta[name="twitter:description"]', tool.metaDescription);
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const currentTool = getToolByPath(currentPath);

  useEffect(() => {
    syncClientDocumentMeta(currentTool.slug);
  }, [currentTool.slug]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = useCallback((slug: string) => {
    if (window.location.pathname !== slug) {
      window.history.pushState({}, '', slug);
      setCurrentPath(slug);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header currentSlug={currentTool.slug} onNavigate={handleNavigate} />
      <main className="flex-1">
        <ConverterWorkspace tool={currentTool} />
        <SeoGuide tool={currentTool} />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
