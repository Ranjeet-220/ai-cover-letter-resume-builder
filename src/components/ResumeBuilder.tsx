'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
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
} from 'lucide-react';
import { WorkExperienceItem, ResumeCvData } from '../types';
import { canGenerate, incrementUsageCount, isProUser } from '../lib/usage';
import { AuthBillingModal } from './AuthBillingModal';
import { ApiSettingsModal } from './ApiSettingsModal';
import { ResumeTemplateSelector } from './ResumeTemplateSelector';
import { ResumeTemplateId, getResumeTemplateById } from '../lib/resumeTemplates';
import { useToast } from './Toast';

const SAMPLE_RESUME_PRESETS: Record<string, ResumeCvData> = {
  software_engineer: {
    fullName: 'Alex Vance',
    professionalTitle: 'Senior Full-Stack Engineer',
    email: 'alex.vance@example.com',
    phone: '(555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    website: 'alexvance.dev',
    summary:
      'Results-driven Senior Full-Stack Engineer with 6+ years of experience architecting high-availability Next.js, React, TypeScript, and microservices web applications. Proven track record of boosting system performance by 40% and scaling platform infrastructure for 1M+ active users.',
    skills: ['TypeScript', 'Next.js 15', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'GraphQL', 'AWS', 'Redis'],
    experiences: [
      {
        id: 'exp-1',
        company: 'Stripe Tech Solutions',
        role: 'Senior Full-Stack Engineer',
        location: 'San Francisco, CA',
        startDate: 'Jan 2022',
        endDate: 'Present',
        bullets: [
          'Architected a high-throughput event processing engine using Node.js and Redis, handling 5M+ daily API transactions with 99.99% uptime.',
          'Led a cross-functional team of 6 engineers to refactor frontend codebase to Next.js App Router, cutting page load times by 42%.',
          'Integrated automated CI/CD pipelines reducing deployment friction and accelerating feature delivery cadence by 30%.',
        ],
      },
      {
        id: 'exp-2',
        company: 'Vanguard Systems',
        role: 'Software Engineer',
        location: 'Austin, TX',
        startDate: 'Jun 2019',
        endDate: 'Dec 2021',
        bullets: [
          'Developed responsive React UI components and RESTful microservices consumed by over 250,000 active enterprise subscribers.',
          'Optimized SQL database query indexing, cutting database response latency from 450ms to 85ms.',
        ],
      },
    ],
    education: 'B.S. in Computer Science — University of California, Berkeley (2019)',
    certifications: ['AWS Certified Solutions Architect', 'Meta Front-End Developer Professional Certificate'],
    languages: ['English (Native)', 'German (Professional)', 'French (Intermediate)'],
    publications: [
      'Scalable Microservices with Node.js & Redis (IEEE Tech 2023)',
      'High Performance Next.js App Router Design Patterns (2024)',
    ],
    portfolioUrl: 'alexvance.dev',
  },
  product_manager: {
    fullName: 'Sophia Martinez',
    professionalTitle: 'Principal Product Manager',
    email: 'sophia.m@example.com',
    phone: '(555) 876-5432',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/sophiamartinez',
    website: 'sophiamartinez.com',
    summary:
      'Strategic Product Leader with 7+ years scaling B2B SaaS products from zero-to-one and $0 to $15M ARR. Expert in user-centric roadmap discovery, data-driven retention loops, and cross-functional engineering alignment.',
    skills: ['Product Strategy', 'B2B SaaS Growth', 'User Research', 'A/B Testing', 'SQL / Mixpanel', 'Agile / Scrum', 'Roadmapping'],
    experiences: [
      {
        id: 'exp-pm-1',
        company: 'Acme Cloud SaaS',
        role: 'Senior Product Manager',
        location: 'New York, NY',
        startDate: 'Mar 2021',
        endDate: 'Present',
        bullets: [
          'Owned product roadmap for enterprise analytics suite, driving a 35% increase in ARR ($8M to $11.8M) within 18 months.',
          'Spearheaded user onboarding redesign that boosted 30-day user retention rates from 28% to 44%.',
        ],
      },
    ],
    education: 'M.B.A. — NYU Stern School of Business | B.A. in Economics — Columbia University',
    languages: ['English (Native)', 'Spanish (Bilingual)'],
    publications: ['Product Retention Loops in Modern B2B SaaS (Product School 2024)'],
    portfolioUrl: 'sophiamartinez.com',
  },
};

function PrintableResumeContent({
  data,
  templateId,
  isFullPreview = false,
}: {
  data: ResumeCvData;
  templateId: ResumeTemplateId;
  isFullPreview?: boolean;
}) {
  const currentTemplate = getResumeTemplateById(templateId);

  // Template: Emerald Split Sidebar (Forest Green Sidebar with Circular Headshot)
  if (templateId === 'emerald-sidebar') {
    return (
      <div
        style={{ fontFamily: currentTemplate.fontFamilyCSS }}
        className={`bg-white text-black shadow-2xl flex border border-zinc-200 overflow-hidden ${
          isFullPreview ? 'min-h-[900px] text-sm' : 'min-h-[680px] text-xs'
        }`}
      >
        {/* Deep Emerald Left Sidebar */}
        <div className="w-1/3 bg-[#064e3b] text-white p-6 flex flex-col space-y-6 shrink-0">
          <div className="text-center space-y-2">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt="Candidate Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-white mx-auto shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-950 border-2 border-white mx-auto flex items-center justify-center text-xs font-mono">
                Photo
              </div>
            )}
            <h1 className="text-lg font-bold uppercase tracking-tight leading-snug">{data.fullName || 'Sophie Walton'}</h1>
            <p className="text-[10px] text-emerald-200 uppercase font-semibold tracking-wider">
              {data.professionalTitle || 'Customer Service Representative'}
            </p>
          </div>

          {/* Details Section */}
          <div className="space-y-2 text-[11px] text-emerald-100 font-sans border-t border-emerald-800 pt-4">
            <div className="font-bold uppercase tracking-wider text-white text-[10px]">Details</div>
            {data.address && <div>{data.address}</div>}
            {(data.cityState || data.location) && <div>{data.cityState || data.location}</div>}
            {data.country && <div>{data.country}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.email && <div className="break-all">{data.email}</div>}
          </div>

          {/* Skills Section with Progress Bars */}
          {data.skills && data.skills.length > 0 && (
            <div className="space-y-3 border-t border-emerald-800 pt-4">
              <div className="font-bold uppercase tracking-wider text-white text-[10px]">Skills</div>
              {data.skills.map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[10px] font-medium text-emerald-100">{skill}</div>
                  <div className="w-full h-1 bg-emerald-950 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${85 - (idx % 3) * 15}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Content Area */}
        <div className="w-2/3 p-8 space-y-5 bg-white text-zinc-900">
          {/* Profile */}
          {data.summary && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                Profile
              </h2>
              <p className="text-[11px] text-zinc-800 leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Employment History */}
          {data.experiences && data.experiences.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-3">
                Employment History
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="font-bold text-black text-xs">
                      {exp.role}, <span className="font-semibold">{exp.company}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono mt-0.5">
                      {exp.startDate} — {exp.endDate}
                    </div>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-zinc-800">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="leading-snug">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                Education
              </h2>
              <p className="text-[11px] text-zinc-800 font-medium">{data.education}</p>
            </div>
          )}

          {/* Additional Information */}
          {(data.languages?.length || data.certifications?.length || data.drivingLicense || data.nationality) && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                Additional Information
              </h2>
              <ul className="space-y-1 text-[11px] text-zinc-800">
                {data.languages && data.languages.length > 0 && (
                  <li>• <strong>Languages:</strong> {data.languages.join(', ')}</li>
                )}
                {data.certifications && data.certifications.length > 0 && (
                  <li>• <strong>Certificates:</strong> {data.certifications.join(', ')}</li>
                )}
                {data.drivingLicense && <li>• <strong>Driving License:</strong> {data.drivingLicense}</li>}
                {data.nationality && <li>• <strong>Nationality:</strong> {data.nationality}</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Template: Mint Modern Banner (Vibrant Mint Header Block with Left Photo)
  if (templateId === 'mint-banner') {
    return (
      <div
        style={{ fontFamily: currentTemplate.fontFamilyCSS }}
        className={`bg-white text-black shadow-2xl space-y-5 border border-zinc-200 ${
          isFullPreview ? 'p-10 min-h-[900px] text-sm' : 'p-6 min-h-[680px] text-xs'
        }`}
      >
        {/* Top Mint Banner Block */}
        <div className="flex bg-[#2dd4bf] text-zinc-950 rounded-xl overflow-hidden shadow-md">
          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt="Candidate Profile"
              className="w-28 h-28 object-cover shrink-0"
            />
          ) : (
            <div className="w-28 h-28 bg-teal-800 text-white flex items-center justify-center text-xs font-mono shrink-0">
              Photo
            </div>
          )}
          <div className="p-4 flex flex-col justify-center space-y-1 flex-1">
            <h1 className="text-2xl font-extrabold text-black tracking-tight">{data.fullName || 'Patricia Giordano'}</h1>
            <p className="text-sm font-bold text-teal-950">{data.professionalTitle || 'Receptionist'}</p>
            <div className="text-[11px] text-zinc-900 font-medium pt-1">
              {[
                data.address,
                data.cityState || data.location,
                data.country,
              ].filter(Boolean).join(', ')}
              {data.phone && `  •  ${data.phone}`}
              {data.email && `  •  ${data.email}`}
            </div>
          </div>
        </div>

        {/* Two Column Layout: Left Column 35%, Right Column 65% */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-4 space-y-5 border-r border-zinc-200 pr-4">
            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black">Skills</h2>
                <div className="space-y-2">
                  {data.skills.map((skill, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-[11px] font-medium text-zinc-800">{skill}</div>
                      <div className="flex gap-0.5 text-zinc-900 font-bold text-[10px]">
                        ━━━━━━
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black">Languages</h2>
                <div className="space-y-1.5 text-[11px] text-zinc-800 font-medium">
                  {data.languages.map((lang, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div>{lang}</div>
                      <div className="text-zinc-900 text-[10px]">━━━━━━</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-8 space-y-5">
            {/* Profile */}
            {data.summary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                  Profile
                </h2>
                <p className="text-[11px] text-zinc-800 leading-relaxed">{data.summary}</p>
              </div>
            )}

            {/* Employment History */}
            {data.experiences && data.experiences.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-3">
                  Employment History
                </h2>
                <div className="space-y-4">
                  {data.experiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="font-bold text-black text-xs">
                        {exp.role}, <span className="font-semibold">{exp.company}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {exp.startDate} — {exp.endDate}
                      </div>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-zinc-800">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="leading-snug">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
                  Education
                </h2>
                <p className="text-[11px] text-zinc-800 font-medium">{data.education}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Template 0: Executive Blue Classic (Corporate Financial Analyst with Top-Right Photo & Blue Underlines)
  if (templateId === 'executive-blue-classic') {
    return (
      <div
        style={{ fontFamily: currentTemplate.fontFamilyCSS }}
        className={`bg-white text-black shadow-2xl space-y-4 border border-zinc-200 ${
          isFullPreview ? 'p-12 min-h-[900px] text-sm' : 'p-8 min-h-[680px] text-xs'
        }`}
      >
        {/* Header with Top-Right Candidate Headshot */}
        <div className="flex justify-between items-start border-b-2 border-blue-600 pb-3 gap-4">
          <div className="space-y-1 flex-1">
            <h1 className={`${isFullPreview ? 'text-3xl' : 'text-2xl'} font-extrabold tracking-tight uppercase text-blue-700`}>
              {data.fullName || 'Herman Walton'}
            </h1>
            <p className="text-sm font-extrabold uppercase text-zinc-900 tracking-wider">
              {data.professionalTitle || 'Financial Analyst'}
            </p>
            <div className="text-[11px] text-zinc-600 leading-snug">
              {[
                data.address,
                data.cityState || data.location,
                data.country,
              ].filter(Boolean).join(', ')}
              {data.phone && ` | ${data.phone}`}
              {data.email && ` | ${data.email}`}
              {data.linkedin && ` | LinkedIn: ${data.linkedin}`}
              {data.github && ` | GitHub: ${data.github}`}
            </div>
          </div>

          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt="Candidate Profile"
              className="w-20 h-24 object-cover border border-zinc-300 rounded bg-zinc-100 shrink-0"
            />
          ) : (
            <div className="w-20 h-24 bg-zinc-100 border border-zinc-300 rounded flex items-center justify-center text-zinc-400 text-xs text-center p-1 shrink-0 font-mono">
              Photo
            </div>
          )}
        </div>

        {/* SUMMARY */}
        {data.summary && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 border-b border-blue-600 pb-0.5 mb-1.5">
              Summary
            </h2>
            <p className="text-zinc-800 text-[11px] leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* PROFESSIONAL EXPERIENCE */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 border-b border-blue-600 pb-0.5 mb-2">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-bold text-black text-xs">
                    <span>{exp.role}, <span className="font-extrabold text-zinc-900">{exp.company}</span></span>
                    <span className="text-[11px] font-bold text-zinc-800">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-zinc-800">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION */}
        {data.education && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 border-b border-blue-600 pb-0.5 mb-1.5">
              Education
            </h2>
            <p className="text-[11px] text-zinc-900 font-medium">{data.education}</p>
          </div>
        )}

        {/* TECHNICAL SKILLS */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 border-b border-blue-600 pb-0.5 mb-1.5">
              Technical Skills
            </h2>
            <div className="grid grid-cols-4 gap-2 text-[11px] text-zinc-800 font-medium">
              {data.skills.map((skill, i) => (
                <div key={i}>• {skill}</div>
              ))}
            </div>
          </div>
        )}

        {/* ADDITIONAL INFORMATION */}
        {(data.languages?.length || data.certifications?.length || data.drivingLicense || data.nationality || data.placeOfBirth) && (
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-blue-700 border-b border-blue-600 pb-0.5 mb-1.5">
              Additional Information
            </h2>
            <ul className="space-y-1 text-[11px] text-zinc-800">
              {data.languages && data.languages.length > 0 && (
                <li>• <strong>Languages:</strong> {data.languages.join(', ')}</li>
              )}
              {data.certifications && data.certifications.length > 0 && (
                <li>• <strong>Certificates:</strong> {data.certifications.join(', ')}</li>
              )}
              {data.drivingLicense && <li>• <strong>Driving License:</strong> {data.drivingLicense}</li>}
              {data.nationality && <li>• <strong>Nationality:</strong> {data.nationality}</li>}
              {data.placeOfBirth && <li>• <strong>Place of Birth:</strong> {data.placeOfBirth}</li>}
            </ul>
          </div>
        )}
      </div>
    );
  }
  if (templateId === 'harvard-ivy') {
    return (
      <div
        style={{ fontFamily: currentTemplate.fontFamilyCSS }}
        className={`bg-white text-black shadow-2xl space-y-5 border border-zinc-200 ${
          isFullPreview ? 'p-12 min-h-[900px] text-sm' : 'p-8 min-h-[680px] text-xs'
        }`}
      >
        {/* Centered Executive Header */}
        <div className="text-center border-b-2 border-black pb-4 space-y-1">
          {data.photoUrl && (
            <div className="flex justify-center mb-2">
              <img src={data.photoUrl} alt="Candidate Profile" className="w-16 h-16 rounded-full object-cover border-2 border-black shadow-sm" />
            </div>
          )}
          <h1 className={`${isFullPreview ? 'text-3xl' : 'text-2xl'} font-bold tracking-widest uppercase text-black`}>
            {data.fullName || 'Candidate Name'}
          </h1>
          <p className="text-sm font-semibold italic text-zinc-800">{data.professionalTitle}</p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px] text-zinc-800 font-mono pt-1">
            <span>{data.email}</span>
            {data.phone && <span>• {data.phone}</span>}
            {(data.address || data.cityState || data.location) && (
              <span>• {[data.address, data.cityState || data.location, data.postalCode, data.country].filter(Boolean).join(', ')}</span>
            )}
            {data.linkedin && <span>• LinkedIn: {data.linkedin}</span>}
            {data.github && <span>• GitHub: {data.github}</span>}
            {data.drivingLicense && <span>• License: {data.drivingLicense}</span>}
            {data.nationality && <span>• Nationality: {data.nationality}</span>}
            {data.dateOfBirth && <span>• DOB: {data.dateOfBirth}</span>}
            {data.placeOfBirth && <span>• POB: {data.placeOfBirth}</span>}
          </div>
        </div>

        {/* Executive Summary */}
        {data.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 mb-2 text-center">
              Executive Summary
            </h2>
            <p className="text-zinc-900 leading-relaxed text-center">{data.summary}</p>
          </div>
        )}

        {/* Areas of Expertise */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 mb-2 text-center">
              Areas of Expertise & Competencies
            </h2>
            <p className="text-zinc-900 text-center font-semibold">{data.skills.join('  •  ')}</p>
          </div>
        )}

        {/* Work Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 mb-3 text-center">
              Professional Work Experience
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span className="text-sm">{exp.role} — <span className="italic font-normal">{exp.company}</span></span>
                    <span className="text-xs font-normal text-zinc-700">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  {exp.location && <div className="text-[11px] italic text-zinc-600 mb-1">{exp.location}</div>}
                  <ul className="list-disc list-inside space-y-1 text-zinc-900">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Credentials */}
        {data.education && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 mb-2 text-center">
              Education & Credentials
            </h2>
            <p className="text-zinc-900 text-center font-medium">{data.education}</p>
          </div>
        )}

        {/* Additional Information */}
        {(data.drivingLicense || data.placeOfBirth || data.nationality) && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-1 mb-2 text-center">
              Additional Information
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-[11px] font-medium text-zinc-900">
              {data.drivingLicense && <span><strong>Driving License:</strong> {data.drivingLicense}</span>}
              {data.nationality && <span><strong>Nationality:</strong> {data.nationality}</span>}
              {data.placeOfBirth && <span><strong>Place of Birth:</strong> {data.placeOfBirth}</span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Template 2: Silicon Valley Tech (Modern Sans, Compact Skill Matrix, Metric Callouts)
  if (templateId === 'silicon-valley') {
    return (
      <div
        style={{ fontFamily: currentTemplate.fontFamilyCSS }}
        className={`bg-white text-black shadow-2xl space-y-5 border border-zinc-200 ${
          isFullPreview ? 'p-12 min-h-[900px] text-sm' : 'p-8 min-h-[680px] text-xs'
        }`}
      >
        {/* Modern Tech Header */}
        <div className="border-l-4 border-zinc-900 pl-4 pb-2 flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className={`${isFullPreview ? 'text-3xl' : 'text-2xl'} font-extrabold tracking-tight text-black`}>
              {data.fullName}
            </h1>
            <p className="text-sm font-bold text-zinc-800 mt-0.5">{data.professionalTitle}</p>
          </div>
          <div className="text-right text-[11px] text-zinc-700 font-mono space-y-0.5">
            <div>{data.email} | {data.phone}</div>
            <div>{data.location} | {data.linkedin || data.website}</div>
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-black mb-1">
              Technical Profile Summary
            </h2>
            <p className="text-zinc-900 leading-relaxed text-[11px]">{data.summary}</p>
          </div>
        )}

        {/* Compact Skill Matrix */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
              Technical Stack & Skill Matrix
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-bold text-black">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-3">
              Engineering & Systems Experience
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-extrabold text-black">
                    <span className="text-xs">{exp.role} <span className="text-zinc-600 font-semibold">@ {exp.company}</span></span>
                    <span className="text-[11px] font-mono text-zinc-600">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-900">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-relaxed text-[11px]">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-1">
              Education & Certifications
            </h2>
            <p className="text-zinc-900 text-[11px] font-semibold">{data.education}</p>
          </div>
        )}
      </div>
    );
  }

  // Template 3: Europass Executive (Structured Header Block, Language Badges, Publications)
  if (templateId === 'europass-exec') {
    return (
      <div
        style={{ fontFamily: currentTemplate.fontFamilyCSS }}
        className={`bg-white text-black shadow-2xl space-y-5 border border-zinc-200 ${
          isFullPreview ? 'p-12 min-h-[900px] text-sm' : 'p-8 min-h-[680px] text-xs'
        }`}
      >
        {/* Structured Header Banner */}
        <div className="bg-zinc-950 text-white p-6 rounded-2xl flex justify-between items-center flex-wrap gap-4 shadow-md">
          <div>
            <h1 className={`${isFullPreview ? 'text-2xl' : 'text-xl'} font-extrabold uppercase tracking-tight text-white`}>
              {data.fullName}
            </h1>
            <p className="text-xs font-medium text-zinc-300 mt-1">{data.professionalTitle}</p>
          </div>
          <div className="text-right text-[11px] text-zinc-400 space-y-1 font-mono">
            <div>✉ {data.email}</div>
            <div>📞 {data.phone}</div>
            <div>📍 {data.location}</div>
          </div>
        </div>

        {/* Executive Summary */}
        {data.summary && (
          <div className="border-l-4 border-zinc-950 bg-zinc-50 p-4 rounded-r-xl">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-black mb-1">
              Executive Leadership Summary
            </h2>
            <p className="text-zinc-900 leading-relaxed text-[11px]">{data.summary}</p>
          </div>
        )}

        {/* Language Proficiency Badges */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-400 pb-1 mb-2">
            Language Proficiencies
          </h2>
          <div className="flex flex-wrap gap-2">
            {(data.languages || ['English (Native / Full Professional)', 'German (C1 Working Proficiency)', 'French (Intermediate)']).map((lang, idx) => (
              <span key={idx} className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold">
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Professional Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-400 pb-1 mb-3">
              Executive Work History & Strategic Leadership
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-zinc-300 pl-3">
                  <div className="flex justify-between items-baseline font-bold text-black">
                    <span className="text-xs">{exp.role} | <span className="font-extrabold text-zinc-900">{exp.company}</span></span>
                    <span className="text-[10px] font-mono text-zinc-600">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-zinc-900">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-relaxed text-[11px]">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publications & Keynote Section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-400 pb-1 mb-2">
            Publications & Executive Achievements
          </h2>
          <ul className="list-disc list-inside space-y-1 text-zinc-800 text-[11px]">
            {(data.publications || [
              'Enterprise Microservices Architecture & Scalable SaaS (IEEE 2023)',
              'Keynote Speaker: Global Tech Leadership Forum (Berlin 2024)',
            ]).map((pub, idx) => (
              <li key={idx}>{pub}</li>
            ))}
          </ul>
        </div>

        {/* Education */}
        {data.education && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-400 pb-1 mb-1">
              Education & Qualifications
            </h2>
            <p className="text-zinc-900 text-[11px] font-semibold">{data.education}</p>
          </div>
        )}
      </div>
    );
  }

  // Template 4: ATS-Compact (100% ATS-Safe Minimalist One-Pager)
  if (templateId === 'ats-compact') {
    return (
      <div
        style={{ fontFamily: currentTemplate.fontFamilyCSS }}
        className={`bg-white text-black shadow-2xl space-y-4 border border-zinc-200 ${
          isFullPreview ? 'p-12 min-h-[900px] text-sm' : 'p-8 min-h-[680px] text-xs'
        }`}
      >
        {/* Simple Plain Text Header */}
        <div className="border-b border-black pb-2">
          <h1 className={`${isFullPreview ? 'text-2xl' : 'text-xl'} font-bold uppercase text-black`}>
            {data.fullName}
          </h1>
          <p className="text-xs font-bold text-zinc-800">{data.professionalTitle}</p>
          <div className="text-[11px] text-black font-normal mt-1 font-mono">
            {data.email} | {data.phone} | {data.location} | {data.linkedin || data.website}
          </div>
        </div>

        {/* Executive Summary */}
        {data.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1">
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-black text-[11px] leading-snug">{data.summary}</p>
          </div>
        )}

        {/* Core Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1">
              TECHNICAL SKILLS & KEYWORDS
            </h2>
            <p className="text-black text-[11px] leading-snug font-medium">{data.skills.join(', ')}</p>
          </div>
        )}

        {/* Work Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-2">
              WORK EXPERIENCE
            </h2>
            <div className="space-y-3">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between font-bold text-black text-[11px]">
                    <span>{exp.company} — {exp.role}</span>
                    <span>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[10.5px] text-black">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-snug">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 mb-1">
              EDUCATION
            </h2>
            <p className="text-black text-[11px]">{data.education}</p>
          </div>
        )}
      </div>
    );
  }

  // Template 5: Creative Product & UX (Obsidian Accent Strip, Portfolio Badge, Tech Stack Matrix)
  return (
    <div
      style={{ fontFamily: currentTemplate.fontFamilyCSS }}
      className={`bg-white text-black shadow-2xl flex relative overflow-hidden border border-zinc-200 ${
        isFullPreview ? 'min-h-[900px] text-sm' : 'min-h-[680px] text-xs'
      }`}
    >
      {/* Obsidian Vertical Accent Strip */}
      <div className="w-3.5 bg-zinc-950 shrink-0 min-h-full" />

      <div className={`flex-1 space-y-5 ${isFullPreview ? 'p-10' : 'p-7'}`}>
        {/* Header with Portfolio Badge Callout */}
        <div className="border-b-2 border-zinc-900 pb-3 flex justify-between items-end flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`${isFullPreview ? 'text-3xl' : 'text-2xl'} font-extrabold tracking-tight text-black`}>
                {data.fullName}
              </h1>
              <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold rounded-md uppercase tracking-wider">
                UX & PRODUCT
              </span>
            </div>
            <p className="text-sm font-bold text-zinc-700 mt-0.5">{data.professionalTitle}</p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-300 rounded-full font-bold text-[10px] text-black">
              🌐 Portfolio: {data.portfolioUrl || data.website || 'alexvance.dev'}
            </span>
            <div className="text-[10px] text-zinc-600 font-mono mt-1">
              {data.email} | {data.phone}
            </div>
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
              Product Vision & Design Summary
            </h2>
            <p className="text-zinc-900 leading-relaxed text-[11px]">{data.summary}</p>
          </div>
        )}

        {/* Technical Stack Matrix */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-2">
              Design Systems & Tech Stack Matrix
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {data.skills.map((skill, i) => (
                <div key={i} className="bg-zinc-100 border border-zinc-200 p-2 rounded-xl flex items-center justify-between">
                  <span className="text-[11px] font-bold text-black">{skill}</span>
                  <span className="w-2 h-2 rounded-full bg-black"></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-3">
              Product & UX Leadership Experience
            </h2>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-extrabold text-black">
                    <span className="text-xs">{exp.role} — <span className="text-zinc-700">{exp.company}</span></span>
                    <span className="text-[10px] font-mono text-zinc-600">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-zinc-900">
                    {exp.bullets.map((b, i) => (
                      <li key={i} className="leading-relaxed text-[11px]">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-300 pb-1 mb-1">
              Education & Design Credentials
            </h2>
            <p className="text-zinc-900 text-[11px] font-medium">{data.education}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FormattedPrintableResume({
  data,
  templateId,
  isFullPreview,
  docFontFamily,
  docFontSize,
  docLineHeight,
}: {
  data: ResumeCvData;
  templateId: ResumeTemplateId;
  isFullPreview: boolean;
  docFontFamily: string;
  docFontSize: string;
  docLineHeight: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getFontFamilyStyle = () => {
    switch (docFontFamily) {
      case 'sans':
        return 'Inter, system-ui, sans-serif';
      case 'serif':
        return 'Playfair Display, Georgia, serif';
      case 'mono':
        return 'JetBrains Mono, monospace';
      case 'garamond':
        return 'EB Garamond, Garamond, Georgia, serif';
      default:
        return undefined;
    }
  };

  const getPaperStyle = (): React.CSSProperties => {
    let scale = 1;
    if (docFontSize === 'compact') scale = 0.88;
    if (docFontSize === 'large') scale = 1.15;

    let lh = '1.5';
    if (docLineHeight === 'tight') lh = '1.25';
    if (docLineHeight === 'relaxed') lh = '1.85';

    const fontStyle = getFontFamilyStyle();

    return {
      fontSize: `${scale * 100}%`,
      lineHeight: lh,
      ...(fontStyle ? { fontFamily: fontStyle } : {}),
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full transition-all"
      style={getPaperStyle()}
    >
      {/* Printable Content */}
      <PrintableResumeContent data={data} templateId={templateId} isFullPreview={isFullPreview} />
    </div>
  );
}

export function ResumeBuilder() {
  const { showToast } = useToast();
  const [resumeData, setResumeData] = useState<ResumeCvData>(SAMPLE_RESUME_PRESETS.software_engineer);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [selectedTemplateId, setSelectedTemplateId] = useState<ResumeTemplateId>('silicon-valley');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

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

  const handleLoadPreset = (key: string) => {
    if (SAMPLE_RESUME_PRESETS[key]) {
      const preset = SAMPLE_RESUME_PRESETS[key];
      setResumeData((prev) => ({ ...preset, photoUrl: prev.photoUrl }));
      showToast('Preset Loaded', `Populated ${preset.professionalTitle} sample resume.`);
    }
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

      const filename = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume_${selectedTemplateId}.pdf`;
      pdf.save(filename);
      showToast('PDF Exported!', `Downloaded ${filename}`);
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('PDF Export Error', 'Could not generate PDF canvas.', 'error');
    }
  };

  const handleCopyMarkdown = async () => {
    const md = `# ${resumeData.fullName}
${resumeData.professionalTitle} | ${resumeData.email} | ${resumeData.phone} | ${resumeData.location}

## Executive Summary
${resumeData.summary}

## Core Skills
${resumeData.skills.join(', ')}

## Work Experience
${resumeData.experiences
  .map(
    (exp) => `### ${exp.role} — ${exp.company} (${exp.startDate} - ${exp.endDate})
${exp.bullets.map((b) => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}

## Education
${resumeData.education}
`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(md);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = md;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      showToast('Copy Failed', 'Could not copy to clipboard.', 'error');
      return;
    }

    setCopied(true);
    showToast('Copied Markdown!', 'Resume content copied in Markdown format.');
    setTimeout(() => setCopied(false), 2000);
  };

  const activeTemplate = getResumeTemplateById(selectedTemplateId);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-black font-bold shadow-md">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="gradient-text-animated">AI Executive Resume &amp; CV Builder</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                GEMINI 3.1 FLASH LITE (HIGH)
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Build ATS-optimized monochrome resumes with Google XYZ bullet point metrics.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Template Selector Button */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold transition cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-zinc-300" />
            <span>🎨 Template: <strong className="text-white">{activeTemplate.name}</strong></span>
          </button>

          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 hover:border-white transition cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>Model: <strong className="text-white">Gemini 3.1 Flash Lite (High)</strong></span>
          </button>

          <button
            onClick={() => handleLoadPreset('software_engineer')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition cursor-pointer"
          >
            ⚡ Software Eng
          </button>

          <button
            onClick={() => handleLoadPreset('product_manager')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition cursor-pointer"
          >
            💼 PM Preset
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3.5 py-1.5 rounded-xl gradient-btn font-extrabold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap border-b border-zinc-800 mb-6 gap-x-6 gap-y-2">
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'editor' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Edit3 className="w-4 h-4 shrink-0" /> Form & AI Bullet Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'preview' ? 'border-white text-white' : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4 shrink-0" /> Printable Paper Preview ({activeTemplate.name})
        </button>
      </div>

      {/* Editor View */}
      {activeTab === 'editor' && (
        <div id="resume-split-container" className="flex flex-col lg:flex-row gap-6 w-full relative items-start">
          
          {/* Form Controls */}
          <div
            style={{ width: isDesktop ? `${splitRatio}%` : '100%' }}
            className="space-y-6 shrink-0 transition-all min-w-0"
          >
            
            {/* Contact & Personal Details */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
              
              {/* Recruiter Insight Banner */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-black shrink-0 font-bold">💡</div>
                <p className="leading-relaxed">
                  <strong className="text-white">Recruiter Insight:</strong> Users who added phone number and email received <span className="underline decoration-white font-extrabold">64% more positive feedback</span> from recruiters.
                </p>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-400" />
                  Personal Details & Candidate Photo
                </h3>
              </div>

              {/* Candidate Photo Upload */}
              <div className="p-4 rounded-2xl bg-black border border-zinc-800 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-900 border border-zinc-700 shrink-0 flex items-center justify-center">
                  {resumeData.photoUrl ? (
                    <img src={resumeData.photoUrl} alt="Candidate Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-zinc-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="text-xs font-bold text-white">Profile Photo (Stored Locally)</div>
                  <p className="text-[11px] text-zinc-400">Upload a professional headshot to include on your resume & CV header.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="px-3 py-1 rounded-xl gradient-btn text-xs font-bold transition cursor-pointer">
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {resumeData.photoUrl && (
                      <button
                        onClick={handlePhotoRemove}
                        className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Job Target (Role You Want)*</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={resumeData.professionalTitle}
                    onChange={(e) => setResumeData({ ...resumeData, professionalTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Alex"
                    value={resumeData.firstName ?? (resumeData.fullName ? resumeData.fullName.split(' ')[0] : '')}
                    onChange={(e) => {
                      const fName = e.target.value;
                      const lName = resumeData.lastName ?? (resumeData.fullName ? resumeData.fullName.split(' ').slice(1).join(' ') : '');
                      setResumeData((prev) => ({
                        ...prev,
                        firstName: fName,
                        lastName: prev.lastName ?? lName,
                        fullName: `${fName} ${lName}`.trim(),
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Vance"
                    value={resumeData.lastName ?? (resumeData.fullName ? resumeData.fullName.split(' ').slice(1).join(' ') : '')}
                    onChange={(e) => {
                      const lName = e.target.value;
                      const fName = resumeData.firstName ?? (resumeData.fullName ? resumeData.fullName.split(' ')[0] : '');
                      setResumeData((prev) => ({
                        ...prev,
                        firstName: prev.firstName ?? fName,
                        lastName: lName,
                        fullName: `${fName} ${lName}`.trim(),
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Email Address*</label>
                  <input
                    type="email"
                    placeholder="alex.vance@example.com"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="(555) 234-5678"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Market Street, Suite 400"
                    value={resumeData.address || ''}
                    onChange={(e) => setResumeData({ ...resumeData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">City, State</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    value={resumeData.cityState || resumeData.location || ''}
                    onChange={(e) => setResumeData({ ...resumeData, cityState: e.target.value, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={resumeData.country || ''}
                    onChange={(e) => setResumeData({ ...resumeData, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    placeholder="94105"
                    value={resumeData.postalCode || ''}
                    onChange={(e) => setResumeData({ ...resumeData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/alexvance"
                    value={resumeData.linkedin || ''}
                    onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">GitHub Account</label>
                  <input
                    type="text"
                    placeholder="github.com/alexvance"
                    value={resumeData.github || ''}
                    onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Date Of Birth</label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={resumeData.dateOfBirth || ''}
                    onChange={(e) => setResumeData({ ...resumeData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Additional Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Driving License</label>
                  <input
                    type="text"
                    placeholder="Class C / Valid Unrestricted"
                    value={resumeData.drivingLicense || ''}
                    onChange={(e) => setResumeData({ ...resumeData, drivingLicense: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Place Of Birth</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    value={resumeData.placeOfBirth || ''}
                    onChange={(e) => setResumeData({ ...resumeData, placeOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  Executive Summary
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={loadingAi}
                  className="px-3 py-1 rounded-xl gradient-btn text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                  {loadingAi ? 'Generating...' : '⚡ AI Polish'}
                </button>
              </div>
              <textarea
                rows={4}
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                className="w-full p-3 rounded-xl bg-black border border-zinc-800 text-zinc-100 text-xs leading-relaxed resize-none focus:border-white"
              />
            </div>

            {/* Skills & Technical Competencies */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  Skills & Technical Competencies ({resumeData.skills.length})
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. React, Next.js, Node.js)"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-3.5 py-2 rounded-xl gradient-btn text-xs font-extrabold transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {resumeData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-zinc-500 hover:text-white transition ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience List */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  Professional Work Experience
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {resumeData.experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-2xl bg-black border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Experience Item</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData((prev) => ({
                            ...prev,
                            experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, company: val } : x)),
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Job Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeData((prev) => ({
                            ...prev,
                            experiences: prev.experiences.map((x) => (x.id === exp.id ? { ...x, role: val } : x)),
                          }));
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[11px] font-semibold text-zinc-400">Bullet Points (Google XYZ Metric Formula)</label>
                    {exp.bullets.map((b, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-start">
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
                                  nb[idx] = val;
                                  return { ...x, bullets: nb };
                                }
                                return x;
                              }),
                            }));
                          }}
                          className="w-full sm:flex-1 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs leading-relaxed resize-none focus:border-white"
                        />
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleEnhanceBullet(exp.id, idx)}
                            disabled={enhancingBulletId === `${exp.id}-${idx}`}
                            className="flex-1 sm:flex-none px-3 py-2 rounded-xl gradient-btn text-[11px] font-bold transition shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-white" />
                            {enhancingBulletId === `${exp.id}-${idx}` ? 'Enhancing...' : '⚡ Metric'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(exp.id, idx)}
                            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition shrink-0 cursor-pointer"
                            title="Delete bullet point"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddBullet(exp.id)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3 h-3" /> Add bullet point
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Resizable Splitter Handle Bar (Desktop Only) */}
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
              {/* Document Header Bar */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Eye className="w-4 h-4 text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-bold text-white">Paper Preview</h3>
                    <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                      {activeTemplate.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setShowTemplateModal(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      Template
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold border border-zinc-800 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy MD'}
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPdf}
                      className="px-3.5 py-1.5 rounded-xl gradient-btn text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Interactive Document Toolbar */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg text-xs">
                  {/* Typography & Spacing Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Font Family Picker */}
                    <div className="flex items-center gap-1.5 bg-black px-2.5 py-1.5 rounded-xl border border-zinc-800">
                      <Type className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[11px] text-zinc-400 font-medium">Font:</span>
                      <select
                        value={docFontFamily}
                        onChange={(e) => setDocFontFamily(e.target.value)}
                        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="template" className="bg-zinc-900 text-white">Template Default</option>
                        <option value="sans" className="bg-zinc-900 text-white">Sans-Serif (Inter)</option>
                        <option value="serif" className="bg-zinc-900 text-white">Serif (Playfair)</option>
                        <option value="mono" className="bg-zinc-900 text-white">Mono (JetBrains)</option>
                        <option value="garamond" className="bg-zinc-900 text-white">Classic Garamond</option>
                      </select>
                    </div>

                    {/* Font Size Scale */}
                    <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase px-1">Size:</span>
                      <button
                        type="button"
                        onClick={() => setDocFontSize('compact')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                          docFontSize === 'compact' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Compact
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocFontSize('normal')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                          docFontSize === 'normal' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocFontSize('large')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                          docFontSize === 'large' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
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
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                          docLineHeight === 'tight' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Tight
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocLineHeight('normal')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                          docLineHeight === 'normal' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocLineHeight('relaxed')}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                          docLineHeight === 'relaxed' ? 'gradient-active' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Relaxed
                      </button>
                    </div>

                  </div>

                  {/* Split Preset Controls */}
                  <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800">
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
            <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Layout Mode:</span>
                <span className="text-xs font-bold text-white bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-xl">
                  Multi-Page A4 Resume
                </span>
              </div>
              <button
                onClick={handleExportPdf}
                className="px-3.5 py-1.5 rounded-xl gradient-btn font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>

            <div ref={paperRef} className="cover-letter-paper rounded-xl shadow-2xl relative">
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
