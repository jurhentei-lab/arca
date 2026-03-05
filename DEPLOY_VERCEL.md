# Vercel Deployment (No-Error Setup)

This project deploys as **two Vercel projects**:
1. `front-end` (root)
2. `back-end` (`/back-end`)

## 1) Deploy Backend first

Project root: `back-end`

Set environment variables in Vercel:
- `DATABASE_URL` = Neon connection string
- `JWT_SECRET` = long secure secret
- `CLIENT_ORIGIN` = your frontend URL (for example `https://your-frontend.vercel.app`)
- `NODE_ENV` = `production`

Then deploy backend and copy its public URL:
- Example: `https://arca-backend.vercel.app`

## 2) Run DB init once (local)

```bash
cd back-end
cp .env.example .env
# put Neon DATABASE_URL and JWT_SECRET
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

## 3) Deploy Frontend

Project root: repository root

Set frontend env in Vercel:
- `VITE_API_BASE_URL` = `https://arca-backend.vercel.app/api`

Deploy frontend.

## 4) Post-deploy checks

- Backend health: `https://<backend-domain>/health`
- Frontend opens without blank page
- Sign up / login works
- Admin save updates products

## Notes

- `vercel.json` exists in both root and `back-end` already.
- CORS is configured to allow configured origins and `*.vercel.app`.
