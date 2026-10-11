# Hosting Decision — Vercel

## Selected platform
Use **Vercel** for the public Next.js product landing page and the in-repo portfolio/build-log.

## Why Vercel
- native Next.js hosting
- automatic production deploys from `main`
- preview deployments for pull requests
- global CDN delivery
- simple custom-domain support
- minimal operations overhead for the public web layer

## Project configuration
Connect:

`danielwauer-maker/roblox-decision-engine`

Use:

- Framework Preset: `Next.js`
- Root Directory: `apps/web`
- Production Branch: `main`
- Install Command: `npm install`
- Build Command: `npm run build`

## Public routes
- `/` — product / Early Access landing page
- `/portfolio` — portfolio case study, architecture and sprint readiness

## Security boundary
The public web app must never receive the Roblox API key. Roblox credentials remain server-side in the FastAPI service / production secret store.

## Backend hosting
The FastAPI + PostgreSQL runtime is deliberately decoupled from the marketing/portfolio hosting decision. Backend hosting will be selected before pilot deployment based on persistence, observability, background job and cost requirements.
