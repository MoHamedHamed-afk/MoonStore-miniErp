# Deployment Guide

This repo is prepared for:

- Render for the ASP.NET backend
- Cloudflare Pages for the Angular frontend

## Backend on Render

Use the root `render.yaml` blueprint or configure the service manually with the same values.

Service settings:

- Root directory: `Backend/ShopApi`
- Build command: `dotnet publish ShopApi.csproj -c Release -o ./publish`
- Start command: `dotnet ./publish/ShopApi.dll`
- Health check path: `/health`

Persistent disk:

- Mount path: `/var/data`
- Size: `1 GB` or larger

Required environment variables:

- `APP_DATA_ROOT=/var/data`
- `FRONTEND_URL=https://<your-cloudflare-pages-domain>`
- `FRONTEND_URLS=https://<your-cloudflare-pages-domain>,https://<your-custom-domain-if-any>`
- `Jwt__Key=<strong-random-secret>`
- `Jwt__Issuer=ShopApi`
- `Jwt__Audience=ShopApp`

Optional:

- `DATABASE_URL=<postgres-connection-string>` if you later move off SQLite
- `SQLITE_PATH=/var/data/shop.db` if you want to set the file explicitly
- `UPLOADS_PATH=/var/data/uploads` if you want to set uploads explicitly

Data migration for first launch:

1. Run `powershell -ExecutionPolicy Bypass -File .\scripts\backup-shop-data.ps1`
2. Upload `shop.db` and, if present, `shop.db-wal` / `shop.db-shm` to `/var/data`
3. Upload the contents of `Backend/ShopApi/wwwroot/uploads` to `/var/data/uploads`

## Frontend on Cloudflare Pages

Project settings:

- Root directory: `Frontend/shop-ui`
- Build command: `npm ci && npm run build:cloudflare`
- Build output directory: `dist/shop-ui/browser`

Required Cloudflare Pages environment variable:

- `API_BASE_URL=https://<your-render-service>.onrender.com`

Notes:

- SPA routing is handled by [src/_redirects](F:\projects\Moon Store - Mini Erp\Frontend\shop-ui\src\_redirects)
- Cache headers are handled by [src/_headers](F:\projects\Moon Store - Mini Erp\Frontend\shop-ui\src\_headers)
- The production Angular environment is generated at build time by [configure-production-env.mjs](F:\projects\Moon Store - Mini Erp\Frontend\shop-ui\scripts\configure-production-env.mjs)

## Recommended deployment order

1. Deploy the backend on Render
2. Confirm these endpoints work:
   - `/health`
   - `/api/products`
   - `/uploads/<filename>`
3. Set `API_BASE_URL` in Cloudflare Pages to the Render backend URL
4. Deploy the frontend on Cloudflare Pages
5. Add the final frontend domain to Render `FRONTEND_URL` / `FRONTEND_URLS`
