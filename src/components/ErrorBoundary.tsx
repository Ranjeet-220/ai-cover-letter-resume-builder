'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled component error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-rose-500/30 text-zinc-100 shadow-2xl flex flex-col items-center text-center my-6 animate-fade-in">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4 shadow-lg shadow-rose-950/40">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">
            {this.props.fallbackTitle || 'Component Error'}
          </h3>

          <p className="text-xs text-zinc-400 max-w-md mb-4 leading-relaxed">
            An unexpected error occurred while rendering this section. You can try recovering by clicking the button below.
          </p>

          {this.state.error?.message && (
            <div className="max-w-md w-full p-3 rounded-xl bg-black/60 border border-zinc-800 text-rose-300 font-mono text-[11px] break-words text-left mb-5">
              {this.state.error.message}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition shadow-lg cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 font-semibold text-xs hover:bg-zinc-800 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
