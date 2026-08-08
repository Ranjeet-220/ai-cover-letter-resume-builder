<div align="center">

<img src="public/logo.svg" alt="CoverCraft AI Studio logo" width="96" height="96" />

# AI Cover Letter & Resume Builder

[![CI](https://github.com/Ranjeet-220/ai-cover-letter-resume-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranjeet-220/ai-cover-letter-resume-builder/actions/workflows/ci.yml)
[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://covercraft-ai.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?logo=tailwindcss&logoColor=white)

**Live Demo:** [covercraft-ai.vercel.app](https://covercraft-ai.vercel.app)

An AI-powered job application toolkit that generates tailored cover letters, builds ATS-friendly resumes and CVs, analyzes match scores against job descriptions, and tracks your applications — all in one place.

</div>

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

## Screenshots

> Add screenshots here — drop images in `docs/screenshots/` and reference them like this:

```md
![Home page](docs/screenshots/home.png)
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini API (primary), Anthropic Claude API (optional)
- **Database/Auth:** Supabase
- **Payments:** Stripe
- **Export:** jsPDF + html2canvas
- **Tests:** Node.js built-in test runner
- **CI:** GitHub Actions (lint, test, build)

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

> **Note:** The Stripe and Supabase features are optional. Everything except `GEMINI_API_KEY` can be left empty for a fully working local demo.

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

## Security

API keys are always handled server-side via environment variables and are never exposed to the client. If you self-host and expose the app publicly, add rate limiting or authentication before the API routes — clients can supply their own API keys via request bodies. See [SECURITY.md](SECURITY.md) for details on reporting vulnerabilities.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on commits, tests, and pull requests.

## License

[MIT](LICENSE) © 2026 Ranjeet Munjewar
