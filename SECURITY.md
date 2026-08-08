# Security Policy

## Reporting a Vulnerability

If you find a security vulnerability, please **do not open a public issue**.

Email the details privately to [ranjeetmunjewar@gmail.com](mailto:ranjeetmunjewar@gmail.com) with:

- A description of the vulnerability
- Steps to reproduce
- Affected version(s)
- Any proof-of-concept you have

You should receive a response within 7 days. Once the issue is confirmed and fixed, it will be disclosed publicly.

## Security Notes for Self-Hosting

- API keys are read server-side via environment variables. Keep `.env.local` out of version control (it is already gitignored).
- If you expose the app publicly, add rate limiting or authentication before the API routes, since clients can supply their own API keys via request bodies.
- Never commit `STRIPE_SECRET_KEY` or other secrets. Use the platform's secret manager (e.g. Vercel environment variables).
