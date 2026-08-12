#!/usr/bin/env bash
# Ensure production secrets live only in tmpfs: /dev/shm/casino.env
# Sourced by deploy-docker-by-ghcr.sh or run standalone after reboot:
#   bash load-env.sh
#   CASINO_ENV_STDIN=1 bash load-env.sh < secrets.env
set -euo pipefail

SHM_ENV_FILE="${SHM_ENV_FILE:-/dev/shm/casino.env}"

write_shm_env_from_stdin() {
  local tmp
  tmp="$(mktemp -p /dev/shm casino.env.XXXXXX)"
  cat >"$tmp"
  if [[ ! -s "$tmp" ]]; then
    rm -f "$tmp"
    echo "ERROR: empty env content" >&2
    return 1
  fi
  mv -f "$tmp" "$SHM_ENV_FILE"
  chmod 600 "$SHM_ENV_FILE"
}

ensure_casino_env() {
  if [[ -n "${CASINO_ENV_FILE:-}" ]]; then
    if [[ ! -f "$CASINO_ENV_FILE" ]]; then
      echo "ERROR: CASINO_ENV_FILE not found: $CASINO_ENV_FILE" >&2
      return 1
    fi
    if [[ "$CASINO_ENV_FILE" != "$SHM_ENV_FILE" ]]; then
      echo "Copying $CASINO_ENV_FILE → $SHM_ENV_FILE ..."
      cp "$CASINO_ENV_FILE" "$SHM_ENV_FILE"
      chmod 600 "$SHM_ENV_FILE"
    fi
  elif [[ -f "$SHM_ENV_FILE" && -s "$SHM_ENV_FILE" ]]; then
    echo "Using existing $SHM_ENV_FILE"
  elif [[ "${CASINO_ENV_STDIN:-0}" == "1" ]]; then
    echo "Reading env from stdin → $SHM_ENV_FILE ..."
    write_shm_env_from_stdin
  elif [[ -t 0 ]]; then
    echo "No persistent disk .env. Paste env contents, then Ctrl-D:"
    write_shm_env_from_stdin
  else
    echo "ERROR: no secrets available." >&2
    echo "  Provide stdin (CASINO_ENV_STDIN=1), set CASINO_ENV_FILE, or run interactively." >&2
    echo "  Example: ssh prod 'cd /opt/casino/deploy && CASINO_ENV_STDIN=1 bash load-env.sh' < secrets.env" >&2
    return 1
  fi

  if [[ ! -f "$SHM_ENV_FILE" || ! -s "$SHM_ENV_FILE" ]]; then
    echo "ERROR: $SHM_ENV_FILE missing or empty" >&2
    return 1
  fi
  chmod 600 "$SHM_ENV_FILE" 2>/dev/null || true
  export ENV_FILE="$SHM_ENV_FILE"
  echo "ENV_FILE=$ENV_FILE (tmpfs — cleared on reboot)"
}

# When executed (not sourced), run ensure and exit.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  ensure_casino_env
fi
