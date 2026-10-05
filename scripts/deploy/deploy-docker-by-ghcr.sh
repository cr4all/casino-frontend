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

# Always key the local tag off this design. A shared casino.env must not
# set one LOCAL_IMAGE for every deploy — `docker tag` would move that name
# onto the image just pulled (e.g. drop casino-frontend:main).
LOCAL_IMAGE="casino-frontend:${GHCR_TAG}"
# Container name includes the branch/tag so multiple designs can coexist
TAG_SLUG="${GHCR_TAG//./_}"
TAG_SLUG="${TAG_SLUG//-/_}"
CONTAINER_NAME="${FRONTEND_CONTAINER_NAME:-casino_prod_frontend_${TAG_SLUG}}"
# One Compose project per design. A shared project name makes `up` delete
# the other design's container.
COMPOSE_PROJECT_NAME="casino-frontend-${GHCR_TAG//./-}"
if [[ -z "${FRONTEND_PORT:-}" ]]; then
  line="$(grep -E '^FRONTEND_PORT=' "$ENV_FILE" 2>/dev/null | tail -n1 || true)"
  FRONTEND_PORT="${line#FRONTEND_PORT=}"
  FRONTEND_PORT="${FRONTEND_PORT%$'\r'}"
fi
FRONTEND_PORT="${FRONTEND_PORT:-8001}"

COMPOSE_FILE="${DEPLOY_ROOT}/docker-compose.yml"
COMPOSE=(docker compose -p "$COMPOSE_PROJECT_NAME" -f "$COMPOSE_FILE" --env-file "$ENV_FILE")

PORT_HOLDER="$(docker ps --filter "publish=${FRONTEND_PORT}" --format '{{.Names}}' | head -n1 || true)"
if [[ -n "$PORT_HOLDER" && "$PORT_HOLDER" != "$CONTAINER_NAME" ]]; then
  echo "ERROR: host port ${FRONTEND_PORT} is already used by container ${PORT_HOLDER}." >&2
  echo "Set a different FRONTEND_PORT for this design, e.g. FRONTEND_PORT=8002." >&2
  exit 1
fi

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

# Same container name left behind by the old shared project (casino-frontend-prod)
# blocks the new per-design project. Remove it only when it is not this project.
EXISTING_PROJECT="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$CONTAINER_NAME" 2>/dev/null || true)"
if [[ -n "$EXISTING_PROJECT" && "$EXISTING_PROJECT" != "$COMPOSE_PROJECT_NAME" ]]; then
  echo "Removing ${CONTAINER_NAME} from previous compose project ${EXISTING_PROJECT}..."
  docker rm -f "$CONTAINER_NAME"
fi

echo "Starting frontend (project: ${COMPOSE_PROJECT_NAME}, container: ${CONTAINER_NAME}, port: ${FRONTEND_PORT})..."
export FRONTEND_IMAGE="$LOCAL_IMAGE"
export FRONTEND_CONTAINER_NAME="$CONTAINER_NAME"
export FRONTEND_PORT
"${COMPOSE[@]}" up -d

echo "Deploy complete (image ${REMOTE_IMAGE} → ${LOCAL_IMAGE}, container ${CONTAINER_NAME})."
echo "Other designs are left running. Stop only this one with:"
echo "  docker compose -p ${COMPOSE_PROJECT_NAME} -f ${COMPOSE_FILE} down"
echo "Secrets remain in $ENV_FILE only (tmpfs). Re-run load-env.sh after reboot."
"${COMPOSE[@]}" ps
