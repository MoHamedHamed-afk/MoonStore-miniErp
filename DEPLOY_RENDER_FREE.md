# Render Free Demo Deployment

This guide converts the backend to a zero-cost Render Web Service demo.

## What Changes

- Uses Render `Free` instance type.
- Removes the persistent disk.
- Stores SQLite and uploads in `/tmp/moonstore-data`.
- Data is ephemeral and can be lost after redeploy, restart, or idle spin-down.

## Render Service Config

Use the repository `render.yaml`:

```yaml
services:
  - type: web
    name: moonstore-backend
    runtime: docker
    plan: free
    rootDir: Backend/ShopApi
    healthCheckPath: /health
    envVars:
      - key: APP_DATA_ROOT
        value: /tmp/moonstore-data
      - key: SQLITE_PATH
        value: /tmp/moonstore-data/shop.db
      - key: UPLOADS_PATH
        value: /tmp/moonstore-data/uploads
      - key: Cloudinary__CloudName
        sync: false
      - key: Cloudinary__ApiKey
        sync: false
      - key: Cloudinary__ApiSecret
        sync: false
      - key: Cloudinary__Folder
        value: moon-store/products
      - key: FRONTEND_URL
        sync: false
      - key: FRONTEND_URLS
        sync: false
      - key: Jwt__Key
        sync: false
      - key: Jwt__Issuer
        value: ShopApi
      - key: Jwt__Audience
        value: ShopApp
```

## Create The Free Service

1. Push this repository to GitHub.
2. Open Render Dashboard.
3. Delete or downgrade the old paid backend service only after confirming you no longer need its disk data.
4. Click `New` > `Blueprint`.
5. Connect `https://github.com/MoHamedHamed-afk/MoonStore-miniErp`.
6. Render should detect `render.yaml`.
7. Confirm the service plan is `Free`.
8. Confirm there is no disk listed.
9. Add environment variable values.
10. Deploy.

## Required Environment Variables

Set these in Render:

```text
Jwt__Key=<generate-a-long-random-secret>
FRONTEND_URL=https://<your-cloudflare-pages-domain>
FRONTEND_URLS=https://<your-cloudflare-pages-domain>,http://localhost:3000,http://localhost:4200
Jwt__Issuer=ShopApi
Jwt__Audience=ShopApp
APP_DATA_ROOT=/tmp/moonstore-data
SQLITE_PATH=/tmp/moonstore-data/shop.db
UPLOADS_PATH=/tmp/moonstore-data/uploads
Cloudinary__CloudName=<your-cloudinary-cloud-name>
Cloudinary__ApiKey=<your-cloudinary-api-key>
Cloudinary__ApiSecret=<your-cloudinary-api-secret>
Cloudinary__Folder=moon-store/products
```

Do not set `DATABASE_URL` unless you migrate to PostgreSQL.

Cloudinary is recommended for the demo because Render Free storage is ephemeral. If the Cloudinary variables are missing, the backend falls back to local `/uploads`, but those local files can disappear after a Render restart/redeploy.

## SQLite On Render Free

SQLite will work for a demo, but it is not persistent on Render Free.

Expected behavior:

- Products/users/orders are recreated by migrations and seeding when the app starts.
- New signups, carts, favorites, orders, moderator changes, product edits, and uploaded images can disappear after restart/redeploy/spin-down.
- Uploaded images stored in `/tmp/moonstore-data/uploads` are temporary unless Cloudinary is configured.

Best practices:

- Treat SQLite on Free as demo-only.
- Keep seed data realistic enough for client demos.
- Do not promise persistent customer data on Free.
- Configure Cloudinary for admin product uploads that must survive restarts.
- Keep fallback product images in the frontend assets or an external image host if Cloudinary is not configured.

## Free Persistent Database Alternatives

Recommended free external databases:

- Supabase Postgres: good dashboard, auth/storage options, generous free tier.
- Neon Postgres: serverless Postgres, good for demos and simple production-like setups.

Migration outline from SQLite to Postgres:

1. Create a free Supabase or Neon project.
2. Copy its Postgres connection string.
3. In Render, set `DATABASE_URL=<postgres-connection-string>`.
4. Keep `Jwt__Key`, `FRONTEND_URL`, and `FRONTEND_URLS`.
5. Redeploy the backend.
6. The app will use `UseNpgsql(...)` automatically when `DATABASE_URL` starts with `postgres`.
7. Run/allow EF migrations on startup.
8. Export old SQLite data if needed and import it into Postgres with a migration script.

For a demo with real persistence, Supabase/Neon is better than SQLite on Render Free.

## API Verification

After deploy:

```text
https://<render-service>.onrender.com/health
https://<render-service>.onrender.com/api/products
```

Expected:

- `/health` returns `{ "status": "ok" }`.
- `/api/products` returns seeded products or current demo products.
- Login/register should work, but data may reset later if using SQLite on Free.

## Zero-Billing Checklist

- Backend service instance type is `Free`.
- No persistent disk is attached.
- No paid Render Postgres database is attached.
- No paid Redis/Key Value instance is attached.
- No paid background worker, cron job, or private service exists for this project.
- Old Starter service is deleted or downgraded.
- Old disk is deleted after backing up any needed data.
- Render usage page shows no paid resources.
- No payment-triggering add-ons are enabled.
- Cloudflare Pages frontend remains on its free plan.
