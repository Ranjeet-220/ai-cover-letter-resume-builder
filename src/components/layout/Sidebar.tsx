'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Zap,
  Briefcase,
  User,
  GraduationCap,
  ChevronRight,
  MessageSquareHeart,
  Menu,
  Sliders,
  Palette,
  X,
} from 'lucide-react';
import { getFreeGenerationsRemaining, isProUser } from '@/lib/usage';

import type { AppStep } from '@/features/workspace/types';

interface SidebarProps {
  activeStep: AppStep;
  onSelectStep: (step: AppStep) => void;
  onOpenFeedback: () => void;
  onOpenAuthModal: () => void;
  onOpenApiModal: () => void;
  onOpenThemeModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeStep,
  onSelectStep,
  onOpenFeedback,
  onOpenAuthModal,
  onOpenApiModal,
  onOpenThemeModal,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const [isPro, setIsPro] = useState(false);
  const [remainingFree, setRemainingFree] = useState(5);

  useEffect(() => {
    const refreshUsage = () => {
      setIsPro(isProUser());
      setRemainingFree(getFreeGenerationsRemaining());
    };
    refreshUsage();
    window.addEventListener('covercraft-usage-change', refreshUsage);
    return () => window.removeEventListener('covercraft-usage-change', refreshUsage);
  }, [activeStep]);

  const steps = [
    {
      id: 'resume' as AppStep,
      name: 'Resume Builder',
      subtitle: 'Create & tailor resumes',
      icon: FileText,
    },
    {
      id: 'cover-letter' as AppStep,
      name: 'Cover Letter',
      subtitle: 'AI cover letter generator',
      icon: Sparkles,
    },
    {
      id: 'cv' as AppStep,
      name: 'CV Builder',
      subtitle: 'Academic & executive CV',
      icon: GraduationCap,
    },
  ];

  const tools = [
    {
      id: 'tracker' as AppStep,
      name: 'Application Tracker',
      icon: Briefcase,
    },
    {
      id: 'profiles' as AppStep,
      name: 'Resume Profiles',
      icon: User,
    },
  ];

  return (
    <aside
      className={`workspace-sidebar fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-dvh flex flex-col transition-all duration-300 max-lg:w-72 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      } ${isMobileOpen ? 'translate-x-0' : 'max-lg:-translate-x-full'}`}
    >
      {/* Top Header & Brand */}
      <div className="min-h-0 flex-1 flex flex-col">
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="p-2.5 rounded-xl bg-white text-black font-bold shadow-md shrink-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-sm font-extrabold text-white tracking-tight">
                  <span className="gradient-text-animated">CoverCraft AI</span>
                </h1>
                <p className="text-[10px] text-zinc-400">Career workspace</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                aria-label="Close sidebar navigation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Guided Navigation */}
        <nav aria-label="Workspace navigation" className="p-3 space-y-6 overflow-y-auto min-h-0">
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Workspace
              </div>
            )}

            <div className="space-y-1.5">
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = activeStep === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectStep(s.id);
                      onCloseMobile?.();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? s.name : undefined}
                    className={`workspace-nav-item w-full p-2.5 rounded-2xl transition text-left flex items-center gap-3 group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                      isActive
                        ? 'workspace-nav-active font-semibold'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 transition ${
                        isActive ? 'bg-black text-white' : 'bg-zinc-900 text-zinc-400 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 truncate">
                        <span className="text-xs font-bold truncate block">{s.name}</span>
                        <p className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-zinc-500'}`}>
                          {s.subtitle}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Tools */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Tools
              </div>
            )}
            <div className="space-y-1">
              {tools.map((t) => {
                const Icon = t.icon;
                const isActive = activeStep === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectStep(t.id);
                      onCloseMobile?.();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? t.name : undefined}
                    className={`workspace-nav-item w-full p-2.5 rounded-2xl transition text-left flex items-center gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                      isActive
                        ? 'workspace-nav-active font-semibold'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-zinc-900 text-zinc-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    {!isCollapsed && <span className="text-xs font-medium">{t.name}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2.5 shrink-0">
        {!isCollapsed ? (
          <>
            {/* Streamlined Utility Actions */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
              <button
                onClick={onOpenThemeModal}
                title="Visual & Theme Mode"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition text-[10px] font-medium gap-1 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme</span>
              </button>
              <button
                onClick={onOpenApiModal}
                title="AI Model Settings"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition text-[10px] font-medium gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <button
                onClick={onOpenFeedback}
                title="Feedback & Rating"
                className="flex flex-col items-center justify-center py-2 px-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition text-[10px] font-medium gap-1 cursor-pointer"
              >
                <MessageSquareHeart className="w-3.5 h-3.5" />
                <span>Feedback</span>
              </button>
            </div>

            {/* Usage & Pro Card */}
            <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Usage
                </span>
                <span className={`font-semibold ${isPro ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {isPro ? 'Pro Unlimited' : `${remainingFree} / 5 left`}
                </span>
              </div>

              {!isPro ? (
                <button
                  onClick={onOpenAuthModal}
                  className="w-full py-1.5 rounded-lg gradient-btn font-bold text-[11px] transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Upgrade Pro ($9)
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="w-full py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                >
                  Manage Account
                </button>
              )}
            </div>
          </>
        ) : (
          /* Collapsed Icons Only */
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onOpenThemeModal}
              title="Visual & Theme Mode"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenApiModal}
              title="AI Model Settings"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenFeedback}
              title="Feedback & Rating"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
            >
              <MessageSquareHeart className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAuthModal}
              title={isPro ? 'Pro Unlimited' : `${remainingFree} / 5 generations left`}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${isPro ? 'text-amber-400' : 'text-zinc-400'}`} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
