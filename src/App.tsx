import { DataTable } from "@/components/Tables/LLMTable/DataTable";
import llmData from '@/data/llm-data.json';
import { useEffect, useState } from "react";

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme-mode';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between px-3 py-1 bg-slate-800 text-slate-300 dark:bg-slate-950 dark:text-slate-400 shrink-0 border-b border-slate-700/60 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-[13px] font-semibold text-white tracking-tight">
            LLM Comparison
          </h1>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {llmData.length} models
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
          <button
            type="button"
            onClick={() => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
            className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-600 bg-slate-700 text-slate-200 transition-colors hover:bg-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {themeMode === 'dark' ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6.75 6.75 0 1 0 9 9A9 9 0 1 1 12 3z" />
              </svg>
            )}
          </button>
          <span>Updated May 2, 2026</span>
          <a
            href="https://github.com/nuxdie/ai-pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white dark:text-slate-500 dark:hover:text-slate-200 transition-colors"
          >
            Submit a correction &rarr;
          </a>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <DataTable data={llmData} />
      </main>
    </div>
  );
}
