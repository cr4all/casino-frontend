# Production frontend deploy bundle (GHCR)

Self-contained **frontend** stack for the production host. No frontend git checkout required.

VITE_* values are already baked into the image at `build-push` time. This host only needs `FRONTEND_PORT` (and related host nginx) from `.env`.

## Layout on the server

```text
/opt/casino/
  .env                    # shared secrets / ports
  deploy/                 # backend scripts/deploy (separate)
  deploy-frontend/        # copy of this directory (scripts/deploy/)
    deploy-docker-by-ghcr.sh
    docker-compose.yml
    README.md
```

Do **not** copy this folder over `/opt/casino/deploy` (backend).

## One-time setup

1. Copy this folder to `/opt/casino/deploy-frontend`.
2. Ensure `/opt/casino/.env` exists (at least `FRONTEND_PORT=8001`).
3. Have a GitHub PAT with `read:packages`.

## Deploy

```bash
cd /opt/casino/deploy-frontend
bash deploy-docker-by-ghcr.sh
# prompts for GHCR_TOKEN, logs in as cr4all, pulls ghcr.io/cr4all/casino-frontend:latest
```

Optional:

| Variable | Default | Meaning |
|----------|---------|---------|
| `GHCR_IMAGE` | `ghcr.io/cr4all/casino-frontend` | Registry image |
| `GHCR_TAG` | `latest` | Tag to pull |
| `CASINO_ENV_FILE` | `../.env` | Env file for port interpolation |
| `GHCR_USERNAME` | `cr4all` | ghcr.io login user |
| `GHCR_TOKEN` | (prompted) | GitHub PAT |

Rollback:

```bash
GHCR_TAG=<short-sha> bash deploy-docker-by-ghcr.sh
```

## Build / push (dev server)

From the `casino-frontend` git checkout (after testing with `scripts/deploy-docker.sh`):

```bash
bash scripts/build-push-docker-image.sh
# reads VITE_* from /opt/casino/.env (or ../.env), builds, pushes to GHCR
```
