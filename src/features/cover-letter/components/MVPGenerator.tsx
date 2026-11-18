'use client';
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  Mail,
  Globe,
  RotateCcw,
} from 'lucide-react';
import {
  canGenerate,
  incrementUsageCount,
  isProUser,
} from '@/lib/usage';
import { AuthBillingModal } from '@/features/billing/components/AuthBillingModal';
import { ApiSettingsModal } from '@/features/settings/components/ApiSettingsModal';
import { ColdEmailModal } from '@/features/cover-letter/components/ColdEmailModal';
import { JobUrlImporter, ImportedJobData } from '@/features/job-match/components/JobUrlImporter';
import { AtsMatchAnalyzer } from '@/features/job-match/components/AtsMatchAnalyzer';
import { calculateAtsMatchScore, weaveKeywordIntoText, AtsAnalysisResult } from '@/lib/atsUtils';
import { useToast } from '@/components/ui/Toast';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export function MVPGenerator() {
  const { showToast } = useToast();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'Professional' | 'Friendly' | 'Enthusiastic' | 'Confident'>('Professional');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showColdEmailModal, setShowColdEmailModal] = useState(false);
  const [showJobUrlImporter, setShowJobUrlImporter] = useState(false);
  const [modalReason, setModalReason] = useState<'limit_reached' | 'upgrade_click'>('limit_reached');

  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');

  // ATS Score State
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [isCalculatingAts, setIsCalculatingAts] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    const refreshModel = () => {
      try {
        setSelectedModel(localStorage.getItem('covercraft_selected_model') || 'gemini-3.1-flash-lite');
      } catch {
        setSelectedModel('gemini-3.1-flash-lite');
      }
    };
    refreshModel();
    window.addEventListener('covercraft-settings-change', refreshModel);
    return () => {
      window.removeEventListener('covercraft-settings-change', refreshModel);
    };
  }, []);

  // Recalculate ATS Match Score whenever letter, resume, or job description changes
  useEffect(() => {
    if (jobDescription.trim() && (generatedLetter.trim() || resumeText.trim())) {
      const docToAnalyze = generatedLetter.trim() || resumeText.trim();
      const result = calculateAtsMatchScore(docToAnalyze, jobDescription, jobTitle);
      setAtsResult(result);
    } else {
      setAtsResult(null);
    }
  }, [generatedLetter, resumeText, jobDescription, jobTitle]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeText.trim() || !jobDescription.trim()) {
      const msg = 'Please provide both your Experience/Resume and the Job Description.';
      setGenerationError(msg);
      showToast('Missing Inputs', msg, 'error');
      return;
    }

    if (!canGenerate()) {
      setModalReason('limit_reached');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setCopied(false);
    setGenerationError(null);

    try {
      let customGeminiKey = '';
      let customAnthropicKey = '';
      try {
        customGeminiKey = localStorage.getItem('covercraft_gemini_api_key') || '';
        customAnthropicKey = localStorage.getItem('covercraft_anthropic_api_key') || '';
      } catch {
        // Browser storage is optional; server credentials or the local fallback may still work.
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jobDescription,
          targetCompany: companyName || 'Target Company',
          jobTitle: jobTitle || 'Target Position',
          tone: tone.toLowerCase(),
          length: 'standard',
          model: selectedModel,
          apiKey: customGeminiKey,
          anthropicApiKey: customAnthropicKey,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error((data && data.error) || 'Failed to generate cover letter');
      }
      if (data && data.coverLetter) {
        setGeneratedLetter(data.coverLetter);

        // Recalculate ATS Match Score for generated letter
        const newAts = calculateAtsMatchScore(data.coverLetter, jobDescription, jobTitle);
        setAtsResult(newAts);

        showToast('Cover Letter Ready', 'Generated tailored cover letter successfully.');

        if (!isProUser()) {
          incrementUsageCount();
        }
      } else {
        throw new Error((data && data.error) || 'Failed to generate cover letter');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || 'Failed to generate cover letter. Please try again.';
      setGenerationError(msg);
      showToast('Generation Issue', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter) return;
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      showToast('Copied', 'Cover letter copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      showToast('Copy Failed', 'Clipboard access was blocked.', 'error');
    }
  };

  const loadSampleData = () => {
    const sampleResume = 'Senior Software Engineer with 5+ years of experience building modern React, Next.js, and TypeScript applications. Demonstrated expertise in full-stack web architectures, REST APIs, and UI/UX design. Led high-performance frontend teams that boosted page load speed by 40%.';
    const sampleJd = 'We are looking for a Senior Full-Stack Engineer to join our fast-paced product engineering team. Ideal candidates have strong proficiency with Next.js, Tailwind CSS, TypeScript, and AI integrations. Responsibilities include building scalable web apps, optimizing performance, and collaborating closely with design.';
    const sampleCompany = 'Stripe';
    const sampleTitle = 'Senior Full-Stack Engineer';

    setResumeText(sampleResume);
    setJobDescription(sampleJd);
    setCompanyName(sampleCompany);
    setJobTitle(sampleTitle);
    setGeneratedLetter('');

    const initialAts = calculateAtsMatchScore(sampleResume, sampleJd, sampleTitle);
    setAtsResult(initialAts);
    showToast('Sample Loaded', 'Pre-filled sample job and candidate details.');
  };

  const handleJobImport = (imported: ImportedJobData) => {
    if (imported.jobTitle) setJobTitle(imported.jobTitle);
    if (imported.companyName) setCompanyName(imported.companyName);
    if (imported.jobDescription) setJobDescription(imported.jobDescription);
    setShowJobUrlImporter(false);
    showToast('Job Imported', `Loaded details for ${imported.jobTitle || 'job'}.`);
  };

  const handleWeaveKeyword = (keyword: string) => {
    if (generatedLetter.trim()) {
      setGeneratedLetter((prev) => weaveKeywordIntoText(prev, keyword));
    } else if (resumeText.trim()) {
      setResumeText((prev) => weaveKeywordIntoText(prev, keyword));
    }
  };

  const handleWeaveAllKeywords = () => {
    if (!atsResult || atsResult.missingKeywords.length === 0) return;
    if (generatedLetter.trim()) {
      setGeneratedLetter((prev) => {
        let updated = prev;
        atsResult.missingKeywords.forEach((kw) => {
          updated = weaveKeywordIntoText(updated, kw);
        });
        return updated;
      });
    } else if (resumeText.trim()) {
      setResumeText((prev) => {
        let updated = prev;
        atsResult.missingKeywords.forEach((kw) => {
          updated = weaveKeywordIntoText(updated, kw);
        });
        return updated;
      });
    }
  };

  const toneOptions = [
    { id: 'Professional', label: 'Professional', icon: '💼' },
    { id: 'Friendly', label: 'Friendly', icon: '🤝' },
    { id: 'Enthusiastic', label: 'Enthusiastic', icon: '✨' },
    { id: 'Confident', label: 'Confident', icon: '🎯' },
  ] as const;

  const wordCount = generatedLetter.trim() ? generatedLetter.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Card Header with subtle helper actions */}
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                Job Details
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target company, position, and background
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowJobUrlImporter(true)}
                className="text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Import URL
              </button>
              <button
                type="button"
                onClick={loadSampleData}
                className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Sample
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Company & Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition"
                />
              </div>
            </div>

            {/* Resume / Experience */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">Your Experience / Resume *</label>
                {resumeText.length > 0 && (
                  <span className="text-[10px] text-zinc-500 font-mono">{resumeText.length} chars</span>
                )}
              </div>
              <textarea
                required
                rows={5}
                placeholder="Paste your past experience, skills, and key achievements..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition resize-none leading-relaxed"
              />
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-300">Target Job Description *</label>
                {jobDescription.length > 0 && (
                  <span className="text-[10px] text-zinc-500 font-mono">{jobDescription.length} chars</span>
                )}
              </div>
              <textarea
                required
                rows={5}
                placeholder="Paste the job posting requirements and responsibilities..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-black border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition resize-none leading-relaxed"
              />
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">Tone of Voice</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {toneOptions.map((t) => {
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-white text-black font-semibold border-white shadow-sm'
                          : 'bg-black text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {generationError && (
              <ErrorAlert
                title="Generation Issue"
                message={generationError}
                variant="error"
                onDismiss={() => setGenerationError(null)}
                onRetry={() => {
                  const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                  handleGenerate(fakeEvent);
                }}
                retryLabel="Try Again"
              />
            )}

            {/* Primary Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl gradient-btn font-bold text-xs tracking-wide uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Cover Letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Output Area */}
        <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col h-full min-h-[560px]">
          {/* Card Header */}
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-4 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-white">Generated Letter</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {generatedLetter ? `${wordCount} words` : 'Ready to review and copy'}
              </p>
            </div>

            {generatedLetter && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowColdEmailModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Cold Email</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    copied
                      ? 'bg-zinc-100 text-black shadow-sm font-bold'
                      : 'gradient-btn font-bold shadow-sm'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Letter</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Letter Body Display */}
          <div className="flex-1 bg-black border border-zinc-850 rounded-xl p-5 overflow-y-auto text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-zinc-800 font-sans">
            {generatedLetter ? (
              <div>{generatedLetter}</div>
            ) : (
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-3">
                  <Sparkles className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="font-semibold text-zinc-300 text-xs">Your letter will appear here</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
                  Fill in your job details on the left, select a tone, and click Generate Cover Letter.
                </p>
              </div>
            )}
          </div>

          {/* Footer stats when letter is present */}
          {generatedLetter && (
            <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
              <span>{wordCount} words • {generatedLetter.length} characters</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-zinc-300 hover:text-white font-medium transition flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ATS Match Score Analyzer Section */}
      {jobDescription.trim() && (generatedLetter.trim() || resumeText.trim()) && (
        <AtsMatchAnalyzer
          score={atsResult?.score}
          matchedKeywords={atsResult?.matchedKeywords}
          missingKeywords={atsResult?.missingKeywords}
          strengths={atsResult?.strengths}
          recommendations={atsResult?.recommendations}
          documentText={generatedLetter || resumeText}
          jobDescription={jobDescription}
          jobTitle={jobTitle}
          onWeaveKeyword={handleWeaveKeyword}
          onWeaveAllKeywords={handleWeaveAllKeywords}
          onRecalculate={() => {
            setIsCalculatingAts(true);
            const res = calculateAtsMatchScore(generatedLetter || resumeText, jobDescription, jobTitle);
            setAtsResult(res);
            setTimeout(() => setIsCalculatingAts(false), 300);
          }}
          isCalculating={isCalculatingAts}
        />
      )}

      {/* Modals */}
      <AuthBillingModal
        isOpen={showAuthModal}
        reason={modalReason}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
      <ApiSettingsModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={(m) => setSelectedModel(m)}
      />
      <ColdEmailModal
        isOpen={showColdEmailModal}
        onClose={() => setShowColdEmailModal(false)}
        coverLetterContent={generatedLetter}
        jobTitle={jobTitle}
        targetCompany={companyName}
      />
      <JobUrlImporter
        isOpen={showJobUrlImporter}
        onClose={() => setShowJobUrlImporter(false)}
        onImport={handleJobImport}
      />
    </div>
  );
}

export default MVPGenerator;
