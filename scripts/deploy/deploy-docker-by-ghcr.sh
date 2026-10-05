#!/usr/bin/env bash
# Deploy frontend from GHCR (no git pull, no image build).
# Copy this entire scripts/deploy/ directory to the production host, e.g.:
#   /opt/casino/deploy-frontend/
# Secrets: shared /dev/shm/casino.env (tmpfs) — same file as backend deploy.
# Do NOT overwrite /opt/casino/deploy (backend bundle).
#
# Usage:
#   BRANCH=main          bash deploy-docker-by-ghcr.sh   # pulls :main   tag
#   BRANCH=design-dark   bash deploy-docker-by-ghcr.sh   # pulls :design-dark tag
#   GHCR_TAG=abc1234     bash deploy-docker-by-ghcr.sh   # pull exact tag (overrides BRANCH)
#
# When deploying multiple designs simultaneously, also set FRONTEND_PORT per run:
#   BRANCH=design-dark FRONTEND_PORT=8002 bash deploy-docker-by-ghcr.sh
set -euo pipefail

DEPLOY_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_ROOT"

# shellcheck source=load-env.sh
source "${DEPLOY_ROOT}/load-env.sh"
ensure_casino_env

GHCR_IMAGE="${GHCR_IMAGE:-ghcr.io/cr4all/casino-frontend}"
GHCR_USERNAME="${GHCR_USERNAME:-cr4all}"

# Resolve GHCR_TAG from BRANCH if not set explicitly
if [[ -z "${GHCR_TAG:-}" ]]; then
  BRANCH="${BRANCH:-}"
  if [[ -z "$BRANCH" ]]; then
    read -r -p "Branch/design name to deploy (e.g. main, design-dark): " BRANCH
  fi
  if [[ -z "$BRANCH" ]]; then
    echo "ERROR: BRANCH is required (or set GHCR_TAG directly)" >&2
    exit 1
  fi
  # Sanitize to Docker-safe tag (same rule as build script)
  GHCR_TAG="$(echo "$BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9._-]/-/g')"
fi

LOCAL_IMAGE="${LOCAL_IMAGE:-casino-frontend:${GHCR_TAG}}"
# Container name includes the branch/tag so multiple designs can coexist
CONTAINER_NAME="${FRONTEND_CONTAINER_NAME:-casino_prod_frontend_${GHCR_TAG//-/_}}"

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

echo "Starting frontend (container: ${CONTAINER_NAME})..."
export FRONTEND_IMAGE="$LOCAL_IMAGE"
export FRONTEND_CONTAINER_NAME="$CONTAINER_NAME"
"${COMPOSE[@]}" up -d

echo "Deploy complete (image ${REMOTE_IMAGE} → ${LOCAL_IMAGE}, container ${CONTAINER_NAME})."
echo "Secrets remain in $ENV_FILE only (tmpfs). Re-run load-env.sh after reboot."
"${COMPOSE[@]}" ps
