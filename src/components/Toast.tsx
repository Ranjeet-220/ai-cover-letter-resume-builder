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
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-2xl bg-black border border-zinc-800 text-white shadow-2xl flex items-start justify-between gap-3 animate-slide-up transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-full bg-zinc-900 text-white shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-white" />}
                {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-zinc-300" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-zinc-400" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">{toast.title}</h4>
                {toast.description && (
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{toast.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white transition p-0.5 rounded-lg hover:bg-zinc-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showToast: (title: string, description?: string) => {
        console.log(`[Toast] ${title} - ${description || ''}`);
      },
    };
  }
  return context;
}
