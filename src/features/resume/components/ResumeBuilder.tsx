'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Download,
  Zap,
  FileText,
  Briefcase,
  User,
  Wand2,
  Cpu,
  Eye,
  Edit3,
  Palette,
  X,
  Type,
  Sliders,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';
import { WorkExperienceItem, ResumeCvData } from '@/types/index';
import { canGenerate, incrementUsageCount, isProUser } from '@/lib/usage';
import { AuthBillingModal } from '@/features/billing/components/AuthBillingModal';
import { ApiSettingsModal } from '@/features/settings/components/ApiSettingsModal';
import { ResumeTemplateSelector } from '@/features/resume/components/ResumeTemplateSelector';
import { ResumeTemplateId, getResumeTemplateById } from '@/lib/resumeTemplates';
import { useToast } from '@/components/ui/Toast';

import { SAMPLE_RESUME_PRESETS } from '../data/sample-resumes';
import { FormattedPrintableResume } from '@/features/resume/components/ResumePreview';

export function ResumeBuilder() {
  const { showToast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeCvData>(SAMPLE_RESUME_PRESETS.software_engineer);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [selectedTemplateId, setSelectedTemplateId] = useState<ResumeTemplateId>('silicon-valley');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showMorePersonalDetails, setShowMorePersonalDetails] = useState(false);

  // Document formatting state & split ratio state
  const [docFontFamily, setDocFontFamily] = useState<string>('template');
  const [docFontSize, setDocFontSize] = useState<'compact' | 'normal' | 'large'>('normal');
  const [docLineHeight, setDocLineHeight] = useState<'tight' | 'normal' | 'relaxed'>('normal');
  const [splitRatio, setSplitRatio] = useState<number>(54);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const container = document.getElementById('resume-split-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newRatio = ((e.clientX - rect.left) / rect.width) * 100;
      if (newRatio >= 35 && newRatio <= 68) {
        setSplitRatio(Math.round(newRatio));
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleAddSkill = (skillToAdd?: string) => {
    const rawSkill = skillToAdd !== undefined ? skillToAdd : newSkillInput;
    if (!rawSkill.trim()) return;

    const parsedSkills = rawSkill
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (parsedSkills.length === 0) {
      setNewSkillInput('');
      return;
    }

    const existing = new Set(resumeData.skills.map((s) => s.toLowerCase()));
    const uniqueNew = parsedSkills.filter((s) => !existing.has(s.toLowerCase()));
    if (uniqueNew.length === 0) {
      setNewSkillInput('');
      return;
    }

    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, ...uniqueNew],
    }));

    setNewSkillInput('');
    showToast(
      'Skills Added!',
      `Added ${uniqueNew.join(', ')} to technical competencies.`
    );
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    const removedSkill = resumeData.skills[indexToRemove];
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove),
    }));
    if (removedSkill !== undefined) {
      showToast('Skill Removed', `Removed ${removedSkill}.`);
    }
  };

  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedModel = localStorage.getItem('covercraft_selected_model') || 'gemini-3.1-flash-lite';
        setSelectedModel(savedModel);
        const savedTemplate = (localStorage.getItem('covercraft_selected_template') as ResumeTemplateId) || 'silicon-valley';
        setSelectedTemplateId(savedTemplate);
        const savedPhoto = localStorage.getItem('covercraft_resume_photo');
        if (savedPhoto) {
          setResumeData((prev) => ({ ...prev, photoUrl: savedPhoto }));
        }
      }
    } catch (err) {
      console.warn('Failed to restore resume preferences from localStorage', err);
    }
    const refreshModel = () => {
      try {
        if (typeof window !== 'undefined') {
          setSelectedModel(localStorage.getItem('covercraft_selected_model') || 'gemini-3.1-flash-lite');
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('covercraft-settings-change', refreshModel);
    return () => window.removeEventListener('covercraft-settings-change', refreshModel);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setResumeData((prev) => ({ ...prev, photoUrl: base64 }));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('covercraft_resume_photo', base64);
        } catch (err) {
          console.warn('Could not persist photo to localStorage', err);
          showToast('Photo Uploaded', 'Shown in preview but could not be saved locally (storage full).', 'info');
          return;
        }
      }
      showToast('Photo Uploaded!', 'Saved locally & added to resume header.');
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    setResumeData((prev) => ({ ...prev, photoUrl: undefined }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('covercraft_resume_photo');
    }
    showToast('Photo Removed', 'Removed profile photo.');
  };

  const handleSelectTemplate = (id: ResumeTemplateId) => {
    setSelectedTemplateId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('covercraft_selected_template', id);
    }
    const templateObj = getResumeTemplateById(id);
    showToast(`Applied ${templateObj.name} Template`, templateObj.badge);
  };

  const handleGenerateSummary = async () => {
    if (!canGenerate()) {
      setShowAuthModal(true);
      return;
    }
    setLoadingAi(true);
    try {
      const customGeminiKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_gemini_api_key') || '' : '';
      const customAnthropicKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_anthropic_api_key') || '' : '';

      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: resumeData.professionalTitle,
          pastExperience: JSON.stringify(resumeData.experiences),
          keySkills: resumeData.skills,
          model: selectedModel,
          apiKey: customGeminiKey,
          anthropicApiKey: customAnthropicKey,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to generate summary');
      }
      if (data && data.summary) {
        setResumeData((prev) => ({ ...prev, summary: data.summary }));
        showToast('Executive Summary Generated!', 'ATS-optimized professional summary updated.');
        if (!isProUser()) {
          incrementUsageCount();
        }
      } else {
        throw new Error('The AI returned no summary.');
      }
    } catch (err) {
      console.error(err);
      showToast('Summary Generation Notice', 'Please try again.', 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleEnhanceBullet = async (expId: string, bulletIndex: number) => {
    if (!canGenerate()) {
      setShowAuthModal(true);
      return;
    }
    if (enhancingBulletId) return;
    const exp = resumeData.experiences.find((e) => e.id === expId);
    if (!exp) return;
    const rawBullet = exp.bullets[bulletIndex];
    if (!rawBullet) return;

    setEnhancingBulletId(`${expId}-${bulletIndex}`);

    try {
      const customGeminiKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_gemini_api_key') || '' : '';
      const customAnthropicKey = typeof window !== 'undefined' ? localStorage.getItem('covercraft_anthropic_api_key') || '' : '';

      const res = await fetch('/api/resume/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet: rawBullet,
          targetRole: resumeData.professionalTitle,
          model: selectedModel,
          apiKey: customGeminiKey,
          anthropicApiKey: customAnthropicKey,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to enhance bullet');
      }
      if (data && data.enhancedBullet) {
        setResumeData((prev) => ({
          ...prev,
          experiences: prev.experiences.map((item) => {
            if (item.id !== expId) return item;
            if (bulletIndex < item.bullets.length) {
              if (item.bullets[bulletIndex] !== rawBullet) return item;
              const newBullets = [...item.bullets];
              newBullets[bulletIndex] = data.enhancedBullet;
              return { ...item, bullets: newBullets };
            }
            return item;
          }),
        }));
        showToast('Bullet Enhanced!', 'Transformed using Google XYZ metric formula.');
        if (!isProUser()) {
          incrementUsageCount();
        }
      } else {
        throw new Error('The AI returned no enhanced bullet.');
      }
    } catch (err) {
      console.error(err);
      showToast('Enhancement Notice', 'Please try again.', 'error');
    } finally {
      setEnhancingBulletId(null);
    }
  };

  const handleAddExperience = () => {
    const newExp: WorkExperienceItem = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      role: 'Role Title',
      location: 'City, State',
      startDate: '2023',
      endDate: 'Present',
      bullets: ['Led cross-functional initiatives driving key operational outcomes.'],
    };
    setResumeData((prev) => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const handleAddBullet = (expId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, bullets: [...exp.bullets, 'New impact bullet point...'] };
        }
        return exp;
      }),
    }));
  };

  const handleRemoveBullet = (expId: string, bulletIdx: number) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const updatedBullets = exp.bullets.filter((_, idx) => idx !== bulletIdx);
          return { ...exp, bullets: updatedBullets };
        }
        return exp;
      }),
    }));
    showToast('Bullet Removed', 'Removed bullet point from experience.');
  };

  const handleRemoveExperience = (expId: string) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== expId),
    }));
  };

  const handleExportPdf = async () => {
    if (!paperRef.current) return;
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(paperRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume_${selectedTemplateId}.pdf`;
      pdf.save(filename);
      showToast('PDF Exported!', `Downloaded ${filename}`);
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('PDF Export Error', 'Could not generate PDF canvas.', 'error');
    }
  };

  const activeTemplate = getResumeTemplateById(selectedTemplateId);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Sleek Top Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-sm">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Full Preview</span>
          </button>
        </div>

        {/* Template and export actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Template Selector Button */}
          <button
            type="button"
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/80 text-xs font-medium transition cursor-pointer shadow-sm"
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Template: <strong className="font-semibold text-white">{activeTemplate.name}</strong></span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gradient-btn text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Editor View */}
      {activeTab === 'editor' && (
        <div id="resume-split-container" className="flex flex-col lg:flex-row gap-6 w-full relative items-start">
          {/* Form Controls Column */}
          <div
            style={{ width: isDesktop ? `${splitRatio}%` : '100%' }}
            className="space-y-5 shrink-0 transition-all min-w-0"
          >
            {/* 1. Personal Details */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Personal Details</h3>
                  </div>
                </div>
              </div>

              {/* Photo Upload Row */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700/70 shrink-0 flex items-center justify-center">
                  {resumeData.photoUrl ? (
                    <img src={resumeData.photoUrl} alt="Candidate Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-zinc-200">
                    Profile Photo <span className="text-zinc-500 font-normal">(optional)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition cursor-pointer">
                    Upload
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {resumeData.photoUrl && (
                    <button
                      type="button"
                      onClick={handlePhotoRemove}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 text-xs font-medium border border-zinc-800 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Primary Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Target Job Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={resumeData.professionalTitle}
                    onChange={(e) => setResumeData({ ...resumeData, professionalTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Vance"
                    value={resumeData.fullName}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parts = val.split(' ');
                      setResumeData({
                        ...resumeData,
                        fullName: val,
                        firstName: parts[0] || '',
                        lastName: parts.slice(1).join(' ') || '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="alex.vance@example.com"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(555) 234-5678"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Location (City, State)</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    value={resumeData.cityState || resumeData.location || ''}
                    onChange={(e) =>
                      setResumeData({ ...resumeData, cityState: e.target.value, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/alexvance"
                    value={resumeData.linkedin || ''}
                    onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>
              </div>

              {/* Collapsible Additional Details */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMorePersonalDetails((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-medium cursor-pointer"
                >
                  {showMorePersonalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showMorePersonalDetails ? 'Hide additional fields' : 'More fields (Address, GitHub, Website, Date of Birth)'}</span>
                </button>

                {showMorePersonalDetails && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 mt-2 border-t border-zinc-800/60">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Street Address</label>
                      <input
                        type="text"
                        placeholder="123 Market Street"
                        value={resumeData.address || ''}
                        onChange={(e) => setResumeData({ ...resumeData, address: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Postal Code</label>
                      <input
                        type="text"
                        placeholder="94105"
                        value={resumeData.postalCode || ''}
                        onChange={(e) => setResumeData({ ...resumeData, postalCode: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="United States"
                        value={resumeData.country || ''}
                        onChange={(e) => setResumeData({ ...resumeData, country: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">GitHub Profile</label>
                      <input
                        type="text"
                        placeholder="github.com/alexvance"
                        value={resumeData.github || ''}
                        onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Personal Website</label>
                      <input
                        type="text"
                        placeholder="alexvance.dev"
                        value={resumeData.website || ''}
                        onChange={(e) => setResumeData({ ...resumeData, website: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Date of Birth</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={resumeData.dateOfBirth || ''}
                        onChange={(e) => setResumeData({ ...resumeData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Place of Birth</label>
                      <input
                        type="text"
                        placeholder="San Francisco, CA"
                        value={resumeData.placeOfBirth || ''}
                        onChange={(e) => setResumeData({ ...resumeData, placeOfBirth: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Driving License</label>
                      <input
                        type="text"
                        placeholder="Class C / Valid Unrestricted"
                        value={resumeData.drivingLicense || ''}
                        onChange={(e) => setResumeData({ ...resumeData, drivingLicense: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Professional Summary */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Professional Summary</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={loadingAi}
                  className="px-3 py-1.5 rounded-xl gradient-btn text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  title="Generate ATS-optimized summary using AI"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>{loadingAi ? 'Generating...' : 'AI Enhance'}</span>
                </button>
              </div>

              <textarea
                rows={4}
                placeholder="Write a concise 2-4 sentence summary highlighting your experience, strengths, and achievements..."
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-xs leading-relaxed resize-y focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
            </div>

            {/* 3. Work Experience */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <Briefcase className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">Work Experience</h3>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {resumeData.experiences.length}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Position</span>
                </button>
              </div>

              {/* Experience Items */}
              <div className="space-y-4">
                {resumeData.experiences.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3.5 transition hover:border-zinc-700/80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">
                        #{expIdx + 1} {exp.role || 'Position'} {exp.company ? `at ${exp.company}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove this position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    </div>

                    {/* Company & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Company / Organization *</label>
                        <input
                          type="text"
                          placeholder="e.g. Stripe Tech Solutions"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, company: val } : x)),
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Job Title / Role *</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Full-Stack Engineer"
                          value={exp.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, role: val } : x)),
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Location & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Location</label>
                        <input
                          type="text"
                          placeholder="San Francisco, CA"
                          value={exp.location || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, location: val } : x)),
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Start Date</label>
                        <input
                          type="text"
                          placeholder="Jan 2022"
                          value={exp.startDate || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, startDate: val } : x)),
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">End Date</label>
                        <input
                          type="text"
                          placeholder="Present"
                          value={exp.endDate || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, endDate: val } : x)),
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-1 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-zinc-400">Bullet Points & Impact</label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(exp.id)}
                          className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add bullet
                        </button>
                      </div>

                      {exp.bullets.map((b, bulletIdx) => (
                        <div key={bulletIdx} className="flex flex-col sm:flex-row gap-2 sm:items-start">
                          <textarea
                            rows={2}
                            value={b}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResumeData((prev) => ({
                                ...prev,
                                experiences: prev.experiences.map((x) => {
                                  if (x.id === exp.id) {
                                    const nb = [...x.bullets];
                                    nb[bulletIdx] = val;
                                    return { ...x, bullets: nb };
                                  }
                                  return x;
                                }),
                              }));
                            }}
                            className="w-full sm:flex-1 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-xs leading-relaxed resize-y focus:outline-none focus:border-zinc-500"
                          />
                          <div className="flex items-center gap-1.5 self-end sm:self-start">
                            <button
                              type="button"
                              onClick={() => handleEnhanceBullet(exp.id, bulletIdx)}
                              disabled={enhancingBulletId === `${exp.id}-${bulletIdx}`}
                              className="px-2.5 py-1.5 rounded-lg gradient-btn text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-sm"
                              title="Enhance with Google XYZ formula (Accomplished [X] by [Y] resulting in [Z])"
                            >
                              <Zap className="w-3 h-3 text-white" />
                              <span>{enhancingBulletId === `${exp.id}-${bulletIdx}` ? 'Enhancing...' : 'AI Metric'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBullet(exp.id, bulletIdx)}
                              className="p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition cursor-pointer"
                              title="Delete bullet point"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Education */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Education & Credentials</h3>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Degrees & Institution</label>
                <textarea
                  rows={2}
                  placeholder="e.g. B.S. in Computer Science — University of California, Berkeley (2019)"
                  value={resumeData.education}
                  onChange={(e) => setResumeData({ ...resumeData, education: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-xs leading-relaxed resize-y focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                />
              </div>

              {/* Optional Certifications & Languages Display/Edit */}
              {(resumeData.certifications || resumeData.languages) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
                  {resumeData.certifications && (
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Certifications</label>
                      <input
                        type="text"
                        placeholder="e.g. AWS Certified Solutions Architect"
                        value={resumeData.certifications.join(', ')}
                        onChange={(e) => {
                          const certs = e.target.value.split(',').map((c) => c.trim()).filter(Boolean);
                          setResumeData({ ...resumeData, certifications: certs });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  )}
                  {resumeData.languages && (
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Languages</label>
                      <input
                        type="text"
                        placeholder="e.g. English (Native), German (Fluent)"
                        value={resumeData.languages.join(', ')}
                        onChange={(e) => {
                          const langs = e.target.value.split(',').map((l) => l.trim()).filter(Boolean);
                          setResumeData({ ...resumeData, languages: langs });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Skills */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <Sliders className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">Skills & Competencies</h3>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {resumeData.skills.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (type and hit Enter, or comma-separate e.g. React, Next.js)"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-3.5 py-2 rounded-xl gradient-btn text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {resumeData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition hover:border-zinc-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-zinc-500 hover:text-white transition cursor-pointer"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Splitter Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="hidden lg:flex w-4 cursor-col-resize items-center justify-center hover:bg-zinc-800/80 group transition-colors select-none py-6 z-10 shrink-0"
            title="Drag left or right to adjust split ratio"
          >
            <div className="w-1.5 h-24 rounded-full bg-zinc-800 group-hover:bg-amber-400 group-active:bg-amber-500 transition-colors flex flex-col items-center justify-center gap-1 shadow-md">
              <div className="w-0.5 h-1.5 bg-zinc-400 group-hover:bg-black rounded-full" />
              <div className="w-0.5 h-1.5 bg-zinc-400 group-hover:bg-black rounded-full" />
              <div className="w-0.5 h-1.5 bg-zinc-400 group-hover:bg-black rounded-full" />
            </div>
          </div>

          {/* Right Column: Live Document Preview */}
          <div
            style={{ width: isDesktop ? `calc(${100 - splitRatio}% - 4rem)` : '100%' }}
            className="flex flex-col shrink-0 space-y-4 min-w-0"
          >
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 shadow-lg flex flex-col space-y-3">
              {/* Preview Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <Eye className="w-4 h-4 text-zinc-400 shrink-0" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Preview</h3>
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="text-[11px] font-semibold text-zinc-300 hover:text-white px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex items-center gap-1 cursor-pointer"
                    title="Change resume template"
                  >
                    <span>{activeTemplate.name}</span>
                    <Palette className="w-3 h-3 text-amber-400" />
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                {/* Font & Size & Spacing */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Font Family Picker */}
                  <div className="flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-lg border border-zinc-800">
                    <Type className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] text-zinc-400 font-medium">Font:</span>
                    <select
                      value={docFontFamily}
                      onChange={(e) => setDocFontFamily(e.target.value)}
                      className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="template" className="bg-zinc-900 text-white">Template Default</option>
                      <option value="sans" className="bg-zinc-900 text-white">Sans (Inter)</option>
                      <option value="serif" className="bg-zinc-900 text-white">Serif (Playfair)</option>
                      <option value="mono" className="bg-zinc-900 text-white">Mono (JetBrains)</option>
                      <option value="garamond" className="bg-zinc-900 text-white">Classic Garamond</option>
                    </select>
                  </div>

                  {/* Font Size Scale */}
                  <div className="flex items-center gap-1 bg-black p-0.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase px-1">Size:</span>
                    <button
                      type="button"
                      onClick={() => setDocFontSize('compact')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docFontSize === 'compact' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Compact
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocFontSize('normal')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docFontSize === 'normal' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocFontSize('large')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docFontSize === 'large' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Large
                    </button>
                  </div>

                  {/* Line Spacing */}
                  <div className="flex items-center gap-1 bg-black p-0.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase px-1">Spacing:</span>
                    <button
                      type="button"
                      onClick={() => setDocLineHeight('tight')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docLineHeight === 'tight' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Tight
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocLineHeight('normal')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docLineHeight === 'normal' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocLineHeight('relaxed')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docLineHeight === 'relaxed' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Relaxed
                    </button>
                  </div>
                </div>

                {/* Split Ratio Presets */}
                <div className="hidden lg:flex items-center gap-1 bg-black p-0.5 rounded-lg border border-zinc-800">
                  <Sliders className="w-3 h-3 text-zinc-400 ml-1" />
                  <button
                    type="button"
                    onClick={() => setSplitRatio(40)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                      splitRatio === 40 ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    40:60
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitRatio(52)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                      splitRatio === 52 ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    50:50
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitRatio(64)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                      splitRatio === 64 ? 'bg-amber-400 text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    60:40
                  </button>
                </div>
              </div>

              {/* Paper Preview Render Area */}
              <div ref={paperRef} className="cover-letter-paper rounded-xl overflow-hidden shadow-2xl relative">
                <FormattedPrintableResume
                  data={resumeData}
                  templateId={selectedTemplateId}
                  isFullPreview={false}
                  docFontFamily={docFontFamily}
                  docFontSize={docFontSize}
                  docLineHeight={docLineHeight}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Printable Paper Preview Tab */}
      {activeTab === 'preview' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-400">Layout Mode:</span>
              <span className="text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-lg">
                Multi-Page A4 Resume
              </span>
            </div>
          </div>

          <div ref={paperRef} className="cover-letter-paper rounded-xl shadow-2xl relative overflow-hidden">
            <FormattedPrintableResume
              data={resumeData}
              templateId={selectedTemplateId}
              isFullPreview
              docFontFamily={docFontFamily}
              docFontSize={docFontSize}
              docLineHeight={docLineHeight}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthBillingModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {}} />
      <ApiSettingsModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} onSave={(m) => setSelectedModel(m)} />
      <ResumeTemplateSelector
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
