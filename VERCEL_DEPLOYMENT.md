# Csbox Cloud Academy - Vercel Deployment Guide

## Overview
This guide covers deploying the Csbox Cloud Academy frontend to Vercel and the backend to a compatible platform (Railway, Render, Fly.io, or your own VPS).

---

## Part 1: Frontend Deployment to Vercel

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/csbox-academy.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New Project"**
3. Import your `csbox-academy` repository
4. Select the root directory as the project root
5. Click **"Deploy"**

### Step 3: Configure Environment Variables in Vercel
In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` | Yes |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-public-key` | Yes |
| `APP_URL` | `https://your-app.vercel.app` | Yes |

### Step 4: Redeploy
After adding environment variables, go to **Deployments** and click **"Redeploy"** on the latest deployment.

---

## Part 2: Backend Deployment Options

### Option A: Railway (Recommended for Node.js)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the `server/` directory as the source
5. Add environment variables (see below)
6. Deploy

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `server/`
5. Set build command: `npm install`
6. Set start command: `npm start` or `npm run dev`
7. Add environment variables
8. Deploy

### Option C: Fly.io
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Run: `fly launch` in the `server/` directory
3. Add environment variables: `fly secrets set KEY=value`
4. Deploy: `fly deploy`

---

## Part 3: Backend Environment Variables

Add these to your backend hosting platform:

| Variable | Example Value | Required |
|----------|---------------|----------|
| `PORT` | `3001` | Yes |
| `NODE_ENV` | `production` | Yes |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Yes |
| `JWT_SECRET` | `your-32-char-random-string` | Yes |
| `JWT_REFRESH_SECRET` | `your-32-char-random-string` | Yes |
| `JWT_EXPIRES_IN` | `15m` | No |
| `REFRESH_EXPIRES_IN` | `7d` | No |
| `DATABASE_URL` | `postgresql://postgres:...@db.*.supabase.co:5432/postgres` | Yes |
| `REDIS_URL` | `redis://...` | Optional |
| `STORAGE_PROVIDER` | `local` | No |
| `STORAGE_PATH` | `./uploads` | No |
| `MAX_FILE_SIZE_MB` | `50` | No |
| `SMTP_HOST` | `smtp.example.com` | Optional |
| `SMTP_PORT` | `587` | Optional |
| `SMTP_USER` | `your-email@example.com` | Optional |
| `SMTP_PASS` | `your-password` | Optional |
| `SMTP_FROM` | `noreply@csbox.dev` | Optional |
| `ENABLE_MFA` | `true` | No |
| `ENABLE_EMAIL_NOTIFICATIONS` | `true` | No |
| `ENABLE_AUDIT_LOGGING` | `true` | No |

---

## Part 4: Generate JWT Secrets

Run this command to generate secure random secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Part 5: Supabase Configuration for Production

### 1. Get Supabase Credentials
1. Go to your Supabase project dashboard
2. **Settings → API**: Copy `Project URL` and `anon public` key
3. **Settings → Database**: Copy the connection string (URI format)

### 2. Enable Email Auth (Optional)
1. **Authentication → Settings**
2. Enable email confirmations if desired
3. Set redirect URLs to: `https://your-app.vercel.app/*`

### 3. Run the Schema
1. **SQL Editor → New Query**
2. Paste the entire contents of `server/schema_complete.sql`
3. Click **Run**

---

## Part 6: Vercel Build Configuration

### vercel.json (Optional - for custom configuration)
Create a `vercel.json` in the root directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key",
    "APP_URL": "@app_url"
  }
}
```

### package.json Build Script
Ensure your `package.json` has:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Part 7: CORS Configuration

Update your backend CORS settings to allow your Vercel domain:

**server/.env:**
```
CORS_ORIGIN=https://your-app.vercel.app
```

Or in your backend code, configure CORS to accept requests from your Vercel domain.

---

## Part 8: Database Connection for Production

### Supabase Connection String Format
```
postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

### Where to Find It
1. Supabase Dashboard → **Settings → Database**
2. Copy the **Connection string** under "URI" format
3. Replace `YOUR_PASSWORD` with your database password

---

## Part 8: Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render/Fly.io
- [ ] Environment variables configured on both platforms
- [ ] Supabase schema executed
- [ ] CORS configured with Vercel domain
- [ ] JWT secrets generated and set
- [ ] Database connection string configured
- [ ] Test login with seed credentials
- [ ] Test all role-based dashboards
- [ ] Test certificate generation
- [ ] Test support ticket creation

---

## Part 9: Troubleshooting

### Build Fails on Vercel
- Ensure `vite` is in `devDependencies` and `dependencies`
- Check that `vite.config.ts` is configured correctly
- Verify Node.js version (18+ recommended)

### CORS Errors
- Add your Vercel domain to `CORS_ORIGIN` in backend
- Ensure backend is running and accessible

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Ensure Supabase project is active (not paused)
- Check that IP allowlisting includes your backend (if applicable)

### Environment Variables Not Loading
- In Vercel: Settings → Environment Variables → check spelling
- Redeploy after adding new variables
- Variables must start with `VITE_` for frontend (Vite requirement)

---

## Part 10: File Structure for Deployment

```
csbox-academy/
├── .env                          # Frontend env (local only)
├── .env.example                  # Frontend env template
├── vercel.json                   # Vercel config (optional)
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite config
├── tsconfig.json                 # TypeScript config
├── index.html                    # Entry point
├── src/                          # Frontend source
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── services/
│   └── types/
├── server/                       # Backend source
│   ├── .env                      # Backend env (local only)
│   ├── .env.example              # Backend env template
│   ├── index.ts                  # Backend entry
│   ├── schema.sql                # Original schema
│   └── schema_complete.sql       # Complete schema for Supabase
└── VERCEL_DEPLOYMENT.md          # This file
```

---

## Quick Start Commands

```bash
# Local development
npm install
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy backend to Railway
cd server
railway up