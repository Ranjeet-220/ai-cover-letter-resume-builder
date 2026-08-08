export type ResumeTemplateId =
  | 'executive-blue-classic'
  | 'emerald-sidebar'
  | 'mint-banner'
  | 'harvard-ivy'
  | 'silicon-valley'
  | 'europass-exec'
  | 'ats-compact'
  | 'creative-product';

export interface ResumeTemplate {
  id: ResumeTemplateId;
  name: string;
  subtitle: string;
  badge: string;
  badgeColorClass: string;
  description: string;
  category: string;
  fontFamily: 'serif' | 'sans' | 'mono';
  fontFamilyCSS: string;
  features: string[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentBg: string;
    borderStyle: string;
    headerStyle: 'centered' | 'modern' | 'structured' | 'minimal' | 'obsidian-strip' | 'blue-classic' | 'emerald-sidebar' | 'mint-banner';
  };
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'emerald-sidebar',
    name: 'Emerald Split Sidebar',
    subtitle: 'Customer Service, Operations & Hospitality',
    badge: 'Split Sidebar',
    badgeColorClass: 'bg-emerald-950 text-emerald-300 border-emerald-700',
    description:
      'Distinctive forest emerald sidebar containing circular candidate headshot, contact details, and skill level bars alongside a clean white main content column.',
    category: 'Service & Retail',
    fontFamily: 'serif',
    fontFamilyCSS: 'Georgia, "Times New Roman", serif',
    features: [
      'Forest Emerald Green Left Sidebar (#064e3b)',
      'Circular Candidate Photo Header',
      'Contact & Skill Level Bars Panel',
      'Clean Two-Column Layout',
    ],
    theme: {
      primaryColor: '#064e3b',
      secondaryColor: '#065f46',
      accentBg: '#064e3b',
      borderStyle: 'border-r border-emerald-800',
      headerStyle: 'emerald-sidebar',
    },
  },
  {
    id: 'mint-banner',
    name: 'Mint Modern Banner',
    subtitle: 'Admin, Reception & Front Desk Professional',
    badge: 'Mint Banner',
    badgeColorClass: 'bg-teal-950 text-teal-300 border-teal-700',
    description:
      'Vibrant mint green header block with integrated headshot photo, paired with dual-column skill rating bars and clean profile sectioning.',
    category: 'Admin & Front Desk',
    fontFamily: 'sans',
    fontFamilyCSS: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    features: [
      'Bright Mint Green Banner Block (#2dd4bf)',
      'Left Headshot Photo Integration',
      'Segmented Skill Level Rating Bars',
      'Clean Column Layout',
    ],
    theme: {
      primaryColor: '#0d9488',
      secondaryColor: '#111827',
      accentBg: '#2dd4bf',
      borderStyle: 'border-b-4 border-teal-500',
      headerStyle: 'mint-banner',
    },
  },
  {
    id: 'executive-blue-classic',
    name: 'Executive Blue Classic',
    subtitle: 'Financial Analyst & Corporate Executive',
    badge: 'Corporate Standard',
    badgeColorClass: 'bg-blue-950 text-blue-200 border-blue-700',
    description:
      'Classic corporate layout featuring royal blue section headings with full-width thin underline rules, top-right candidate headshot, and 4-column technical skills matrix.',
    category: 'Finance & Enterprise',
    fontFamily: 'sans',
    fontFamilyCSS: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    features: [
      'Royal Blue Section Titles (#1d4ed8)',
      'Full-Width Thin Underline Rules',
      'Top-Right Profile Photo Alignment',
      '4-Column Technical Skills Matrix',
      'Right-Aligned Employment Dates',
    ],
    theme: {
      primaryColor: '#1d4ed8',
      secondaryColor: '#1e293b',
      accentBg: '#ffffff',
      borderStyle: 'border-b border-blue-600',
      headerStyle: 'blue-classic',
    },
  },
  {
    id: 'harvard-ivy',
    name: 'Harvard Ivy League',
    subtitle: 'Investment Banking, Private Equity & Consulting',
    badge: 'Ivy League',
    badgeColorClass: 'bg-zinc-900 text-zinc-200 border-zinc-700',
    description:
      'Classic Garamond serif typography with centered header alignment and subtle horizontal rules. Gold standard for Wall Street, MBB consulting, and elite corporate roles.',
    category: 'Finance & Consulting',
    fontFamily: 'serif',
    fontFamilyCSS: 'Georgia, Garamond, "Times New Roman", serif',
    features: ['Classic Garamond Serif', 'Centered Executive Header', 'Thin Horizontal Rule Dividers', 'High Executive Authority'],
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#333333',
      accentBg: '#fcfcfc',
      borderStyle: 'border-b-2 border-black',
      headerStyle: 'centered',
    },
  },
  {
    id: 'silicon-valley',
    name: 'Silicon Valley Tech',
    subtitle: 'FAANG Tech Engineer & Architecture',
    badge: 'FAANG Standard',
    badgeColorClass: 'bg-zinc-900 text-zinc-200 border-zinc-700',
    description:
      'Modern Sans-Serif layout with a compact skill matrix and metric callout highlights tailored for technical screeners at Meta, Google, Apple, and high-growth startups.',
    category: 'Engineering & Tech',
    fontFamily: 'sans',
    fontFamilyCSS: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    features: ['Modern Clean Sans', 'Compact Skill Matrix Grid', 'Highlighted Metric Callouts', 'Recruiter Scannable'],
    theme: {
      primaryColor: '#09090b',
      secondaryColor: '#27272a',
      accentBg: '#f4f4f5',
      borderStyle: 'border-l-4 border-black',
      headerStyle: 'modern',
    },
  },
  {
    id: 'europass-exec',
    name: 'Europass Executive',
    subtitle: 'European & C-Suite Corporate Leadership',
    badge: 'Europass',
    badgeColorClass: 'bg-zinc-900 text-zinc-200 border-zinc-700',
    description:
      'Structured header block with dual accent container, dedicated language proficiency badges, and executive publications section for EMEA and global leadership.',
    category: 'Executive & Global',
    fontFamily: 'sans',
    fontFamilyCSS: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    features: ['Structured Header Banner', 'Language Proficiency Badges', 'Publications & Awards Row', 'C-Suite Layout'],
    theme: {
      primaryColor: '#18181b',
      secondaryColor: '#3f3f46',
      accentBg: '#f4f4f5',
      borderStyle: 'border-b border-zinc-400',
      headerStyle: 'structured',
    },
  },
  {
    id: 'ats-compact',
    name: 'ATS-Compact One-Pager',
    subtitle: '100% ATS-Safe Minimalist',
    badge: '100% ATS Safe',
    badgeColorClass: 'bg-zinc-900 text-zinc-200 border-zinc-700',
    description:
      'High-density single-column structure designed for 100% keyword parsing success across Workday, Taleo, Greenhouse, and Lever automated ATS screening bots.',
    category: 'ATS Optimized',
    fontFamily: 'sans',
    fontFamilyCSS: 'Arial, Helvetica, sans-serif',
    features: ['0% Graphics/Tables (Max Parse)', 'High Keyword Density', 'Standard Heading Hierarchy', 'Greenhouse/Workday Tested'],
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#262626',
      accentBg: '#ffffff',
      borderStyle: 'border-b border-zinc-800',
      headerStyle: 'minimal',
    },
  },
  {
    id: 'creative-product',
    name: 'Creative Product & UX',
    subtitle: 'Product Managers, Design Leads & Directors',
    badge: 'UX & Design',
    badgeColorClass: 'bg-zinc-900 text-zinc-200 border-zinc-700',
    description:
      'Distinctive obsidian accent strip with portfolio link badge, design system stack matrix, and product impact highlights.',
    category: 'Design & Product',
    fontFamily: 'sans',
    fontFamilyCSS: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    features: ['Obsidian Accent Strip', 'Portfolio Link Callout', 'Design System Stack Matrix', 'Product Impact Highlights'],
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#18181b',
      accentBg: '#f4f4f5',
      borderStyle: 'border-l-4 border-zinc-900',
      headerStyle: 'obsidian-strip',
    },
  },
];

export function getResumeTemplateById(id: ResumeTemplateId): ResumeTemplate {
  return (
    RESUME_TEMPLATES.find((t) => t.id === id) ||
    RESUME_TEMPLATES.find((t) => t.id === 'emerald-sidebar') ||
    RESUME_TEMPLATES[0]
  );
}
