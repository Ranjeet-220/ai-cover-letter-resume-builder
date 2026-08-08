'use client';

import React, { useState } from 'react';
import {
  Check,
  Plus,
  Sparkles,
  Zap,
  RotateCcw,
  TrendingUp,
  AlertCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Loader2,
  Wand2,
  Filter,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { calculateAtsMatchScore, AtsAnalysisResult } from '../lib/atsUtils';

export interface AtsMatchAnalyzerProps {
  score?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  recommendedKeywords?: string[];
  documentText?: string;
  jobDescription?: string;
  jobTitle?: string;
  onWeaveKeyword?: (keyword: string) => void;
  onWeaveAllKeywords?: () => void;
  onRecalculate?: () => void;
  isWeaving?: boolean;
  isCalculating?: boolean;
  strengths?: string[];
  recommendations?: string[];
  className?: string;
}

export function AtsMatchAnalyzer({
  score: propScore,
  matchedKeywords: propMatchedKeywords,
  missingKeywords: propMissingKeywords,
  recommendedKeywords: propRecommendedKeywords,
  documentText = '',
  jobDescription = '',
  jobTitle = '',
  onWeaveKeyword,
  onWeaveAllKeywords,
  onRecalculate,
  isWeaving = false,
  isCalculating = false,
  strengths: propStrengths,
  recommendations: propRecommendations,
  className = '',
}: AtsMatchAnalyzerProps) {
  const [weavingKeyword, setWeavingKeyword] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'matched' | 'missing' | 'recommended'>('all');

  // Compute fallback / computed values if props aren't provided explicitly
  const computedAnalysis: AtsAnalysisResult = React.useMemo(() => {
    if (
      propScore !== undefined &&
      propMatchedKeywords !== undefined &&
      propMissingKeywords !== undefined
    ) {
      return {
        score: propScore,
        matchedKeywords: propMatchedKeywords,
        missingKeywords: propMissingKeywords,
        strengths: propStrengths || [],
        recommendations: propRecommendations || [],
      };
    }
    return calculateAtsMatchScore(documentText, jobDescription, jobTitle);
  }, [
    propScore,
    propMatchedKeywords,
    propMissingKeywords,
    propStrengths,
    propRecommendations,
    documentText,
    jobDescription,
    jobTitle,
  ]);

  const score = propScore !== undefined ? propScore : computedAnalysis.score;
  const matchedKeywords = propMatchedKeywords || computedAnalysis.matchedKeywords;
  const missingKeywords = propMissingKeywords || computedAnalysis.missingKeywords;
  
  // Synthesize recommended keywords (top priority missing or industry standard high-impact keywords)
  const recommendedKeywords = React.useMemo(() => {
    if (propRecommendedKeywords && propRecommendedKeywords.length > 0) {
      return propRecommendedKeywords;
    }
    // Take top missing keywords or suggest strategic ones
    const topMissing = missingKeywords.slice(0, 4);
    if (topMissing.length > 0) return topMissing;
    return ['Metrics & KPIs', 'Cross-Functional Leadership', 'Process Optimization'];
  }, [propRecommendedKeywords, missingKeywords]);

  const strengths = propStrengths || computedAnalysis.strengths;
  const recommendations = propRecommendations || computedAnalysis.recommendations;

  // Rating label & color configuration based on ATS score
  const getScoreRating = (val: number) => {
    if (val >= 85) {
      return {
        label: 'EXCELLENT MATCH',
        subtext: 'High probability of clearing ATS screening filters',
        color: 'text-emerald-400',
        stroke: '#34d399',
        gradientId: 'ats-emerald-grad',
        glowColor: 'rgba(52, 211, 153, 0.25)',
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-600',
      };
    }
    if (val >= 70) {
      return {
        label: 'STRONG ALIGNMENT',
        subtext: 'Good keyword density, minor optimization recommended',
        color: 'text-indigo-400',
        stroke: '#818cf8',
        gradientId: 'ats-indigo-grad',
        glowColor: 'rgba(129, 140, 248, 0.25)',
        bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
        badgeBg: 'bg-indigo-950 text-indigo-300 border-indigo-600',
      };
    }
    if (val >= 50) {
      return {
        label: 'MODERATE MATCH',
        subtext: 'Weave missing core skills to boost recruiter visibility',
        color: 'text-amber-400',
        stroke: '#fbbf24',
        gradientId: 'ats-amber-grad',
        glowColor: 'rgba(251, 191, 36, 0.25)',
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        badgeBg: 'bg-amber-950 text-amber-300 border-amber-600',
      };
    }
    return {
      label: 'NEEDS KEYWORDS',
      subtext: 'Critical skills missing; high risk of automated rejection',
      color: 'text-rose-400',
      stroke: '#f43f5e',
      gradientId: 'ats-rose-grad',
      glowColor: 'rgba(244, 63, 94, 0.25)',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-600',
    };
  };

  const rating = getScoreRating(score);

  // SVG Meter Math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleKeywordClick = (keyword: string) => {
    setWeavingKeyword(keyword);
    if (onWeaveKeyword) {
      onWeaveKeyword(keyword);
    }
    setTimeout(() => {
      setWeavingKeyword(null);
      if (onRecalculate) {
        onRecalculate();
      }
    }, 400);
  };

  const handleWeaveAllClick = () => {
    if (onWeaveAllKeywords) {
      onWeaveAllKeywords();
    } else if (onWeaveKeyword && missingKeywords.length > 0) {
      missingKeywords.forEach((kw, idx) => {
        setTimeout(() => onWeaveKeyword(kw), idx * 150);
      });
    }
  };

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const matchPercentage = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 0;

  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6 text-white relative overflow-hidden ${className}`}>
      {/* Background ambient lighting */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{ background: rating.glowColor }}
      />

      {/* Top Header & High-Impact Score Gauge */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-zinc-800/80 relative z-10">
        
        {/* Left Info Column */}
        <div className="space-y-3 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="p-2 rounded-xl bg-white text-black font-extrabold flex items-center justify-center shadow-md">
              <ShieldCheck className="w-4 h-4 fill-black text-white" />
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
              <span className="gradient-text-animated">ATS Match Gauge</span>
              <span className="text-[10px] font-mono text-zinc-400 font-normal normal-case">v2.5 AI</span>
            </h3>
            <span className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full border uppercase tracking-wider shadow-sm ${rating.bg}`}>
              {rating.label}
            </span>
          </div>

          <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
            {rating.subtext}. Click missing keyword chips to auto-weave them into your resume or cover letter.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-center md:justify-start gap-4 pt-1 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-400">Matched:</span>
              <strong className="text-white font-bold">{matchedKeywords.length}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-zinc-400">Missing:</span>
              <strong className="text-white font-bold">{missingKeywords.length}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-zinc-400">Recommended:</span>
              <strong className="text-white font-bold">{recommendedKeywords.length}</strong>
            </div>

            {onRecalculate && (
              <button
                onClick={onRecalculate}
                disabled={isCalculating}
                className="text-xs font-bold text-zinc-400 hover:text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-50 ml-auto"
                title="Re-run ATS match algorithm"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>

          {/* Keyword Match Progress Bar */}
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800/80 mt-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full transition-all duration-700 rounded-full"
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
        </div>

        {/* Right High-Impact SVG Score Meter Gauge */}
        <div className="relative flex items-center justify-center shrink-0 p-2">
          <svg className="w-32 h-32 transform -rotate-90 filter drop-shadow-lg">
            <defs>
              <linearGradient id="ats-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="ats-indigo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="ats-amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="ats-rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-zinc-900"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Dynamic Animated Score Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={`url(#${rating.gradientId})`}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isCalculating ? (
              <Loader2 className="w-7 h-7 animate-spin text-white" />
            ) : (
              <>
                <div className="flex items-baseline justify-center">
                  <span className={`text-3xl font-black tracking-tight ${rating.color}`}>
                    {score}
                  </span>
                  <span className="text-xs font-bold text-zinc-400 ml-0.5">%</span>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 mt-0.5">
                  ATS PASS
                </span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Filter Tabs & Color-Coded Keyword Chips */}
      <div className="space-y-4 relative z-10">
        
        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterMode === 'all' ? 'gradient-active shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Chips ({matchedKeywords.length + missingKeywords.length})
            </button>
            <button
              onClick={() => setFilterMode('missing')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'missing' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <Plus className="w-3 h-3" /> Missing ({missingKeywords.length})
            </button>
            <button
              onClick={() => setFilterMode('matched')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'matched' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Check className="w-3 h-3" /> Matched ({matchedKeywords.length})
            </button>
            <button
              onClick={() => setFilterMode('recommended')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'recommended' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Recommended ({recommendedKeywords.length})
            </button>
          </div>

          {missingKeywords.length > 0 && (onWeaveAllKeywords || onWeaveKeyword) && (
            <button
              onClick={handleWeaveAllClick}
              disabled={isWeaving}
              className="text-xs font-bold gradient-btn px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5 text-white" />
              Auto-Weave All Missing
            </button>
          )}
        </div>

        {/* Color-coded Chips Grid */}
        <div className="space-y-4">
          
          {/* Missing Keywords Chips (Rose Red theme) */}
          {(filterMode === 'all' || filterMode === 'missing') && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Missing Required Keywords ({missingKeywords.length})
              </label>

              {missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((keyword) => {
                    const isCurrentlyWeaving = weavingKeyword === keyword || isWeaving;
                    return (
                      <button
                        key={keyword}
                        onClick={() => handleKeywordClick(keyword)}
                        disabled={isCurrentlyWeaving}
                        title={`Click to naturally weave "${keyword}" into document text`}
                        className="group relative px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800/80 hover:border-rose-400 text-rose-200 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                      >
                        {isCurrentlyWeaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-rose-400 group-hover:text-white group-hover:rotate-90 transition-transform" />
                        )}
                        <span>{keyword}</span>
                        <span className="text-[9px] font-extrabold text-white bg-rose-600 px-1.5 py-0.5 rounded transition-opacity ml-1 shadow">
                          +Weave
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No missing keywords detected! Your document covers all extracted job requirements.</span>
                </div>
              )}
            </div>
          )}

          {/* Matched Keywords Chips (Emerald Green theme) */}
          {(filterMode === 'all' || filterMode === 'matched') && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Verified Matched Keywords ({matchedKeywords.length})
              </label>

              {matchedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {matchedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                      <span>{keyword}</span>
                      <span className="text-[9px] font-mono uppercase bg-emerald-900/80 text-emerald-300 px-1 rounded border border-emerald-700/50">
                        MATCHED
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No matched keywords yet. Add skills to your resume/letter.</p>
              )}
            </div>
          )}

          {/* Recommended Keywords Chips (Purple theme) */}
          {(filterMode === 'all' || filterMode === 'recommended') && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Strategic High-Impact Recommendations ({recommendedKeywords.length})
              </label>

              <div className="flex flex-wrap gap-2">
                {recommendedKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => handleKeywordClick(keyword)}
                    title={`Add strategic keyword "${keyword}" to boost ATS ranking`}
                    className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/80 hover:border-purple-400 text-purple-200 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>{keyword}</span>
                    <span className="text-[9px] font-extrabold text-purple-300 bg-purple-900/90 px-1.5 py-0.5 rounded border border-purple-700">
                      +Strategic
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Expandable Strengths & Recommendations Details */}
      {(strengths.length > 0 || recommendations.length > 0) && (
        <div className="pt-2 border-t border-zinc-800 relative z-10">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-bold text-zinc-400 hover:text-white transition py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-white" />
              ATS Audit Breakdown & Optimization Advice ({strengths.length + recommendations.length})
            </span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3 text-xs animate-fade-in">
              {strengths.length > 0 && (
                <div className="bg-black/90 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <span className="font-extrabold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Key Strengths Identified
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 text-xs">
                    {strengths.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="bg-black/90 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <span className="font-extrabold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> High-Impact Action Items
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 text-xs">
                    {recommendations.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default AtsMatchAnalyzer;
