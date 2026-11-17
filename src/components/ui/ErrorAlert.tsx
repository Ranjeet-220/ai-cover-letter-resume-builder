'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X, RefreshCw } from 'lucide-react';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

interface ErrorAlertProps {
  title?: string;
  message: string;
  variant?: AlertVariant;
  onDismiss?: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorAlert({
  title,
  message,
  variant = 'error',
  onDismiss,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}: ErrorAlertProps) {
  if (!message) return null;

  const config = {
    error: {
      container: 'bg-rose-950/40 border-rose-500/40 text-rose-200 dark:bg-rose-950/40 dark:border-rose-500/40 dark:text-rose-200',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: AlertCircle,
      defaultTitle: 'Error',
      button: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/30',
    },
    warning: {
      container: 'bg-amber-950/40 border-amber-500/40 text-amber-200 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-200',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      defaultTitle: 'Notice',
      button: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/30',
    },
    info: {
      container: 'bg-sky-950/40 border-sky-500/40 text-sky-200 dark:bg-sky-950/40 dark:border-sky-500/40 dark:text-sky-200',
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      icon: Info,
      defaultTitle: 'Information',
      button: 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border-sky-500/30',
    },
    success: {
      container: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-200',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      defaultTitle: 'Success',
      button: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-500/30',
    },
  }[variant];

  const Icon = config.icon;
  const headerTitle = title ?? (variant === 'error' ? 'Notice' : config.defaultTitle);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 backdrop-blur-sm transition-all animate-fade-in ${config.container} ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className={`p-1.5 rounded-xl border shrink-0 mt-0.5 ${config.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          {headerTitle && (
            <h4 className="font-bold uppercase tracking-wider text-[11px] leading-snug mb-0.5">
              {headerTitle}
            </h4>
          )}
          <p className="leading-relaxed break-words text-[12px] opacity-95">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${config.button}`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>{retryLabel}</span>
            </button>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 transition cursor-pointer hover:bg-white/10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
