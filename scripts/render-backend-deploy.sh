#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_SERVICE_NAME="limit-challenge-backend"
DEFAULT_ROOT_DIR="backend"
DEFAULT_HEALTH_PATH="/health/"
DEFAULT_BUILD_COMMAND="pip install -r requirements.txt"
DEFAULT_START_COMMAND="sh -c 'python manage.py migrate && python manage.py seed_submissions && gunicorn server.wsgi:application --bind 0.0.0.0:\$PORT'"

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require_command curl
require_command python3
require_command git

if [[ -z "${RENDER_API_KEY:-}" ]]; then
  echo "RENDER_API_KEY is required." >&2
  exit 1
fi

api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  if [[ -n "$data" ]]; then
    curl -fsS \
      -X "$method" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Accept: application/json" \
      -H "Content-Type: application/json" \
      "https://api.render.com${path}" \
      --data "$data"
  else
    curl -fsS \
      -X "$method" \
      -H "Authorization: Bearer $RENDER_API_KEY" \
      -H "Accept: application/json" \
      "https://api.render.com${path}"
  fi
}

SERVICE_NAME="${RENDER_SERVICE_NAME:-$DEFAULT_SERVICE_NAME}"
ROOT_DIR="${RENDER_ROOT_DIR:-$DEFAULT_ROOT_DIR}"
HEALTH_PATH="${RENDER_HEALTH_PATH:-$DEFAULT_HEALTH_PATH}"
BUILD_COMMAND="${RENDER_BUILD_COMMAND:-$DEFAULT_BUILD_COMMAND}"
START_COMMAND="${RENDER_START_COMMAND:-$DEFAULT_START_COMMAND}"
BRANCH="${RENDER_BRANCH:-$(git -C "$REPO_ROOT" branch --show-current)}"
REPO_URL="${RENDER_REPO_URL:-$(git -C "$REPO_ROOT" remote get-url origin)}"
FRONTEND_ORIGIN="${RENDER_FRONTEND_ORIGIN:-}"
DJANGO_SECRET_KEY="${DJANGO_SECRET_KEY:-$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
)}"

OWNER_ID="${RENDER_OWNER_ID:-}"
if [[ -z "$OWNER_ID" ]]; then
  OWNER_ID="$(api GET "/v1/owners" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["owner"]["id"])')"
fi

SERVICE_JSON="$(api GET "/v1/services?ownerId=${OWNER_ID}&name=${SERVICE_NAME}")"
SERVICE_ID="$(printf '%s' "$SERVICE_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["service"]["id"] if data else "")')"
SERVICE_URL="$(printf '%s' "$SERVICE_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data[0]["service"]["serviceDetails"].get("url","") if data else "")')"

if [[ -z "$SERVICE_ID" ]]; then
  CREATE_PAYLOAD="$(python3 - <<PY
import json
payload = {
  "type": "web_service",
  "name": ${SERVICE_NAME@Q},
  "ownerId": ${OWNER_ID@Q},
  "repo": ${REPO_URL@Q},
  "branch": ${BRANCH@Q},
  "rootDir": ${ROOT_DIR@Q},
  "autoDeploy": "yes",
  "serviceDetails": {
    "env": "python",
    "plan": "free",
    "region": "oregon",
    "pullRequestPreviewsEnabled": "no",
    "healthCheckPath": ${HEALTH_PATH@Q},
    "envSpecificDetails": {
      "buildCommand": ${BUILD_COMMAND@Q},
      "startCommand": ${START_COMMAND@Q},
    },
  },
}
print(json.dumps(payload))
PY
)"
  SERVICE_JSON="$(api POST "/v1/services" "$CREATE_PAYLOAD")"
  SERVICE_ID="$(printf '%s' "$SERVICE_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); service=data.get("service", data); print(service["id"])')"
  SERVICE_URL="$(printf '%s' "$SERVICE_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); service=data.get("service", data); print(service.get("serviceDetails", {}).get("url", ""))')"
fi

HOSTS="localhost,127.0.0.1,.onrender.com"
if [[ -n "$SERVICE_URL" ]]; then
  RENDER_HOST="$(python3 -c 'import sys,urllib.parse; print(urllib.parse.urlparse(sys.argv[1]).hostname or "")' "$SERVICE_URL")"
  if [[ -n "$RENDER_HOST" ]]; then
    HOSTS="${HOSTS},${RENDER_HOST}"
  fi
fi

api PUT "/v1/services/${SERVICE_ID}/env-vars/DJANGO_DEBUG" '{"value":"false"}' >/dev/null
api PUT "/v1/services/${SERVICE_ID}/env-vars/DJANGO_SECRET_KEY" "{\"value\":\"${DJANGO_SECRET_KEY}\"}" >/dev/null
api PUT "/v1/services/${SERVICE_ID}/env-vars/DJANGO_ALLOWED_HOSTS" "{\"value\":\"${HOSTS}\"}" >/dev/null

if [[ -n "$FRONTEND_ORIGIN" ]]; then
  api PUT "/v1/services/${SERVICE_ID}/env-vars/DJANGO_CORS_ALLOWED_ORIGINS" "{\"value\":\"${FRONTEND_ORIGIN}\"}" >/dev/null
  api PUT "/v1/services/${SERVICE_ID}/env-vars/DJANGO_CSRF_TRUSTED_ORIGINS" "{\"value\":\"${FRONTEND_ORIGIN}\"}" >/dev/null
fi

DEPLOY_JSON="$(api POST "/v1/services/${SERVICE_ID}/deploys" '{"clearCache":"clear"}')"
DEPLOY_ID="$(printf '%s' "$DEPLOY_JSON" | python3 -c 'import json,sys; data=json.load(sys.stdin); print(data.get("id", ""))')"

printf 'service_id=%s\n' "$SERVICE_ID"
printf 'service_url=%s\n' "$SERVICE_URL"
printf 'deploy_id=%s\n' "$DEPLOY_ID"
