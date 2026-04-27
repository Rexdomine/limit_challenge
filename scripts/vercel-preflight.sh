#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_FILE="$FRONTEND_DIR/.env.example"
PROJECT_FILE="$FRONTEND_DIR/.vercel/project.json"
RUN_BUILD=0

if [[ "${1:-}" == "--build" ]]; then
  RUN_BUILD=1
fi

if [[ -x "/home/node/.openclaw/workspace/.tools/vercel-cli/node_modules/.bin/vercel" ]]; then
  VERCEL_BIN="/home/node/.openclaw/workspace/.tools/vercel-cli/node_modules/.bin/vercel"
elif command -v vercel >/dev/null 2>&1; then
  VERCEL_BIN="$(command -v vercel)"
else
  echo "FAIL: Vercel CLI not found."
  exit 1
fi

echo "OK: using Vercel CLI at $VERCEL_BIN"

if ! "$VERCEL_BIN" whoami >/dev/null 2>&1; then
  echo "FAIL: Vercel auth is not active in this runtime. Run 'vercel login' or provide a token."
  exit 1
fi

echo "OK: Vercel auth is active"

if [[ ! -f "$PROJECT_FILE" ]]; then
  echo "FAIL: frontend is not linked to a Vercel project. Missing $PROJECT_FILE"
  exit 1
fi

echo "OK: repo-local Vercel project link exists"

if [[ ! -f "$VENV_FILE" ]]; then
  echo "FAIL: missing $VENV_FILE so required frontend env vars are not documented"
  exit 1
fi

echo "OK: frontend env example exists"

if ! grep -q '^NEXT_PUBLIC_API_BASE_URL=' "$VENV_FILE"; then
  echo "FAIL: NEXT_PUBLIC_API_BASE_URL is not documented in $VENV_FILE"
  exit 1
fi

echo "OK: NEXT_PUBLIC_API_BASE_URL is documented"

if [[ "$RUN_BUILD" -eq 1 ]]; then
  echo "Running production frontend build..."
  (cd "$FRONTEND_DIR" && npm run build)
  echo "OK: frontend production build passed"
fi

echo "PASS: Vercel deployment preflight succeeded"
