'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Layout, Sparkles, FileText, ShieldCheck, Award, Eye, Filter } from 'lucide-react';
import { RESUME_TEMPLATES, ResumeTemplate, ResumeTemplateId } from '../lib/resumeTemplates';

interface ResumeTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: ResumeTemplateId;
  onSelectTemplate: (id: ResumeTemplateId) => void;
}

type TemplateCategory = 'all' | 'ats' | 'tech' | 'executive' | 'modern';

export function ResumeTemplateSelector({
  isOpen,
  onClose,
  selectedTemplateId,
  onSelectTemplate,
}: ResumeTemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all' as TemplateCategory, label: 'All Templates', count: RESUME_TEMPLATES.length },
    { id: 'ats' as TemplateCategory, label: 'ATS High Pass Rate', count: 3 },
    { id: 'tech' as TemplateCategory, label: 'Tech & FAANG', count: 2 },
    { id: 'executive' as TemplateCategory, label: 'C-Suite & Finance', count: 2 },
    { id: 'modern' as TemplateCategory, label: 'Modern & Creative', count: 2 },
  ];

  const filteredTemplates = RESUME_TEMPLATES.filter((tmpl) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'ats') return tmpl.id === 'ats-compact' || tmpl.id === 'harvard-ivy' || tmpl.id === 'silicon-valley';
    if (activeCategory === 'tech') return tmpl.id === 'silicon-valley' || tmpl.id === 'mint-banner';
    if (activeCategory === 'executive') return tmpl.id === 'executive-blue-classic' || tmpl.id === 'europass-exec';
    if (activeCategory === 'modern') return tmpl.id === 'emerald-sidebar' || tmpl.id === 'creative-product';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white z-10 animate-slide-up">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white text-black font-bold shadow-lg">
              <Layout className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
                <span className="gradient-text-animated">Resume &amp; CV Visual Template Cards</span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {RESUME_TEMPLATES.length} INDUSTRY LAYOUTS
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Interactive wireframe layout thumbnails optimized for Ivy League finance, FAANG tech, and ATS scanners.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center gap-2 overflow-x-auto shrink-0">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0 mr-1" />
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'gradient-active shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/10 text-black font-extrabold' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Template Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => onSelectTemplate(tmpl.id)}
                  className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'bg-zinc-900 border-white ring-1 ring-white shadow-2xl scale-[1.01]'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/80'
                  }`}
                >
                  {/* Top Badge Strip */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border ${tmpl.badgeColorClass}`}
                      >
                        {tmpl.badge}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-black bg-white px-2 py-0.5 rounded-full shadow">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-white transition flex items-center justify-between">
                        <span>{tmpl.name}</span>
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                          {tmpl.id === 'ats-compact' ? '99% ATS' : '98% ATS'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-zinc-400 font-medium line-clamp-1">{tmpl.subtitle}</p>
                    </div>

                    {/* Interactive Graphical Wireframe Thumbnail */}
                    <div className="w-full h-36 bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group-hover:border-zinc-500 transition shadow-inner">
                      
                      {/* Emerald Split Sidebar Layout Preview */}
                      {tmpl.id === 'emerald-sidebar' && (
                        <div className="w-full h-full bg-white rounded flex text-[6px] font-serif text-black shadow-inner overflow-hidden">
                          <div className="w-1/3 bg-[#064e3b] text-white p-1 flex flex-col justify-between">
                            <div className="text-center space-y-0.5">
                              <div className="w-3 h-3 rounded-full bg-white mx-auto"></div>
                              <div className="font-bold text-[5px]">SOPHIE WALTON</div>
                              <div className="text-[4px] text-emerald-200">REPRESENTATIVE</div>
                            </div>
                            <div className="space-y-0.5 text-[4px] border-t border-emerald-800 pt-0.5">
                              <div>Seattle, WA</div>
                              <div>(206) 742-5187</div>
                            </div>
                          </div>
                          <div className="w-2/3 p-1.5 flex flex-col justify-between">
                            <div className="font-bold border-b border-black text-[5.5px]">Profile</div>
                            <div className="w-full h-1 bg-zinc-200 rounded-sm"></div>
                            <div className="font-bold border-b border-black text-[5.5px]">Employment History</div>
                            <div className="w-11/12 h-1 bg-zinc-200 rounded-sm"></div>
                          </div>
                        </div>
                      )}

                      {/* Mint Modern Banner Layout Preview */}
                      {tmpl.id === 'mint-banner' && (
                        <div className="w-full h-full bg-white rounded p-1.5 text-[6px] font-sans text-black flex flex-col justify-between shadow-inner">
                          <div className="flex bg-[#2dd4bf] text-black rounded p-1 items-center gap-1">
                            <div className="w-4 h-4 bg-teal-800 rounded shrink-0"></div>
                            <div>
                              <div className="font-extrabold text-[6.5px]">PATRICIA GIORDANO</div>
                              <div className="text-[4.5px] font-semibold">Receptionist</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-12 gap-1 my-1 flex-1">
                            <div className="col-span-4 border-r border-zinc-200 pr-1 space-y-1">
                              <div className="font-bold text-[5px]">Skills</div>
                              <div className="w-full h-0.5 bg-zinc-400"></div>
                            </div>
                            <div className="col-span-8 space-y-1">
                              <div className="font-bold border-b border-zinc-300 text-[5px]">Profile</div>
                              <div className="w-full h-1 bg-zinc-200 rounded-sm"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Executive Blue Classic Layout Preview */}
                      {tmpl.id === 'executive-blue-classic' && (
                        <div className="w-full h-full bg-white rounded p-2 text-[6px] font-sans text-black flex flex-col justify-between shadow-inner">
                          <div className="flex justify-between items-start border-b border-blue-600 pb-1">
                            <div>
                              <div className="font-extrabold text-[8px] text-blue-700">HERMAN WALTON</div>
                              <div className="text-[5.5px] font-bold text-black">FINANCIAL ANALYST</div>
                              <div className="text-[4.5px] text-zinc-600">Market St 12, NY | (412) 479-6342</div>
                            </div>
                            <div className="w-4 h-5 bg-zinc-200 border border-zinc-400 rounded-sm"></div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-blue-700 border-b border-blue-600 text-[5.5px]">PROFESSIONAL EXPERIENCE</div>
                            <div className="flex justify-between text-[5px] font-bold">
                              <span>Financial Analyst, GEO Corp.</span>
                              <span>2012 — Present</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-200 rounded-sm"></div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-extrabold text-blue-700 border-b border-blue-600 text-[5.5px]">TECHNICAL SKILLS</div>
                            <div className="grid grid-cols-4 gap-0.5 text-[4.5px]">
                              <div>• Solutions</div>
                              <div>• Analytics</div>
                              <div>• Agile</div>
                              <div>• Systems</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Harvard Ivy Layout Preview */}
                      {tmpl.id === 'harvard-ivy' && (
                        <div className="w-full h-full bg-white rounded p-2 text-[6px] font-serif text-black flex flex-col justify-between shadow-inner">
                          <div className="text-center space-y-0.5 border-b border-black pb-1">
                            <div className="font-bold tracking-wider uppercase text-[7px]">ALEX VANCE</div>
                            <div className="text-[5px] text-zinc-700">alex@example.com | (555) 234-5678 | San Francisco, CA</div>
                          </div>
                          <div className="space-y-1 my-1">
                            <div className="font-bold uppercase border-b border-zinc-400 text-[6px]">EXECUTIVE SUMMARY</div>
                            <div className="w-full h-1.5 bg-zinc-200 rounded-sm"></div>
                            <div className="w-4/5 h-1.5 bg-zinc-200 rounded-sm"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold uppercase border-b border-zinc-400 text-[6px]">EXPERIENCE</div>
                            <div className="flex justify-between font-bold text-[5.5px]">
                              <span>Senior Engineer — Stripe Tech</span>
                              <span>2022 - Present</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-300 rounded-sm"></div>
                            <div className="w-11/12 h-1 bg-zinc-300 rounded-sm"></div>
                          </div>
                        </div>
                      )}

                      {/* Silicon Valley Layout Preview */}
                      {tmpl.id === 'silicon-valley' && (
                        <div className="w-full h-full bg-white rounded p-2 text-[6px] font-sans text-black flex flex-col justify-between shadow-inner">
                          <div className="flex justify-between items-start border-l-2 border-black pl-1.5">
                            <div>
                              <div className="font-extrabold text-[8px]">ALEX VANCE</div>
                              <div className="text-[5.5px] font-semibold text-zinc-600">Senior Full-Stack Engineer</div>
                            </div>
                            <div className="flex gap-0.5">
                              <span className="px-1 bg-zinc-900 text-white rounded text-[4.5px]">FAANG</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 my-1 p-1 bg-zinc-100 rounded">
                            <div className="h-1 bg-zinc-800 rounded-xs"></div>
                            <div className="h-1 bg-zinc-800 rounded-xs"></div>
                            <div className="h-1 bg-zinc-800 rounded-xs"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold uppercase text-[6px] text-zinc-900">EXPERIENCE & METRICS</div>
                            <div className="p-1 bg-zinc-50 border border-zinc-200 rounded">
                              <div className="w-full h-1 bg-zinc-700 rounded-sm mb-0.5"></div>
                              <div className="w-3/4 h-1 bg-zinc-900 rounded-sm"></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Europass Exec Layout Preview */}
                      {tmpl.id === 'europass-exec' && (
                        <div className="w-full h-full bg-white rounded text-[6px] font-sans text-black flex flex-col justify-between shadow-inner overflow-hidden">
                          <div className="bg-zinc-900 text-white p-2 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-[7px]">ALEX VANCE</div>
                              <div className="text-[5px] text-zinc-300">Executive Director</div>
                            </div>
                            <span className="px-1 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded text-[4.5px]">EU PASS</span>
                          </div>
                          <div className="p-2 space-y-1">
                            <div className="flex gap-1 text-[5px]">
                              <span className="px-1 bg-zinc-200 rounded font-bold">English (Native)</span>
                              <span className="px-1 bg-zinc-200 rounded font-bold">German (C1)</span>
                            </div>
                            <div className="font-bold uppercase text-[5.5px] border-b border-zinc-300">PUBLICATIONS & LEADERSHIP</div>
                            <div className="w-full h-1 bg-zinc-300 rounded-sm"></div>
                            <div className="w-4/5 h-1 bg-zinc-300 rounded-sm"></div>
                          </div>
                        </div>
                      )}

                      {/* ATS Compact Layout Preview */}
                      {tmpl.id === 'ats-compact' && (
                        <div className="w-full h-full bg-white rounded p-2 text-[5.5px] font-sans text-black flex flex-col justify-between shadow-inner">
                          <div className="border-b border-zinc-400 pb-0.5">
                            <div className="font-bold text-[7px]">ALEX VANCE</div>
                            <div className="text-[4.5px] text-zinc-800">alex@example.com | (555) 234-5678 | San Francisco, CA</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-extrabold uppercase text-[5.5px]">TECHNICAL SKILLS (KEYWORDS)</div>
                            <div className="text-[4.5px] text-zinc-700 leading-tight">TypeScript, React, Next.js, Node.js, SQL, AWS, Redis, Docker</div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-extrabold uppercase text-[5.5px]">WORK EXPERIENCE</div>
                            <div className="w-full h-0.5 bg-zinc-800"></div>
                            <div className="w-full h-0.5 bg-zinc-800"></div>
                            <div className="w-4/5 h-0.5 bg-zinc-800"></div>
                          </div>
                        </div>
                      )}

                      {/* Creative Product Layout Preview */}
                      {tmpl.id === 'creative-product' && (
                        <div className="w-full h-full bg-white rounded text-[6px] font-sans text-black flex shadow-inner overflow-hidden">
                          <div className="w-2 bg-zinc-950 h-full shrink-0" />
                          <div className="p-2 flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-center border-b border-zinc-200 pb-1">
                              <div>
                                <div className="font-bold text-[7.5px]">ALEX VANCE</div>
                                <div className="text-[5px] text-zinc-600">Product & UX Designer</div>
                              </div>
                              <span className="px-1 py-0.5 bg-zinc-100 border border-zinc-300 text-black font-bold rounded text-[4.5px]">PORTFOLIO</span>
                            </div>
                            <div className="space-y-1">
                              <div className="font-bold uppercase text-[5.5px]">DESIGN STACK MATRIX</div>
                              <div className="grid grid-cols-2 gap-1">
                                <div className="bg-zinc-100 p-0.5 rounded text-[4.5px] font-semibold">Figma & Systems</div>
                                <div className="bg-zinc-100 p-0.5 rounded text-[4.5px] font-semibold">User Research</div>
                              </div>
                            </div>
                            <div className="w-full h-1 bg-zinc-300 rounded-sm"></div>
                          </div>
                        </div>
                      )}

                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">{tmpl.description}</p>
                  </div>

                  {/* Features List & Apply Button */}
                  <div className="p-4 pt-0 space-y-3">
                    <ul className="space-y-1 border-t border-zinc-800/80 pt-3">
                      {tmpl.features.map((feat, idx) => (
                        <li key={idx} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-white shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(tmpl.id);
                        onClose();
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'gradient-active hover:bg-zinc-200 shadow-lg'
                          : 'bg-zinc-800 text-white hover:bg-white hover:text-black border border-zinc-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" /> Applied Template
                        </>
                      ) : (
                        'Apply Template'
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span>All templates feature 100% PDF export compatibility & clean typography.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition border border-zinc-800 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
