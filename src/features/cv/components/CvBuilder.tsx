'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Download,
  Zap,
  BookOpen,
  User,
  Eye,
  Edit3,
  Type,
  Briefcase,
  Award,
  Globe,
  Sparkles,
} from 'lucide-react';
import { canGenerate, incrementUsageCount, isProUser } from '@/lib/usage';
import { AuthBillingModal } from '@/features/billing/components/AuthBillingModal';
import { ApiSettingsModal } from '@/features/settings/components/ApiSettingsModal';
import { useToast } from '@/components/ui/Toast';

interface PublicationItem {
  id: string;
  title: string;
  publisher: string;
  year: string;
}

interface CvData {
  fullName: string;
  executiveTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  biography: string;
  researchFocus: string;
  experiences: {
    id: string;
    organization: string;
    role: string;
    dates: string;
    bullets: string[];
  }[];
  publications: PublicationItem[];
  grantsAndHonors: string[];
  languages: string[];
  education: string;
}

const SAMPLE_CV_PRESETS: Record<string, CvData> = {
  executive: {
    fullName: 'Dr. Marcus Vance, Ph.D.',
    executiveTitle: 'Chief Technology Officer | Executive Board Advisor',
    email: 'marcus.vance@executive.org',
    phone: '(555) 987-6543',
    location: 'Boston, MA & Zurich, Switzerland',
    website: 'linkedin.com/in/drmarcusvance',
    biography:
      'Transformational Executive Leader with 15+ years overseeing global R&D, enterprise digital transformation, and P&L scale ($100M+). Proven track record leading 300+ engineer organizations, securing $45M in strategic venture backing, and driving 4 successful M&A exits across North America and Europe.',
    researchFocus: 'Enterprise AI Governance, Scalable Distributed Systems, Quantum-Resistant Encryption',
    experiences: [
      {
        id: 'cv-exp-1',
        organization: 'Nexus Global Tech AG',
        role: 'Chief Technology Officer (CTO)',
        dates: '2020 – Present',
        bullets: [
          'Direct global R&D operations ($120M annual budget) across 4 engineering hubs in Zurich, Boston, London, and Singapore.',
          'Spearheaded enterprise cloud transformation resulting in a 40% operating cost reduction and $35M in net-new ARR.',
          'Appointed to the Executive Investment Committee, evaluating early-stage AI acquisition targets.',
        ],
      },
      {
        id: 'cv-exp-2',
        organization: 'Helix AI Research Labs',
        role: 'VP of Engineering & Applied Science',
        dates: '2016 – 2020',
        bullets: [
          'Scaled core engineering team from 25 to 140 Ph.D. researchers and software architects.',
          'Secured 12 patents in high-throughput neural inference and distributed graph computing.',
        ],
      },
    ],
    publications: [
      {
        id: 'pub-1',
        title: 'Scalable Neural Architectures for Real-Time Financial Risk Assessment',
        publisher: 'IEEE Transactions on Artificial Intelligence',
        year: '2023',
      },
      {
        id: 'pub-2',
        title: 'Zero-Trust Encryption Frameworks in Distributed Cloud Systems',
        publisher: 'ACM Journal of Cybersecurity',
        year: '2021',
      },
    ],
    grantsAndHonors: [
      'European Research Council (ERC) Advanced Grant ($2.5M) — 2022',
      'MIT Technology Review 35 Innovators Under 35 — 2018',
    ],
    languages: ['English (Native)', 'German (Fluent / C2)', 'French (Conversational / B2)'],
    education: 'Ph.D. in Computer Science — MIT (2015) | B.S. in Electrical Engineering — Stanford University',
  },
  academic: {
    fullName: 'Prof. Elena Rostova',
    executiveTitle: 'Professor of Computational Biology',
    email: 'elena.rostova@university.edu',
    phone: '(555) 345-6789',
    location: 'Cambridge, MA',
    website: 'rostova-lab.org',
    biography:
      'Distinguished Researcher and Academic Chair specializing in computational genomics, protein folding simulation, and bio-AI models. Principal Investigator on 5 NIH-funded grants totaling $8M+.',
    researchFocus: 'Genomic Vector Modeling, Deep Learning for Protein Folding, Bio-Informatics Pipelines',
    experiences: [
      {
        id: 'acad-exp-1',
        organization: 'Harvard Department of Stem Cell & Regenerative Biology',
        role: 'Tenured Professor & Principal Investigator',
        dates: '2018 – Present',
        bullets: [
          'Direct the Rostova Bio-AI Computational Laboratory, supervising 14 Ph.D. candidates and post-doctoral researchers.',
          'Authored 45+ peer-reviewed papers in Nature, Science, and Cell with over 8,500 citations.',
        ],
      },
    ],
    publications: [
      {
        id: 'pub-acad-1',
        title: 'Predictive Folding Dynamics of Synthetic Proteins Using Transformer Models',
        publisher: 'Nature Biotechnology',
        year: '2024',
      },
    ],
    grantsAndHonors: ['NIH R01 Research Project Grant ($3.2M) — 2023', 'National Science Foundation CAREER Award — 2019'],
    languages: ['English (Native)', 'Spanish (Fluent)', 'Russian (Native)'],
    education: 'Ph.D. in Biophysics — Harvard University | B.S. in Biochemistry — Oxford University',
  },
};

export function CvBuilder() {
  const [cvData, setCvData] = useState<CvData>(SAMPLE_CV_PRESETS.executive);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  // Document Studio Typography & Layout State
  const [docFontFamily, setDocFontFamily] = useState<string>('system-ui');
  const [docFontSize, setDocFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [docLineHeight, setDocLineHeight] = useState<'tight' | 'normal' | 'relaxed'>('normal');

  const paperRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      // This synchronizes the client-only preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedModel(
        localStorage.getItem('covercraft_selected_model') || 'gemini-3.1-flash-lite'
      );
    } catch {
      setSelectedModel('gemini-3.1-flash-lite');
    }
    const refreshModel = () => {
      try {
        setSelectedModel(
          localStorage.getItem('covercraft_selected_model') || 'gemini-3.1-flash-lite'
        );
      } catch {
        setSelectedModel('gemini-3.1-flash-lite');
      }
    };
    window.addEventListener('covercraft-settings-change', refreshModel);
    return () => window.removeEventListener('covercraft-settings-change', refreshModel);
  }, []);

  const getCvStyle = (): React.CSSProperties => {
    let scale = '100%';
    if (docFontSize === 'sm') scale = '88%';
    if (docFontSize === 'lg') scale = '115%';

    let lh = '1.5';
    if (docLineHeight === 'tight') lh = '1.25';
    if (docLineHeight === 'relaxed') lh = '1.85';

    return {
      fontFamily: docFontFamily,
      fontSize: scale,
      lineHeight: lh,
    };
  };

  const handleLoadPreset = (key: string) => {
    if (SAMPLE_CV_PRESETS[key]) {
      setCvData(SAMPLE_CV_PRESETS[key]);
    }
  };

  const handleGenerateBiography = async () => {
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
          targetRole: cvData.executiveTitle,
          pastExperience: JSON.stringify(cvData.experiences),
          keySkills: cvData.researchFocus.split(','),
          model: selectedModel,
          apiKey: customGeminiKey,
          anthropicApiKey: customAnthropicKey,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || 'Failed to generate biography');
      }
      if (data && data.summary) {
        setCvData((prev) => ({ ...prev, biography: data.summary }));
        if (!isProUser()) {
          incrementUsageCount();
        }
        showToast('Biography generated', 'Your executive biography was updated.');
      } else {
        throw new Error('The AI returned no summary.');
      }
    } catch (err) {
      console.error(err);
      showToast('Generation failed', err instanceof Error ? err.message : 'Please try again.', 'error');
    } finally {
      setLoadingAi(false);
    }
  };


  const handleAddExperience = () => {
    const newExp = {
      id: `cv-exp-${Date.now()}`,
      organization: 'New Organization / Institution',
      role: 'Executive Role / Appointment',
      dates: '2023 – Present',
      bullets: ['Directed strategic organizational initiatives and high-impact programs.'],
    };
    setCvData((prev) => ({ ...prev, experiences: [...prev.experiences, newExp] }));
  };

  const handleRemoveExperience = (expId: string) => {
    setCvData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== expId),
    }));
  };

  const handleAddBullet = (expId: string) => {
    setCvData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, 'New leadership initiative...'] } : exp
      ),
    }));
  };

  const handleRemoveBullet = (expId: string, bulletIdx: number) => {
    setCvData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === expId ? { ...exp, bullets: exp.bullets.filter((_, idx) => idx !== bulletIdx) } : exp
      ),
    }));
  };

  const handleAddPublication = () => {
    const newPub: PublicationItem = {
      id: `pub-${Date.now()}`,
      title: 'New Published Research Paper Title',
      publisher: 'Journal of Science & Tech',
      year: '2025',
    };
    setCvData((prev) => ({ ...prev, publications: [...prev.publications, newPub] }));
  };

  const handleRemovePublication = (pubId: string) => {
    setCvData((prev) => ({
      ...prev,
      publications: prev.publications.filter((p) => p.id !== pubId),
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

      const filename = `${cvData.fullName.replace(/\s+/g, '_')}_Executive_CV.pdf`;
      pdf.save(filename);
      showToast('PDF Exported!', `Downloaded ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('PDF Export Error', 'Could not generate PDF canvas.', 'error');
    }
  };

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

        {/* Center/Right: Sample Presets & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[11px] font-medium hidden sm:inline">Load Sample:</span>
            <button
              type="button"
              onClick={() => handleLoadPreset('executive')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-zinc-800 transition cursor-pointer"
            >
              🏛️ Executive CV
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset('academic')}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-zinc-800 transition cursor-pointer"
            >
              🎓 Academic CV
            </button>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block mx-1" />

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Form Column */}
          <div className="lg:col-span-6 space-y-5">
            {/* 1. Contact & Executive Title */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Executive Contact & Title</h3>
                    <p className="text-[11px] text-zinc-400">Header details and credentials</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name & Honorifics *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Marcus Vance, Ph.D."
                    value={cvData.fullName}
                    onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Executive Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Technology Officer"
                    value={cvData.executiveTitle}
                    onChange={(e) => setCvData({ ...cvData, executiveTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="marcus.vance@executive.org"
                    value={cvData.email}
                    onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(555) 987-6543"
                    value={cvData.phone}
                    onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Boston, MA & Zurich, Switzerland"
                    value={cvData.location}
                    onChange={(e) => setCvData({ ...cvData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Profile / Website URL</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/drmarcusvance"
                    value={cvData.website}
                    onChange={(e) => setCvData({ ...cvData, website: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 2. Executive Biography & Strategic Focus */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Executive Biography & Vision</h3>
                    <p className="text-[11px] text-zinc-400">High-level narrative summarizing career achievements</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateBiography}
                  disabled={loadingAi}
                  className="px-3 py-1.5 rounded-xl gradient-btn text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  title="Refine biography using AI"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span>{loadingAi ? 'Refining...' : 'AI Bio Polish'}</span>
                </button>
              </div>

              <textarea
                rows={4}
                placeholder="Executive leader with 15+ years overseeing global operations, P&L scale, and strategic initiatives..."
                value={cvData.biography}
                onChange={(e) => setCvData({ ...cvData, biography: e.target.value })}
                className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-xs leading-relaxed resize-y focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />

              <div className="pt-2 border-t border-zinc-800/60">
                <label className="block text-xs font-medium text-zinc-300 mb-1">Domain & Strategic Focus Areas</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise AI Governance, Scalable Distributed Systems"
                  value={cvData.researchFocus}
                  onChange={(e) => setCvData({ ...cvData, researchFocus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            </div>

            {/* 3. Leadership & Appointments (Work Experience) */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <Briefcase className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">Leadership Appointments</h3>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {cvData.experiences.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Executive, advisory, and academic appointments</p>
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

              <div className="space-y-4">
                {cvData.experiences.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-3.5 transition hover:border-zinc-700/80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">
                        #{expIdx + 1} {exp.role || 'Appointment'} {exp.organization ? `at ${exp.organization}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove Appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Organization / Institution *</label>
                        <input
                          type="text"
                          placeholder="e.g. Nexus Global Tech AG"
                          value={exp.organization}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, organization: val } : x)),
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">Executive Role *</label>
                        <input
                          type="text"
                          placeholder="e.g. Chief Technology Officer (CTO)"
                          value={exp.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCvData((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, role: val } : x)),
                            }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">Date Range</label>
                      <input
                        type="text"
                        placeholder="e.g. 2020 – Present"
                        value={exp.dates}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCvData((prev) => ({
                            ...prev,
                            experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, dates: val } : x)),
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
                      />
                    </div>

                    {/* Bullets */}
                    <div className="space-y-2 pt-1 border-t border-zinc-800/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-zinc-400">Leadership Initiatives & Impact</label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(exp.id)}
                          className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add bullet
                        </button>
                      </div>

                      {exp.bullets.map((b, bulletIdx) => (
                        <div key={bulletIdx} className="flex gap-2 items-start">
                          <textarea
                            rows={2}
                            value={b}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCvData((prev) => ({
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
                            className="w-full flex-1 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-xs leading-relaxed resize-y focus:outline-none focus:border-zinc-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(exp.id, bulletIdx)}
                            className="p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition cursor-pointer"
                            title="Delete bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Academic Credentials & Education */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Academic Credentials & Education</h3>
                    <p className="text-[11px] text-zinc-400">Degrees, postdoctoral appointments, and universities</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Degrees & Credentials</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ph.D. in Computer Science — MIT (2015) | B.S. in Electrical Engineering — Stanford University"
                  value={cvData.education}
                  onChange={(e) => setCvData({ ...cvData, education: e.target.value })}
                  className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 text-xs leading-relaxed resize-y focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                />
              </div>

              {/* Grants, Honors, Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Grants & Honors</label>
                  <input
                    type="text"
                    placeholder="e.g. ERC Advanced Grant ($2.5M)"
                    value={cvData.grantsAndHonors.join('; ')}
                    onChange={(e) => {
                      const items = e.target.value.split(';').map((s) => s.trim()).filter(Boolean);
                      setCvData({ ...cvData, grantsAndHonors: items });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Languages</label>
                  <input
                    type="text"
                    placeholder="e.g. English (Native), German (Fluent)"
                    value={cvData.languages.join(', ')}
                    onChange={(e) => {
                      const langs = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setCvData({ ...cvData, languages: langs });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* 5. Publications & Keynotes */}
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-300 border border-zinc-800">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">Publications & Keynotes</h3>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {cvData.publications.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">Peer-reviewed papers, patents, and keynote presentations</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddPublication}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Publication</span>
                </button>
              </div>

              <div className="space-y-3">
                {cvData.publications.map((pub) => (
                  <div key={pub.id} className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Paper / Publication Title"
                        value={pub.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCvData((prev) => ({
                            ...prev,
                            publications: prev.publications.map((p) => (p.id === pub.id ? { ...p, title: val } : p)),
                          }));
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-white text-xs font-medium focus:outline-none focus:border-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePublication(pub.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Remove Publication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Publisher / Journal / Conference"
                        value={pub.publisher}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCvData((prev) => ({
                            ...prev,
                            publications: prev.publications.map((p) => (p.id === pub.id ? { ...p, publisher: val } : p)),
                          }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-500"
                      />
                      <input
                        type="text"
                        placeholder="Year (e.g. 2024)"
                        value={pub.year}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCvData((prev) => ({
                            ...prev,
                            publications: prev.publications.map((p) => (p.id === pub.id ? { ...p, year: val } : p)),
                          }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Paper Preview Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 shadow-lg flex flex-col space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live CV Preview</h3>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Font Family */}
                  <div className="flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-lg border border-zinc-800">
                    <Type className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] text-zinc-400 font-medium">Font:</span>
                    <select
                      value={docFontFamily}
                      onChange={(e) => setDocFontFamily(e.target.value)}
                      className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="system-ui" className="bg-zinc-900 text-white">Sans (System UI)</option>
                      <option value="Georgia, serif" className="bg-zinc-900 text-white">Serif (Georgia)</option>
                      <option value="monospace" className="bg-zinc-900 text-white">Mono (JetBrains)</option>
                      <option value="Garamond, serif" className="bg-zinc-900 text-white">Classic (Garamond)</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="flex items-center gap-1 bg-black p-0.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase px-1">Size:</span>
                    <button
                      type="button"
                      onClick={() => setDocFontSize('sm')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docFontSize === 'sm' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Compact
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocFontSize('md')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docFontSize === 'md' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocFontSize('lg')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                        docFontSize === 'lg' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
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
              </div>

              {/* Paper Preview Container */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <div
                  ref={paperRef}
                  style={getCvStyle()}
                  className="cover-letter-paper p-8 bg-white text-black min-h-[720px] space-y-5"
                >
                  <div className="border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-extrabold tracking-tight text-black uppercase">{cvData.fullName}</h1>
                    <p className="text-xs font-bold text-zinc-800 mt-0.5">{cvData.executiveTitle}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-zinc-700 mt-2 font-mono">
                      <span>{cvData.email}</span>
                      <span>• {cvData.phone}</span>
                      <span>• {cvData.location}</span>
                    </div>
                  </div>

                  {cvData.biography && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                        Executive Biography & Strategic Vision
                      </h2>
                      <p className="text-[11px] text-zinc-900 leading-relaxed">{cvData.biography}</p>
                    </div>
                  )}

                  {cvData.researchFocus && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-1">
                        Domain & Strategic Focus Areas
                      </h2>
                      <p className="text-[11px] text-black font-bold">{cvData.researchFocus}</p>
                    </div>
                  )}

                  {cvData.experiences && cvData.experiences.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                        Leadership & Professional Appointments
                      </h2>
                      <div className="space-y-3">
                        {cvData.experiences.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between font-extrabold text-black text-[11px]">
                              <span>{exp.role} — {exp.organization}</span>
                              <span className="text-[10px] font-normal text-zinc-600">{exp.dates}</span>
                            </div>
                            <ul className="list-disc list-inside mt-1 text-[10px] text-zinc-900 space-y-0.5">
                              {exp.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cvData.publications && cvData.publications.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                        Select Publications & Keynotes
                      </h2>
                      <ul className="space-y-1 text-[10px] text-zinc-900">
                        {cvData.publications.map((pub) => (
                          <li key={pub.id}>
                            • <strong>&quot;{pub.title}&quot;</strong> — <em>{pub.publisher}</em> ({pub.year})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {cvData.education && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-1">
                        Academic Degrees & Credentials
                      </h2>
                      <p className="text-[11px] text-zinc-900">{cvData.education}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Tab */}
      {activeTab === 'preview' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-400">Layout Mode:</span>
              <span className="text-xs font-semibold text-white bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-lg">
                Multi-Page A4 Executive CV
              </span>
            </div>
          </div>

          <div
            ref={paperRef}
            style={getCvStyle()}
            className="cover-letter-paper p-8 rounded-xl bg-white text-black shadow-2xl min-h-[850px] space-y-5 ring-1 ring-zinc-300/30"
          >
            <div className="border-b-2 border-black pb-4">
              <h1 className="text-2xl font-extrabold tracking-tight text-black uppercase">{cvData.fullName}</h1>
              <p className="text-xs font-bold text-zinc-800 mt-0.5">{cvData.executiveTitle}</p>
              <div className="flex flex-wrap gap-2 text-[10px] text-zinc-700 mt-2 font-mono">
                <span>{cvData.email}</span>
                <span>• {cvData.phone}</span>
                <span>• {cvData.location}</span>
              </div>
            </div>

            {cvData.biography && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                  Executive Biography & Strategic Vision
                </h2>
                <p className="text-[11px] text-zinc-900 leading-relaxed">{cvData.biography}</p>
              </div>
            )}

            {cvData.researchFocus && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-1">
                  Domain & Strategic Focus Areas
                </h2>
                <p className="text-[11px] text-black font-bold">{cvData.researchFocus}</p>
              </div>
            )}

            {cvData.experiences && cvData.experiences.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                  Leadership & Professional Appointments
                </h2>
                <div className="space-y-3">
                  {cvData.experiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between font-extrabold text-black text-[11px]">
                        <span>{exp.role} — {exp.organization}</span>
                        <span className="text-[10px] font-normal text-zinc-600">{exp.dates}</span>
                      </div>
                      <ul className="list-disc list-inside mt-1 text-[10px] text-zinc-900 space-y-0.5">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cvData.publications && cvData.publications.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                  Select Publications & Keynotes
                </h2>
                <ul className="space-y-1 text-[10px] text-zinc-900">
                  {cvData.publications.map((pub) => (
                    <li key={pub.id}>
                      • <strong>&quot;{pub.title}&quot;</strong> — <em>{pub.publisher}</em> ({pub.year})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cvData.education && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-1">
                  Academic Degrees & Credentials
                </h2>
                <p className="text-[11px] text-zinc-900">{cvData.education}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthBillingModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {}} />
      <ApiSettingsModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} onSave={(m) => setSelectedModel(m)} />
    </div>
  );
}
