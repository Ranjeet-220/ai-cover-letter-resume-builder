'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  X,
  Send,
  CheckCircle2,
  MessageSquareHeart,
  Sparkles,
  Smile,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type FeedbackCategory =
  | 'General Feedback'
  | 'Cover Letter Quality'
  | 'Speed & Performance'
  | 'Feature Request'
  | 'UI / UX Design'
  | 'Bug Report';

export interface AspectRating {
  letterQuality: number;
  speed: number;
  easeOfUse: number;
}

export interface FeedbackData {
  id: string;
  rating: number;
  category: FeedbackCategory;
  comment: string;
  email?: string;
  aspects: AspectRating;
  createdAt: string;
}

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (feedback: FeedbackData) => void;
  initialCategory?: FeedbackCategory;
}

const CATEGORIES: FeedbackCategory[] = [
  'General Feedback',
  'Cover Letter Quality',
  'Speed & Performance',
  'Feature Request',
  'UI / UX Design',
  'Bug Report',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement 😞',
  2: 'Fair 😐',
  3: 'Good 🙂',
  4: 'Very Good! 😊',
  5: 'Amazing! 🚀',
};

const STORAGE_KEY = 'covercraft_feedback_entries';

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialCategory = 'General Feedback',
}: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [comment, setComment] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [aspects, setAspects] = useState<AspectRating>({
    letterQuality: 0,
    speed: 0,
    easeOfUse: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setCategory(initialCategory);
      setComment('');
      setEmail('');
      setAspects({ letterQuality: 0, speed: 0, easeOfUse: 0 });
      setIsSubmitting(false);
      setIsSubmitted(false);
      setErrorMessage(null);
    }
  }, [isOpen, initialCategory]);

  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    },
    [isOpen, isSubmitting, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const handleAspectRating = (aspect: keyof AspectRating, value: number) => {
    setAspects((prev) => ({ ...prev, [aspect]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage('Please select a star rating before submitting.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const feedbackPayload: FeedbackData = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rating,
        category,
        comment: comment.trim(),
        email: email.trim() || undefined,
        aspects,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      try {
        const existingRaw = localStorage.getItem(STORAGE_KEY);
        const existing: FeedbackData[] = existingRaw ? JSON.parse(existingRaw) : [];
        existing.unshift(feedbackPayload);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch (err) {
        console.warn('Could not save feedback to localStorage:', err);
      }

      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Trigger celebratory confetti animation
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981'],
        });
      } catch (err) {
        console.warn('Confetti animation failed:', err);
      }

      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(feedbackPayload);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 transition-all scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-slate-900 p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <MessageSquareHeart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2
                id="feedback-modal-title"
                className="text-lg font-bold text-white flex items-center gap-2"
              >
                <span className="gradient-text-animated">User Feedback &amp; Rating</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full">
                  CoverCraft AI
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Your feedback directly shapes our future features & AI enhancements!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {isSubmitted ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                <span className="gradient-text-animated">Thank You for Your Feedback!</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                We deeply appreciate your response. Your rating ({rating}/5 Stars) and insights help us make CoverCraft AI even better.
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-900/40"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <span>⚠️ {errorMessage}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="text-center bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Overall Rating <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center justify-center gap-2 my-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors duration-150 ${
                          star <= activeRating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700 fill-slate-800/40 hover:text-slate-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="h-5 text-xs font-medium text-amber-400 transition-all">
                  {activeRating > 0 ? RATING_LABELS[activeRating] : 'Select stars to rate'}
                </div>
              </div>

              {/* Category Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Topic / Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        category === cat
                          ? 'bg-indigo-600/90 border-indigo-500 text-white shadow-md shadow-indigo-900/30'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Quick Ratings */}
              <div className="space-y-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Specific Feature Ratings (Optional)
                </div>
                {[
                  { key: 'letterQuality' as const, label: 'Cover Letter Quality' },
                  { key: 'speed' as const, label: 'Generation Speed' },
                  { key: 'easeOfUse' as const, label: 'Ease of Use' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-300">{label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAspectRating(key, val)}
                          className="p-0.5 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              val <= aspects[key]
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Comments */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Your Comments & Suggestions
                  </label>
                  <span className="text-[10px] text-slate-500">{comment.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or how we can make CoverCraft AI even more useful for your job applications..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              {/* Optional Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-slate-500 font-normal">(Optional, for follow-up)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Banner */}
        <div className="bg-slate-950 p-3 border-t border-slate-800/80 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>CoverCraft AI Feedback Engine • Built for Job Seekers</span>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
