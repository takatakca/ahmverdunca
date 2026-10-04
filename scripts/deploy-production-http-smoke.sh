#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"
PATHNAME="${2:-}"

: "${AHMV_PRODUCTION_URL:?AHMV_PRODUCTION_URL is required}"

case "$MODE" in
  body|headers|status) ;;
  *)
    echo "Usage: $0 {body|headers|status} /path" >&2
    exit 2
    ;;
esac

case "$PATHNAME" in
  /*) ;;
  *)
    echo "ERROR: Smoke path must begin with /." >&2
    exit 2
    ;;
esac

if [[ "$PATHNAME" == *"'"* || "$PATHNAME" == *$'\n'* || "$PATHNAME" == *$'\r'* ]]; then
  echo "ERROR: Smoke path contains unsupported characters." >&2
  exit 2
fi

URL="${AHMV_PRODUCTION_URL}${PATHNAME}"
USER_AGENT="AHMV-Deploy-Smoke/1.1"
MAX_ATTEMPTS="${AHMV_HTTP_SMOKE_ATTEMPTS:-8}"
RETRY_DELAY="${AHMV_HTTP_SMOKE_DELAY_SECONDS:-3}"

[[ "$MAX_ATTEMPTS" =~ ^[1-9][0-9]*$ ]] || {
  echo "ERROR: AHMV_HTTP_SMOKE_ATTEMPTS must be a positive integer." >&2
  exit 2
}
[[ "$RETRY_DELAY" =~ ^[0-9]+$ ]] || {
  echo "ERROR: AHMV_HTTP_SMOKE_DELAY_SECONDS must be a non-negative integer." >&2
  exit 2
}

curl_action=()
case "$MODE" in
  body) ;;
  headers) curl_action=(-D - -o /dev/null) ;;
  status) curl_action=(-o /dev/null) ;;
esac

looks_like_waf_challenge() {
  local file="$1"

  grep -Eqi     'webdriverCheck|failedChecks|wsidchk|pdata|/z0f[0-9a-f]+'     "$file"
}

public_curl_once() {
  local body_file
  local headers_file
  local status

  body_file="$(mktemp)"
  headers_file="$(mktemp)"

  set +e
  curl --fail --silent --show-error --location     --connect-timeout 15 --max-time 30     --user-agent "$USER_AGENT"     --header 'Cache-Control: no-cache'     -D "$headers_file"     -o "$body_file"     "$URL"
  status=$?
  set -e

  if [ "$status" -ne 0 ]; then
    rm -f "$body_file" "$headers_file"
    return "$status"
  fi

  if looks_like_waf_challenge "$body_file"; then
    echo "Public HTTPS returned a WAF/browser challenge instead of application content." >&2
    rm -f "$body_file" "$headers_file"
    return 90
  fi

  case "$MODE" in
    body) cat "$body_file" ;;
    headers) cat "$headers_file" ;;
    status) : ;;
  esac

  rm -f "$body_file" "$headers_file"
}

origin_curl_once() {
  : "${AHMV_HOST:?AHMV_HOST is required for origin smoke fallback}"

  local connect_target
  connect_target="${AHMV_ORIGIN_CONNECT_HOST:-$AHMV_HOST}"

  # Keep the public URL/Host/SNI as ahmverdun.ca while connecting directly to
  # the hosting origin. This bypasses the public WAF without relying on the
  # cPanel loopback vhost, which can misroute application paths such as
  # /healthz. TLS verification is relaxed only for this authenticated deploy
  # diagnostic because some hosting origins present a platform certificate.
  curl --insecure --fail --silent --show-error --location     --connect-timeout 15 --max-time 30     --connect-to "ahmverdun.ca:443:${connect_target}:443"     --user-agent "$USER_AGENT"     --header 'Cache-Control: no-cache'     "${curl_action[@]}"     "$URL"
}

retry_smoke() {
  local target="$1"
  local attempt=1
  local status=1
  local output=""

  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    echo "HTTP smoke attempt ${attempt}/${MAX_ATTEMPTS} against ${target}..." >&2

    set +e
    if [ "$target" = "origin" ]; then
      output="$(origin_curl_once 2> >(cat >&2))"
      status=$?
    else
      output="$(public_curl_once 2> >(cat >&2))"
      status=$?
    fi
    set -e

    if [ "$status" -eq 0 ]; then
      printf '%s' "$output"
      return 0
    fi

    if [ "$status" -eq 90 ]; then
      echo "Detected public WAF challenge; switching to origin verification." >&2
      return 90
    fi

    echo "HTTP smoke attempt ${attempt} failed with exit code ${status}." >&2
    if [ "$attempt" -lt "$MAX_ATTEMPTS" ] && [ "$RETRY_DELAY" -gt 0 ]; then
      sleep "$RETRY_DELAY"
    fi
    attempt=$((attempt + 1))
  done

  echo "ERROR: HTTP smoke failed after ${MAX_ATTEMPTS} attempts." >&2
  return "$status"
}

# Prefer the public HTTPS path parents use. If the hosting WAF returns a
# browser challenge to the GitHub runner, verify the same URL directly against
# the configured hosting origin instead of treating the challenge page as a
# successful application response.
if [ "${AHMV_HTTP_SMOKE_TARGET:-public}" = "origin" ]; then
  echo "Smoke target: production origin (diagnostic override)" >&2
  retry_smoke origin
else
  echo "Smoke target: public HTTPS endpoint" >&2

  set +e
  PUBLIC_OUTPUT="$(retry_smoke public)"
  PUBLIC_STATUS=$?
  set -e

  if [ "$PUBLIC_STATUS" -eq 0 ]; then
    printf '%s' "$PUBLIC_OUTPUT"
  elif [ "$PUBLIC_STATUS" -eq 90 ]; then
    echo "Smoke target: hosting origin after public WAF challenge" >&2
    retry_smoke origin
  else
    exit "$PUBLIC_STATUS"
  fi
fi
