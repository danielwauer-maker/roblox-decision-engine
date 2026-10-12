# R15 Pilot test state

This file records the active pilot validation wiring for the web application.

- Frontend: Vercel production project `roblox-decision-engine`
- Backend: Vercel FastAPI production project `roblox-decision-engine-api`
- Database: Neon PostgreSQL pilot database
- Test tenants: two explicitly `SIMULATED` studios plus one `LIVE` test tenant
- Safety boundary: simulated tenants cannot perform Roblox live sync
- Admin frontend uses server-side `API_BASE_URL` and `PILOT_ADMIN_TOKEN`; no backend credential is exposed to the browser

The live Roblox tenant is intentionally not considered connected until a real Roblox credential has been supplied through the encrypted tenant connection flow.
