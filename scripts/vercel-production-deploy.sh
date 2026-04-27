#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"
STATE_RENDER_ENV="/home/node/.openclaw/workspace/state/render.env"
DEFAULT_RENDER_SERVICE_NAME="limit-challenge-backend"

if [[ -x "/home/node/.openclaw/workspace/.tools/vercel-cli/node_modules/.bin/vercel" ]]; then
  VERCEL_BIN="/home/node/.openclaw/workspace/.tools/vercel-cli/node_modules/.bin/vercel"
elif command -v vercel >/dev/null 2>&1; then
  VERCEL_BIN="$(command -v vercel)"
else
  echo "FAIL: Vercel CLI not found." >&2
  exit 1
fi

source_render_env() {
  if [[ -n "${RENDER_API_KEY:-}" ]]; then
    return 0
  fi

  if [[ -f "$STATE_RENDER_ENV" ]]; then
    # shellcheck disable=SC1090
    source "$STATE_RENDER_ENV"
  fi

  if [[ -z "${RENDER_API_KEY:-}" ]]; then
    echo "FAIL: RENDER_API_KEY is required to resolve the Render backend URL." >&2
    exit 1
  fi
}

render_api() {
  local method="$1"
  local path="$2"

  curl -fsS \
    -X "$method" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Accept: application/json" \
    "https://api.render.com${path}"
}

resolve_render_service_url() {
  source_render_env

  local owner_id="${RENDER_OWNER_ID:-}"
  local service_name="${RENDER_SERVICE_NAME:-$DEFAULT_RENDER_SERVICE_NAME}"

  if [[ -z "$owner_id" ]]; then
    owner_id="$(
      render_api GET "/v1/owners" |
        python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["owner"]["id"])'
    )"
  fi

  render_api GET "/v1/services?ownerId=${owner_id}&name=${service_name}" |
    python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["service"]["serviceDetails"].get("url","") if data else "")'
}

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "FAIL: missing frontend directory at $FRONTEND_DIR" >&2
  exit 1
fi

if ! "$VERCEL_BIN" whoami >/dev/null 2>&1; then
  echo "FAIL: Vercel auth is not active in this runtime." >&2
  exit 1
fi

RENDER_SERVICE_URL="${RENDER_SERVICE_URL:-$(resolve_render_service_url)}"
if [[ -z "$RENDER_SERVICE_URL" ]]; then
  echo "FAIL: could not resolve a Render service URL. Deploy the backend first or set RENDER_SERVICE_URL." >&2
  exit 1
fi

NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-${RENDER_SERVICE_URL%/}/api}"
echo "Using production API base URL: $NEXT_PUBLIC_API_BASE_URL"

cd "$FRONTEND_DIR"
DEPLOY_OUTPUT="$("$VERCEL_BIN" deploy \
  --prod \
  --yes \
  --build-env "NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL" \
  --env "NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL" \
  "$@")"

echo "$DEPLOY_OUTPUT"
DEPLOY_URL="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+vercel\.app' | tail -n 1)"

if [[ -z "$DEPLOY_URL" ]]; then
  echo "FAIL: could not determine production deployment URL from Vercel output." >&2
  exit 1
fi

bash "$REPO_ROOT/scripts/vercel-smoke-check.sh" "$DEPLOY_URL" "$NEXT_PUBLIC_API_BASE_URL"
