# Hosting Decision — PlayDirective Production

## Canonical production platform

PlayDirective production is self-hosted on the Hetzner server in Germany.

Canonical URL:

`https://playdirective.com`

Repository:

`danielwauer-maker/roblox-decision-engine`

Production checkout:

`/opt/roblox-decision-engine`

## Production architecture

- Next.js web service in Docker, bound to `127.0.0.1:8090`
- FastAPI service in Docker, bound to `127.0.0.1:8091`
- PostgreSQL 16 on the internal Docker network only; no public host port
- HTTPS reverse proxy in front of the loopback-bound application services
- persistent PostgreSQL storage on the Hetzner volume
- production configuration in server-local `.env.production`, excluded from Git

Deployments are intentionally explicit rather than automatic:

1. require the intended commit on `main` and green repository CI
2. fast-forward the production checkout with `git pull --ff-only`
3. build/start with `docker-compose.production.yml` and `.env.production`
4. confirm container state, `/health` and `/ready`
5. run any release-specific acceptance checks before marking production accepted

## Scheduled production operations

System cron runs the production maintenance scripts from `/etc/cron.d/playdirective-r17`:

- PostgreSQL backup — daily at 02:20 server time
- Roblox analytics sync — daily at 06:10 server time
- lifecycle evaluation — daily at 08:10 server time
- local production health check — every 5 minutes

The maintenance scripts under `deploy/hetzner/` are tracked as executable because cron invokes them directly.

## Monitoring

The local 5-minute health check validates the public site, API liveness/readiness and required Docker containers. An independent scheduled GitHub Actions uptime workflow checks the canonical public URL from outside Hetzner and fails visibly if the site cannot be reached.

For higher-volume/general-availability operation, dedicated paging/uptime infrastructure can replace or supplement the GitHub Actions baseline.

## Security boundary

- Roblox credentials are tenant-scoped, encrypted at rest and used server-side only for entitled connections.
- Platform/provider secrets remain in `.env.production` or provider secret stores and are not committed to Git.
- Web and API container ports are loopback-bound.
- PostgreSQL is not published externally.
- HTTPS is required for the public service.

## Vercel status

Vercel was used during an earlier public-frontend stage and may still produce repository deployment/status checks. It is **not** the canonical PlayDirective production runtime. A Vercel build-rate-limit or deployment-status failure must not be represented as a Hetzner production outage; it should be classified as a non-production integration status unless Vercel is deliberately reintroduced into the production architecture.

Historical R11 documentation describing Vercel reflects that earlier release stage and is superseded by this production decision for current operations.
