'use client';
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Zap,
  Split,
  Eye,
  Edit,
  Scissors,
  CheckCircle,
  Award,
  Mail,
  Save,
  Loader2,
} from 'lucide-react';
import { CoverLetter, ResumeProfile } from '@/types/index';
import { saveCoverLetter, ApplicationStatus } from '@/lib/storage';
import { ColdEmailModal } from '@/features/cover-letter/components/ColdEmailModal';
import { AtsMatchAnalyzer } from '@/features/job-match/components/AtsMatchAnalyzer';
import { calculateAtsMatchScore, weaveKeywordIntoText, AtsAnalysisResult } from '@/lib/atsUtils';
import { useToast } from '@/components/ui/Toast';

interface CoverLetterEditorProps {
  initialLetter?: CoverLetter | null;
  activeProfile?: ResumeProfile | null;
  onSave?: (letter: CoverLetter) => void;
}

export function CoverLetterEditor({
  initialLetter,
  activeProfile,
  onSave,
}: CoverLetterEditorProps) {
  const [content, setContent] = useState(
    initialLetter?.content ||
      `Dear Hiring Manager,\n\nI am writing to express my strong interest in the role at your company. With my background in software development and technical leadership, I am confident in my ability to deliver immediate value to your team.\n\nSincerely,\nCandidate Name`
  );
  const [company, setCompany] = useState(initialLetter?.targetCompany || 'Acme Corp');
  const [jobTitle, setJobTitle] = useState(initialLetter?.jobTitle || 'Senior Developer');
  const [tone, setTone] = useState(initialLetter?.tone || 'professional');

  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'paper'>('split');
  const [isImproving, setIsImproving] = useState(false);
  const [improvingAction, setImprovingAction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showColdEmailModal, setShowColdEmailModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('August 1, 2026');

  // ATS Analysis State
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [isCalculatingAts, setIsCalculatingAts] = useState(false);

  const jobDescription = initialLetter?.jobDescription || '';
  const paperRef = useRef<HTMLDivElement>(null);
  const loadedLetterIdRef = useRef<string | null>(null);
  const atsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    const letterId = initialLetter?.id ?? null;
    if (letterId !== loadedLetterIdRef.current) {
      loadedLetterIdRef.current = letterId;
      if (initialLetter) {
        setContent(initialLetter.content);
        setCompany(initialLetter.targetCompany);
        setJobTitle(initialLetter.jobTitle);
        setTone(initialLetter.tone);
      }
    }
  }, [initialLetter]);

  useEffect(() => {
    return () => {
      if (atsTimerRef.current) clearTimeout(atsTimerRef.current);
    };
  }, []);

  // Recalculate ATS Match Score whenever content changes
  useEffect(() => {
    if (content.trim()) {
      const result = calculateAtsMatchScore(content, jobDescription, jobTitle);
      setAtsResult(result);
    } else {
      setAtsResult(null);
    }
  }, [content, jobDescription, jobTitle]);

  const handleWeaveKeyword = (keyword: string) => {
    setContent((prev) => weaveKeywordIntoText(prev, keyword));
  };

  const handleWeaveAllKeywords = () => {
    if (!atsResult || atsResult.missingKeywords.length === 0) return;
    setContent((prev) => {
      let updated = prev;
      atsResult.missingKeywords.forEach((kw) => {
        updated = weaveKeywordIntoText(updated, kw);
      });
      return updated;
    });
  };

  const handleImprove = async (action: 'confident' | 'shorten' | 'leadership' | 'grammar') => {
    setIsImproving(true);
    setImprovingAction(action);
    try {
      const customGeminiKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_gemini_api_key') || '' : '';
      const customAnthropicKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_anthropic_api_key') || '' : '';
      const model = typeof window !== 'undefined' ? localStorage.getItem('covercraft_selected_model') || 'gemini-3.1-flash-lite' : 'gemini-3.1-flash-lite';

      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content,
          action,
          jobDescription: jobDescription,
          model,
          apiKey: customGeminiKey,
          anthropicApiKey: customAnthropicKey,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to improve text');
      }
      if (data && data.improvedText) {
        setContent(data.improvedText);
        showToast('Text Refined', `Applied ${action} enhancement.`);
      } else {
        throw new Error('The AI returned no improved text.');
      }
    } catch (err) {
      console.error(err);
      showToast('Improvement failed', err instanceof Error ? err.message : 'Please try again.', 'error');
    } finally {
      setIsImproving(false);
      setImprovingAction(null);
    }
  };

  const handleSave = async () => {
    const currentAts = calculateAtsMatchScore(content, jobDescription, jobTitle);

    const letterToSave: CoverLetter = {
      id: initialLetter?.id || `letter-${Date.now()}`,
      title: `${jobTitle} at ${company}`,
      targetCompany: company,
      jobTitle,
      jobDescription: jobDescription,
      tone: tone as any,
      length: 'standard',
      content,
      matchScore: currentAts.score,
      missingKeywords: currentAts.missingKeywords,
      status: initialLetter?.status || 'draft',
      createdAt: initialLetter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resumeProfileId: initialLetter?.resumeProfileId,
    };

    try {
      await saveCoverLetter({
        id: letterToSave.id,
        title: letterToSave.title,
        company: letterToSave.targetCompany,
        jobTitle: letterToSave.jobTitle,
        jobDescription: letterToSave.jobDescription,
        content: letterToSave.content,
        status: letterToSave.status
          ? (letterToSave.status.charAt(0).toUpperCase() + letterToSave.status.slice(1) as ApplicationStatus)
          : 'Draft',
        matchScore: letterToSave.matchScore,
        createdAt: letterToSave.createdAt,
        updatedAt: letterToSave.updatedAt,
        resumeProfileId: letterToSave.resumeProfileId,
      });
      if (onSave) onSave(letterToSave);
      showToast('Draft Saved', 'Cover letter saved successfully.');
    } catch (err) {
      console.error(err);
      showToast('Save Failed', 'Could not save your cover letter.', 'error');
    }
  };

  const handleCopy = async () => {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      showToast('Copied', 'Cover letter text copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      showToast('Copy Failed', 'Clipboard access was blocked.', 'error');
    }
  };

  const handleExportPdf = async () => {
    if (viewMode === 'edit') {
      setViewMode('split');
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!paperRef.current) return;
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(paperRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${(company || 'Cover_Letter').replace(/\s+/g, '_')}_Letter.pdf`);
      showToast('Export Complete', 'Downloaded A4 PDF.');
    } catch (err) {
      console.error(err);
      showToast('Export Failed', 'Could not generate the PDF. Please try again.', 'error');
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Streamlined Top Toolbar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              Cover Letter Editor
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {jobTitle && company ? `${jobTitle} • ${company}` : 'Edit, refine, and export'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-1 bg-black rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'split' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'edit' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setViewMode('paper')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'paper' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          <button
            onClick={() => setShowColdEmailModal(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cold Email</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-zinc-400" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 rounded-xl gradient-btn font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick AI Actions, ATS, & Editor Textarea */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className={`${viewMode === 'edit' ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-6'} space-y-5`}>
            {/* Quick AI Writing Tools */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  AI Writing Tools
                </h3>
                {isImproving && (
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Refining text...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleImprove('confident')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-left transition cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {improvingAction === 'confident' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-zinc-300" />}
                    <span>Make Confident</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">High-impact action verbs</p>
                </button>

                <button
                  onClick={() => handleImprove('shorten')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-left transition cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {improvingAction === 'shorten' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5 text-zinc-300" />}
                    <span>Shorten Text</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Trim wordiness by ~20%</p>
                </button>

                <button
                  onClick={() => handleImprove('leadership')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-left transition cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {improvingAction === 'leadership' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5 text-zinc-300" />}
                    <span>Highlight Leadership</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Emphasize metrics & results</p>
                </button>

                <button
                  onClick={() => handleImprove('grammar')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-left transition cursor-pointer disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {improvingAction === 'grammar' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-zinc-300" />}
                    <span>Polish & Fix</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Grammar & syntax flow</p>
                </button>
              </div>
            </div>

            {/* ATS Match Score Panel */}
            <AtsMatchAnalyzer
              score={atsResult?.score}
              matchedKeywords={atsResult?.matchedKeywords}
              missingKeywords={atsResult?.missingKeywords}
              strengths={atsResult?.strengths}
              recommendations={atsResult?.recommendations}
              documentText={content}
              jobDescription={jobDescription}
              jobTitle={jobTitle}
              onWeaveKeyword={handleWeaveKeyword}
              onWeaveAllKeywords={handleWeaveAllKeywords}
              onRecalculate={() => {
                setIsCalculatingAts(true);
                const res = calculateAtsMatchScore(content, jobDescription, jobTitle);
                setAtsResult(res);
                if (atsTimerRef.current) clearTimeout(atsTimerRef.current);
                atsTimerRef.current = setTimeout(() => setIsCalculatingAts(false), 300);
              }}
              isCalculating={isCalculatingAts}
            />

            {/* Content Textarea Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Cover Letter Content</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 font-mono">{wordCount} words</span>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-xl bg-black border border-zinc-850 text-white text-xs sm:text-sm leading-relaxed font-sans focus:outline-none focus:border-zinc-600 resize-none selection:bg-zinc-800 transition"
                placeholder="Type or paste your cover letter content here..."
              />
            </div>
          </div>
        )}

        {/* Right Column: Paper Preview */}
        {(viewMode === 'split' || viewMode === 'paper') && (
          <div className={`${viewMode === 'paper' ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-6'} bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" />
                <span>A4 Document Preview</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  className="px-3.5 py-1.5 rounded-lg gradient-btn text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Paper Render */}
            <div
              ref={paperRef}
              className="cover-letter-paper p-6 sm:p-10 rounded-xl bg-white text-black shadow-lg min-h-[600px] space-y-6 text-xs sm:text-sm leading-relaxed"
            >
              <div className="border-b-2 border-black pb-4">
                <h1 className="text-xl font-extrabold tracking-tight uppercase text-black">
                  {activeProfile?.fullName || 'Candidate Name'}
                </h1>
                <p className="text-xs text-zinc-600 font-mono mt-1">
                  {activeProfile?.email || 'email@example.com'} | {activeProfile?.phone || '(555) 000-0000'}
                </p>
              </div>

              <div className="text-[11px] text-zinc-600 font-mono">
                {currentDate}
              </div>

              <div className="space-y-1">
                <p className="font-bold text-black">Hiring Team</p>
                <p className="text-zinc-800">{company}</p>
                <p className="text-zinc-600 text-[11px]">RE: {jobTitle} Position</p>
              </div>

              <div className="whitespace-pre-wrap leading-relaxed text-zinc-900 text-xs sm:text-sm">
                {content}
              </div>
            </div>
          </div>
        )}
      </div>

      <ColdEmailModal
        isOpen={showColdEmailModal}
        onClose={() => setShowColdEmailModal(false)}
        coverLetterContent={content}
        jobTitle={jobTitle}
        targetCompany={company}
      />
    </div>
  );
}

export default CoverLetterEditor;
