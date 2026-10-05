#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-}"
: "${AHMV_APP_ROOT:?AHMV_APP_ROOT is required}"

if [[ ! "$AHMV_APP_ROOT" =~ ^/[A-Za-z0-9._/-]+$ ]]; then
  echo "ERROR: AHMV_APP_ROOT contains unsupported characters for SFTP batch mode." >&2
  exit 1
fi

sftp_batch() {
  : "${RUNNER_TEMP:?RUNNER_TEMP is required}"
  local batch
  batch="$(mktemp "${RUNNER_TEMP}/ahmv-sftp-batch.XXXXXX")"
  cat > "$batch"

  local max_attempts="${AHMV_SFTP_MAX_ATTEMPTS:-5}"
  local attempt=1
  local last_status=255

  while [ "$attempt" -le "$max_attempts" ]; do
    echo "SFTP batch attempt ${attempt}/${max_attempts}..." >&2

    set +e
    sftp -q -b "$batch" ahmv-production 1>&2
    last_status=$?
    set -e

    if [ "$last_status" -eq 0 ]; then
      rm -f "$batch"
      return 0
    fi

    echo "SFTP batch attempt ${attempt} failed with exit code ${last_status}." >&2

    if [ "$attempt" -lt "$max_attempts" ]; then
      local delay=$((attempt * 10))
      if [ "$delay" -gt 45 ]; then delay=45; fi
      echo "Transient SFTP failure detected. Waiting ${delay} seconds..." >&2
      sleep "$delay"
    fi

    attempt=$((attempt + 1))
  done

  rm -f "$batch"
  echo "SFTP batch failed after ${max_attempts} attempts." >&2
  return "$last_status"
}

require_release() {
  : "${RELEASE_KEY:?RELEASE_KEY is required}"
  : "${RELEASE_SHA:?RELEASE_SHA is required}"
  [[ "$RELEASE_KEY" =~ ^[A-Za-z0-9._-]+$ ]] || {
    echo "ERROR: RELEASE_KEY contains unsupported characters." >&2
    exit 1
  }
  [[ "$RELEASE_SHA" =~ ^[0-9a-fA-F]{40}$ ]] || {
    echo "ERROR: RELEASE_SHA must be a 40-character Git SHA." >&2
    exit 1
  }
}

case "$ACTION" in
  test)
    printf 'pwd\nquit\n' | sftp_batch
    ;;

  capture-previous)
    : "${RUNNER_TEMP:?RUNNER_TEMP is required}"
    marker="$RUNNER_TEMP/ahmv-previous-release-key"
    rm -f "$marker"

    printf -- '-get "%s/current/RELEASE_KEY" "%s"\nquit\n' "$AHMV_APP_ROOT" "$marker" |
      sftp_batch

    if [ -s "$marker" ]; then
      tr -d '\r\n' < "$marker"
    fi
    ;;

  prepare)
    require_release
    printf -- '-mkdir "%s/releases"\n-mkdir "%s/releases/%s"\nquit\n'       "$AHMV_APP_ROOT" "$AHMV_APP_ROOT" "$RELEASE_KEY" |
      sftp_batch
    ;;

  upload)
    require_release
    test -d .output
    test -f .output/RELEASE_SHA
    test -f .output/RELEASE_KEY

    printf -- 'lcd ".output"\nput -r * "%s/releases/%s/"\nquit\n'       "$AHMV_APP_ROOT" "$RELEASE_KEY" |
      sftp_batch
    ;;

  verify-upload)
    require_release
    : "${RUNNER_TEMP:?RUNNER_TEMP is required}"
    sha_file="$RUNNER_TEMP/ahmv-uploaded-release-sha"
    key_file="$RUNNER_TEMP/ahmv-uploaded-release-key"
    rm -f "$sha_file" "$key_file"

    printf -- 'get "%s/releases/%s/RELEASE_SHA" "%s"\nget "%s/releases/%s/RELEASE_KEY" "%s"\nquit\n'       "$AHMV_APP_ROOT" "$RELEASE_KEY" "$sha_file"       "$AHMV_APP_ROOT" "$RELEASE_KEY" "$key_file" |
      sftp_batch

    remote_sha="$(tr -d '\r\n' < "$sha_file")"
    remote_key="$(tr -d '\r\n' < "$key_file")"

    [ "$remote_sha" = "$RELEASE_SHA" ] || {
      echo "ERROR: SFTP uploaded release SHA mismatch." >&2
      exit 1
    }
    [ "$remote_key" = "$RELEASE_KEY" ] || {
      echo "ERROR: SFTP uploaded release key mismatch." >&2
      exit 1
    }
    ;;

  activate)
    require_release

    printf -- '-rm "%s/current.new"\nln -s "%s/releases/%s" "%s/current.new"\nrename "%s/current.new" "%s/current"\nquit\n'       "$AHMV_APP_ROOT"       "$AHMV_APP_ROOT" "$RELEASE_KEY" "$AHMV_APP_ROOT"       "$AHMV_APP_ROOT" "$AHMV_APP_ROOT" |
      sftp_batch
    ;;

  verify-active)
    require_release
    : "${RUNNER_TEMP:?RUNNER_TEMP is required}"
    sha_file="$RUNNER_TEMP/ahmv-active-release-sha"
    key_file="$RUNNER_TEMP/ahmv-active-release-key"
    rm -f "$sha_file" "$key_file"

    printf -- 'get "%s/current/RELEASE_SHA" "%s"\nget "%s/current/RELEASE_KEY" "%s"\nquit\n'       "$AHMV_APP_ROOT" "$sha_file"       "$AHMV_APP_ROOT" "$key_file" |
      sftp_batch

    active_sha="$(tr -d '\r\n' < "$sha_file")"
    active_key="$(tr -d '\r\n' < "$key_file")"

    [ "$active_sha" = "$RELEASE_SHA" ] || {
      echo "ERROR: SFTP active release SHA mismatch." >&2
      exit 1
    }
    [ "$active_key" = "$RELEASE_KEY" ] || {
      echo "ERROR: SFTP active release key mismatch." >&2
      exit 1
    }
    ;;

  restart)
    : "${RUNNER_TEMP:?RUNNER_TEMP is required}"
    marker="$RUNNER_TEMP/ahmv-passenger-restart.txt"
    printf '%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$marker"

    printf -- '-mkdir "%s/current/tmp"\nput "%s" "%s/current/tmp/restart.txt"\nquit\n'       "$AHMV_APP_ROOT" "$marker" "$AHMV_APP_ROOT" |
      sftp_batch
    ;;

  rollback)
    : "${PREVIOUS_RELEASE_KEY:?PREVIOUS_RELEASE_KEY is required for SFTP rollback}"
    [[ "$PREVIOUS_RELEASE_KEY" =~ ^[A-Za-z0-9._-]+$ ]] || {
      echo "ERROR: PREVIOUS_RELEASE_KEY contains unsupported characters." >&2
      exit 1
    }

    printf -- '-rm "%s/current.rollback.new"\nln -s "%s/releases/%s" "%s/current.rollback.new"\nrename "%s/current.rollback.new" "%s/current"\nquit\n'       "$AHMV_APP_ROOT"       "$AHMV_APP_ROOT" "$PREVIOUS_RELEASE_KEY" "$AHMV_APP_ROOT"       "$AHMV_APP_ROOT" "$AHMV_APP_ROOT" |
      sftp_batch

    "$0" restart
    ;;

  *)
    echo "Usage: $0 {test|capture-previous|prepare|upload|verify-upload|activate|verify-active|restart|rollback}" >&2
    exit 2
    ;;
esac
