# Submission Tracker

Submission Tracker is a take-home implementation for a broker-submitted opportunity review
workspace. The product is built around a reviewer flow: authenticate, scan the submissions queue,
filter by operational context, and inspect a full submission record with contacts, documents, and
note history.

## Stack

- Backend: Django, Django REST Framework, django-filter
- Frontend: Next.js 16, React 19, Material UI, axios, TanStack React Query
- Hosting: Vercel for `frontend/`, Render for `backend/`

## What Shipped

- Reviewer login flow with protected frontend routes
- Submission list view with:
  - URL-driven filters
  - broker dropdown
  - company search
  - status, priority, has-documents, and has-notes filtering
  - pagination
  - custom loading, empty, and error states
- Submission detail view with:
  - overview, contacts, documents, and notes/timeline sections
  - custom loading and error states
- GitHub-driven Vercel deploy flow for previews and production

## Auth And Session Approach

The frontend uses a reviewer session model backed by Django auth endpoints:

- `POST /api/auth/login/`
- `GET /api/auth/session/`
- `POST /api/auth/logout/`

For hosted environments, the browser does not call the Render backend directly. Instead, the
Next.js app proxies API traffic through `frontend/app/api/backend/[...path]/route.ts`. That keeps
the browser on the frontend origin and avoids fragile cross-site cookie behavior between
`vercel.app` and `onrender.com`.

In local development:

- frontend API calls default to `http://localhost:8000/api` when the app is served from `localhost`
- the demo reviewer login defaults to:
  - username: `reviewer`
  - password: `limit-review-2026`

Backend env overrides:

- `REVIEWER_LOGIN_USERNAME`
- `REVIEWER_LOGIN_PASSWORD`
- `REVIEWER_LOGIN_NAME`

## Architecture Notes

### Backend

The backend keeps the existing relational model and exposes a lightweight review API:

- `GET /api/submissions/`
- `GET /api/submissions/<id>/`
- `GET /api/brokers/`

Implemented backend improvements:

- extended filters for `brokerId`, `companySearch`, `priority`, `hasDocuments`, and `hasNotes`
- relational query optimization using `select_related` and `prefetch_related`
- list responses that include related counts and latest note preview

### Frontend

The frontend is organized around route-level reviewer screens:

- `/login`
- `/submissions`
- `/submissions/[id]`

React Query is used for list/detail/broker data access. Filter state is reflected in the URL so the
submissions workspace is shareable and browser-navigation friendly.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Default local URLs:

- frontend: `http://localhost:3000`
- login: `http://localhost:3000/login`
- submissions list: `http://localhost:3000/submissions`

## Deployment

### Frontend

The production frontend target is the Next.js app in `frontend/`.

GitHub Actions is the default deploy path:

- pull requests trigger Vercel preview deploys
- merges to `main` trigger Vercel production deploys

Required GitHub secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Required GitHub repository variable:

- `NEXT_PUBLIC_API_BASE_URL`

Optional preview variable:

- `NEXT_PUBLIC_API_BASE_URL_PREVIEW`

Deployment helpers:

- `bash scripts/vercel-preflight.sh`
- `bash scripts/vercel-preview-deploy.sh`
- `bash scripts/vercel-production-deploy.sh`

Full operational notes are in [docs/deployment.md](/home/node/.openclaw/workspace/limit_challenge/docs/deployment.md).

### Backend

The backend is deployable independently to Render.

- blueprint: `render.yaml`
- helper: `bash scripts/render-backend-deploy.sh`
- health endpoint: `/health/`

Required secret:

- `RENDER_API_KEY`

Useful optional env:

- `RENDER_FRONTEND_ORIGIN`

## Project Structure

- `backend/`: Django project, API, data model, seed command
- `frontend/`: Next.js reviewer application
- `docs/deployment.md`: deployment and rollback notes
- `INTERVIEWER_NOTES.md`: private reviewer guidance from the starter kit

## Tradeoffs

- I prioritized the review workflow over create/edit tooling because the assignment is centered on
  browsing and inspection.
- I stayed within the provided MUI-based frontend stack rather than introducing a new component
  system or CSS framework migration.
- I used SQLite for the demo backend deployment path because it keeps setup simple, though it is not
  the right choice for durable production data.

## Stretch Improvements Implemented

- extra filters beyond the minimum required prompt
- shareable URL state for the submissions list
- custom loading, empty, and error states for list and detail pages
- hosted-session proxying to make reviewer auth stable in deployment
- GitHub-driven Vercel preview/production deployment flow

## Validation

Frontend validation used during delivery:

- `npm run lint`
- `npm run build`

Backend validation focused on endpoint behavior, relational data loading, and deploy/runtime checks.

## Reviewer Notes

If reviewing the project live, the fastest end-to-end path is:

1. Open `/login`
2. Sign in with the reviewer credentials
3. Test filter behavior on `/submissions`
4. Open a submission detail view
5. Confirm loading and error states behave intentionally

## Demo Credentials

- Username: `reviewer`
- Password: `limit-review-2026`
