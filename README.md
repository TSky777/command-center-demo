# Command Center (Demo)

A clean, white-labelable analytics dashboard for small businesses. This demo
build ships with two tabs — **Home** (a profit & marketing KPI dashboard) and
**Expenses** (a recurring/one-time cost manager) — and runs entirely on
**seeded sample data**. No database, no Shopify, no ad accounts, no API keys.

`npm install && npm start`, open the page, click **Enter Demo**, and you get a
fully populated dashboard you can show to a prospect in under a minute.

---

## Quick start

```bash
npm install        # installs server deps + builds the client
npm start          # serves the app on http://localhost:3001
```

Then open **http://localhost:3001** and click **Enter Demo**.

### Live-reload during development

```bash
npm run dev        # server on :3001, Vite client on :5173 (proxying /api)
```

Open **http://localhost:5173** while developing.

---

## What's inside

```
server/                Express API (no database)
  data/kpis.js         Seeded KPI generator — the "fake business" lives here
  data/expenses.js     In-memory expense list (resets on restart)
  routes/              /api/kpis, /api/expenses, /api/auth, /api/refresh, /api/health
client/                React + Vite front-end
  src/brand.js         ← change the product name, tagline, and accent color here
  src/pages/           Dashboard (Home) and Expenses
  src/components/       Reusable UI (cards, tables, header, login, etc.)
```

## White-labelling for a new business

1. **Name & color:** edit `client/src/brand.js` (`name`, `tagline`, `company`, `accent`).
2. **Logo:** replace the inline mark in `client/src/components/Logo.jsx`, or swap it
   for an `<img src="/your-logo.png" />` and drop the file in `client/public/`.
3. **Sample numbers:** edit the `DAY` base figures and `CHANGES` in
   `server/data/kpis.js` to make the demo match the prospect's industry.
4. **Starter expenses:** edit the seeded list in `server/data/expenses.js`.

## Deploying (Railway / Render / any Node host)

The repo includes a `Procfile` and `railway.json`. Any host that runs
`npm install` then `npm start` on Node 20+ will work. The build step compiles
the React client into `client/dist`, which the server serves statically. No
environment variables are required for the demo.

---

## Turning the demo into a real product

This is a **single-tenant demo**. Two things to build before selling it for
real money:

1. **Real data.** Replace `server/data/kpis.js` with a calculator that reads
   from each business's actual source (Shopify, ad platforms, a database). The
   front-end only depends on the JSON shape that module returns, so nothing in
   `client/` has to change.
2. **Real auth + multi-tenancy.** `server/routes/auth.js` is a demo gate that
   logs everyone in as a demo admin. Swap it for real authentication (Google
   OAuth, magic links, Auth0, etc.) and give each business its own account and
   isolated data.

Until then, the simplest sales motion is: deploy one copy per prospect, seeded
with numbers that look like their business.
