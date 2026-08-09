import { supabase, isSupabaseConfigured } from './supabase';

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

// Helper: LocalStorage operations
function getLocalItem<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from LocalStorage`, err);
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Error writing ${key} to LocalStorage`, err);
  }
}

// Cover Letter Storage APIs
export async function getCoverLetters(): Promise<CoverLetter[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          title: item.title ?? '',
          company: item.company ?? '',
          jobTitle: item.job_title ?? '',
          jobDescription: item.job_description ?? '',
          content: item.content ?? '',
          status: normalizeStatus(item.status),
          matchScore: item.match_score ?? 85,
          createdAt: item.created_at ?? new Date().toISOString(),
          updatedAt: item.updated_at ?? new Date().toISOString(),
          resumeProfileId: item.resume_profile_id,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using LocalStorage fallback', err);
    }
  }
  return getLocalItem<CoverLetter[]>(STORAGE_KEYS.COVER_LETTERS, DEFAULT_COVER_LETTERS);
}

export async function getCoverLetterById(id: string): Promise<CoverLetter | null> {
  const letters = await getCoverLetters();
  return letters.find((l) => l.id === id) || null;
}

export async function saveCoverLetter(
  letter: Partial<CoverLetter> & { title: string; content: string }
): Promise<CoverLetter> {
  const now = new Date().toISOString();
  const newLetter: CoverLetter = {
    id: letter.id || `letter-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: letter.title || 'Untitled Cover Letter',
    company: letter.company || 'Target Company',
    jobTitle: letter.jobTitle || 'Role Title',
    jobDescription: letter.jobDescription || '',
    content: letter.content,
    status: normalizeStatus(letter.status),
    matchScore: letter.matchScore ?? Math.floor(Math.random() * 20) + 80,
    createdAt: letter.createdAt || now,
    updatedAt: now,
    resumeProfileId: letter.resumeProfileId,
  };

  // Sync to local storage
  const currentLetters = getLocalItem<CoverLetter[]>(STORAGE_KEYS.COVER_LETTERS, DEFAULT_COVER_LETTERS);
  const index = currentLetters.findIndex((l) => l.id === newLetter.id);
  let updatedLetters: CoverLetter[];
  if (index >= 0) {
    updatedLetters = [...currentLetters];
    updatedLetters[index] = newLetter;
  } else {
    updatedLetters = [newLetter, ...currentLetters];
  }
  setLocalItem(STORAGE_KEYS.COVER_LETTERS, updatedLetters);

  // Sync to Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('cover_letters').upsert({
        id: newLetter.id,
        title: newLetter.title,
        company: newLetter.company,
        job_title: newLetter.jobTitle,
        job_description: newLetter.jobDescription,
        content: newLetter.content,
        status: newLetter.status,
        match_score: newLetter.matchScore,
        created_at: newLetter.createdAt,
        updated_at: newLetter.updatedAt,
        resume_profile_id: newLetter.resumeProfileId,
      });
    } catch (err) {
      console.warn('Supabase save failed, synced locally', err);
    }
  }

  return newLetter;
}

export async function updateCoverLetterStatus(
  id: string,
  status: ApplicationStatus
): Promise<CoverLetter | null> {
  const letter = await getCoverLetterById(id);
  if (!letter) return null;

  const updated = { ...letter, status, updatedAt: new Date().toISOString() };

  const letters = getLocalItem<CoverLetter[]>(STORAGE_KEYS.COVER_LETTERS, DEFAULT_COVER_LETTERS);
  const idx = letters.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const next = [...letters];
  next[idx] = updated;
  setLocalItem(STORAGE_KEYS.COVER_LETTERS, next);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('cover_letters')
        .update({ status, updated_at: updated.updatedAt })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase status update failed', err);
    }
  }

  return updated;
}

export async function deleteCoverLetter(id: string): Promise<boolean> {
  const letters = getLocalItem<CoverLetter[]>(STORAGE_KEYS.COVER_LETTERS, DEFAULT_COVER_LETTERS);
  const updatedLetters = letters.filter((l) => l.id !== id);
  setLocalItem(STORAGE_KEYS.COVER_LETTERS, updatedLetters);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('cover_letters').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete failed', err);
    }
  }

  return true;
}

// Resume Profiles Storage APIs
export async function getResumeProfiles(): Promise<ResumeProfile[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('resume_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          fullName: item.full_name,
          email: item.email,
          phone: item.phone,
          location: item.location,
          linkedin: item.linkedin,
          website: item.website,
          summary: item.summary,
          skills: Array.isArray(item.skills) ? item.skills : (item.skills || '').split(',').map((s: string) => s.trim()),
          experience: item.experience,
          isDefault: item.is_default ?? false,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase profiles fetch failed, using LocalStorage fallback', err);
    }
  }
  return getLocalItem<ResumeProfile[]>(STORAGE_KEYS.RESUME_PROFILES, DEFAULT_RESUME_PROFILES);
}

export async function saveResumeProfile(
  profile: Partial<ResumeProfile> & { name: string; fullName: string }
): Promise<ResumeProfile> {
  const now = new Date().toISOString();
  const currentProfiles = getLocalItem<ResumeProfile[]>(STORAGE_KEYS.RESUME_PROFILES, DEFAULT_RESUME_PROFILES);
  const isFirst = currentProfiles.length === 0;

  const newProfile: ResumeProfile = {
    id: profile.id || `prof-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: profile.name,
    fullName: profile.fullName,
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    linkedin: profile.linkedin || '',
    website: profile.website || '',
    summary: profile.summary || '',
    skills: profile.skills || [],
    experience: profile.experience || '',
    isDefault: profile.isDefault ?? isFirst,
    createdAt: profile.createdAt || now,
    updatedAt: now,
  };

  let updatedProfiles: ResumeProfile[];
  const existingIdx = currentProfiles.findIndex((p) => p.id === newProfile.id);

  if (newProfile.isDefault) {
    currentProfiles.forEach((p) => (p.isDefault = false));
  } else {
    // Editing the current default profile but unchecking "default" would leave no default.
    const editedWasDefault = existingIdx >= 0 && currentProfiles[existingIdx].isDefault;
    if (editedWasDefault) {
      const otherDefaultIdx = currentProfiles.findIndex((p) => p.id !== newProfile.id && p.isDefault);
      if (otherDefaultIdx === -1) {
        const promoteIdx = currentProfiles.findIndex((p) => p.id !== newProfile.id);
        if (promoteIdx !== -1) currentProfiles[promoteIdx].isDefault = true;
      }
    }
  }

  if (existingIdx >= 0) {
    updatedProfiles = [...currentProfiles];
    updatedProfiles[existingIdx] = newProfile;
  } else {
    updatedProfiles = [newProfile, ...currentProfiles];
  }

  setLocalItem(STORAGE_KEYS.RESUME_PROFILES, updatedProfiles);

  if (isSupabaseConfigured() && supabase) {
    try {
      if (newProfile.isDefault) {
        await supabase.from('resume_profiles').update({ is_default: false }).neq('id', newProfile.id);
      }
      await supabase.from('resume_profiles').upsert({
        id: newProfile.id,
        name: newProfile.name,
        full_name: newProfile.fullName,
        email: newProfile.email,
        phone: newProfile.phone,
        location: newProfile.location,
        linkedin: newProfile.linkedin,
        website: newProfile.website,
        summary: newProfile.summary,
        skills: newProfile.skills,
        experience: newProfile.experience,
        is_default: newProfile.isDefault,
        created_at: newProfile.createdAt,
        updated_at: newProfile.updatedAt,
      });
    } catch (err) {
      console.warn('Supabase profile save failed', err);
    }
  }

  return newProfile;
}

export async function setDefaultResumeProfile(id: string): Promise<ResumeProfile | null> {
  const profiles = getLocalItem<ResumeProfile[]>(STORAGE_KEYS.RESUME_PROFILES, DEFAULT_RESUME_PROFILES);
  let updatedTarget: ResumeProfile | null = null;

  const updatedProfiles = profiles.map((p) => {
    if (p.id === id) {
      updatedTarget = { ...p, isDefault: true, updatedAt: new Date().toISOString() };
      return updatedTarget;
    }
    return { ...p, isDefault: false };
  });

  setLocalItem(STORAGE_KEYS.RESUME_PROFILES, updatedProfiles);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('resume_profiles').update({ is_default: false }).neq('id', id);
      await supabase.from('resume_profiles').update({ is_default: true }).eq('id', id);
    } catch (err) {
      console.warn('Supabase set default failed', err);
    }
  }

  return updatedTarget;
}

export async function getDefaultResumeProfile(): Promise<ResumeProfile | null> {
  const profiles = await getResumeProfiles();
  return profiles.find((p) => p.isDefault) || profiles[0] || null;
}

export async function deleteResumeProfile(id: string): Promise<boolean> {
  const profiles = getLocalItem<ResumeProfile[]>(STORAGE_KEYS.RESUME_PROFILES, DEFAULT_RESUME_PROFILES);
  const wasDefault = profiles.find((p) => p.id === id)?.isDefault === true;
  const updatedProfiles = profiles.filter((p) => p.id !== id);

  let promotedId: string | null = null;
  if (updatedProfiles.length > 0 && !updatedProfiles.some((p) => p.isDefault)) {
    updatedProfiles[0].isDefault = true;
    promotedId = updatedProfiles[0].id;
  }
  
  setLocalItem(STORAGE_KEYS.RESUME_PROFILES, updatedProfiles);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('resume_profiles').delete().eq('id', id);
      if (promotedId) {
        await supabase.from('resume_profiles').update({ is_default: true }).eq('id', promotedId);
      } else if (wasDefault) {
        // No profiles remain in the table; nothing to promote.
        await supabase.from('resume_profiles').update({ is_default: false }).neq('id', id);
      }
    } catch (err) {
      console.warn('Supabase delete profile failed', err);
    }
  }

  return true;
}
