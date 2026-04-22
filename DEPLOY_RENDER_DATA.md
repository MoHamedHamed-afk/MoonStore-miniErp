# Render Data Deployment Path

This project currently stores important live data in two places:

- `Backend/ShopApi/shop.db`
- `Backend/ShopApi/wwwroot/uploads`

That means a safe deployment must preserve both the SQLite database and uploaded product images.

## Recommended short-term deployment path

Use Render with a persistent disk first.

Why this is the safest path for the current data:

- it lets you keep the existing SQLite data
- it lets you keep the current uploaded images
- it avoids doing a full SQLite-to-Postgres migration before launch

## Important Render behavior

Render services use an ephemeral filesystem by default, so file changes are lost on redeploy/restart unless you attach a persistent disk. Render documents this here:

- https://render.com/docs/disks
- https://render.com/docs/deploys

Render also notes that attaching a persistent disk disables zero-downtime deploys and limits the service to a single instance. That is acceptable for a first launch, but not ideal long-term.

## Code support already added

The backend now supports these environment variables:

- `APP_DATA_ROOT`
- `SQLITE_PATH`
- `UPLOADS_PATH`
- `FRONTEND_URL`

If `APP_DATA_ROOT` is set, the backend can store:

- SQLite at `APP_DATA_ROOT/shop.db`
- uploads at `APP_DATA_ROOT/uploads`

## Safe launch plan

1. Back up the current local data.

   Run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\backup-shop-data.ps1
   ```

2. Create a Render web service for the backend.

3. Attach a persistent disk to the backend service.

   Suggested mount path:

   ```text
   /var/data
   ```

4. Set backend environment variables in Render:

   ```text
   APP_DATA_ROOT=/var/data
   FRONTEND_URL=https://your-frontend-domain
   Jwt__Key=your-production-jwt-secret
   Jwt__Issuer=ShopApi
   Jwt__Audience=ShopApp
   ```

5. Copy the current local SQLite database to the Render persistent disk.

   You need:

   - `shop.db`
   - and, if present at the moment of copying, `shop.db-wal` and `shop.db-shm`

   The safest method is:

   - stop the local backend first
   - use the backup created by `backup-shop-data.ps1`
   - transfer those files to `/var/data`

6. Copy uploaded images to the Render persistent disk.

   Transfer the contents of:

   ```text
   Backend/ShopApi/wwwroot/uploads
   ```

   to:

   ```text
   /var/data/uploads
   ```

7. Deploy the backend.

8. Verify these URLs work:

   - `/api/products`
   - `/api/auth/login`
   - uploaded image URLs under `/uploads/...`

9. Deploy the frontend only after `src/environments/environment.production.ts` is updated to the real Render backend URL.

## Long-term recommended path

After first launch, move to Render Postgres.

Why:

- better production durability
- safer scaling path
- avoids SQLite single-disk limitations
- better long-term ERP growth

Render Postgres docs:

- https://render.com/docs/postgresql

## Honest recommendation

For the current project state:

- safest first production launch: `Render backend + persistent disk + current SQLite/uploads`
- best long-term production architecture: `Render backend + Render Postgres + object/persistent image storage`

## Before final deployment

Still needed outside this file:

- set the real Render backend URL in `environment.production.ts`
- production frontend domain must be added in backend config
- production secrets must be set in Render
