# 🚀 Founders & Footsteps — Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Get Your Neon Database URL

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Open project **crimson-dream-68656628**
3. Click **"Connection Details"** in the dashboard
4. Copy the **PostgreSQL connection string** — it looks like:
   ```
   postgresql://neondb_owner:AbCdEfG123@ep-twilight-waterfall-zazcd9zi.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Push Database Schema to Neon

Run this in the project folder (replace the URL with yours):

```bash
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-twilight-waterfall-zazcd9zi.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require" npx drizzle-kit push
```

You should see: `[✓] Changes applied` — this creates all 19 tables.

### Step 3: Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**
1. Push this code to a GitHub repo
2. Go to [https://vercel.com/new](https://vercel.com/new)
3. Import the GitHub repo
4. Vercel auto-detects Next.js — just click **Deploy**

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel deploy --prod
```

### Step 4: Set Environment Variables

In **Vercel Dashboard → Project → Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:YOUR_PASSWORD@ep-twilight-waterfall-zazcd9zi.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_replace_me` |
| `PAYSTACK_SECRET_KEY` | `sk_test_replace_me` |

Optional (for email confirmations):
| `RESEND_API_KEY` | Get from [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | `Founders & Footsteps <bookings@yourdomain.com>` |

Then click **Redeploy** from the Deployments tab.

### Step 5: Test Everything

1. Visit your Vercel URL
2. Go to `/admin` and login with:
   - Email: `admin@yourdomain.com`
   - Password: `your-admin-password`
3. Place a test order from the marketplace
4. Check it appears in Admin → Orders
5. Try editing content in Admin → Content
6. Visit the public FAQ/Careers page to see your edits

---

## What's Deployed

| Feature | Status |
|---|---|
| 8 Service booking systems (Construction, Car, Events, Travel, Salon, Logistics, Tech, Marketplace) | ✅ |
| Full admin dashboard with sidebar, stats, live feed | ✅ |
| Admin CMS for all pages (FAQ, Careers, Press, Help, Returns, Privacy, Terms + all services) | ✅ |
| Paystack checkout (reads from env var) | ✅ |
| Real-time order/booking tracking | ✅ |
| Customer management | ✅ |
| Favorites/Wishlist | ✅ |
| User registration & admin login | ✅ |
