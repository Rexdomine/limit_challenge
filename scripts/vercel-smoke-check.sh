#!/usr/bin/env bash
set -euo pipefail

DEPLOY_URL="${1:-}"
EXPECTED_API_BASE_URL="${2:-}"

if [[ -z "$DEPLOY_URL" ]]; then
  echo "FAIL: usage: bash scripts/vercel-smoke-check.sh <deployment-url> [expected-api-base-url]" >&2
  exit 1
fi

HOME_HTML="$(curl -fsSL "$DEPLOY_URL")"

if [[ "$HOME_HTML" != *"Reviewer login"* ]]; then
  echo "FAIL: deployment home page is missing the reviewer login screen marker." >&2
  exit 1
fi

if [[ "$HOME_HTML" == *"Go to Submissions"* ]]; then
  echo "FAIL: deployment is still serving the legacy homepage CTA." >&2
  exit 1
fi

CONFIG_JSON="$(curl -fsSL "$DEPLOY_URL/api/deployment-check")"

python3 - "$CONFIG_JSON" "$EXPECTED_API_BASE_URL" <<'PY'
import json
import sys

payload = json.loads(sys.argv[1])
expected = sys.argv[2]

if not payload.get("reviewerLoginEnabled"):
    raise SystemExit("FAIL: deployment-check reports reviewer login disabled.")

api_base_url = payload.get("apiBaseUrl")
if not api_base_url:
    raise SystemExit("FAIL: deployment-check reports NEXT_PUBLIC_API_BASE_URL is unset.")

if expected and api_base_url.rstrip("/") != expected.rstrip("/"):
    raise SystemExit(
        f"FAIL: deployment-check apiBaseUrl mismatch. expected={expected} actual={api_base_url}"
    )

print(f"PASS: deployment serves reviewer login and apiBaseUrl={api_base_url}")
PY
