'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  Zap,
  Sliders,
  Sparkles,
  Menu,
} from 'lucide-react';
import { getFreeGenerationsRemaining, isProUser } from '../lib/usage';
import { AppStep } from './Sidebar';

interface TopHeaderProps {
  activeStep: AppStep;
  onOpenSignIn: () => void;
  onOpenRegister: () => void;
  onOpenApiModal: () => void;
  onOpenThemeModal: () => void;
  onOpenMobileMenu?: () => void;
}

export function TopHeader({
  activeStep,
  onOpenSignIn,
  onOpenRegister,
  onOpenApiModal,
  onOpenThemeModal,
  onOpenMobileMenu,
}: TopHeaderProps) {
  const [isPro, setIsPro] = useState(false);
  const [remainingFree, setRemainingFree] = useState(5);

  useEffect(() => {
    setIsPro(isProUser());
    setRemainingFree(getFreeGenerationsRemaining());
  }, [activeStep]);

  const getStepTitle = () => {
    switch (activeStep) {
      case 'resume':
        return 'AI Executive Resume & CV Builder';
      case 'cover-letter':
        return 'Cover Letter MVP Generator';
      case 'cv':
        return 'Executive & Academic CV Builder';
      case 'tracker':
        return 'Job Application Tracker';
      case 'profiles':
        return 'Candidate Resume Profiles';
      default:
        return 'CoverCraft AI Studio';
    }
  };

  return (
    <header className="w-full bg-black/90 dark:bg-black/90 border-b border-zinc-800 sticky top-0 z-30 px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Active View Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile Hamburger Menu Toggle */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold flex items-center justify-center shadow-sm shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
<<<<<<< HEAD
        <div>
          <h2 className="text-xs font-extrabold text-white flex items-center gap-2 tracking-tight">
            <span className="gradient-text-animated">{getStepTitle()}</span>
            <span className="hidden sm:inline-flex text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
              GEMINI 3.1 FLASH LITE
=======
        <div className="min-w-0">
          <h2 className="text-xs font-extrabold text-white flex items-center gap-2 tracking-tight truncate">
            <span className="gradient-text-animated truncate">{getStepTitle()}</span>
            <span className="hidden sm:inline-flex text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 shrink-0">
              GEMINI 3.1 FLASH LITE
            </span>
          </h2>
          <p className="text-[10px] text-zinc-400 hidden md:block">
            ATS-Tailored Career Intelligence Suite
          </p>
        </div>
      </div>

      {/* Right: User-Friendly Account & Navigation Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0 justify-end">
        
        {/* Theme & Visual Aesthetics Button */}
        <button
          onClick={onOpenThemeModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 text-xs font-semibold transition cursor-pointer"
          title="Personalize Light/Dark Mode & Accent Themes"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Theme</span>
        </button>

        {/* Model Settings Drawer Button */}
        <button
          onClick={onOpenApiModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 text-xs font-semibold transition cursor-pointer"
          title="Configure AI Models & Keys"
        >
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span>AI Engine</span>
        </button>

        {/* Free / Pro Usage Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span className="text-zinc-400 hidden sm:inline">Status:</span>
          <span className="font-extrabold text-white">
            {isPro ? 'Pro Unlimited' : `${remainingFree}/5 Free`}
          </span>
        </div>

        {/* Sign In Button */}
        <button
          onClick={onOpenSignIn}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-900 text-white font-bold text-xs border border-zinc-700 hover:border-white transition shadow-sm cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5 text-white" />
          <span>Sign In</span>
        </button>

        {/* Register Free / Upgrade Button */}
        <button
          onClick={onOpenRegister}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gradient-btn font-extrabold text-xs transition shadow-md cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-white" />
          <span>{isPro ? 'Account' : 'Register Free'}</span>
        </button>

      </div>
    </header>
  );
}
