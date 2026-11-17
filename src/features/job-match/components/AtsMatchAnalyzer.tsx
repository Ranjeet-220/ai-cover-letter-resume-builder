'use client';

import React, { useState } from 'react';
import {
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Wand2,
  Target,
} from 'lucide-react';
import { calculateAtsMatchScore, AtsAnalysisResult } from '@/lib/atsUtils';

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
  const [showTips, setShowTips] = useState(false);

  // Compute fallback / computed values if props aren't provided explicitly.
  const usesProvidedAnalysis =
    propScore !== undefined &&
    propMatchedKeywords !== undefined &&
    propMissingKeywords !== undefined;

  const computedAnalysis: AtsAnalysisResult = React.useMemo(() => {
    if (usesProvidedAnalysis) {
      return {
        score: propScore as number,
        matchedKeywords: propMatchedKeywords as string[],
        missingKeywords: propMissingKeywords as string[],
        strengths: propStrengths || [],
        recommendations: propRecommendations || [],
      };
    }
    return calculateAtsMatchScore(documentText, jobDescription, jobTitle);
  }, [
    usesProvidedAnalysis,
    propScore,
    propMatchedKeywords,
    propMissingKeywords,
    propStrengths,
    propRecommendations,
    documentText,
    jobDescription,
    jobTitle,
  ]);

  const score = usesProvidedAnalysis ? (propScore as number) : computedAnalysis.score;
  const matchedKeywords = usesProvidedAnalysis
    ? (propMatchedKeywords as string[])
    : computedAnalysis.matchedKeywords;
  const missingKeywords = usesProvidedAnalysis
    ? (propMissingKeywords as string[])
    : computedAnalysis.missingKeywords;

  const strengths = propStrengths || computedAnalysis.strengths;
  const recommendations = propRecommendations || computedAnalysis.recommendations;

  // Encouraging score feedback
  const getScoreFeedback = (val: number) => {
    if (val >= 80) {
      return {
        label: 'Strong Match',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        barColor: 'bg-emerald-500',
        message: 'Your letter aligns well with the key requirements for this position.',
      };
    }
    if (val >= 60) {
      return {
        label: 'Good Match',
        badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        barColor: 'bg-indigo-500',
        message: 'Good alignment. Weave a few more target keywords below to stand out.',
      };
    }
    return {
      label: 'Needs Keywords',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      barColor: 'bg-amber-500',
      message: 'Click missing keywords below to insert them naturally into your text.',
    };
  };

  const feedback = getScoreFeedback(score);

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
      return;
    }
    if (!onWeaveKeyword || missingKeywords.length === 0) return;
    missingKeywords.forEach((kw, idx) => {
      setTimeout(() => onWeaveKeyword(kw), idx * 150);
    });
    if (onRecalculate) {
      setTimeout(() => onRecalculate(), missingKeywords.length * 150 + 100);
    }
  };

  return (
    <div className={`bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 text-white shadow-sm ${className}`}>
      {/* Top Header & Score Pill/Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                ATS Keyword Match
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${feedback.badgeClass}`}>
                {feedback.label}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {feedback.message}
            </p>
          </div>
        </div>

        {/* Score pill & Refresh */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black border border-zinc-800">
            <span className="text-xs text-zinc-400 font-medium">Score</span>
            <span className="text-base font-extrabold text-white">
              {score}%
            </span>
          </div>

          {onRecalculate && (
            <button
              onClick={onRecalculate}
              disabled={isCalculating}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer disabled:opacity-50"
              title="Recalculate score"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Summary Stats */}
      <div className="space-y-1.5">
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${feedback.barColor}`}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>{matchedKeywords.length} matched keywords</span>
          <span>{missingKeywords.length} missing</span>
        </div>
      </div>

      {/* Missing Keywords (Actionable) */}
      {missingKeywords.length > 0 && (
        <div className="pt-2 space-y-2 border-t border-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <span>Missing Keywords</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-400 font-mono">
                {missingKeywords.length}
              </span>
            </span>

            {(onWeaveAllKeywords || onWeaveKeyword) && (
              <button
                onClick={handleWeaveAllClick}
                disabled={isWeaving}
                className="text-[11px] font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3 text-zinc-400" />
                Add all to letter
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((keyword) => {
              const isCurrentlyWeaving = weavingKeyword === keyword || isWeaving;
              return (
                <button
                  key={keyword}
                  onClick={() => handleKeywordClick(keyword)}
                  disabled={isCurrentlyWeaving}
                  title={`Click to insert "${keyword}" into your draft`}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-60"
                >
                  {isCurrentlyWeaving ? (
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                  ) : (
                    <Plus className="w-3 h-3 text-zinc-400" />
                  )}
                  <span>{keyword}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Matched Keywords (Clean & Encouraging) */}
      {matchedKeywords.length > 0 && (
        <div className="pt-2 space-y-2 border-t border-zinc-900">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <span>Matched Keywords</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-900 text-zinc-500 font-mono">
              {matchedKeywords.length}
            </span>
          </span>

          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((keyword) => (
              <span
                key={keyword}
                className="px-2.5 py-1 rounded-lg bg-black border border-zinc-850 text-zinc-400 text-xs font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{keyword}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Optional Collapsible Audit Tips */}
      {(strengths.length > 0 || recommendations.length > 0) && (
        <div className="pt-2 border-t border-zinc-900">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center justify-between w-full text-xs text-zinc-400 hover:text-zinc-200 transition py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              Optimization Tips
            </span>
            {showTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTips && (
            <div className="mt-2 space-y-2 text-xs bg-black/60 p-3 rounded-xl border border-zinc-850">
              {strengths.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Strengths</span>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-300">
                    {strengths.slice(0, 3).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {recommendations.length > 0 && (
                <div className={strengths.length > 0 ? 'mt-2 pt-2 border-t border-zinc-900' : ''}>
                  <span className="text-[11px] font-semibold text-zinc-300 block mb-1">Suggestions</span>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                    {recommendations.slice(0, 3).map((r, idx) => (
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
