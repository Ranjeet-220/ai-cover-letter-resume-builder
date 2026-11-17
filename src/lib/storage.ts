import { supabase, isSupabaseConfigured } from './supabase.ts';

export type ApplicationStatus = 'Draft' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

const VALID_STATUSES: ApplicationStatus[] = ['Draft', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export function normalizeStatus(value: unknown): ApplicationStatus {
  if (typeof value === 'string') {
    const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    if ((VALID_STATUSES as string[]).includes(normalized)) {
      return normalized as ApplicationStatus;
    }
    if (normalized === 'Interview') return 'Interviewing';
  }
  return 'Draft';
}

export interface CoverLetter {
  id: string;
  _pendingSync?: boolean;
  title: string;
  company: string;
  jobTitle: string;
  jobDescription?: string;
  content: string;
  status: ApplicationStatus;
  matchScore: number;
  createdAt: string;
  updatedAt: string;
  resumeProfileId?: string;
}

export interface ResumeProfile {
  id: string;
  _pendingSync?: boolean;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  summary: string;
  skills: string[];
  experience: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  COVER_LETTERS: 'ai_cover_letters_v1',
  RESUME_PROFILES: 'ai_resume_profiles_v1',
};

// Initial Seed Data for immediate preview and testing
const DEFAULT_RESUME_PROFILES: ResumeProfile[] = [
  {
    id: 'prof-1',
    name: 'Senior Full Stack Engineer',
    fullName: 'Alex Vance',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    website: 'alexvance.dev',
    summary: 'Versatile Full Stack Engineer with 6+ years of experience building scalable web applications using React, Next.js, Node.js, and cloud native architectures. Proven track record of boosting app performance and leading agile engineering teams.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'GraphQL', 'Tailwind CSS', 'PostgreSQL', 'AWS', 'Docker', 'System Design'],
    experience: 'Senior Software Engineer at TechCorp (2022-Present): Scaled microservices to 2M daily active users.\nSoftware Engineer at StartupX (2019-2022): Built core SaaS frontend using Next.js and Tailwind.',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prof-2',
    name: 'Product Manager',
    fullName: 'Alex Vance',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    summary: 'Data-driven Product Manager with expertise in user growth, conversion rate optimization, and cross-functional leadership in AI-driven SaaS products.',
    skills: ['Product Strategy', 'Agile / Scrum', 'A/B Testing', 'User Research', 'SQL', 'Mixpanel', 'Roadmapping'],
    experience: 'Product Lead at GrowthLab (2021-Present): Increased MRR by 35% through streamlined onboarding.',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const DEFAULT_COVER_LETTERS: CoverLetter[] = [
  {
    id: 'letter-1',
    title: 'Lead Frontend Developer - Stripe',
    company: 'Stripe',
    jobTitle: 'Lead Frontend Developer',
    jobDescription: 'Seeking an experienced Lead Frontend Developer proficient in React, Next.js, and TypeScript to architect high-performance payment interfaces and mentor senior engineers.',
    content: `Dear Hiring Team at Stripe,

I am writing to express my strong enthusiasm for the Lead Frontend Developer position at Stripe. Having closely followed Stripe's continuous innovation in financial infrastructure and developer APIs, I am excited about the opportunity to contribute my 6+ years of full-stack engineering expertise to your team.

In my current role as Senior Software Engineer at TechCorp, I architected and scaled web applications serving over 2 million daily active users. By introducing modern Next.js server components and optimizing critical web vitals, our engineering team reduced page load times by 42% while significantly lowering memory overhead. Furthermore, I have regularly mentored junior and senior engineers, advocating for high code quality and comprehensive automated testing.

Stripe's relentless commitment to polished user experiences and robust developer tooling deeply resonates with my own values. I bring extensive proficiency in React, TypeScript, and state management, combined with a passion for designing intuitive, accessible UI systems.

I would welcome the opportunity to discuss how my background in modern web engineering and leadership can help drive Stripe's next generation of web products. Thank you for your time and consideration.

Sincerely,
Alex Vance`,
    status: 'Interviewing',
    matchScore: 92,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    resumeProfileId: 'prof-1',
  },
  {
    id: 'letter-2',
    title: 'Senior React Architect - Vercel',
    company: 'Vercel',
    jobTitle: 'Senior React Architect',
    jobDescription: 'Looking for a Senior React Architect to push the boundaries of modern frontend frameworks, Web Vitals, and developer platform tooling.',
    content: `Dear Vercel Hiring Manager,

I am thrilled to apply for the Senior React Architect position at Vercel. As an active developer who relies on Vercel and Next.js daily, the chance to shape the developer tools that empower millions of creators worldwide is incredibly inspiring.

Over the past 6 years, I have specialized in building high-throughput React applications with complex state architectures. At TechCorp, I spearheaded our migration to modern server-side rendering, resulting in a 35% increase in conversion rates. My deep technical familiarity with TypeScript, React 19 concurrent features, and edge rendering pipelines positions me to immediately add value to Vercel's platform team.

I am eager to bring my problem-solving skills, engineering leadership, and dedication to frontend excellence to Vercel. Thank you for considering my application.

Warm regards,
Alex Vance`,
    status: 'Applied',
    matchScore: 88,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    resumeProfileId: 'prof-1',
  },
  {
    id: 'letter-3',
    title: 'Staff UI Engineer - Airbnb',
    company: 'Airbnb',
    jobTitle: 'Staff UI Engineer',
    jobDescription: 'Airbnb is searching for a Staff UI Engineer with design system mastery and responsive UI craftsmanship.',
    content: `Dear Airbnb Recruitment Team,

I am writing to express my interest in the Staff UI Engineer role at Airbnb. Airbnb's iconic approach to design systems and guest experience has long set the gold standard in tech.

Throughout my engineering career, I have prioritized bridging the gap between product design and production code. At StartupX, I established our design system component library used by 20+ engineers, which accelerated feature delivery by 40% while maintaining strict accessibility standards.

I look forward to discussing how my experience in building accessible, beautiful UI components can support Airbnb's ongoing vision.

Best regards,
Alex Vance`,
    status: 'Draft',
    matchScore: 78,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resumeProfileId: 'prof-1',
  }
];

// Read without overwriting damaged data: valid records remain recoverable.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const text = (value: unknown): string => typeof value === 'string' ? value : '';
const date = (value: unknown): string => {
  const candidate = text(value);
  return Number.isFinite(Date.parse(candidate)) ? candidate : new Date(0).toISOString();
};
function letterRecord(value: unknown): CoverLetter | null {
  if (!isRecord(value) || !text(value.id) || typeof value.content !== 'string') return null;
  return {
    id: text(value.id), _pendingSync: value._pendingSync === true, title: text(value.title), company: text(value.company),
    jobTitle: text(value.jobTitle), jobDescription: text(value.jobDescription), content: value.content,
    status: normalizeStatus(value.status),
    matchScore: typeof value.matchScore === 'number' && Number.isFinite(value.matchScore)
      ? Math.max(0, Math.min(100, value.matchScore)) : 0,
    createdAt: date(value.createdAt), updatedAt: date(value.updatedAt),
    resumeProfileId: text(value.resumeProfileId) || undefined,
  };
}
function profileRecord(value: unknown): ResumeProfile | null {
  if (!isRecord(value) || !text(value.id) || typeof value.fullName !== 'string') return null;
  return {
    id: text(value.id), _pendingSync: value._pendingSync === true, name: text(value.name), fullName: value.fullName,
    email: text(value.email), phone: text(value.phone), location: text(value.location),
    linkedin: text(value.linkedin), website: text(value.website), summary: text(value.summary),
    skills: Array.isArray(value.skills) ? value.skills.filter((s): s is string => typeof s === 'string') : [],
    experience: text(value.experience), isDefault: value.isDefault === true,
    createdAt: date(value.createdAt), updatedAt: date(value.updatedAt),
  };
}
function getLocalItem<T>(key: string, defaults: T[], validate: (value: unknown) => T | null): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return isSupabaseConfigured() ? [] : structuredClone(defaults);
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(validate).filter((item): item is T => item !== null);
  } catch {
    return [];
  }
}
function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') throw new Error('Saving requires browser storage.');
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('Could not save your changes. Browser storage is full or unavailable.');
  }
}
const localLetters = () => getLocalItem(STORAGE_KEYS.COVER_LETTERS, DEFAULT_COVER_LETTERS, letterRecord);
const localProfiles = () => getLocalItem(STORAGE_KEYS.RESUME_PROFILES, DEFAULT_RESUME_PROFILES, profileRecord);

// Keep unsynchronized local records, including when a successful cloud read is empty.
function mergeRecords<T extends { id: string; updatedAt: string; _pendingSync?: boolean }>(remote: T[], local: T[]): T[] {
  const records = new Map(remote.map((item) => [item.id, item]));
  for (const item of local) {
    const cloud = records.get(item.id);
    if (!cloud || item._pendingSync || Date.parse(item.updatedAt) >= Date.parse(cloud.updatedAt)) records.set(item.id, item);
  }
  return [...records.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
async function sync(operation: () => PromiseLike<{ error: unknown }>): Promise<boolean> {
  try {
    const { error } = await operation();
    if (error) throw error;
    return true;
  } catch (error) {
    // The local write has already succeeded. Keep it available for future reads.
    console.warn('Cloud sync failed; changes are saved on this device.', error);
    return false;
  }
}
// Acknowledging an older request must never overwrite an edit made while it was in flight.
function acknowledge<T extends { id: string; updatedAt: string; _pendingSync?: boolean }>(key: string, synced: T[], local: T[]): void {
  const acknowledged = local.map((item) => synced.some((record) =>
    record.id === item.id && record.updatedAt === item.updatedAt &&
    Object.keys(record).every((key) => JSON.stringify(record[key as keyof T]) === JSON.stringify(item[key as keyof T])))
    ? { ...item, _pendingSync: false } : item);
  try { setLocalItem(key, acknowledged); } catch { /* The pending local copy is still durable. */ }
}
export async function getCoverLetters(): Promise<CoverLetter[]> {
  const local = localLetters();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('cover_letters').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      const remote = (data || []).map((row) => letterRecord({
        ...row, jobTitle: row.job_title, jobDescription: row.job_description, matchScore: row.match_score,
        createdAt: row.created_at, updatedAt: row.updated_at, resumeProfileId: row.resume_profile_id,
      })).filter((item): item is CoverLetter => item !== null);
      return mergeRecords(remote, local);
    } catch (error) { console.warn('Cloud read failed; using saved local letters.', error); }
  }
  return local;
}
export async function getCoverLetterById(id: string): Promise<CoverLetter | null> {
  return (await getCoverLetters()).find((letter) => letter.id === id) || null;
}
export async function saveCoverLetter(letter: Partial<CoverLetter> & { title: string; content: string }): Promise<CoverLetter> {
  const now = new Date().toISOString();
  const saved: CoverLetter = {
    ...letter, _pendingSync: true, id: letter.id || crypto.randomUUID(), title: letter.title || 'Untitled Cover Letter',
    company: letter.company || 'Target Company', jobTitle: letter.jobTitle || 'Role Title',
    content: letter.content, status: normalizeStatus(letter.status), matchScore: letter.matchScore ?? 0,
    createdAt: letter.createdAt || now, updatedAt: now,
  };
  setLocalItem(STORAGE_KEYS.COVER_LETTERS, [saved, ...localLetters().filter((item) => item.id !== saved.id)]);
  if (isSupabaseConfigured() && supabase) {
    const synced = await sync(() => supabase!.from('cover_letters').upsert({
      id: saved.id, title: saved.title, company: saved.company, job_title: saved.jobTitle,
      job_description: saved.jobDescription, content: saved.content, status: saved.status,
      match_score: saved.matchScore, created_at: saved.createdAt, updated_at: saved.updatedAt,
      resume_profile_id: saved.resumeProfileId,
    }));
    if (synced) acknowledge(STORAGE_KEYS.COVER_LETTERS, [letterRecord(saved)!], localLetters());
  }
  return saved;
}
export async function updateCoverLetterStatus(id: string, status: ApplicationStatus): Promise<CoverLetter | null> {
  const letter = await getCoverLetterById(id);
  return letter ? saveCoverLetter({ ...letter, status }) : null;
}
export async function deleteCoverLetter(id: string): Promise<boolean> {
  // Do not remove the local copy if the cloud deletion fails: it would reappear on the next read.
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('cover_letters').delete().eq('id', id);
    if (error) throw new Error('Could not delete the cloud copy. Please try again.');
  }
  setLocalItem(STORAGE_KEYS.COVER_LETTERS, localLetters().filter((item) => item.id !== id));
  return true;
}
export async function getResumeProfiles(): Promise<ResumeProfile[]> {
  const local = localProfiles();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('resume_profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const remote = (data || []).map((row) => profileRecord({
        ...row, fullName: row.full_name, isDefault: row.is_default,
        skills: typeof row.skills === 'string' ? row.skills.split(',').map((s: string) => s.trim()) : row.skills,
        createdAt: row.created_at, updatedAt: row.updated_at,
      })).filter((item): item is ResumeProfile => item !== null);
      return mergeRecords(remote, local);
    } catch (error) { console.warn('Cloud read failed; using saved local profiles.', error); }
  }
  return local;
}
async function syncProfiles(profiles: ResumeProfile[]): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;
  const pending = profiles.filter((profile) => profile._pendingSync);
  if (!pending.length) return;
  const synced = await sync(() => supabase!.from('resume_profiles').upsert(pending.map((p) => ({
    id: p.id, name: p.name, full_name: p.fullName, email: p.email, phone: p.phone, location: p.location,
    linkedin: p.linkedin, website: p.website, summary: p.summary, skills: p.skills, experience: p.experience,
    is_default: p.isDefault, created_at: p.createdAt, updated_at: p.updatedAt,
  }))));
  if (synced) acknowledge(STORAGE_KEYS.RESUME_PROFILES, pending.map((profile) => profileRecord(profile)!), localProfiles());
}
export async function saveResumeProfile(profile: Partial<ResumeProfile> & { name: string; fullName: string }): Promise<ResumeProfile> {
  const now = new Date().toISOString();
  const current = await getResumeProfiles();
  const previous = current.find((p) => p.id === profile.id);
  const saved: ResumeProfile = {
    ...previous, ...profile, _pendingSync: true, id: profile.id || crypto.randomUUID(), name: profile.name, fullName: profile.fullName,
    email: profile.email ?? previous?.email ?? '', phone: profile.phone ?? previous?.phone ?? '',
    location: profile.location ?? previous?.location ?? '', summary: profile.summary ?? previous?.summary ?? '',
    skills: profile.skills ?? previous?.skills ?? [], experience: profile.experience ?? previous?.experience ?? '',
    isDefault: profile.isDefault ?? previous?.isDefault ?? current.length === 0,
    createdAt: previous?.createdAt || profile.createdAt || now, updatedAt: now,
  };
  const next = [saved, ...current.filter((p) => p.id !== saved.id).map((p) =>
    saved.isDefault && p.isDefault ? { ...p, _pendingSync: true, isDefault: false, updatedAt: now } : p)];
  if (!next.some((p) => p.isDefault)) next[0].isDefault = true;
  setLocalItem(STORAGE_KEYS.RESUME_PROFILES, next);
  await syncProfiles(next);
  return saved;
}
export async function setDefaultResumeProfile(id: string): Promise<ResumeProfile | null> {
  const profiles = await getResumeProfiles();
  const target = profiles.find((p) => p.id === id);
  return target ? saveResumeProfile({ ...target, isDefault: true }) : null;
}
export async function getDefaultResumeProfile(): Promise<ResumeProfile | null> {
  const profiles = await getResumeProfiles();
  return profiles.find((p) => p.isDefault) || profiles[0] || null;
}
export async function deleteResumeProfile(id: string): Promise<boolean> {
  const profiles = await getResumeProfiles();
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('resume_profiles').delete().eq('id', id);
    if (error) throw new Error('Could not delete the cloud copy. Please try again.');
  }
  const next = profiles.filter((p) => p.id !== id);
  if (next.length && !next.some((p) => p.isDefault)) next[0] = { ...next[0], _pendingSync: true, isDefault: true, updatedAt: new Date().toISOString() };
  setLocalItem(STORAGE_KEYS.RESUME_PROFILES, next);
  await syncProfiles(next);
  return true;
}
