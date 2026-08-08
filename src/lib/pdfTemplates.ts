export interface PdfTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  fontFamilyCSS: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  accentBg: string;
  borderStyle: string;
  headerLayout: 'modern-left' | 'executive-centered' | 'minimal-clean' | 'creative-banner';
  headerBg?: string;
  headerTextColor?: string;
  dividerStyle: string;
  contactIconStyle: string;
}

export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: 'modern-indigo',
    name: 'Modern Indigo',
    description: 'Sleek, tech-focused layout with rich indigo accents and modern typography.',
    badge: 'Popular',
    fontFamily: 'sans',
    fontFamilyCSS: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    primaryColor: '#4f46e5', // indigo-600
    secondaryColor: '#4338ca', // indigo-700
    accentColor: '#6366f1', // indigo-500
    textColor: '#1e293b', // slate-800
    bgColor: '#ffffff',
    accentBg: '#eef2ff', // indigo-50
    borderStyle: 'border-l-4 border-indigo-600',
    headerLayout: 'modern-left',
    dividerStyle: 'border-indigo-100',
    contactIconStyle: 'text-indigo-600 bg-indigo-50',
  },
  {
    id: 'executive-serif',
    name: 'Executive Serif',
    description: 'Classic, authoritative layout with elegant serif fonts and centered header.',
    badge: 'Executive',
    fontFamily: 'serif',
    fontFamilyCSS: 'Georgia, Cambria, "Times New Roman", Times, serif',
    primaryColor: '#0f172a', // slate-900
    secondaryColor: '#334155', // slate-700
    accentColor: '#475569', // slate-600
    textColor: '#1e293b',
    bgColor: '#ffffff',
    accentBg: '#f8fafc',
    borderStyle: 'border-b-2 border-slate-900',
    headerLayout: 'executive-centered',
    dividerStyle: 'border-slate-300',
    contactIconStyle: 'text-slate-800 bg-slate-100',
  },
  {
    id: 'minimalist-line',
    name: 'Minimalist Line',
    description: 'Ultra-clean monochromatic design with precise line dividers and high legibility.',
    badge: 'Clean',
    fontFamily: 'sans',
    fontFamilyCSS: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    primaryColor: '#0284c7', // sky-600
    secondaryColor: '#0369a1', // sky-700
    accentColor: '#38bdf8', // sky-400
    textColor: '#0f172a',
    bgColor: '#ffffff',
    accentBg: '#f0f9ff',
    borderStyle: 'border-t border-b border-slate-200',
    headerLayout: 'minimal-clean',
    dividerStyle: 'border-slate-200',
    contactIconStyle: 'text-slate-600 bg-slate-100',
  },
  {
    id: 'creative-gradient',
    name: 'Creative Gradient',
    description: 'Vibrant top gradient banner with styled badges for creative and design roles.',
    badge: 'Creative',
    fontFamily: 'sans',
    fontFamilyCSS: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    primaryColor: '#7c3aed', // violet-600
    secondaryColor: '#c026d3', // fuchsia-600
    accentColor: '#ec4899', // pink-500
    textColor: '#1e293b',
    bgColor: '#ffffff',
    accentBg: '#faf5ff',
    headerBg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
    headerTextColor: '#ffffff',
    borderStyle: 'border-none',
    headerLayout: 'creative-banner',
    dividerStyle: 'border-purple-100',
    contactIconStyle: 'text-violet-600 bg-purple-50',
  },
];

export const DEFAULT_PDF_TEMPLATE = PDF_TEMPLATES[0];

export function getPdfTemplateById(id?: string): PdfTemplate {
  if (!id) return DEFAULT_PDF_TEMPLATE;
  return PDF_TEMPLATES.find((t) => t.id === id) || DEFAULT_PDF_TEMPLATE;
}
