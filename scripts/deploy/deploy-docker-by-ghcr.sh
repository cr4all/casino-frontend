#!/usr/bin/env bash
# Deploy frontend from GHCR (no git pull, no image build).
# Copy this entire scripts/deploy/ directory to the production host, e.g.:
#   /opt/casino/deploy-frontend/
# Secrets: shared /dev/shm/casino.env (tmpfs) — same file as backend deploy.
# Do NOT overwrite /opt/casino/deploy (backend bundle).
# Run: bash deploy-docker-by-ghcr.sh
set -euo pipefail

DEPLOY_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_ROOT"

# shellcheck source=load-env.sh
source "${DEPLOY_ROOT}/load-env.sh"
ensure_casino_env

GHCR_IMAGE="${GHCR_IMAGE:-ghcr.io/cr4all/casino-frontend}"
GHCR_TAG="${GHCR_TAG:-latest}"
LOCAL_IMAGE="${LOCAL_IMAGE:-casino-frontend:latest}"
GHCR_USERNAME="${GHCR_USERNAME:-cr4all}"

COMPOSE_FILE="${DEPLOY_ROOT}/docker-compose.yml"
COMPOSE=(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE")

if [[ -z "${GHCR_TOKEN:-}" ]]; then
  read -r -s -p "GHCR_TOKEN (GitHub PAT with read:packages): " GHCR_TOKEN
  echo
fi
if [[ -z "${GHCR_TOKEN}" ]]; then
  echo "ERROR: GHCR_TOKEN is required to pull from ghcr.io" >&2
  exit 1
fi

echo "Logging in to ghcr.io as ${GHCR_USERNAME}..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
unset GHCR_TOKEN

REMOTE_IMAGE="${GHCR_IMAGE}:${GHCR_TAG}"
echo "Pulling ${REMOTE_IMAGE}..."
docker pull "$REMOTE_IMAGE"

echo "Tagging as ${LOCAL_IMAGE}..."
docker tag "$REMOTE_IMAGE" "$LOCAL_IMAGE"

echo "Starting frontend..."
"${COMPOSE[@]}" up -d

echo "Deploy complete (image ${REMOTE_IMAGE} → ${LOCAL_IMAGE})."
echo "Secrets remain in $ENV_FILE only (tmpfs). Re-run load-env.sh after reboot."
"${COMPOSE[@]}" ps
