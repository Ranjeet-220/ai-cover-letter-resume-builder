'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import type { AppStep } from '../types';
import { TopHeader } from '@/components/layout/TopHeader';
import { MVPGenerator } from '@/features/cover-letter/components/MVPGenerator';
import { ResumeBuilder } from '@/features/resume/components/ResumeBuilder';
import { CoverLetterEditor } from '@/features/cover-letter/components/CoverLetterEditor';
import { CvBuilder } from '@/features/cv/components/CvBuilder';
import { ResumeProfiles } from '@/features/profiles/components/ResumeProfiles';
import { FeedbackModal } from '@/features/workspace/components/FeedbackModal';
import { AuthBillingModal } from '@/features/billing/components/AuthBillingModal';
import { ApiSettingsModal } from '@/features/settings/components/ApiSettingsModal';
import { ThemeSelectorModal } from '@/features/settings/components/ThemeSelectorModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import {
  CoverLetter,
  ResumeProfile,
  getDefaultResumeProfile,
} from '@/lib/storage';
import {
  getStoredThemeMode,
  getStoredAccentPreset,
  applyThemeSettings,
} from '@/lib/theme';
import { setProUser, addCredits } from '@/lib/usage';

export function Workspace() {
  const [activeStep, setActiveStepState] = useState<AppStep>('resume');
  const [visitedSteps, setVisitedSteps] = useState<AppStep[]>(['resume']);
  const setActiveStep = (step: AppStep) => {
    setVisitedSteps((visited) => visited.includes(step) ? visited : [...visited, step]);
    setActiveStepState(step);
  };
  const [activeLetter, setActiveLetter] = useState<CoverLetter | null>(null);
  const [activeProfile, setActiveProfile] = useState<ResumeProfile | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'pricing' | 'auth'>('auth');
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    // Activate Pro after a successful Stripe checkout redirects back with a session_id.
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (sessionId) {
      fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok || !data) throw new Error('Stripe verification failed');
          return data as { paid?: boolean; plan?: string | null };
        })
        .then((data) => {
          if (data.paid) {
            if (data.plan === 'pack') {
              addCredits(15);
            } else {
              setProUser(true);
            }
            window.location.replace(window.location.pathname);
          }
        })
        .catch((err) => console.error('Failed to verify Stripe session', err));
    }
  }, []);

  useEffect(() => {
    // Hydrate Theme & Accent settings
    const mode = getStoredThemeMode();
    const accent = getStoredAccentPreset();
    applyThemeSettings(mode, accent);

    async function loadDefaultProfile() {
      try {
        const prof = await getDefaultResumeProfile();
        setActiveProfile(prof);
      } catch (err) {
        console.error('Error loading default resume profile', err);
      }
    }
    loadDefaultProfile();
  }, []);

  const handleOpenSignIn = () => {
    setAuthModalTab('auth');
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalTab('auth');
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleOpenPricing = () => {
    setAuthModalTab('pricing');
    setIsAuthModalOpen(true);
  };

  const handleCreateNewLetter = () => {
    const newLetter: CoverLetter = {
      id: '',
      title: 'New Application',
      company: '',
      jobTitle: '',
      jobDescription: '',
      content: '',
      status: 'Draft',
      matchScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resumeProfileId: activeProfile?.id,
    };
    setActiveLetter(newLetter);
    setActiveStep('cover-letter');
  };

  return (
    <div className="workspace-shell min-h-screen flex text-zinc-100 font-sans selection:bg-white selection:text-black w-full">
      {/* Step-by-Step Navigation Sidebar */}
      <Sidebar
        activeStep={activeStep}
        onSelectStep={(step) => setActiveStep(step)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenAuthModal={handleOpenPricing}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main View Area */}
      <div className="workspace-content flex-1 flex flex-col min-w-0 w-full max-w-full">
        {/* Account and app controls */}
        <TopHeader
          activeStep={activeStep}
          onOpenSignIn={handleOpenSignIn}
          onOpenRegister={handleOpenRegister}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 flex flex-col">
          {/* Step 1: Resume Builder */}
          {visitedSteps.includes('resume') && (
            <section hidden={activeStep !== 'resume'}>
              <ErrorBoundary fallbackTitle="Resume Builder Error">
                <ResumeBuilder />
              </ErrorBoundary>
            </section>
          )}

          {/* Step 2: Cover Letter Generator */}
          {visitedSteps.includes('cover-letter') && (
            <section hidden={activeStep !== 'cover-letter'}>
              <ErrorBoundary fallbackTitle="Cover Letter Error">
                <div className="flex-1 flex flex-col">
                  {activeLetter ? (
                    <>
                      {/* Active Editor Top Status Banner */}
                      <div className="max-w-7xl mx-auto px-4 pt-4 w-full">
                        <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-zinc-200 font-semibold">Full Editor Mode</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400 truncate max-w-xs">{activeLetter.title || 'Untitled Draft'}</span>
                          </div>
                          <button
                            onClick={() => setActiveLetter(null)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>← Switch to Quick Generator</span>
                          </button>
                        </div>
                      </div>

                      <CoverLetterEditor
                        initialLetter={{
                          id: activeLetter.id,
                          title: activeLetter.title,
                          targetCompany: activeLetter.company,
                          jobTitle: activeLetter.jobTitle,
                          jobDescription: activeLetter.jobDescription || '',
                          tone: 'professional',
                          length: 'standard',
                          content: activeLetter.content,
                          matchScore: activeLetter.matchScore,
                          missingKeywords: [],
                          status: activeLetter.status.toLowerCase() as 'draft' | 'applied' | 'interviewing' | 'offer' | 'rejected',
                          createdAt: activeLetter.createdAt,
                          updatedAt: activeLetter.updatedAt,
                        }}
                        activeProfile={activeProfile ? {
                          id: activeProfile.id,
                          name: activeProfile.name,
                          fullName: activeProfile.fullName,
                          email: activeProfile.email,
                          phone: activeProfile.phone,
                          location: activeProfile.location,
                          summary: activeProfile.summary,
                          skills: activeProfile.skills,
                          experience: activeProfile.experience,
                          education: '',
                          isDefault: activeProfile.isDefault,
                        } : null}
                        onSave={(saved) =>
                          setActiveLetter({
                            ...activeLetter,
                            id: saved.id,
                            title: saved.title,
                            company: saved.targetCompany,
                            jobTitle: saved.jobTitle,
                            jobDescription: saved.jobDescription,
                            content: saved.content,
                            status: saved.status
                              ? ((saved.status.charAt(0).toUpperCase() + saved.status.slice(1)) as CoverLetter['status'])
                              : activeLetter.status,
                            matchScore: saved.matchScore,
                            updatedAt: saved.updatedAt,
                          })
                        }
                      />
                    </>
                  ) : (
                    <MVPGenerator />
                  )}

                  {/* Mode Switching Helper Banner */}
                  <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
                    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      {activeLetter ? (
                        <>
                          <span className="text-zinc-400">Done editing this draft or want to generate a new one quickly?</span>
                          <button
                            onClick={() => setActiveLetter(null)}
                            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 font-semibold transition cursor-pointer flex items-center gap-1.5"
                          >
                            ← Switch to Quick Generator
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-zinc-400">Need full control over layout, line-by-line editing, and live preview?</span>
                          <button
                            onClick={handleCreateNewLetter}
                            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 font-semibold transition cursor-pointer flex items-center gap-1.5"
                          >
                            Open Full Editor →
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </ErrorBoundary>
            </section>
          )}

          {/* Step 3: Executive & Academic CV Builder */}
          {visitedSteps.includes('cv') && (
            <section hidden={activeStep !== 'cv'}>
              <ErrorBoundary fallbackTitle="CV Builder Error">
                <CvBuilder />
              </ErrorBoundary>
            </section>
          )}

          {/* Additional Tool: Resume Profiles */}
          {visitedSteps.includes('profiles') && (
            <section hidden={activeStep !== 'profiles'}>
              <ErrorBoundary fallbackTitle="Resume Profiles Error">
                <ResumeProfiles
                  isActive={activeStep === 'profiles'}
                  onSelectProfile={(profile) => {
                    setActiveProfile(profile);
                  }}
                />
              </ErrorBoundary>
            </section>
          )}
        </main>
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
      <AuthBillingModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
        initialTab={authModalTab}
        initialAuthMode={authModalMode}
      />
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
}
