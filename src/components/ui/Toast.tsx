'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastMessage = { id, type, title, description };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-slide-up transition-all backdrop-blur-md ${
                isError
                  ? 'bg-zinc-950 border border-rose-500/40 text-rose-100 shadow-rose-950/40'
                  : isSuccess
                  ? 'bg-zinc-950 border border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-black/60'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-xl shrink-0 mt-0.5 border ${
                    isError
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : isSuccess
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-sky-400'
                  }`}
                >
                  {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                  {isError && <AlertCircle className="w-4 h-4" />}
                  {!isSuccess && !isError && <Info className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold leading-tight text-white">{toast.title}</h4>
                  {toast.description && (
                    <p
                      className={`text-[11px] mt-1 leading-snug break-words ${
                        isError ? 'text-rose-200/90' : 'text-zinc-400'
                      }`}
                    >
                      {toast.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                className="text-zinc-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showToast: (title: string, description?: string, type?: ToastType) => {
        console.log(`[Toast] [${type || 'success'}] ${title} - ${description || ''}`);
      },
    };
  }
  return context;
}
