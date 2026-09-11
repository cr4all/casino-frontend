# Provider images moved

Game thumbnails and provider logos now live in `casino-assets/storage/providers`.

1. Run `cd casino-assets && npm run import:frontend` only if you still have a backup of this folder.
2. Serve images from casino-assets (default `http://localhost:8090/providers/...`).
3. Set `VITE_ASSETS_BASE_URL` in the frontend env.

Sync scripts (`npm run sync:*-thumbs`) write directly into `casino-assets/storage/providers`.
