'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  Plus,
  Download,
  Zap,
  BookOpen,
  User,
  Eye,
  Edit3,
  Type,
  Sliders,
  Scissors,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import { getFreeGenerationsRemaining, canGenerate, incrementUsageCount, isProUser } from '../lib/usage';
import { AuthBillingModal } from './AuthBillingModal';
import { ApiSettingsModal } from './ApiSettingsModal';

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
  const [docPadding, setDocPadding] = useState<'p-6' | 'p-8' | 'p-12'>('p-8');
  const [showPageBreaks, setShowPageBreaks] = useState<boolean>(true);
  const [splitRatio, setSplitRatio] = useState<'50-50' | '60-40' | '40-60'>('50-50');

  const paperRef = useRef<HTMLDivElement>(null);

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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate biography');
      }
      if (data.summary) {
        setCvData((prev) => ({ ...prev, biography: data.summary }));
        if (!isProUser()) {
          incrementUsageCount();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
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

  const handleExportPdf = async () => {
    if (!paperRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
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

      pdf.save(`${cvData.fullName.replace(/\s+/g, '_')}_Executive_CV.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-black font-bold shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="gradient-text-animated">Executive &amp; Academic CV Builder</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                EUROPASS & C-SUITE READY
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Build multi-page academic research CVs and executive board-level CVs.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleLoadPreset('executive')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition cursor-pointer"
          >
            🏛️ Executive CV
          </button>
          <button
            onClick={() => handleLoadPreset('academic')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition cursor-pointer"
          >
            🎓 Academic CV
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 rounded-xl gradient-btn font-extrabold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CV PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-zinc-800 mb-6 gap-x-6 gap-y-2">
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'editor' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4" /> CV Form & AI Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'preview' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" /> Multi-Page CV Paper Preview
        </button>
      </div>

        {activeTab === 'editor' && (
        <div className={`grid grid-cols-1 gap-8 ${
          splitRatio === '60-40'
            ? 'lg:grid-cols-12 [&>div:first-child]:lg:col-span-7 [&>div:last-child]:lg:col-span-5'
            : splitRatio === '40-60'
            ? 'lg:grid-cols-12 [&>div:first-child]:lg:col-span-5 [&>div:last-child]:lg:col-span-7'
            : 'lg:grid-cols-12 [&>div:first-child]:lg:col-span-6 [&>div:last-child]:lg:col-span-6'
        }`}>
          {/* Form */}
          <div className="space-y-6">
            
            {/* Header Details */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                <User className="w-4 h-4 text-zinc-400" /> Executive Contact & Title
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Full Name & Honorifics</label>
                  <input
                    type="text"
                    value={cvData.fullName}
                    onChange={(e) => setCvData({ ...cvData, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Executive Title</label>
                  <input
                    type="text"
                    value={cvData.executiveTitle}
                    onChange={(e) => setCvData({ ...cvData, executiveTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Email</label>
                  <input
                    type="text"
                    value={cvData.email}
                    onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                    className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={cvData.phone}
                    onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                    className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={cvData.location}
                    onChange={(e) => setCvData({ ...cvData, location: e.target.value })}
                    className="w-full p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Biography & Vision */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" /> Executive Biography & Vision
                </h3>
                <button
                  onClick={handleGenerateBiography}
                  disabled={loadingAi}
                  className="px-3 py-1 rounded-xl gradient-btn text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  {loadingAi ? 'Refining...' : '⚡ AI Bio Polish'}
                </button>
              </div>
              <textarea
                rows={4}
                value={cvData.biography}
                onChange={(e) => setCvData({ ...cvData, biography: e.target.value })}
                className="w-full p-3 rounded-xl bg-black border border-zinc-800 text-zinc-100 text-xs leading-relaxed resize-none focus:border-white"
              />
            </div>

            {/* Publications & Research */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" /> Publications & Board Appointments
                </h3>
                <button
                  onClick={handleAddPublication}
                  className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Publication
                </button>
              </div>

              {cvData.publications.map((pub) => (
                <div key={pub.id} className="p-3 rounded-xl bg-black border border-zinc-800 space-y-2">
                  <input
                    type="text"
                    value={pub.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCvData((prev) => ({
                        ...prev,
                        publications: prev.publications.map((p) => (p.id === pub.id ? { ...p, title: val } : p)),
                      }));
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={pub.publisher}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData((prev) => ({
                          ...prev,
                          publications: prev.publications.map((p) => (p.id === pub.id ? { ...p, publisher: val } : p)),
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs"
                    />
                    <input
                      type="text"
                      value={pub.year}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCvData((prev) => ({
                          ...prev,
                          publications: prev.publications.map((p) => (p.id === pub.id ? { ...p, year: val } : p)),
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Paper Preview */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" /> Executive CV Paper Preview
              </h3>
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-3.5 py-1.5 rounded-xl gradient-btn text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>

            {/* Interactive Document Toolbar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Font Family */}
                <div className="flex items-center gap-1.5 bg-black px-2.5 py-1.5 rounded-xl border border-zinc-800">
                  <Type className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px] text-zinc-400 font-medium">Font:</span>
                  <select
                    value={docFontFamily}
                    onChange={(e) => setDocFontFamily(e.target.value)}
                    className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="system-ui" className="bg-zinc-900 text-white">Sans (System UI)</option>
                    <option value="Georgia, serif" className="bg-zinc-900 text-white">Serif (Georgia)</option>
                    <option value="monospace" className="bg-zinc-900 text-white">Mono (JetBrains)</option>
                    <option value="Garamond, serif" className="bg-zinc-900 text-white">Classic (Garamond)</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase px-1">Size:</span>
                  <button
                    type="button"
                    onClick={() => setDocFontSize('sm')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      docFontSize === 'sm' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocFontSize('md')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      docFontSize === 'md' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocFontSize('lg')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      docFontSize === 'lg' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Large
                  </button>
                </div>

                {/* Line Spacing */}
                <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase px-1">Spacing:</span>
                  <button
                    type="button"
                    onClick={() => setDocLineHeight('tight')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      docLineHeight === 'tight' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tight
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocLineHeight('normal')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      docLineHeight === 'normal' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocLineHeight('relaxed')}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      docLineHeight === 'relaxed' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Relaxed
                  </button>
                </div>
              </div>
            </div>

            {/* Paper Preview Container */}
            <div className="relative rounded-xl">
              <div
                ref={paperRef}
                style={getCvStyle()}
                className="cover-letter-paper p-8 rounded-xl bg-white text-black shadow-2xl min-h-[720px] space-y-5"
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

                {cvData.experiences && (
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
      )}

      {/* Full Preview Tab */}
      {activeTab === 'preview' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">Layout Mode:</span>
              <span className="text-xs font-bold text-white bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-xl">
                Multi-Page A4 Executive CV
              </span>
            </div>
            <button
              onClick={handleExportPdf}
              className="px-3.5 py-1.5 rounded-xl gradient-btn font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Export CV PDF
            </button>
          </div>

          <div
            ref={paperRef}
            style={{ fontFamily: docFontFamily }}
            className={`cover-letter-paper p-8 rounded-xl bg-white text-black shadow-2xl min-h-[850px] space-y-5 ring-1 ring-zinc-300/30 text-${
              docFontSize === 'sm' ? '[11px]' : docFontSize === 'lg' ? '[13px]' : 'xs'
            } leading-${docLineHeight}`}
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

            {cvData.experiences && (
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
