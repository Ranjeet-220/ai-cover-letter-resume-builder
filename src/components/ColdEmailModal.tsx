'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Zap,
  CheckCircle2,
  Sliders,
  UserCheck,
} from 'lucide-react';

interface ColdEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverLetterContent: string;
  jobTitle?: string;
  targetCompany?: string;
}

interface MessageData {
  subject: string;
  body: string;
  fullText: string;
  wordCount: number;
}

export function ColdEmailModal({
  isOpen,
  onClose,
  coverLetterContent,
  jobTitle = '',
  targetCompany = '',
}: ColdEmailModalProps) {
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin'>('email');
  const [hiringManagerName, setHiringManagerName] = useState('Hiring Manager');
  const [tone, setTone] = useState('Direct & Value-driven');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [coldEmail, setColdEmail] = useState<MessageData | null>(null);
  const [linkedInInMail, setLinkedInInMail] = useState<MessageData | null>(null);
  const [generatedWith, setGeneratedWith] = useState<'gemini' | 'fallback' | null>(null);

  // Copy States
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const requestIdRef = useRef(0);

  const handleConvert = useCallback(
    async (overrideTone?: string, overrideManager?: string) => {
      if (!coverLetterContent.trim()) return;

      setLoading(true);
      setError(null);
      setCopiedSubject(false);
      setCopiedBody(false);
      setCopiedFull(false);
      const requestId = ++requestIdRef.current;

      try {
        let apiKey = '';
        try {
          apiKey = localStorage.getItem('covercraft_gemini_api_key') || '';
        } catch {
          // The server-side key or fallback generator can still be used.
        }
        const res = await fetch('/api/cold-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coverLetter: coverLetterContent,
            jobTitle,
            targetCompany,
            hiringManagerName: overrideManager ?? hiringManagerName,
            tone: overrideTone ?? tone,
            apiKey: apiKey || undefined,
          }),
        });

        const data = await res.json().catch(() => null);

        if (requestId !== requestIdRef.current) return;
        if (res.ok && data && data.success && data.coldEmail && data.linkedInInMail) {
          setColdEmail(data.coldEmail);
          setLinkedInInMail(data.linkedInInMail);
          setGeneratedWith(data.generatedWith || 'fallback');
        } else {
          throw new Error(data.error || 'Failed to convert cover letter');
        }
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        const message = err instanceof Error ? err.message : 'An error occurred during conversion';
        setError(message);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [coverLetterContent, jobTitle, targetCompany, hiringManagerName, tone]
  );

  // Trigger auto-conversion when modal opens if not already generated
  useEffect(() => {
    if (isOpen && !coldEmail && !loading && !error) {
      handleConvert();
    }
  }, [isOpen, coldEmail, loading, error, handleConvert]);

  useEffect(() => {
    if (!isOpen) {
      requestIdRef.current += 1;
      setColdEmail(null);
      setLinkedInInMail(null);
      setGeneratedWith(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentMessage = activeTab === 'email' ? coldEmail : linkedInInMail;

  const copyToClipboard = async (text: string, target: 'subject' | 'body' | 'full') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const reset = () => {
        setCopiedSubject(false);
        setCopiedBody(false);
        setCopiedFull(false);
      };
      if (target === 'subject') {
        setCopiedSubject(true);
        setTimeout(reset, 2000);
      } else if (target === 'body') {
        setCopiedBody(true);
        setTimeout(reset, 2000);
      } else {
        setCopiedFull(true);
        setTimeout(reset, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
      >
        
        {/* Black & White Header */}
        <div className="bg-black p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="gradient-text-animated">1-Click Cold Email &amp; InMail Converter</span>
                <span className="text-[10px] font-extrabold font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                  ~150 Words
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Transform any long cover letter into a high-converting message for Hiring Managers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar */}
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          {/* Hiring Manager Input */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-zinc-300" />
              Recipient / Hiring Manager Name:
            </label>
            <input
              type="text"
              value={hiringManagerName}
              onChange={(e) => setHiringManagerName(e.target.value)}
              placeholder="e.g. Sarah Jenkins or Hiring Team"
              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-300" />
              Outreach Tone:
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white"
            >
              <option value="Direct & Value-driven">Direct & Value-driven (~150 words)</option>
              <option value="Enthusiastic & High Energy">Enthusiastic & High Energy</option>
              <option value="Executive & Strategic">Executive & Strategic</option>
              <option value="Short & Punchy">Short & Punchy (~100 words)</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('email');
                setCopiedSubject(false);
                setCopiedBody(false);
                setCopiedFull(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
                activeTab === 'email'
                  ? 'border-white text-white bg-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              Cold Email
              {coldEmail && (
                <span className="text-[10px] bg-black text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800">
                  {coldEmail.wordCount} words
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('linkedin');
                setCopiedSubject(false);
                setCopiedBody(false);
                setCopiedFull(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
                activeTab === 'linkedin'
                  ? 'border-white text-white bg-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-white" />
              LinkedIn InMail
              {linkedInInMail && (
                <span className="text-[10px] bg-black text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800">
                  {linkedInInMail.wordCount} words
                </span>
              )}
            </button>
          </div>

          {/* Regenerate Button */}
          <button
            onClick={() => handleConvert()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold gradient-btn rounded-xl transition disabled:opacity-50 mb-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl animate-bounce">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-sm font-bold text-white">
                Converting cover letter into high-converting ~150-word message...
              </p>
              <p className="text-xs text-zinc-400 max-w-xs">
                Distilling key achievements, crafting irresistible subject lines, and framing low-friction CTAs.
              </p>
            </div>
          ) : currentMessage ? (
            <div className="space-y-4">
              {/* Subject Line Card */}
              <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-300">
                    Subject Line
                  </span>
                  <button
                    onClick={() => copyToClipboard(currentMessage.subject, 'subject')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-xl transition cursor-pointer"
                  >
                    {copiedSubject ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span className="text-white font-bold">Copied Subject</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Subject</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs font-bold text-white select-all bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {currentMessage.subject}
                </div>
              </div>

              {/* Message Body Card */}
              <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-300">
                      Message Body
                    </span>
                    <span className="text-[10px] font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full font-mono">
                      {currentMessage.wordCount} words
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentMessage.body, 'body')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-xl transition cursor-pointer"
                  >
                    {copiedBody ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span className="text-white font-bold">Copied Body</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Body</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-200 bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono select-all">
                  {currentMessage.body}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-400 text-xs">
              No message generated yet. Click &quot;Regenerate&quot; to convert your cover letter.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-black border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span>
              {generatedWith === 'gemini'
                ? 'AI Engine: Gemini Executive Outreach'
                : 'AI Engine: Smart Direct Outreach'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              Close
            </button>

            {currentMessage && (
              <button
                onClick={() => copyToClipboard(currentMessage.fullText, 'full')}
                className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold gradient-btn rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer"
              >
                {copiedFull ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied Full Message!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>1-Click Copy Full Message</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
