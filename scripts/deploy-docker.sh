#!/usr/bin/env bash
# Casino Frontend — production Docker deploy
# Run on server: bash scripts/deploy-docker.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="../casino-backend/docker/docker-compose.prod.yml"

ENV_FILE="${CASINO_ENV_FILE:-$ROOT/../.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  ENV_FILE="$ROOT/../casino-backend/.env"
fi

COMPOSE=(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE")

echo "Pulling latest code..."
git pull origin main

echo "Building frontend image..."
"${COMPOSE[@]}" build frontend

echo "Starting frontend..."
"${COMPOSE[@]}" up -d frontend

echo "Deploy complete."
"${COMPOSE[@]}" ps frontend
