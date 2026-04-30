# Moon Store Deployment Notes

These notes are for the current demo deployment: ASP.NET Core backend on Render and Angular frontend on Cloudflare Pages.

## Render backend environment variables

Use Render environment variable names with double underscores for nested .NET config:

- `Jwt__Key=<long-random-production-secret>`
- `Jwt__Issuer=ShopApi`
- `Jwt__Audience=ShopApp`
- `Seed__AdminPassword=<private-admin-password>`
- `Seed__ModeratorPassword=<private-moderator-password>`
- `Seed__BackupAdminPassword=<private-backup-admin-password>`
- `FRONTEND_URL=https://moonstore-mini-erp-frontend.pages.dev`
- `Cloudinary__CloudName=dh45pzldn`
- `Cloudinary__ApiKey=<from Cloudinary dashboard>`
- `Cloudinary__ApiSecret=<from Cloudinary dashboard>`
- `Cloudinary__Folder=moon-store/products`

The backend also accepts the uppercase names `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `CLOUDINARY_FOLDER`, but the double-underscore names above match `render.yaml`.

Do not commit API keys, API secrets, Render API keys, JWT secrets, or production passwords to GitHub.

## Cloudflare Pages manual deploy

The current Cloudflare Pages project is not Git-connected, so a GitHub push alone will not update the frontend.

```powershell
cd "F:\projects\Moon Store - Mini Erp\Frontend\shop-ui"
npm run build:cloudflare
npx wrangler pages deploy ./dist/shop-ui/browser --project-name moonstore-mini-erp-frontend
```

## Render manual deploy

After pushing backend changes to GitHub, open Render, select the backend service, then choose `Manual Deploy` and deploy the latest commit.

## Demo limitations

- Render Free uses ephemeral local storage, so SQLite data can reset after redeploys/restarts. Cloudinary images remain stored in Cloudinary.
- The local/demo OTP password reset displays the OTP on the website and stores it in backend memory. OTPs are cleared when the backend restarts.
- Product images should be uploaded to Cloudinary, not stored as local server files, for demo stability.
- Checkout is cash/manual confirmation only. There is no card payment processor in Phase 1.
- SCSS budget warnings are known and intentionally deferred until the final deployment cleanup.

## Before real production

- Move from SQLite to an external database such as Supabase Postgres, Neon Postgres, or a managed database from the hosting provider.
- Replace demo/fallback seeded passwords with private credentials or environment-driven setup.
- Rotate any API keys that were ever pasted into chat or logs.
- Connect Cloudflare Pages to GitHub, or keep the manual deploy command as the official release step.
