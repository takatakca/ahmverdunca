#!/usr/bin/env bash
set -euo pipefail

: "${AHMV_CPANEL_HOST:?AHMV_CPANEL_HOST is required}"
: "${AHMV_CPANEL_USER:?AHMV_CPANEL_USER is required}"
: "${AHMV_CPANEL_API_TOKEN:?AHMV_CPANEL_API_TOKEN is required}"
: "${AHMV_APP_ROOT:?AHMV_APP_ROOT is required}"

[[ "$AHMV_CPANEL_HOST" =~ ^[A-Za-z0-9._-]+$ ]] || {
  echo "ERROR: AHMV_CPANEL_HOST must be a hostname only." >&2
  exit 1
}

[[ "$AHMV_CPANEL_USER" =~ ^[A-Za-z0-9._-]+$ ]] || {
  echo "ERROR: AHMV_CPANEL_USER contains unsupported characters." >&2
  exit 1
}

[[ "$AHMV_APP_ROOT" = /* ]] || {
  echo "ERROR: AHMV_APP_ROOT must be an absolute path." >&2
  exit 1
}

BASE="https://${AHMV_CPANEL_HOST}:2083"
AUTH="Authorization: cpanel ${AHMV_CPANEL_USER}:${AHMV_CPANEL_API_TOKEN}"

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

curl   --fail-with-body   --silent   --show-error   --connect-timeout 15   --max-time 30   -H "$AUTH"   --get   --data-urlencode "dir=$AHMV_APP_ROOT"   "$BASE/execute/Fileman/list_files"   > "$tmp"

jq -e '.status == 1' "$tmp" >/dev/null || {
  echo "ERROR: cPanel UAPI authentication or Fileman access failed." >&2
  jq -c '{status,errors,messages}' "$tmp" >&2 || true
  exit 1
}

count="$(jq '(.data // []) | length' "$tmp")"

printf '{"ok":true,"transport":"cpanel-https","appRootAccessible":true,"entries":%s}\n' "$count"
