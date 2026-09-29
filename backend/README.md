# GreenLoop Backend & Demo Credentials (Development Only)

This file contains development reference documentation, demo credentials, and database commands. **Do not use these in production.**

---

## Pre-Seeded Demo Accounts

All demo accounts share the password:
```text
Password123!
```

| Email | Full Name / Organization | Role | Neighborhood | Primary Purpose |
|---|---|---|---|---|
| `ananya@greenloop.demo` | Ananya Ramachandran | `INDIVIDUAL` | Anna Nagar | Community sharing, borrowing tools, upcycled goods |
| `rha_chennai@greenloop.demo` | Robin Hood Army (NGO) | `NGO` | Guindy | Food rescue volunteer distributions, safety verification |
| `coromandel@greenloop.demo` | Coromandel Reclaimers | `BUSINESS` | Guindy Ind. Estate | Industrial surplus (textiles, HDPE barrels, timber) |
| `ecokrafts@greenloop.demo` | Meera Krishnan (EcoKrafts) | `INDIVIDUAL` (Artisan) | Adyar | Upcycled handmade products, green marketplace seller |
| `admin@greenloop.demo` | Dr. Priya Sundaram | `COMMUNITY_ADMIN` | Ashok Nagar | Community governance, verification, user moderation |
| `karthik@greenloop.demo` | Karthik Subramanian | `INDIVIDUAL` | T. Nagar | Community peer with completed transactions |

---

## Database Commands

### Test MySQL Connection
```bash
npm run test:db
# or
node test-connection.js
```

### Push Schema Changes to MySQL
```bash
npx prisma db push
```

### Reset & Reseed Demo Data Safely
```bash
npx ts-node prisma/seed.ts
```

All demo listings are marked with `isDemo: true`, allowing clean filtering or complete demo re-seeding at any time.

---

## File Uploads
User and listing uploads are stored in `backend/uploads/` and served statically via the backend server at `http://localhost:5000/uploads/...`.
