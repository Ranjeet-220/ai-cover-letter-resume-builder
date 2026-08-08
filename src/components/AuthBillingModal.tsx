'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { X, Zap, Check, Shield, Mail, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getErrorMessage, isRecord } from '../lib/errors';

interface AuthBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reason?: 'limit_reached' | 'upgrade_click';
  initialTab?: 'pricing' | 'auth';
  initialAuthMode?: 'signin' | 'signup';
}

export function AuthBillingModal({
  isOpen,
  onClose,
  onSuccess,
  reason = 'limit_reached',
  initialTab = 'pricing',
  initialAuthMode = 'signin',
}: AuthBillingModalProps) {
  const [tab, setTab] = useState<'pricing' | 'auth'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialAuthMode);
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setAuthMode(initialAuthMode);
      setAuthMessage(null);
    }
  }, [isOpen, initialTab, initialAuthMode]);

  if (!isOpen) return null;

  const handleStripeCheckout = async (plan: 'unlimited' | 'pack') => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data: unknown = await res.json();

      if (!res.ok || !isRecord(data) || typeof data.url !== 'string') {
        const message = isRecord(data) && typeof data.error === 'string'
          ? data.error
          : 'Unable to start checkout.';
        throw new Error(message);
      }
      window.location.assign(data.url);
    } catch (err: unknown) {
      setAuthMessage(getErrorMessage(err, 'Unable to start checkout.'));
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage(null);

    try {
      if (!supabase) {
        setAuthMessage('Authentication is not configured for this deployment.');
        return;
      }

      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthMessage('Account created successfully!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthMessage('Logged in successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Auth error';
      setAuthMessage(`Notice: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-black border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="bg-zinc-950 p-6 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white text-black rounded-2xl font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span className="gradient-text-animated">
                  {reason === 'limit_reached' ? 'Free Limit Reached' : 'Upgrade CoverCraft Pro'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {reason === 'limit_reached'
                  ? 'You have used all 5 free generations. Sign in or upgrade to create unlimited documents.'
                  : 'Unlock unlimited AI generations, custom models, and executive exports.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1.5 px-6 gap-2">
          <button
            onClick={() => setTab('pricing')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'pricing' ? 'gradient-active shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Stripe Subscription ($9/mo)
          </button>
          <button
            onClick={() => setTab('auth')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              tab === 'auth' ? 'gradient-active shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Sign In / Register
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {authMessage && (
            <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-bold">
              <span>{authMessage}</span>
            </div>
          )}

          {tab === 'pricing' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-5 rounded-2xl bg-zinc-900 border-2 border-white flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pro Unlimited</div>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      $9 <span className="text-xs font-normal text-zinc-400">/ month</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-white" /> Unlimited Generations
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-white" /> Gemini 2.5 Flash & Pro
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-white" /> PDF & Markdown Exports
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleStripeCheckout('unlimited')}
                    disabled={loading}
                    className="mt-5 w-full py-2.5 rounded-xl gradient-btn font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? 'Processing...' : 'Subscribe ($9/mo)'}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">15 Credit Pack</div>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      $5 <span className="text-xs font-normal text-zinc-400">one-time</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400" /> 15 AI Generations
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400" /> Pay as you go
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleStripeCheckout('pack')}
                    disabled={loading}
                    className="mt-5 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition border border-zinc-700 cursor-pointer"
                  >
                    {loading ? 'Processing...' : 'Buy Credit Pack ($5)'}
                  </button>
                </div>

              </div>

            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl gradient-btn font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : authMode === 'signin' ? 'Sign In' : 'Create Free Account'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-zinc-400 hover:text-white underline transition"
                >
                  {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-zinc-950 p-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Secured with Stripe & Supabase Authentication</span>
        </div>

      </div>
    </div>
  );
}
