'use client';
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Zap,
  FileText,
  Briefcase,
  RefreshCw,
  Cpu,
  Mail,
  Globe,
} from 'lucide-react';
import {
  getFreeGenerationsRemaining,
  canGenerate,
  incrementUsageCount,
  isProUser,
} from '../lib/usage';
import { AuthBillingModal } from './AuthBillingModal';
import { ApiSettingsModal } from './ApiSettingsModal';
import { ColdEmailModal } from './ColdEmailModal';
import { JobUrlImporter, ImportedJobData } from './JobUrlImporter';
import { AtsMatchAnalyzer } from './AtsMatchAnalyzer';
import { calculateAtsMatchScore, weaveKeywordIntoText, AtsAnalysisResult } from '../lib/atsUtils';
import { useToast } from './Toast';

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
  const [remainingFree, setRemainingFree] = useState(5);
  const [isPro, setIsPro] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showColdEmailModal, setShowColdEmailModal] = useState(false);
  const [showJobUrlImporter, setShowJobUrlImporter] = useState(false);
  const [modalReason, setModalReason] = useState<'limit_reached' | 'upgrade_click'>('limit_reached');

  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  // ATS Score State
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [isCalculatingAts, setIsCalculatingAts] = useState(false);

  useEffect(() => {
    setRemainingFree(getFreeGenerationsRemaining());
    setIsPro(isProUser());
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('covercraft_selected_model') || 'gemini-2.5-flash';
      setSelectedModel(savedModel);
    }
  }, []);

  // Recalculate ATS Match Score whenever letter, resume, or job description changes
  useEffect(() => {
    if (jobDescription.trim() && (generatedLetter.trim() || resumeText.trim())) {
      const docToAnalyze = generatedLetter.trim() || resumeText.trim();
      const result = calculateAtsMatchScore(docToAnalyze, jobDescription, jobTitle);
      setAtsResult(result);
    }
  }, [generatedLetter, resumeText, jobDescription, jobTitle]);

  const refreshUsageStatus = () => {
    setRemainingFree(getFreeGenerationsRemaining());
    setIsPro(isProUser());
  };

  const getModelLabel = () => {
    if (selectedModel === 'gemini-2.5-flash') return 'Gemini 2.5 Flash (High)';
    if (selectedModel === 'gemini-2.5-pro') return 'Gemini 2.5 Pro';
    if (selectedModel === 'claude-sonnet-4-20250514') return 'Claude Sonnet 4';
    return 'Gemini 2.5 Flash (High)';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canGenerate()) {
      setModalReason('limit_reached');
      setShowAuthModal(true);
      return;
    }

    if (!resumeText.trim() || !jobDescription.trim()) {
      alert('Please paste both your Resume/Bio and the Job Description.');
      return;
    }

    setLoading(true);
    setCopied(false);

    try {
      const customGeminiKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_gemini_api_key') || '' : '';
      const customAnthropicKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_anthropic_api_key') || '' : '';

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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
      if (data.coverLetter) {
        setGeneratedLetter(data.coverLetter);
        
        // Recalculate ATS Match Score for generated letter
        const newAts = calculateAtsMatchScore(data.coverLetter, jobDescription, jobTitle);
        setAtsResult(newAts);

        showToast('Cover Letter Generated!', 'ATS-tailored letter ready to copy or edit.');

        if (!isPro) {
          incrementUsageCount();
          refreshUsageStatus();
        }
      } else {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Generation Notice', err?.message || 'Please check inputs and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    showToast('Copied to Clipboard!', 'Cover letter text copied ready to paste.');
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSampleData = () => {
    const sampleResume = 'Senior Software Engineer with 5+ years of experience building modern React, Next.js, and TypeScript applications. Demonstrated expertise in full-stack web architectures, REST APIs, and UI/UX design. Led high-performance frontend teams that boosted page load speed by 40%.';
    const sampleJd = 'We are looking for a Senior Full-Stack Engineer to join our fast-paced product engineering team. Ideal candidates have strong proficiency with Next.js, Tailwind CSS, TypeScript, and AI integrations. Responsibilities include building scalable web apps, optimizing performance, and collaborating closely with design.';
    const sampleCompany = 'Stripe Tech Solutions';
    const sampleTitle = 'Senior Full-Stack Engineer';

    setResumeText(sampleResume);
    setJobDescription(sampleJd);
    setCompanyName(sampleCompany);
    setJobTitle(sampleTitle);

    const initialAts = calculateAtsMatchScore(sampleResume, sampleJd, sampleTitle);
    setAtsResult(initialAts);
    showToast('Sample Data Loaded', 'Pre-filled sample candidate resume and job post.');
  };

  const handleJobImport = (imported: ImportedJobData) => {
    if (imported.jobTitle) setJobTitle(imported.jobTitle);
    if (imported.companyName) setCompanyName(imported.companyName);
    if (imported.jobDescription) setJobDescription(imported.jobDescription);
    setShowJobUrlImporter(false);
    showToast('Job Post Imported!', `Loaded ${imported.jobTitle || 'job requirements'} into form.`);
  };

  const handleWeaveKeyword = (keyword: string) => {
    if (generatedLetter.trim()) {
      const updated = weaveKeywordIntoText(generatedLetter, keyword);
      setGeneratedLetter(updated);
    } else if (resumeText.trim()) {
      const updated = weaveKeywordIntoText(resumeText, keyword);
      setResumeText(updated);
    }
  };

  const handleWeaveAllKeywords = () => {
    if (!atsResult || atsResult.missingKeywords.length === 0) return;
    let textToUpdate = generatedLetter.trim() ? generatedLetter : resumeText;
    if (!textToUpdate.trim()) return;

    atsResult.missingKeywords.forEach((kw) => {
      textToUpdate = weaveKeywordIntoText(textToUpdate, kw);
    });

    if (generatedLetter.trim()) {
      setGeneratedLetter(textToUpdate);
    } else {
      setResumeText(textToUpdate);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner / Credit & Model Status Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-black font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="gradient-text-animated">Cover Letter MVP Generator</span>
              {isPro && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-white border border-zinc-700">
                  PRO UNLIMITED
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              High-precision AI generator with URL Importer & ATS Match Auto-Weaver.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowJobUrlImporter(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-btn font-bold text-xs transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>Import Job URL</span>
          </button>

          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 hover:border-white transition cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>Model: <strong className="text-white">{getModelLabel()}</strong></span>
          </button>

          {!isPro ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs">
              <span className="text-zinc-400">Free Uses:</span>
              <span className="font-bold text-white">
                {remainingFree} / 5
              </span>
            </div>
          ) : (
            <div className="text-xs text-white font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700">
              ⚡ Unlimited Active
            </div>
          )}

          <button
            onClick={() => {
              setModalReason('upgrade_click');
              setShowAuthModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl gradient-btn font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            {isPro ? 'Manage Account' : 'Upgrade / Sign In'}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              1. Input Parameters
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowJobUrlImporter(true)}
                className="text-xs text-zinc-300 hover:text-white font-semibold transition flex items-center gap-1 cursor-pointer bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl"
              >
                <Globe className="w-3 h-3 text-white" /> URL Import
              </button>
              <button
                type="button"
                onClick={loadSampleData}
                className="text-xs text-zinc-400 hover:text-white font-medium transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Sample Data
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex justify-between">
                <span>Paste Your Resume / Bio *</span>
                <span className="text-[10px] text-zinc-500">{resumeText.length} chars</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Paste your past experience, key skills, achievements..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-3 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex justify-between">
                <span>Paste Job Description *</span>
                <span className="text-[10px] text-zinc-500">{jobDescription.length} chars</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Paste target job post requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Tone Selection</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="Professional">💼 Professional & Formal</option>
                <option value="Friendly">😊 Friendly & Warm</option>
                <option value="Enthusiastic">🚀 Enthusiastic & Passionate</option>
                <option value="Confident">🔥 Confident & Authoritative</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl gradient-btn font-extrabold text-xs tracking-wide uppercase transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  Generate Cover Letter ({getModelLabel()})
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Output Area */}
        <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col h-full min-h-[540px]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-zinc-400" />
              2. Output Letter
            </h3>

            {generatedLetter && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowColdEmailModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  Convert to Cold Email
                </button>
                <button
                  onClick={handleCopy}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    copied
                      ? 'bg-zinc-100 text-black shadow-md font-bold'
                      : 'gradient-btn font-bold shadow-md'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-black border border-zinc-800/80 rounded-2xl p-5 overflow-y-auto text-zinc-100 text-xs leading-relaxed whitespace-pre-wrap">
            {generatedLetter ? (
              <div>{generatedLetter}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-zinc-300">Your Generated Cover Letter Will Appear Here</p>
                <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
                  Fill in your inputs on the left or import from URL, select your tone, and click Generate.
                </p>
              </div>
            )}
          </div>

          {generatedLetter && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>Length: {generatedLetter.split(/\s+/).length} words</span>
              <button
                onClick={handleCopy}
                className="text-white hover:underline font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Text
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ATS Match Score Analyzer Section */}
      {(jobDescription.trim() || generatedLetter.trim() || resumeText.trim()) && (
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
      <AuthBillingModal isOpen={showAuthModal} reason={modalReason} onClose={() => setShowAuthModal(false)} onSuccess={refreshUsageStatus} />
      <ApiSettingsModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} onSave={(m) => setSelectedModel(m)} />
      <ColdEmailModal isOpen={showColdEmailModal} onClose={() => setShowColdEmailModal(false)} coverLetterContent={generatedLetter} jobTitle={jobTitle} targetCompany={companyName} />
      <JobUrlImporter isOpen={showJobUrlImporter} onClose={() => setShowJobUrlImporter(false)} onImport={handleJobImport} />
    </div>
  );
}

export default MVPGenerator;
