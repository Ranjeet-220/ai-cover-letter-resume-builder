export type CoverLetterTone = 'professional' | 'enthusiastic' | 'confident' | 'modern' | 'direct';
export type CoverLetterLength = 'short' | 'standard' | 'detailed';
export type CoverLetterStatus = 'draft' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface CoverLetter {
  id: string;
  title: string;
  targetCompany: string;
  jobTitle: string;
  jobDescription: string;
  tone: CoverLetterTone;
  length: CoverLetterLength;
  content: string;
  matchScore: number;
  missingKeywords: string[];
  status: CoverLetterStatus;
  createdAt: string;
  updatedAt: string;
  resumeProfileId?: string;
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ResumeCvData {
  photoUrl?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  professionalTitle: string;
  jobTarget?: string;
  email: string;
  phone: string;
  address?: string;
  cityState?: string;
  country?: string;
  postalCode?: string;
  drivingLicense?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  location: string;
  linkedin: string;
  github?: string;
  website: string;
  summary: string;
  skills: string[];
  experiences: WorkExperienceItem[];
  education: string;
  certifications?: string[];
  languages?: string[];
  publications?: string[];
  portfolioUrl?: string;
}

export interface ResumeProfile {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  isDefault: boolean;
}

export interface GenerationConfig {
  model: string;
  tone: CoverLetterTone;
  length: CoverLetterLength;
  focusKeywords: string[];
  customPrompt?: string;
  apiKey?: string;
}

export interface JobMatchResult {
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}
