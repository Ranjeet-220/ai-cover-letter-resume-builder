'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Menu,
  Palette,
  Sliders,
  LogIn,
  User,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { isProUser } from '@/lib/usage';
import type { AppStep } from '@/features/workspace/types';

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
  onOpenApiModal,
  onOpenThemeModal,
  onOpenMobileMenu,
}: TopHeaderProps) {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const refreshUsage = () => {
      setIsPro(isProUser());
    };
    refreshUsage();
    window.addEventListener('covercraft-usage-change', refreshUsage);
    return () => window.removeEventListener('covercraft-usage-change', refreshUsage);
  }, [activeStep]);

  const getStepInfo = () => {
    switch (activeStep) {
      case 'resume':
        return { title: 'Resume Builder', icon: FileText };
      case 'cover-letter':
        return { title: 'Cover Letter', icon: Sparkles };
      case 'cv':
        return { title: 'CV Builder', icon: GraduationCap };
      case 'profiles':
        return { title: 'Resume Profiles', icon: User };
      default:
        return { title: 'CoverCraft AI Studio', icon: Sparkles };
    }
  };

  const { title: stepTitle, icon: StepIcon } = getStepInfo();

  return (
    <header className="workspace-header w-full sticky top-0 z-30 px-4 sm:px-7 py-3.5 flex items-center justify-between gap-3">
      {/* Left: Active View Section Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
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

        <div className="p-2.5 rounded-2xl workspace-icon flex items-center justify-center shrink-0">
          <StepIcon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate leading-tight">
            {stepTitle}
          </h1>
        </div>
      </div>

      {/* Right: Quick Theme/Settings Triggers & Account */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Theme Trigger */}
        <button
          onClick={onOpenThemeModal}
          className="workspace-header-action p-2 sm:px-3 sm:py-2 rounded-xl text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          title="Theme & Visuals"
          aria-label="Theme settings"
        >
          <Palette className="w-4 h-4 text-zinc-400" />
          <span className="hidden sm:inline">Theme</span>
        </button>

        {/* Quick AI Model Settings Trigger */}
        <button
          onClick={onOpenApiModal}
          className="workspace-header-action p-2 sm:px-3 sm:py-2 rounded-xl text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          title="AI Model & API Keys"
          aria-label="AI Model settings"
        >
          <Sliders className="w-4 h-4 text-zinc-400" />
          <span className="hidden sm:inline">AI Settings</span>
        </button>

        {/* Clean Sign In / Account Action */}
        {isPro ? (
          <button
            onClick={onOpenSignIn}
            aria-label="Open account"
            className="workspace-header-action flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-200 hover:text-white font-medium text-xs transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Account</span>
          </button>
        ) : (
          <button
            onClick={onOpenSignIn}
            aria-label="Sign in"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition shadow-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            <LogIn className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
