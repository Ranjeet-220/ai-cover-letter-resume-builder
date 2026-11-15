'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home, Trash2 } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled route error in CoverCraft Studio:', error);
  }, [error]);

  const handleRetry = () => {
    if (typeof unstable_retry === 'function') {
      unstable_retry();
    } else {
      reset();
    }
  };

  const handleClearCacheAndReset = () => {
    try {
      if (typeof window !== 'undefined') {
        const preserveKeys = ['covercraft_gemini_api_key', 'covercraft_anthropic_api_key', 'covercraft_theme_mode', 'covercraft_accent_preset'];
        const savedSettings: Record<string, string> = {};
        preserveKeys.forEach((k) => {
          const val = localStorage.getItem(k);
          if (val) savedSettings[k] = val;
        });

        sessionStorage.clear();
        localStorage.clear();

        Object.entries(savedSettings).forEach(([k, v]) => {
          localStorage.setItem(k, v);
        });
      }
    } catch (e) {
      console.warn('Could not clear storage', e);
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Error icon badge */}
        <div className="relative p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-6 shadow-xl shadow-rose-950/50">
          <AlertCircle className="w-10 h-10 animate-pulse" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Something went wrong
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          CoverCraft Studio encountered an unexpected problem while rendering this page. Your saved resumes and cover letters in local storage are safe.
        </p>

        {/* Technical Error Details (Safe for display) */}
        <div className="w-full p-4 rounded-2xl bg-black border border-zinc-800/80 text-left mb-6 font-mono text-xs">
          <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 flex items-center justify-between">
            <span>Error Details</span>
            {error.digest && (
              <span className="text-zinc-600 font-normal">Digest: {error.digest.slice(0, 12)}...</span>
            )}
          </div>
          <p className="text-rose-300 break-words text-[11px] leading-relaxed">
            {error.message || 'An unexpected runtime error occurred.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Studio Home</span>
          </button>
        </div>

        {/* Fallback reset action */}
        <div className="mt-6 pt-6 border-t border-zinc-900 w-full flex items-center justify-between text-[11px] text-zinc-500">
          <span>Persisting crash after reload?</span>
          <button
            type="button"
            onClick={handleClearCacheAndReset}
            className="text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <Trash2 className="w-3 h-3" />
            <span>Reset Corrupt Session State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
