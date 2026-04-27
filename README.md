# Submission Tracker Take-home Challenge

This repository hosts the boilerplate for the Submission Tracker assignment. It includes a Django +
Django REST Framework backend and a Next.js frontend scaffold so candidates can focus on API
design, relational data modelling, and product-focused UI work.

## Challenge Overview

Operations managers need a workspace to review broker-submitted opportunities. Build a lightweight
tool that lets them browse incoming submissions, filter by business context, and inspect full
details per record. Deliver a polished frontend experience backed by clean APIs.

### Goals

- **Backend:** Model the domain, expose list and detail endpoints, and support realistic filtering.
- **Frontend (higher weight):** Craft an intuitive list and detail experience with filters that map
  to query parameters. Focus on UX clarity, organization, and maintainability.

## Data Model

Required entities (already defined in `submissions/models.py`):

- `Broker`: name, contact email
- `Company`: legal name, industry, headquarters city
- `TeamMember`: internal owner for a submission
- `Submission`: links to company, broker, owner with status, priority, and summary
- `Contact`: primary contacts for a submission
- `Document`: references to supporting files
- `Note`: threaded context for collaboration

Seed data (~25 submissions with dozens of related contacts, documents, and notes) is available via
`python manage.py seed_submissions`. Re-run with `--force` to rebuild the dataset.

## API Requirements

- `GET /api/submissions/`
  - Returns paginated submissions with company, broker, owner, counts of related documents/notes,
    and the latest note preview.
  - Supports filters via query params. `status` is wired up; extend filters for `brokerId` and
    `companySearch` (plus optional extras like `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`).
- `GET /api/submissions/<id>/`
  - Returns the full submission plus related contacts, documents, and notes.
- `GET /api/brokers/`
  - Returns brokers for the frontend dropdown.

Viewsets, serializers, and base filters are in place but intentionally minimal so you can refine
the query behavior and filtering logic.

## Frontend Workspace Overview

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. The list
and detail routes under `/submissions` are scaffolded so you can focus on API consumption and UX
polish.

### What is pre-built?

- Global providers supply Material UI theming and a shared React Query client.
- `/submissions` hosts the list view with filter inputs and hints about required query params.
- `/submissions/[id]` hosts the detail shell and links back to the list.
- Custom hooks in `lib/hooks` define how to fetch submissions and brokers. Each hook is disabled by
  default (`enabled: false`) so no network requests fire until you enable them.

### What you need to implement

- Wire the filter state to query parameters and React Query `queryFn`s.
- Render table/card layouts for the submission list along with loading, empty, and error states.
- Build the detail page sections for summary data, contacts, documents, and notes.
- Enable the queries and handle pagination or other UX you want to highlight.

## Project Structure

- `backend/`: Django project with REST API, seed command, and submission models.
- `frontend/`: Next.js app described above.
- `INTERVIEWER_NOTES.md`: Context for reviewers/interviewers.

## Environment Variables

- In local development, frontend requests default to `http://localhost:8000/api` when you run the app on `localhost`.
- For any hosted deployment, `NEXT_PUBLIC_API_BASE_URL` must be set explicitly to the public backend `/api` URL.
- Backend reviewer login defaults to:
  - `REVIEWER_LOGIN_USERNAME=reviewer`
  - `REVIEWER_LOGIN_PASSWORD=limit-review-2026`
  - `REVIEWER_LOGIN_NAME=Demo Reviewer`

### Deployment Variables

- `frontend/.env.example` is the source of truth for required frontend env names.
- For public Vercel deployments, `NEXT_PUBLIC_API_BASE_URL` must point at a hosted backend API, not localhost.

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions  # optional but recommended
# add --force to rebuild the generated sample data
python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # create if you want a custom API base
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api only on localhost
npm run dev
```

Visit `http://localhost:3000/submissions` to start building.

### Reviewer Login

The app now ships with a login-only reviewer flow that protects the API and frontend workspace.

- Default login URL: `http://localhost:3000/login`
- Demo username: `reviewer`
- Demo password: `limit-review-2026`
- To override credentials, export `REVIEWER_LOGIN_USERNAME`, `REVIEWER_LOGIN_PASSWORD`, and
  `REVIEWER_LOGIN_NAME` before starting the Django server.

## Deployment

The public frontend target for this project is the Next.js app in `frontend/`, with Vercel as the target platform.

Run the repo-local preflight before attempting a deploy:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-preflight.sh
```

For a full verification pass including a production build:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-preflight.sh --build
```

Preview deploys should go through the repo-local wrapper so the build always uses the hosted Render backend automatically:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-preview-deploy.sh
```

Production deploy:

```bash
cd /home/node/.openclaw/workspace/limit_challenge
bash scripts/vercel-production-deploy.sh
```

Both deploy wrappers now run a post-deploy smoke check so a deployment fails fast if:

- the homepage is still serving the legacy `Go to Submissions` scaffold
- the reviewer login shell is missing
- the deployed frontend does not report the expected `NEXT_PUBLIC_API_BASE_URL`

Full deployment notes and rollback guidance live in `docs/deployment.md`.

### Backend Hosting

The Django backend in `backend/` can be deployed independently to Render.

- Blueprint spec: `render.yaml`
- Repo-local helper: `bash scripts/render-backend-deploy.sh`
- Default service name: `limit-challenge-backend`
- Health endpoint: `/health/`

Required runtime secret:

- `RENDER_API_KEY` for the deploy helper

Optional helper env:

- `RENDER_FRONTEND_ORIGIN` to allow a hosted frontend origin through CORS and CSRF settings

## Development Workflow

1. Start the Django server on port 8000 (`python manage.py runserver`).
2. Start the Next.js dev server on port 3000 (`npm run dev`).
3. Iterate on backend filters, serializers, and viewsets, then refresh the frontend to see updated
   data.
4. When ready, add README notes summarizing your approach, tradeoffs, and any stretch goals.

## Submission Instructions

- Provide a short README update summarizing approach, tradeoffs, and how to run the solution.
- Record and share a brief screen capture (max 2 minutes) demonstrating the frontend working end-to-end with the backend.
- Call out any stretch goals implemented.
- Automated tests are optional, but including targeted backend or frontend tests is a strong signal.

## Solution Summary

### Approach

- Kept the existing Django + DRF domain model and built out the API contract rather than reshaping the project from scratch.
- Prioritized the frontend experience because the challenge weights UX, filter flow, and product polish most heavily.
- Treated the list page as the main working surface for operations managers and the detail page as the supporting review surface.

### What was implemented

- Extended submission filtering for `brokerId` and `companySearch` and added optional higher-signal filters for `priority`, `hasDocuments`, and `hasNotes`.
- Improved backend query behavior with `select_related` and `prefetch_related` to keep relational reads efficient.
- Enabled the React Query hooks and wired the submission list to URL-driven filter state.
- Built a polished list UI with status and priority treatment, broker and owner context, related counts, latest note preview, loading states, empty states, error handling, and pagination.
- Built the detail page sections for summary information, contacts, documents, and note history.
- Verified the frontend with lint, TypeScript, and a production Next.js build.

### Tradeoffs

- Focused on strengthening the read workflow rather than adding create or edit interactions, since the assignment is centered on browsing and inspecting submissions.
- Added a few optional filters that increase reviewer signal without pulling time away from the core list/detail experience.
- Kept the UI implementation within the provided Material UI stack instead of introducing extra component libraries or deployment complexity.

### Stretch goals implemented

- Additional filters beyond the required minimum: `priority`, `hasDocuments`, and `hasNotes`.
- Shareable URL state for the list filters.
- Stronger relational query loading for backend efficiency.

## Evaluation Rubric

- **Frontend (45%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Backend (30%)** – API design, serialization choices, filtering implementation, and attention to
  relational data handling.
- **Code Quality (15%)** – Structure, naming, documentation/readability, testing where it adds
  value.
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details.

## Optional Bonus

Authentication, deployment, or extra tooling are not required but welcome if scope allows.
