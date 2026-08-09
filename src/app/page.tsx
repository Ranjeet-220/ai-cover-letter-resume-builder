'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, AppStep } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { MVPGenerator } from '../components/MVPGenerator';
import { ResumeBuilder } from '../components/ResumeBuilder';
import { CoverLetterEditor } from '../components/CoverLetterEditor';
import { CvBuilder } from '../components/CvBuilder';
import { ApplicationTracker } from '../components/ApplicationTracker';
import { ResumeProfiles } from '../components/ResumeProfiles';
import { FeedbackModal } from '../components/FeedbackModal';
import { AuthBillingModal } from '../components/AuthBillingModal';
import { ApiSettingsModal } from '../components/ApiSettingsModal';
import { ThemeSelectorModal } from '../components/ThemeSelectorModal';
import {
  CoverLetter,
  ResumeProfile,
  getDefaultResumeProfile,
} from '../lib/storage';
import {
  getStoredThemeMode,
  getStoredAccentPreset,
  applyThemeSettings,
} from '../lib/theme';
import { setProUser, addCredits } from '../lib/usage';

export default function Home() {
  const [activeStep, setActiveStep] = useState<AppStep>('resume');
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
        .then((res) => res.json())
        .then((data: { paid?: boolean; plan?: string | null }) => {
          if (data.paid) {
            if (data.plan === 'pack') {
              addCredits(15);
            } else {
              setProUser(true);
            }
            window.location.replace(window.location.origin);
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

  const handleSelectLetterForEdit = (letter: CoverLetter) => {
    setActiveLetter(letter);
    setActiveStep('cover-letter');
  };

  const handleCreateNewLetter = () => {
    const newLetter: CoverLetter = {
      id: '',
      title: 'New Application',
      company: 'Acme Corp',
      jobTitle: 'Senior Developer',
      jobDescription: 'Looking for an experienced engineer to join our team.',
      content: `Dear Hiring Team,\n\nI am excited to submit my application for the Senior Developer role at Acme Corp. With a background in building performant web applications, I am eager to bring my skills to your team.\n\nSincerely,\n${
        activeProfile?.fullName || 'Alex Vance'
      }`,
      status: 'Draft',
      matchScore: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resumeProfileId: activeProfile?.id,
    };
    setActiveLetter(newLetter);
    setActiveStep('cover-letter');
  };

  return (
    <div className="min-h-screen flex bg-black dark:bg-black text-zinc-100 dark:text-zinc-100 font-sans selection:bg-white selection:text-black transition-colors duration-300 w-full">
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
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">

        {/* Top-Right Header Bar with User-Friendly Sign In & Register Buttons */}
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
          {activeStep === 'resume' && <ResumeBuilder />}

          {/* Step 2: Cover Letter Generator */}
          {activeStep === 'cover-letter' && (
            <div className="flex-1 flex flex-col">
              {activeLetter ? (
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
              ) : <MVPGenerator />}
              <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400">Want to use the advanced split-screen studio editor?</span>
                  <button
                    onClick={() => setActiveLetter(null)}
                    className="text-white hover:underline font-bold"
                  >
                    Open Studio Editor →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Executive & Academic CV Builder */}
          {activeStep === 'cv' && <CvBuilder />}

          {/* Additional Tool: Application Tracker */}
          {activeStep === 'tracker' && (
            <ApplicationTracker
              onSelectLetter={handleSelectLetterForEdit}
              onCreateNew={handleCreateNewLetter}
            />
          )}

          {/* Additional Tool: Resume Profiles */}
          {activeStep === 'profiles' && (
            <ResumeProfiles
              onSelectProfile={(profile) => {
                setActiveProfile(profile);
              }}
            />
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
