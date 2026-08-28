# Production frontend deploy bundle (GHCR)

Self-contained **frontend** stack for the production host. No frontend git checkout required.

VITE_* values are already baked into the image at `build-push` time. Runtime only needs port (etc.) from the shared tmpfs env file.

## Layout on the server

```text
/opt/casino/
  deploy/                 # backend scripts/deploy (separate)
  deploy-frontend/        # copy of this directory (scripts/deploy/)
    deploy-docker-by-ghcr.sh
    load-env.sh
    docker-compose.yml
    README.md
/dev/shm/casino.env       # shared secrets (tmpfs — not on disk)
```

Do **not** copy this folder over `/opt/casino/deploy` (backend).

## One-time setup

1. Copy this folder to `/opt/casino/deploy-frontend`.
2. Load secrets into tmpfs (same file as backend):

```bash
ssh prod 'cd /opt/casino/deploy-frontend && CASINO_ENV_STDIN=1 bash load-env.sh' < ./secrets.env
```

3. Have a GitHub PAT with `read:packages`.

## Deploy

```bash
cd /opt/casino/deploy-frontend
bash deploy-docker-by-ghcr.sh
```

After reboot, re-run `load-env.sh` before deploy/`compose up`.

Optional:

| Variable | Default | Meaning |
|----------|---------|---------|
| `GHCR_IMAGE` | `ghcr.io/cr4all/casino-frontend` | Registry image |
| `GHCR_TAG` | `latest` | Tag to pull |
| `SHM_ENV_FILE` | `/dev/shm/casino.env` | tmpfs secrets |
| `CASINO_ENV_FILE` | | Copied into shm if set |
| `CASINO_ENV_STDIN` | `0` | `1` = read stdin into shm |
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
# reads VITE_* from env file on the build machine, builds, pushes to GHCR
```
