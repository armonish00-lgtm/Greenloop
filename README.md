# GreenLoop - Unified Community Circular Sustainability Platform

GreenLoop is a hyperlocal circular economy platform that brings household resource sharing, emergency food rescue, industrial surplus repurposing, and sustainable artisan commerce into one unified portal.

---

## Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React (vector icons), Socket.IO Client |
| **Backend** | Node.js, Express, TypeScript, Socket.IO, Multer (file uploads), JWT, bcrypt |
| **Database & ORM** | MySQL 8.0, Prisma ORM (`@prisma/client`, `prisma`) |
| **Real-time Engine** | Socket.IO WebSockets for instant 1-on-1 messaging & transaction requests |
| **AI Assistant** | Integrated floating conversational assistant (`AIChatbot`) with context navigation |

---

## Key Features

1. **AI Community Assistant**:
   - Floating persistent widget across all pages (`bottom-6 right-6`).
   - Natural conversational responses to greetings and user questions.
   - Intelligent module recommendations for adding products and items.
   - Interactive quick-navigation action buttons (`[+ Post an Item]`, `[Open Share & Borrow]`, `[Go to Marketplace]`, etc.).

2. **Hyperlocal Circular Modules**:
   - **Share & Borrow (Module 01)**: Lending high-utility tools, appliances, and camping gear locally without redundant consumption.
   - **Food Rescue (Module 02)**: Direct coordination of surplus catering and restaurant meals to verified welfare NGOs and shelters.
   - **Industrial Surplus (Module 03)**: B2B exchange of secondary textiles, HDPE drums, pallets, and excess manufacturing materials.
   - **Green Marketplace (Module 04)**: Hyperlocal trade of upcycled goods, zero-waste products, and repaired essentials.

3. **Trust & Verification Badging**:
   - Equal platform access and capabilities across all accounts.
   - Visual verified indicators:
     - `Factory` badge: **Industrial Partner Listing**
     - `HeartHandshake` badge: **Registered NGO / Charity**
     - `UserCheck` badge: **Community Member**
     - `ShieldCheck` badge: **Verified Organization**

4. **Streamlined Chat & Privacy**:
   - Clicking *"Chat"* opens directly with an empty input box (no automatic messages sent).
   - Clickable inquiry suggestion chips (`"Is this item still available?"`, `"Can I arrange a pickup this weekend?"`).
   - Approximate neighborhood privacy protection until transaction confirmation.

5. **Professional Light Admin Console**:
   - Clean, professional governance portal at `/admin`.
   - Real-time community health metrics, visual analytics charts, verification queue, and user report moderation.

---

## Project Structure

```
greenloop/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma         # Prisma schema for MySQL
│   ├── src/
│   │   ├── controllers/          # API & Chat controllers
│   │   ├── middleware/           # Auth & upload middleware
│   │   ├── routes/               # REST API endpoints (/api/...)
│   │   ├── services/             # Socket.IO & business logic
│   │   └── index.ts              # Express server entry point
│   ├── uploads/                  # Uploaded listing images
│   ├── .env.example              # Sample backend environment variables
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Common components, layout & modals
│   │   │   ├── common/AIChatbot.tsx # Floating AI assistant
│   │   │   └── modals/           # Listing, Request, Auth, Report modals
│   │   ├── context/              # Auth & Location providers
│   │   ├── pages/                # Landing, Dashboard, Explore, Admin, etc.
│   │   ├── services/             # Axios API client & WebSocket client
│   │   └── types/                # TypeScript interface definitions
│   ├── vercel.json               # SPA routing rewrite configuration for Vercel
│   ├── .env.example              # Sample frontend environment variables
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL Server 8.0+ running locally (e.g. port `3306`)

### 1. Database Setup
Create a MySQL database named `greenloop`:
```sql
CREATE DATABASE greenloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your local MySQL credentials:
# DATABASE_URL="mysql://root:yourpassword@127.0.0.1:3306/greenloop"

npm install
npx prisma db push        # Push schema to MySQL database
npm run build             # Compile TypeScript
npm run dev               # Start development server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Verify VITE_API_URL=http://localhost:5000/api

npm install
npm run dev               # Start Vite dev server on http://localhost:5173
```

---

## Deployment Guide

### A. Deploying Frontend to Vercel

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables in Vercel:
   - `VITE_API_URL`: `https://your-backend-domain.com/api`
   - `VITE_SOCKET_URL`: `https://your-backend-domain.com`
5. Click **Deploy**.
   - Note: The `frontend/vercel.json` file is already preconfigured with single-page application (SPA) rewrites to route all URLs to `index.html`.

---

### B. Deploying Backend (Railway / Render / Render / Ubuntu VPS)

1. Deploy the `backend/` directory to your Node.js hosting platform of choice.
2. Configure the Build and Start commands:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start` (or `node dist/index.js`)
3. Provision a managed MySQL database (e.g. PlanetScale, AWS RDS, Railway MySQL, or DigitalOcean Managed Database).
4. Configure Production Environment Variables:
   - `PORT`: `5000` (or platform default)
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `mysql://USER:PASSWORD@HOST:PORT/greenloop`
   - `JWT_SECRET`: A high-entropy 64-character random string
   - `CLIENT_URL`: `https://your-greenloop-frontend.vercel.app` (enables production CORS)
   - `UPLOAD_DIR`: `./uploads` (or connect an AWS S3 / Cloudinary bucket for persistent media)
5. Run Database Migrations on production:
   ```bash
   npx prisma migrate deploy
   ```

---

## Security & Best Practices

- **Never Commit Secrets**: `.env` files are explicitly excluded in `.gitignore`.
- **CORS Protection**: The Express backend dynamically validates requests against `CLIENT_URL`.
- **Password Hashing**: All passwords use `bcrypt` salt rounds.
- **Role-based Authentication**: JWT tokens carry user roles and are verified on protected mutation routes.
- **Privacy Geocoding**: Neighborhood-level approximation prevents exact user residence exposure before mutual trade acceptance.

---

## License
MIT License. Built for circular community sustainability.
