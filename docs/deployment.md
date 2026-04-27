# Deployment

This project has two deployment surfaces:

- `frontend/` on Vercel
- `backend/` on Render

## Target

- Provider: Vercel
- App root: `frontend/`
- Deployment mode: preview or production from the frontend directory

## Preflight

Run the repo-local preflight before asking setup questions or attempting a deploy:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-preflight.sh
```

For a full local verification pass before deploying:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-preflight.sh --build
```

What the preflight verifies:

- a usable Vercel CLI is available
- Vercel authentication is active in the current runtime
- the repo is linked to the correct Vercel project through `frontend/.vercel/project.json`
- `frontend/.env.example` exists to document required frontend variables
- optional production build succeeds when `--build` is used

Thor rule:

- if preflight passes, deploy directly
- if preflight fails, report the specific failed check instead of asking broad setup questions

## Link The Repo

If `frontend/.vercel/project.json` is missing, link the frontend directory to the intended Vercel project:

```bash
cd /home/node/.openclaw/workspace/limit_challenge/frontend
/home/node/.openclaw/workspace/.tools/vercel-cli/node_modules/.bin/vercel link
```

This creates local project metadata under `frontend/.vercel/`. That directory stays uncommitted.

## Deploy

Preview deploy:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-preview-deploy.sh
```

What the preview wrapper does:

- resolves the current Render backend service URL from the local Render API credentials
- sets `NEXT_PUBLIC_API_BASE_URL` to `<render-service-url>/api`
- injects that value into the Vercel preview deployment so each preview build points at Render automatically
- runs a post-deploy smoke check that verifies the login screen is live and the deployment reports the expected public API base URL

Production deploy:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-production-deploy.sh
```

What the production wrapper does after deploy:

- verifies the homepage contains the reviewer login shell instead of the legacy CTA
- verifies `/api/deployment-check` reports the expected public API base URL

## Environment

Document required public variables in `frontend/.env.example`.

Current frontend variable:

- `NEXT_PUBLIC_API_BASE_URL`

Default local value:

- `http://localhost:8000/api`

Hosted deploy note:

- if the frontend is deployed publicly, `NEXT_PUBLIC_API_BASE_URL` should point at a reachable hosted backend API, not localhost
- repo-local preview deploys now set that value automatically from the Render backend URL
- the frontend no longer silently falls back to localhost on hosted deployments; if the public API base URL is missing, the app now fails loudly with a configuration error instead of reviving the old broken behavior

## Rollback

- Preview: redeploy the prior known-good commit or switch back to the last working Vercel preview
- Production: redeploy the last known-good commit with `vercel --prod`

## Current Runtime Status

Verified on 2026-04-27 in this runtime:

- Vercel CLI is installed
- Vercel authentication is active
- the repo is linked through `frontend/.vercel/project.json`
- `bash scripts/vercel-preflight.sh` passes

Frontend deploys can be executed directly from this runtime.

## Backend on Render

The backend deploy path is repo-local and API-driven so Thor can reuse it without recreating service settings by hand.

Files:

- `render.yaml`
- `scripts/render-backend-deploy.sh`

Default backend service settings:

- Service name: `limit-challenge-backend`
- Runtime: Python
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `sh -c 'python manage.py migrate && python manage.py seed_submissions && gunicorn server.wsgi:application --bind 0.0.0.0:$PORT'`
- Health check: `/health/`

Required env before running the helper:

- `RENDER_API_KEY`

Optional env:

- `RENDER_OWNER_ID` to force a specific Render workspace
- `RENDER_FRONTEND_ORIGIN` to set `DJANGO_CORS_ALLOWED_ORIGINS` and `DJANGO_CSRF_TRUSTED_ORIGINS`
- `RENDER_SERVICE_NAME` to override the default Render service name

Run:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/render-backend-deploy.sh
```

The helper will:

- discover or create the Render web service
- set production-safe Django env vars
- trigger a fresh deploy

Notes:

- The backend currently uses SQLite. That is acceptable for a lightweight demo deploy, but data is not durable on a standard stateless web service.
- If the hosted frontend URL changes, rerun the helper with a new `RENDER_FRONTEND_ORIGIN` value or update the corresponding Render env vars.
- The preview deploy wrapper reads Render credentials from `/home/node/.openclaw/workspace/state/render.env` when they are not already exported in the shell.
