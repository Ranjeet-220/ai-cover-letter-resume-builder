import type { ResumeCvData } from '@/types';

export const SAMPLE_RESUME_PRESETS: Record<string, ResumeCvData> = {
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
