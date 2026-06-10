# Dynamic Vehicle QR Manager

A full-stack web application for managing dynamic QR codes for vehicles.  
QR codes are **permanent** — only the data behind them changes.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (bcrypt hashed passwords) |
| QR Code | qrcode.js |
| Hosting | Frontend → GitHub Pages, Backend → Render/Railway |
| Docker | Full stack via docker-compose |

## Project Structure

```
qrscan/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema (vehicles, admins, history)
│   │   ├── migrations/         # SQL migration files
│   │   └── seed.ts             # Seeds default admin
│   └── src/
│       ├── config/prisma.ts    # Prisma client singleton
│       ├── controllers/        # Route handlers
│       ├── middleware/         # Auth, validation, error handling
│       ├── routes/             # Express routers
│       ├── services/           # Business logic (SQL via Prisma)
│       └── index.ts            # App entry point
├── frontend/
│   └── src/
│       ├── api/                # Axios + API calls
│       ├── components/         # Reusable UI components
│       ├── context/            # Auth context
│       ├── hooks/              # useVehicles, useVehicle
│       ├── layouts/            # AdminLayout
│       ├── pages/              # All page components
│       └── types/              # TypeScript interfaces
├── docker-compose.yml          # Postgres + backend + frontend
└── .github/workflows/          # CI/CD
```

## Quick Start (Local)

### 1. Clone and set up environment

```bash
git clone <your-repo>
cd qrscan
```

### 2. Set up backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run db:seed        # creates admin@qrmanager.com / Admin@123
npm run dev            # http://localhost:5000
```

### 3. Set up frontend

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start              # http://localhost:3000
```

### 4. Docker (easiest — runs everything)

```bash
cp .env.example .env   # set POSTGRES_PASSWORD and JWT_SECRET
docker-compose up --build

# Seed the admin user
docker exec qr-backend sh -c "cd /app && node -e \"require('./dist/config/prisma').default.\$connect().then(() => require('child_process').execSync('npx ts-node prisma/seed.ts', {stdio:'inherit'}))\""
# Or just run: docker exec -it qr-backend npx prisma db seed
```

---

## Environment Variables

### `backend/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/qrvehicle?schema=public"
JWT_SECRET=your_secret_min_32_chars
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:3000
```

---

## Database Schema

```sql
-- admins: stores admin credentials
-- vehicles: main vehicle + driver data, immutable ID used for QR URL
-- vehicle_history: full audit trail of every change
-- vehicle_counter: atomic counter for sequential IDs (VH10001, VH10002, …)
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Admin login → JWT |
| GET | `/api/auth/me` | ✅ | Get current admin |
| POST | `/api/auth/change-password` | ✅ | Change password |
| GET | `/api/vehicles` | ✅ | List (paginated + search) |
| POST | `/api/vehicles` | ✅ | Create vehicle |
| GET | `/api/vehicles/:id` | — | Get vehicle (public, used by scan page) |
| PUT | `/api/vehicles/:id` | ✅ | Update vehicle |
| DELETE | `/api/vehicles/:id` | ✅ | Delete vehicle |
| GET | `/api/vehicles/:id/qrcode` | ✅ | Get QR code (PNG + SVG) |
| GET | `/api/vehicles/:id/history` | ✅ | Get change history |
| POST | `/api/vehicles/bulk` | ✅ | Bulk import (Excel or JSON) |

---

## QR Code Logic

1. Vehicle created → unique sequential ID assigned (`VH10001`, `VH10002`, …)
2. QR code encodes only the scan URL: `https://yourdomain.com/vehicle/VH10001`
3. Scanning opens the public page → fetches **latest data** from PostgreSQL
4. QR code **never changes** — just update the DB record

---

## Deployment

### Backend on Render

1. New **Web Service** → connect repo → set root dir `backend`
2. Build: `npm install && npx prisma generate && npm run build`
3. Start: `npx prisma migrate deploy && node dist/index.js`
4. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `BASE_URL`
5. Add a **PostgreSQL** database in Render → copy the connection string

### Backend on Railway

```bash
cd backend
railway init
railway add --database postgresql
railway up
```

### Frontend on GitHub Pages

```bash
cd frontend
# Set REACT_APP_API_URL to your Render/Railway backend URL in GitHub Secrets
# Push to main — GitHub Actions deploys automatically
```

---

## Excel Import Template

Column headers (row 1):

```
Vehicle Number | Driver Name | Driver Mobile | Emergency Contact | Emergency Contact Name | Vehicle Type | Company Name | Insurance Number | Insurance Expiry | Address | Notes
```

---

## Default Admin

```
Email:    admin@qrmanager.com
Password: Admin@123
```

Change this immediately after first login via **Settings → Change Password**.
