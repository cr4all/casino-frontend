#!/usr/bin/env bash
# Build casino-frontend Docker image (VITE_* baked from .env) and push to GHCR.
# Run on the build machine from the frontend repo root:
#   bash scripts/build-push-docker-image.sh
#
# Does not change scripts/deploy-docker.sh (dev plaintext local build).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GHCR_IMAGE="${GHCR_IMAGE:-ghcr.io/cr4all/casino-frontend}"
GHCR_USERNAME="${GHCR_USERNAME:-cr4all}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_REF="${GIT_REF:-main}"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"
SKIP_GIT_PULL="${SKIP_GIT_PULL:-0}"

ENV_FILE="${CASINO_ENV_FILE:-$ROOT/../.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_FILE="$ROOT/.env"
fi
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: env file not found. Expected $ROOT/../.env or set CASINO_ENV_FILE" >&2
  exit 1
fi

# Read KEY=VALUE from env file without sourcing the whole file (avoids shell injection).
env_get() {
  local key="$1"
  local default="${2:-}"
  local line value
  line="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n1 || true)"
  if [[ -z "$line" ]]; then
    echo "$default"
    return 0
  fi
  value="${line#*=}"
  value="${value%$'\r'}"
  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  echo "$value"
}

if [[ "$SKIP_GIT_PULL" != "1" ]]; then
  echo "Pulling ${GIT_REMOTE}/${GIT_REF}..."
  git pull --ff-only "$GIT_REMOTE" "$GIT_REF"
fi

SHORT_SHA="$(git rev-parse --short HEAD)"
FULL_SHA="$(git rev-parse HEAD)"
echo "Building from commit ${SHORT_SHA} (${FULL_SHA})"
echo "Using env file: $ENV_FILE"

VITE_API_URL="$(env_get VITE_API_URL 'http://localhost:8000/api/v1')"
VITE_TAWK_PROPERTY_ID="$(env_get VITE_TAWK_PROPERTY_ID '')"
VITE_TAWK_WIDGET_ID="$(env_get VITE_TAWK_WIDGET_ID '')"
VITE_REVERB_APP_KEY="$(env_get VITE_REVERB_APP_KEY '')"
VITE_REVERB_HOST="$(env_get VITE_REVERB_HOST 'localhost')"
VITE_REVERB_PORT="$(env_get VITE_REVERB_PORT '8080')"
VITE_REVERB_SCHEME="$(env_get VITE_REVERB_SCHEME 'http')"
VITE_TURNSTILE_SITE_KEY="$(env_get VITE_TURNSTILE_SITE_KEY '')"
VITE_SENTRY_DSN="$(env_get VITE_SENTRY_DSN '')"
VITE_SENTRY_ENVIRONMENT="$(env_get VITE_SENTRY_ENVIRONMENT 'production')"
VITE_SENTRY_TRACES_SAMPLE_RATE="$(env_get VITE_SENTRY_TRACES_SAMPLE_RATE '0.1')"
VITE_POSTHOG_KEY="$(env_get VITE_POSTHOG_KEY '')"
VITE_POSTHOG_HOST="$(env_get VITE_POSTHOG_HOST 'https://us.i.posthog.com')"

if [[ -z "${GHCR_TOKEN:-}" ]]; then
  read -r -s -p "GHCR_TOKEN (GitHub PAT with write:packages): " GHCR_TOKEN
  echo
fi
if [[ -z "${GHCR_TOKEN}" ]]; then
  echo "ERROR: GHCR_TOKEN is required to push to ghcr.io" >&2
  exit 1
fi

echo "Logging in to ghcr.io as ${GHCR_USERNAME}..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
unset GHCR_TOKEN

IMAGE_SHA="${GHCR_IMAGE}:${SHORT_SHA}"
IMAGE_LATEST="${GHCR_IMAGE}:latest"

echo "Building Docker image (${DOCKER_PLATFORM})..."
echo "  VITE_API_URL=${VITE_API_URL}"
echo "  VITE_REVERB_HOST=${VITE_REVERB_HOST} VITE_REVERB_PORT=${VITE_REVERB_PORT} VITE_REVERB_SCHEME=${VITE_REVERB_SCHEME}"

docker build \
  --platform "$DOCKER_PLATFORM" \
  -f Dockerfile \
  --build-arg "VITE_API_URL=${VITE_API_URL}" \
  --build-arg "VITE_TAWK_PROPERTY_ID=${VITE_TAWK_PROPERTY_ID}" \
  --build-arg "VITE_TAWK_WIDGET_ID=${VITE_TAWK_WIDGET_ID}" \
  --build-arg "VITE_REVERB_APP_KEY=${VITE_REVERB_APP_KEY}" \
  --build-arg "VITE_REVERB_HOST=${VITE_REVERB_HOST}" \
  --build-arg "VITE_REVERB_PORT=${VITE_REVERB_PORT}" \
  --build-arg "VITE_REVERB_SCHEME=${VITE_REVERB_SCHEME}" \
  --build-arg "VITE_TURNSTILE_SITE_KEY=${VITE_TURNSTILE_SITE_KEY}" \
  --build-arg "VITE_SENTRY_DSN=${VITE_SENTRY_DSN}" \
  --build-arg "VITE_SENTRY_ENVIRONMENT=${VITE_SENTRY_ENVIRONMENT}" \
  --build-arg "VITE_SENTRY_TRACES_SAMPLE_RATE=${VITE_SENTRY_TRACES_SAMPLE_RATE}" \
  --build-arg "VITE_POSTHOG_KEY=${VITE_POSTHOG_KEY}" \
  --build-arg "VITE_POSTHOG_HOST=${VITE_POSTHOG_HOST}" \
  -t "$IMAGE_SHA" \
  -t "$IMAGE_LATEST" \
  .

echo "Pushing ${IMAGE_SHA} ..."
docker push "$IMAGE_SHA"
echo "Pushing ${IMAGE_LATEST} ..."
docker push "$IMAGE_LATEST"

echo "Done. Pushed:"
echo "  ${IMAGE_SHA}"
echo "  ${IMAGE_LATEST}"
echo "Deploy on production with scripts/deploy/deploy-docker-by-ghcr.sh"
echo "  (copy scripts/deploy/ to /opt/casino/deploy-frontend — not the backend deploy/ folder)"
