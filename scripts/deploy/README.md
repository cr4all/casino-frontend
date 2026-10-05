# Production frontend deploy bundle (GHCR)

Self-contained **frontend** stack for the production host. No frontend git checkout required.

VITE_* values are already baked into the image at `build-push` time. Runtime only needs port (etc.) from the shared tmpfs env file.

---

## Per-branch (design) image strategy

Each design branch is published as an independent Docker image tag.

| Branch | GHCR tags | `:latest`? |
|--------|-----------|-----------|
| `main` | `:main` + `:<sha>` | ✅ also pushed as `:latest` |
| `design-dark` | `:design-dark` + `:<sha>` | ❌ |
| `feature/new-ui` | `:feature-new-ui` + `:<sha>` | ❌ |

> Branch names are automatically normalised to lowercase with `/`, uppercase letters, and special characters replaced by `-`.
> `:latest` always points to the most recent build of the `main` branch.

---

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

---

## One-time setup

1. Copy this folder to `/opt/casino/deploy-frontend`.
2. Load secrets into tmpfs (same file as backend):

```bash
ssh prod 'cd /opt/casino/deploy-frontend && CASINO_ENV_STDIN=1 bash load-env.sh' < ./secrets.env
```

3. Have a GitHub PAT with `read:packages`.

---

## Build / push (build machine)

Run from the `casino-frontend` git checkout.

```bash
# Build main branch → pushes 3 tags: :main + :<sha> + :latest
GIT_REF=main bash scripts/build-push-docker-image.sh

# Build a design branch → pushes 2 tags: :design-dark + :<sha>
GIT_REF=design-dark bash scripts/build-push-docker-image.sh
```

Omitting `GIT_REF` defaults to `main`.

---

## Deploy (production server)

### Default — deploy main (latest)

```bash
cd /opt/casino/deploy-frontend
BRANCH=main bash deploy-docker-by-ghcr.sh
```

Container name: `casino_prod_frontend_main`

### Deploy a specific design branch

```bash
BRANCH=design-dark bash deploy-docker-by-ghcr.sh
```

Container name: `casino_prod_frontend_design_dark`

### Run multiple designs side-by-side (separate ports)

Each design is its own Compose project (`casino-frontend-<tag>`). Deploying one does not stop or remove the others. Give each design its own host port — two containers cannot bind the same port.

```bash
# First design — port 8001
BRANCH=main FRONTEND_PORT=8001 bash deploy-docker-by-ghcr.sh

# Second design — port 8002
BRANCH=youwin24 FRONTEND_PORT=8002 bash deploy-docker-by-ghcr.sh
```

Stop only one design:

```bash
docker compose -p casino-frontend-youwin24 -f docker-compose.yml down
```

### Rollback to a specific SHA

```bash
GHCR_TAG=<short-sha> bash deploy-docker-by-ghcr.sh
```

After reboot, re-run `load-env.sh` before `compose up`.

---

## Environment variable reference

### deploy-docker-by-ghcr.sh

| Variable | Default | Meaning |
|----------|---------|---------|
| `BRANCH` | (interactive prompt) | Branch / design name to deploy |
| `GHCR_TAG` | normalised `BRANCH` value | Set directly to override `BRANCH` |
| `GHCR_IMAGE` | `ghcr.io/cr4all/casino-frontend` | Registry image path |
| `FRONTEND_PORT` | `8001` | Host port |
| `FRONTEND_CONTAINER_NAME` | `casino_prod_frontend_<tag>` | Override container name manually |
| `COMPOSE_PROJECT_NAME` | `casino-frontend-<tag>` | Set by the script; one project per design |
| `SHM_ENV_FILE` | `/dev/shm/casino.env` | tmpfs secrets path |
| `CASINO_ENV_FILE` | | Env file to copy into shm |
| `CASINO_ENV_STDIN` | `0` | `1` = read stdin into shm |
| `GHCR_USERNAME` | `cr4all` | ghcr.io login user |
| `GHCR_TOKEN` | (prompted) | GitHub PAT (`read:packages`) |

### build-push-docker-image.sh

| Variable | Default | Meaning |
|----------|---------|---------|
| `GIT_REF` | `main` | Branch to build (used as image tag) |
| `GHCR_IMAGE` | `ghcr.io/cr4all/casino-frontend` | Registry image path |
| `GHCR_USERNAME` | `cr4all` | ghcr.io login user |
| `GHCR_TOKEN` | (prompted) | GitHub PAT (`write:packages`) |
| `GIT_REMOTE` | `origin` | Git remote name |
| `DOCKER_PLATFORM` | `linux/amd64` | Build platform |
| `SKIP_GIT_PULL` | `0` | `1` = skip git pull before build |
| `CASINO_ENV_FILE` | `../.env` | Env file to read VITE_* values from |
