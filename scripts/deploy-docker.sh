#!/usr/bin/env bash
# Casino Frontend — production Docker deploy
# Run on server: bash scripts/deploy-docker.sh
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE_FILE="../casino-backend/docker/docker-compose.prod.yml"

echo "Pulling latest code..."
git pull origin main

echo "Building frontend image..."
docker compose -f "$COMPOSE_FILE" build frontend

echo "Starting frontend..."
docker compose -f "$COMPOSE_FILE" up -d frontend

echo "Deploy complete."
docker compose -f "$COMPOSE_FILE" ps frontend
