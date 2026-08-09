# 🚀 Founders & Footsteps — Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Get Your Database URL

1. Go to [Neon](https://neon.tech) or your preferred PostgreSQL provider
2. Create a database and get the connection string

### Step 2: Push Database Schema

Run this in the project folder:

```bash
DATABASE_URL="your-database-url" npx drizzle-kit push
```

You should see: `[✓] Changes applied` — this creates all tables.

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
| `DATABASE_URL` | Your PostgreSQL connection string |
| `RESEND_API_KEY` | Get from [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | `Founders & Footsteps <noreply@yourdomain.com>` (optional) |

For payments (optional):
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Your Paystack public key |
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key |

Then click **Redeploy** from the Deployments tab.

### Step 5: Test Everything

1. Visit your Vercel URL
2. Test user registration (OTP email verification)
3. Check the inbox system
4. Test admin features at `/admin`

## New Features in This Version

### 1. OTP Email Verification
- 6-digit codes sent via Resend
- 10-minute expiration
- Beautiful HTML templates

### 2. Universal Inbox System
- User inbox at `/inbox`
- Admin broadcasts at `/admin/inbox`
- Order/booking notifications

### 3. Package Tracking Numbers
- Orders: FF-ORD-YYMMDD-XXXX
- Bookings: FF-BK-YYMMDD-XXXX
