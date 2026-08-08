# AI Cover Letter & Resume Builder

An AI-powered job application toolkit that generates tailored cover letters, builds ATS-friendly resumes and CVs, analyzes match scores against job descriptions, and tracks your applications — all in one place.

## Features

- **AI Cover Letter Generator** — Tailored cover letters generated from your resume profile and a job description
- **Resume Builder** — ATS-friendly resume builder with bullet-point enhancement
- **CV Builder** — Custom CV templates with export to PDF
- **ATS Match Analyzer** — Score your resume against a job description
- **Application Tracker** — Track job applications in one dashboard
- **Job URL Importer** — Import job details directly from a URL
- **Cold Email Generator** — Generate outreach emails
- **Resume Profiles** — Save and switch between multiple resume profiles
- **Auth & Billing** — Sign in with Supabase Auth, Pro plans with Stripe checkout

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini API (primary), Anthropic Claude API (optional)
- **Database/Auth:** Supabase
- **Payments:** Stripe
- **Export:** jsPDF + html2canvas
- **Tests:** Node.js built-in test runner

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key ([get one here](https://aistudio.google.com/)) |
| `ANTHROPIC_API_KEY` | No | Anthropic Claude API key |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

## API Routes

- `POST /api/generate` — Generate cover letter
- `POST /api/improve` — Improve/rewrite a letter
- `POST /api/match-score` — Analyze resume vs job description match
- `POST /api/cold-email` — Generate cold email
- `POST /api/job-import` — Import job details from URL
- `POST /api/resume/generate` — Generate resume
- `POST /api/resume/enhance-bullet` — Enhance resume bullet points
- `GET /api/stripe/checkout` — Create Stripe checkout session
- `GET /api/stripe/verify` — Verify Stripe payment

## License

MIT
