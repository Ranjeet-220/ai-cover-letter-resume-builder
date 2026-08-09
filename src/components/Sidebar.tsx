'use client';
/* eslint-disable react-hooks/set-state-in-effect */

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
} from 'lucide-react';
import { getFreeGenerationsRemaining, isProUser } from '../lib/usage';

export type AppStep = 'resume' | 'cover-letter' | 'cv' | 'tracker' | 'profiles';

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
    setIsPro(isProUser());
    setRemainingFree(getFreeGenerationsRemaining());
  }, [activeStep]);

  const steps = [
    {
      id: 'resume' as AppStep,
      name: 'AI Executive Resume & CV Builder',
      subtitle: 'ATS Format & Bullet Metrics',
      icon: FileText,
    },
    {
      id: 'cover-letter' as AppStep,
      name: 'Cover Letter MVP Generator',
      subtitle: 'Tailored MVP & Studio Editor',
      icon: Sparkles,
    },
    {
      id: 'cv' as AppStep,
      name: 'Executive & Academic CV Builder',
      subtitle: 'Europass & Multi-Page CV',
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
      className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 h-screen bg-black border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300 max-lg:w-72 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      } ${isMobileOpen ? 'translate-x-0' : 'max-lg:-translate-x-full'}`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="p-2.5 rounded-xl bg-white text-black font-bold shadow-md shrink-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="text-sm font-extrabold text-white flex items-center gap-1.5 tracking-tight">
                  <span className="gradient-text-animated">CoverCraft AI</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                    2026
                  </span>
                </h1>
                <p className="text-[10px] text-zinc-400">AI Career Studio</p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Guided Navigation */}
        <div className="p-3 space-y-6">
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <span className="gradient-text-animated">AI Career Builder Suite</span>
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
                    className={`w-full p-2.5 rounded-2xl transition text-left flex items-center gap-3 group cursor-pointer ${
                      isActive
                        ? 'gradient-active shadow-lg font-semibold'
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
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Dashboard & Management
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
                    className={`w-full p-2.5 rounded-2xl transition text-left flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-white font-semibold border border-zinc-700'
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
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-zinc-800/80 space-y-2">
        <button
          onClick={onOpenThemeModal}
          className={`w-full p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Palette className="w-4 h-4 text-zinc-400 shrink-0" />
          {!isCollapsed && <span>Visual & Theme Mode</span>}
        </button>

        <button
          onClick={onOpenApiModal}
          className={`w-full p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Sliders className="w-4 h-4 text-zinc-400 shrink-0" />
          {!isCollapsed && <span>AI Model Settings</span>}
        </button>

        <button
          onClick={onOpenFeedback}
          className={`w-full p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <MessageSquareHeart className="w-4 h-4 text-zinc-400 shrink-0" />
          {!isCollapsed && <span>Feedback & Rating</span>}
        </button>

        {!isCollapsed && (
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-white" /> Free Usage
              </span>
              <span className={`font-bold ${isPro ? 'text-white' : 'text-zinc-300'}`}>
                {isPro ? 'Unlimited' : `${remainingFree} / 5`}
              </span>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="w-full py-2 rounded-xl gradient-btn font-bold text-[11px] transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isPro ? 'Manage Account' : 'Upgrade Pro ($9)'}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
