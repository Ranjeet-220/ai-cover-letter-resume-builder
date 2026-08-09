'use client';
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Sparkles,
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
  Layers,
  Cpu,
} from 'lucide-react';
import { CoverLetter, ResumeProfile } from '../types';
import { saveCoverLetter, ApplicationStatus } from '../lib/storage';
import { PDF_TEMPLATES, PdfTemplate, getPdfTemplateById } from '../lib/pdfTemplates';
import { ColdEmailModal } from './ColdEmailModal';
import { AtsMatchAnalyzer } from './AtsMatchAnalyzer';
import { calculateAtsMatchScore, weaveKeywordIntoText, AtsAnalysisResult } from '../lib/atsUtils';

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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern-indigo');
  const [isImproving, setIsImproving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showColdEmailModal, setShowColdEmailModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('August 1, 2026');

  // ATS Analysis State
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [isCalculatingAts, setIsCalculatingAts] = useState(false);

  const jobDescription = initialLetter?.jobDescription || '';
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    if (initialLetter) {
      setContent(initialLetter.content);
      setCompany(initialLetter.targetCompany);
      setJobTitle(initialLetter.jobTitle);
      setTone(initialLetter.tone);
    }
  }, [initialLetter]);

  // Recalculate ATS Match Score whenever content changes
  useEffect(() => {
    if (content.trim()) {
      const result = calculateAtsMatchScore(content, jobDescription, jobTitle);
      setAtsResult(result);
    }
  }, [content, jobDescription, jobTitle]);

  const handleWeaveKeyword = (keyword: string) => {
    const updatedContent = weaveKeywordIntoText(content, keyword);
    setContent(updatedContent);
  };

  const handleWeaveAllKeywords = () => {
    if (!atsResult || atsResult.missingKeywords.length === 0) return;
    let updated = content;
    atsResult.missingKeywords.forEach((kw) => {
      updated = weaveKeywordIntoText(updated, kw);
    });
    setContent(updated);
  };

  const handleImprove = async (action: 'confident' | 'shorten' | 'leadership' | 'grammar') => {
    setIsImproving(true);
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to improve text');
      }
      if (data.improvedText) {
        setContent(data.improvedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImproving(false);
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
      status: (initialLetter?.status as any) || 'Draft',
      createdAt: initialLetter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resumeProfileId: initialLetter?.resumeProfileId,
    };

    await saveCoverLetter({
      id: letterToSave.id,
      title: letterToSave.title,
      company: letterToSave.targetCompany,
      jobTitle: letterToSave.jobTitle,
      jobDescription: letterToSave.jobDescription,
      content: letterToSave.content,
      status: (letterToSave.status
        ? letterToSave.status.charAt(0).toUpperCase() + letterToSave.status.slice(1)
        : 'Draft') as ApplicationStatus,
      matchScore: letterToSave.matchScore,
      createdAt: letterToSave.createdAt,
      updatedAt: letterToSave.updatedAt,
      resumeProfileId: letterToSave.resumeProfileId,
    });
    if (onSave) onSave(letterToSave);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (!paperRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
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

      pdf.save(`${company.replace(/\s+/g, '_')}_Cover_Letter.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-black font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Studio Editor & ATS Transformer
            </h2>
            <p className="text-xs text-zinc-400">
              Transform tone, weave missing ATS keywords, and export clean A4 PDF documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggles */}
          <div className="flex items-center p-1 bg-black rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'split' ? 'gradient-active font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Split className="w-3.5 h-3.5 inline mr-1" /> Split View
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'edit' ? 'gradient-active font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Edit className="w-3.5 h-3.5 inline mr-1" /> Raw Editor
            </button>
            <button
              onClick={() => setViewMode('paper')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'paper' ? 'gradient-active font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Paper Only
            </button>
          </div>

          <button
            onClick={() => setShowColdEmailModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition"
          >
            ✉️ Cold Email
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition"
          >
            Save Draft
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 rounded-xl gradient-btn font-extrabold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick AI Actions & Controls */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className="lg:col-span-6 space-y-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                ⚡ 1-Click AI Quick Transforms
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleImprove('confident')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-left transition cursor-pointer"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-white" /> Make Confident
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">High-impact action verbs</p>
                </button>

                <button
                  onClick={() => handleImprove('shorten')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-left transition cursor-pointer"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-white" /> Shorten 20%
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Trim wordiness</p>
                </button>

                <button
                  onClick={() => handleImprove('leadership')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-left transition cursor-pointer"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-white" /> Highlight Leadership
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Emphasize metrics</p>
                </button>

                <button
                  onClick={() => handleImprove('grammar')}
                  disabled={isImproving}
                  className="p-3 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-left transition cursor-pointer"
                >
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-white" /> Fix Syntax
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Polish flow</p>
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
                setTimeout(() => setIsCalculatingAts(false), 300);
              }}
              isCalculating={isCalculatingAts}
            />

            {/* Content Textarea */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Cover Letter Content</span>
                <span className="text-[11px] text-zinc-500 font-mono">{wordCount} words</span>
              </div>
              <textarea
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 rounded-2xl bg-black border border-zinc-800 text-white text-xs leading-relaxed font-sans focus:outline-none focus:border-white resize-none selection:bg-zinc-800"
              />
            </div>

          </div>
        )}

        {/* Right Column: Paper Preview */}
        {(viewMode === 'split' || viewMode === 'paper') && (
          <div className={`${viewMode === 'paper' ? 'lg:col-span-12 max-w-4xl mx-auto' : 'lg:col-span-6'} bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" /> A4 Document Preview
              </h3>
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl gradient-btn text-xs font-extrabold transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>

            {/* Paper Render */}
            <div
              ref={paperRef}
              className="cover-letter-paper p-5 sm:p-10 rounded-xl bg-white text-black shadow-2xl min-h-[640px] space-y-6 text-xs leading-relaxed"
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

              <div className="whitespace-pre-wrap leading-relaxed text-zinc-900 text-xs">
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
