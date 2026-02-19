# Deko

**Wait time? Show time.** ✨

Deko turns retail checkout screens into animated entertainment. When a customer pays, pixel-art sprites act out the order preparation — making wait time feel like show time.

## Stack

- **Frontend:** Next.js 15 + PixiJS 8
- **Backend:** Supabase (realtime + auth + DB)
- **Hosting:** Vercel
- **Triggers:** Stripe webhooks / manual

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase + Stripe credentials
npm run dev
```

## Routes

- `/` — Display screen (customer-facing)
- `/admin` — Shop configuration panel
- `/api/webhook/stripe` — Stripe webhook endpoint

## License

Proprietary — SCVI Media Pty Ltd
