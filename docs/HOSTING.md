# Hosting — Vercel

## Decision
The public product landing page and portfolio/build-log are hosted on **Vercel**.

Why Vercel for this repository:
- native Next.js hosting
- automatic production deployment from `main`
- preview deployments for pull requests
- global CDN / edge delivery
- zero infrastructure administration for the marketing and portfolio surfaces
- easy custom-domain support later

## Vercel project configuration

Connect the GitHub repository:

`danielwauer-maker/roblox-decision-engine`

Use these settings:

- Framework Preset: `Next.js`
- Root Directory: `apps/web`
- Production Branch: `main`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output: automatic Next.js default

## Public routes

- `/` — product / Early Access landing page
- `/portfolio` — project portfolio, architecture and sprint readiness

## Environment

The current public web surface does not require secrets.

When API-backed features are introduced, configure public frontend variables in Vercel only when needed. Never expose the Roblox API key to the browser. Roblox credentials remain server-side in the API service.

## Backend hosting

Vercel is selected for the public Next.js web application. The FastAPI + PostgreSQL production runtime will be selected separately before pilot deployment, because long-running API workloads and PostgreSQL should not be coupled to the static/product-site hosting decision.
