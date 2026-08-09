"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import {
  Sparkles,
  Building2,
  Briefcase,
  FileText,
  Sliders,
  Key,
  Plus,
  X,
  Zap,
  ChevronRight,
  Check,
  BrainCircuit,
  Loader2,
} from "lucide-react";

export interface GeneratorFormData {
  jobTitle: string;
  targetCompany: string;
  jobDescription: string;
  resume: string;
  tone: string;
  length: string;
  focusKeywords: string[];
  apiKey: string;
}

export interface MatchScoreResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: string[];
  method: string;
}

interface GeneratorFormProps {
  onGenerate?: (data: { coverLetter: string; generatedWith: string; tone: string; length: string }) => void;
  onMatchScore?: (result: MatchScoreResult) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

const SAMPLE_TEMPLATES = [
  {
    id: "swe-google",
    label: "Software Engineer at Google",
    icon: "🟢",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300",
    data: {
      jobTitle: "Senior Full-Stack Software Engineer",
      targetCompany: "Google",
      jobDescription:
        "We are seeking a Senior Full-Stack Engineer to lead the design and execution of high-throughput web applications. Requirements: 5+ years experience in React, TypeScript, and Node.js; deep knowledge of distributed systems, web performance, and API design. Proven track record of cross-functional team leadership and delivering 99.99% uptime services.",
      resume:
        "Experienced Full-Stack Software Engineer with 6 years building high-throughput cloud web applications in React, TypeScript, Node.js, and Python. Spearheaded engineering initiatives that reduced API latency by 40% and improved web vitals by 35%. Managed cross-functional agile teams of 8 engineers and architected microservices serving over 15M monthly active users.",
      tone: "Confident",
      length: "Medium",
      focusKeywords: ["TypeScript", "React", "System Architecture", "High Throughput", "Latency Reduction"],
    },
  },
  {
    id: "pm-stripe",
    label: "Product Manager at Stripe",
    icon: "🟣",
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300",
    data: {
      jobTitle: "Senior Product Manager - Core Payments",
      targetCompany: "Stripe",
      jobDescription:
        "Drive product vision, strategy, and execution for Stripe's global payments infrastructure. Collaborate closely with engineering, design, and risk teams to scale developer experience, improve transaction success rates, and launch localized payment methods across emerging markets.",
      resume:
        "Data-driven Senior Product Manager with 5 years leading fintech and developer API products. Increased checkout payment conversion by 18% across 12 countries. Managed end-to-end product roadmaps for APIs handling $2B+ in annual transaction volume, conducting continuous user research and A/B experimentation.",
      tone: "Executive",
      length: "Detailed",
      focusKeywords: ["Developer API", "Payment Conversion", "Fintech Strategy", "Global Scale", "A/B Testing"],
    },
  },
  {
    id: "ds-netflix",
    label: "Data Scientist at Netflix",
    icon: "🔴",
    color: "from-rose-500/20 to-red-500/20 border-rose-500/40 text-rose-300",
    data: {
      jobTitle: "Lead Data Scientist - Recommendations",
      targetCompany: "Netflix",
      jobDescription:
        "Build state-of-the-art recommendation and personalization models powering content discovery for hundreds of millions of global members. Expertise in Python, PyTorch/TensorFlow, SQL, large-scale A/B testing, and deep learning recommendation architectures required.",
      resume:
        "Senior Data Scientist specializing in Machine Learning and Deep Learning algorithms. Built recommendation engines serving 10M+ daily active users using PyTorch, Spark, and Scikit-learn. Spearheaded experimental frameworks that increased member watch time retention by 22% and published 2 papers on multi-armed bandit optimization.",
      tone: "Professional",
      length: "Medium",
      focusKeywords: ["PyTorch", "Recommendation Systems", "A/B Testing", "Machine Learning", "Python"],
    },
  },
];

const TONE_OPTIONS = [
  { id: "Professional", label: "Professional", icon: "💼", badge: "Balanced & Polished" },
  { id: "Confident", label: "Confident", icon: "🚀", badge: "Assertive & High-Impact" },
  { id: "Enthusiastic", label: "Enthusiastic", icon: "🔥", badge: "Passionate & Energetic" },
  { id: "Executive", label: "Executive", icon: "👔", badge: "Strategic & Leadership" },
  { id: "Creative", label: "Creative", icon: "🎨", badge: "Engaging & Distinctive" },
  { id: "Concise", label: "Concise", icon: "⚡", badge: "Punchy & Direct" },
];

const LENGTH_OPTIONS = [
  { id: "Short", label: "Short", detail: "~200 words", desc: "3 concise paragraphs for quick reads" },
  { id: "Medium", label: "Medium", detail: "~350 words", desc: "Standard 4-paragraph cover letter format" },
  { id: "Detailed", label: "Detailed", detail: "~500 words", desc: "Comprehensive letter with bullet highlights" },
];

export default function GeneratorForm({
  onGenerate,
  onMatchScore,
  onLoadingStateChange,
}: GeneratorFormProps) {
  const [activeTab, setActiveTab] = useState<"job" | "resume" | "style">("job");
  
  // Form State
  const [jobTitle, setJobTitle] = useState("Senior Full-Stack Software Engineer");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [jobDescription, setJobDescription] = useState(
    "We are seeking a Senior Full-Stack Engineer to lead the design and execution of high-throughput web applications. Requirements: 5+ years experience in React, TypeScript, and Node.js; deep knowledge of distributed systems, web performance, and API design."
  );
  const [resume, setResume] = useState(
    "Experienced Full-Stack Software Engineer with 6 years building high-throughput cloud web applications in React, TypeScript, Node.js, and Python. Spearheaded engineering initiatives that reduced API latency by 40% and improved web vitals by 35%."
  );
  const [tone, setTone] = useState("Confident");
  const [length, setLength] = useState("Medium");
  const [focusKeywords, setFocusKeywords] = useState<string[]>([
    "TypeScript",
    "React",
    "System Architecture",
  ]);
  const [keywordInput, setKeywordInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyDrawer, setShowApiKeyDrawer] = useState(false);

  // Status state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Keyword tag handler
  const handleAddKeyword = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter" && e.key !== ",") return;
    if (e) e.preventDefault();

    const trimmed = keywordInput.trim().replace(/,/g, "");
    if (trimmed && !focusKeywords.includes(trimmed)) {
      setFocusKeywords([...focusKeywords, trimmed]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFocusKeywords(focusKeywords.filter((k) => k !== keywordToRemove));
  };

  // Sample Preset loader
  const handleLoadSample = (sample: (typeof SAMPLE_TEMPLATES)[0]) => {
    setJobTitle(sample.data.jobTitle);
    setTargetCompany(sample.data.targetCompany);
    setJobDescription(sample.data.jobDescription);
    setResume(sample.data.resume);
    setTone(sample.data.tone);
    setLength(sample.data.length);
    setFocusKeywords(sample.data.focusKeywords);
    setSuccessMessage(`Loaded template: "${sample.label}"`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle Form Submission / Cover Letter Generation
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsGenerating(true);
    if (onLoadingStateChange) onLoadingStateChange(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          targetCompany,
          jobDescription,
          resume,
          tone,
          length,
          focusKeywords,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      const usedModel = data.generatedWith && data.generatedWith !== "fallback"
        ? "Gemini/Claude AI"
        : "Smart Fallback Generator";
      setSuccessMessage(`Successfully generated letter using ${usedModel}!`);
      setTimeout(() => setSuccessMessage(""), 4000);

      if (onGenerate) {
        onGenerate({
          coverLetter: data.coverLetter,
          generatedWith: data.generatedWith,
          tone: data.tone,
          length: data.length,
        });
      }
    } catch (err: any) {
      console.error("GeneratorForm error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while generating.");
    } finally {
      setIsGenerating(false);
      if (onLoadingStateChange) onLoadingStateChange(false);
    }
  };

  // Handle Match Score Calculation
  const handleCalculateMatchScore = async () => {
    setErrorMessage("");
    setIsCalculatingScore(true);
    if (onLoadingStateChange) onLoadingStateChange(true);

    try {
      const response = await fetch("/api/match-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          resume,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to calculate match score");
      }

      if (onMatchScore) {
        onMatchScore({
          score: data.score,
          matchedKeywords: data.matchedKeywords,
          missingKeywords: data.missingKeywords,
          strengths: data.strengths,
          recommendations: data.recommendations,
          method: data.method,
        });
      }
      setSuccessMessage(`Match score calculated: ${data.score}%`);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error("Match Score error:", err);
      setErrorMessage(err.message || "Failed to calculate match score.");
    } finally {
      setIsCalculatingScore(false);
      if (onLoadingStateChange) onLoadingStateChange(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
      {/* Top Header & Preset Templates */}
      <div className="mb-6 border-b border-white/10 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              Cover Letter Generator Specs
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Customize target position, candidate experience, and AI tone parameters.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowApiKeyDrawer(!showApiKeyDrawer)}
            className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/50 px-3 py-1.5 rounded-lg border border-purple-500/30 transition-all self-start sm:self-auto"
          >
            <Key className="w-3.5 h-3.5" />
            {apiKey ? "Gemini Key Configured ✓" : "Custom Gemini API Key"}
          </button>
        </div>

        {/* Optional Custom API Key Drawer */}
        {showApiKeyDrawer && (
          <div className="mb-4 p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs animate-fade-in">
            <label className="block text-purple-200 font-medium mb-1">
              Google Gemini API Key (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (Leave empty to use built-in smart fallback)"
                className="flex-1 bg-black/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={() => setApiKey("")}
                  className="px-3 py-2 text-red-400 hover:bg-red-950/40 rounded-lg border border-red-500/30"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              If provided, requests will be routed to your Gemini key. If empty or invalid, our built-in fallback generator will process your letter seamlessly.
            </p>
          </div>
        )}

        {/* Preset Sample Buttons */}
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            ⚡ 1-Click Sample Preset Templates:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SAMPLE_TEMPLATES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border bg-gradient-to-r text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${sample.color}`}
              >
                <span className="text-lg">{sample.icon}</span>
                <div className="truncate">
                  <div className="text-xs font-semibold truncate">{sample.label}</div>
                  <div className="text-[10px] opacity-75 truncate">{sample.data.jobTitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("job")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === "job"
              ? "border-purple-500 text-purple-300 bg-purple-500/10 rounded-t-lg"
              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-t-lg"
          }`}
        >
          <Building2 className="w-4 h-4" />
          1. Job & Company
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resume")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === "resume"
              ? "border-blue-500 text-blue-300 bg-blue-500/10 rounded-t-lg"
              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-t-lg"
          }`}
        >
          <FileText className="w-4 h-4" />
          2. Candidate Resume
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
            activeTab === "style"
              ? "border-emerald-500 text-emerald-300 bg-emerald-500/10 rounded-t-lg"
              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-t-lg"
          }`}
        >
          <Sliders className="w-4 h-4" />
          3. Tone & Style
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-200 text-xs flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between">
          <span>✅ {successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Fields Content */}
      <form onSubmit={handleGenerate} className="space-y-5">
        {/* Tab 1: Job & Company */}
        {activeTab === "job" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Target Job Title *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Target Company Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. Google, Stripe, Netflix"
                    className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Job Description / Requirements *
                </label>
                <span className="text-[11px] text-gray-500">{jobDescription.length} characters</span>
              </div>
              <textarea
                required
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job posting description, key responsibilities, and required qualifications here..."
                className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab("resume")}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all"
              >
                Next: Candidate Resume <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Candidate Resume & Focus Keywords */}
        {activeTab === "resume" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Your Resume / Work History Summary *
                </label>
                <span className="text-[11px] text-gray-500">{resume.length} characters</span>
              </div>
              <textarea
                required
                rows={6}
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume bullet points, key achievements, years of experience, and main tech stack..."
                className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>

            {/* Interactive Focus Keywords Tags */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Target Focus Keywords & Skills to Emphasize
              </label>
              <div className="p-3 bg-black/40 border border-white/15 rounded-xl space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {focusKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {focusKeywords.length === 0 && (
                    <span className="text-xs text-gray-500 italic">No custom focus keywords added yet.</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder="Type skill & press Enter (e.g. System Design, PyTorch)..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tag
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setActiveTab("job")}
                className="text-xs text-gray-400 hover:text-white"
              >
                ← Back to Job Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("style")}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all"
              >
                Next: Tone & Length <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Tone & Length */}
        {activeTab === "style" && (
          <div className="space-y-5 animate-fade-in">
            {/* Tone Selector Pills */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Select Letter Tone & Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TONE_OPTIONS.map((t) => {
                  const isSelected = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10 ring-1 ring-purple-500"
                          : "bg-black/30 border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{t.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="text-xs font-bold mt-1.5">{t.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length Selector Segmented Control */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Target Letter Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTH_OPTIONS.map((l) => {
                  const isSelected = length === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLength(l.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500"
                          : "bg-black/30 border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold">{l.label}</div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{l.detail}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveTab("resume")}
                className="text-xs text-gray-400 hover:text-white"
              >
                ← Back to Resume
              </button>
            </div>
          </div>
        )}

        {/* Form Action Buttons Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <button
            type="button"
            onClick={handleCalculateMatchScore}
            disabled={isCalculatingScore || isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 text-xs font-semibold transition-all disabled:opacity-50"
          >
            {isCalculatingScore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                Calculating ATS Score...
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4 text-blue-400" />
                Analyze Match Score
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isGenerating || isCalculatingScore}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Drafting Cover Letter...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                Generate Tailored Cover Letter
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
