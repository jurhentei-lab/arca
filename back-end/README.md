# ARCA Backend (Neon Ready)

## 1) Setup

```bash
cd back-end
cp .env.example .env
npm install
npm run prisma:generate
```

Set `.env`:

```env
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET="replace-with-long-random-secret"
CLIENT_ORIGIN="http://localhost:5173,https://your-frontend.vercel.app"
VERCEL_URL=""
NODE_ENV="development"
```

## 2) Initialize DB (Neon)

```bash
npm run prisma:push
npm run prisma:seed
```

Seed admin user:
- email: `admin@arca.com`
- password: `Admin@12345`

## 3) Run

```bash
npm run dev
```

Health check: `GET http://localhost:4000/health`

## Vercel

- Backend is configured with [vercel.json](/Users/25LP5459/desktop/Tusul/back-end/vercel.json)
- Deploy this folder as a separate Vercel project (`Root Directory = back-end`)
- Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN` in Vercel project settings

## API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/products`
- `PUT /api/products/bulk` (Bearer token)
- `GET /api/orders` (Bearer token, ADMIN)
- `POST /api/orders` (Bearer token, ADMIN)
- `DELETE /api/orders/:id` (Bearer token, ADMIN)

`PUT /api/products/bulk` expects:

```json
{
  "products": [
    {
      "id": "amber-vessel-7",
      "name": "Amber Vessel No.7",
      "category": "Ceramics",
      "price": 1240,
      "variant": "v1",
      "badge": "New",
      "featured": true,
      "collectionType": "CURATED"
    }
  ]
}
```
