'use client';

import React, { useRef } from 'react';
import type { ResumeCvData } from '@/types';
import { type ResumeTemplateId, getResumeTemplateById } from '@/lib/resumeTemplates';

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

export function FormattedPrintableResume({
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
