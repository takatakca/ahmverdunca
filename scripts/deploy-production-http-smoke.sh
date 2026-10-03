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

public_curl_once() {
  curl --fail --silent --show-error --location \
    --connect-timeout 15 --max-time 30 \
    --user-agent "$USER_AGENT" \
    --header 'Cache-Control: no-cache' \
    "${curl_action[@]}" \
    "$URL"
}

origin_curl_once() {
  command -v ahmv-ssh >/dev/null 2>&1 || {
    echo "ERROR: ahmv-ssh helper is unavailable for origin smoke." >&2
    return 1
  }

  local remote_action=""
  case "$MODE" in
    body) ;;
    headers) remote_action="-D - -o /dev/null" ;;
    status) remote_action="-o /dev/null" ;;
  esac

  # The cPanel/Passenger loopback origin can present the hosting certificate
  # rather than the public ahmverdun.ca certificate. This request never leaves
  # the server: --resolve pins the hostname to 127.0.0.1. TLS verification for
  # the public site remains a separate concern; this probe validates that the
  # just-activated Passenger application answers with the expected content.
  ahmv-ssh "curl --insecure --fail --silent --show-error --location --connect-timeout 10 --max-time 30 --resolve 'ahmverdun.ca:443:127.0.0.1' --user-agent '$USER_AGENT' --header 'Cache-Control: no-cache' $remote_action '$URL'"
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

    echo "HTTP smoke attempt ${attempt} failed with exit code ${status}." >&2
    if [ "$attempt" -lt "$MAX_ATTEMPTS" ] && [ "$RETRY_DELAY" -gt 0 ]; then
      sleep "$RETRY_DELAY"
    fi
    attempt=$((attempt + 1))
  done

  echo "ERROR: HTTP smoke failed after ${MAX_ATTEMPTS} attempts." >&2
  return "$status"
}

if [ "${AHMV_DEPLOY_TRANSPORT:-}" = "ssh" ]; then
  echo "Smoke target: production origin over SSH" >&2
  retry_smoke origin
else
  echo "Smoke target: public HTTPS endpoint" >&2
  retry_smoke public
fi
