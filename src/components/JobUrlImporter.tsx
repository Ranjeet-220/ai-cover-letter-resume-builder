'use client';
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  X,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  FileText,
  Tag,
  ArrowRight,
  Clipboard,
  CheckCircle2,
} from 'lucide-react';

export interface ImportedJobData {
  jobTitle: string;
  companyName: string;
  location?: string;
  jobDescription: string;
  keySkills: string[];
}

export interface JobUrlImporterProps {
  isOpen?: boolean;
  onClose?: () => void;
  onImport: (data: ImportedJobData) => void;
  variant?: 'modal' | 'drawer' | 'inline';
  className?: string;
}

const SUPPORTED_PLATFORMS = [
  { name: 'LinkedIn', domain: 'linkedin.com', badgeClass: 'border-zinc-700 bg-zinc-900 text-zinc-100' },
  { name: 'Greenhouse', domain: 'greenhouse.io', badgeClass: 'border-zinc-700 bg-zinc-900 text-zinc-100' },
  { name: 'Lever', domain: 'lever.co', badgeClass: 'border-zinc-700 bg-zinc-900 text-zinc-100' },
  { name: 'Indeed', domain: 'indeed.com', badgeClass: 'border-zinc-700 bg-zinc-900 text-zinc-100' },
  { name: 'Workday', domain: 'myworkdayjobs.com', badgeClass: 'border-zinc-700 bg-zinc-900 text-zinc-100' },
];

export function JobUrlImporter({
  isOpen = true,
  onClose,
  onImport,
  variant = 'modal',
  className = '',
}: JobUrlImporterProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<ImportedJobData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setError(null);
      setSuccessResult(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen && variant !== 'inline') return null;

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setError(null);
        }
      }
    } catch {
      // Clipboard access rejected or not available
    }
  };

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError('Please paste a job posting URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      let apiKey = '';
      let model = 'gemini-3.1-flash-lite';
      if (typeof window !== 'undefined') {
        apiKey = localStorage.getItem('covercraft_gemini_api_key') || '';
        model = localStorage.getItem('covercraft_selected_model') || model;
      }

      const res = await fetch('/api/job-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: cleanUrl,
          apiKey: apiKey || undefined,
          model,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse job details from URL.');
      }

      const imported: ImportedJobData = {
        jobTitle: data.jobTitle || 'Target Position',
        companyName: data.companyName || 'Target Company',
        location: data.location || 'Remote / Unspecified',
        jobDescription: data.jobDescription || '',
        keySkills: Array.isArray(data.keySkills) ? data.keySkills : [],
      };

      setSuccessResult(imported);

    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while importing the job post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyImport = () => {
    if (successResult) {
      onImport(successResult);
      setIsCopied(true);
      if (onClose) onClose();
    }
  };

  const containerContent = (
    <div className={`relative bg-black border-2 border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white font-sans ${className}`}>
      
      {/* High-Contrast B&W Header */}
      <div className="bg-zinc-950 p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-white text-black font-black flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                <span className="gradient-text-animated">Import Job Posting URL</span>
              </h2>
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-white text-black border border-white">
                AI Parser 3.6
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Paste any job link to auto-fill title, company, description & key skills.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-white hover:text-black text-zinc-400 transition-all border border-zinc-800"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Main Form Body */}
      <div className="p-6 space-y-6">
        
        {/* URL Input Section */}
        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-white" />
                Job Listing URL
              </span>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition"
              >
                <Clipboard className="w-3.5 h-3.5" />
                Paste Clipboard
              </button>
            </label>

            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/... or Greenhouse / Lever URL"
                disabled={isLoading}
                className="w-full px-4 py-3.5 pr-10 bg-zinc-950 border-2 border-zinc-800 rounded-2xl text-white placeholder-zinc-600 text-sm font-mono focus:outline-none focus:border-white transition-all disabled:opacity-50"
              />
              {url && !isLoading && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Platform Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-zinc-500 mr-1">Supported:</span>
            {SUPPORTED_PLATFORMS.map((platform) => (
              <span
                key={platform.name}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${platform.badgeClass}`}
              >
                {platform.name}
              </span>
            ))}
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-zinc-800 bg-black text-zinc-400">
              + All Career Portals
            </span>
          </div>

          {/* Error Callout */}
          {error && (
            <div className="p-4 rounded-2xl bg-zinc-950 border-2 border-white text-white text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">Import Warning</p>
                <p className="text-zinc-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Import Action Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full py-4 rounded-2xl gradient-btn font-black uppercase text-xs tracking-wider transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 border-2 border-transparent disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Parsing Job Listing with Gemini 3.1...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white fill-white" />
                <span>Import Job Post</span>
              </>
            )}
          </button>
        </form>

        {/* Success Result Preview Box */}
        {successResult && (
          <div className="mt-6 p-5 rounded-2xl bg-zinc-950 border-2 border-zinc-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="font-black text-xs uppercase tracking-wider text-white">
                  Job Listing Extracted Successfully
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-black rounded uppercase">
                {isCopied ? 'Auto-Filled Form' : 'Ready'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-black p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                  Job Title
                </span>
                <p className="font-bold text-white text-sm">{successResult.jobTitle}</p>
              </div>

              <div className="bg-black p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  Company
                </span>
                <p className="font-bold text-white text-sm">{successResult.companyName}</p>
              </div>
            </div>

            {successResult.location && (
              <div className="bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  Location
                </span>
                <p className="font-semibold text-zinc-200">{successResult.location}</p>
              </div>
            )}

            {/* Key Skills Badges */}
            {successResult.keySkills.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-white" />
                  Extracted Key Skills ({successResult.keySkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {successResult.keySkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-900 text-white border border-zinc-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description Preview */}
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                Job Description Preview
              </span>
              <p className="text-xs text-zinc-400 bg-black p-3 rounded-xl border border-zinc-800 line-clamp-3 leading-relaxed">
                {successResult.jobDescription}
              </p>
            </div>

            {/* Confirm & Fill Form Button */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleApplyImport}
                className="w-full py-3 rounded-xl gradient-btn font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Use Extracted Job Details</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <div className="bg-zinc-950 p-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
        <span>Powered by Gemini 3.1 Flash Lite Engine with High Precision Fallback Parsing.</span>
      </div>

    </div>
  );

  if (variant === 'inline') {
    return containerContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl">
        {containerContent}
      </div>
    </div>
  );
}

export default JobUrlImporter;
