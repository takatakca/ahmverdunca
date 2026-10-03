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
USER_AGENT="AHMV-Deploy-Smoke/1.0"

public_curl() {
  case "$MODE" in
    body)
      curl --fail --silent --show-error --location \
        --connect-timeout 15 --max-time 30 \
        --retry 8 --retry-delay 3 --retry-all-errors \
        --user-agent "$USER_AGENT" \
        --header 'Cache-Control: no-cache' \
        "$URL"
      ;;
    headers)
      curl --fail --silent --show-error --location \
        --connect-timeout 15 --max-time 30 \
        --retry 8 --retry-delay 3 --retry-all-errors \
        --user-agent "$USER_AGENT" \
        --header 'Cache-Control: no-cache' \
        -D - -o /dev/null "$URL"
      ;;
    status)
      curl --fail --silent --show-error --location \
        --connect-timeout 15 --max-time 30 \
        --retry 8 --retry-delay 3 --retry-all-errors \
        --user-agent "$USER_AGENT" \
        --header 'Cache-Control: no-cache' \
        -o /dev/null "$URL"
      ;;
  esac
}

origin_curl() {
  command -v ahmv-ssh >/dev/null 2>&1 || {
    echo "ERROR: ahmv-ssh helper is unavailable for origin smoke." >&2
    exit 1
  }

  local curl_action
  case "$MODE" in
    body) curl_action="" ;;
    headers) curl_action="-D - -o /dev/null" ;;
    status) curl_action="-o /dev/null" ;;
  esac

  ahmv-ssh "curl --fail --silent --show-error --location --connect-timeout 10 --max-time 30 --retry 5 --retry-delay 2 --retry-all-errors --resolve 'ahmverdun.ca:443:127.0.0.1' --user-agent '$USER_AGENT' --header 'Cache-Control: no-cache' $curl_action '$URL'"
}

if [ "${AHMV_DEPLOY_TRANSPORT:-}" = "ssh" ]; then
  echo "Smoke target: production origin over SSH" >&2
  origin_curl
else
  echo "Smoke target: public HTTPS endpoint" >&2
  public_curl
fi
