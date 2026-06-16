# Handoff — getting started

This is a white-label analytics dashboard demo (a **Home** profit/marketing
dashboard + an **Expenses** manager) that runs on seeded sample data with no
setup. There are two ways to use it.

---

## A) Just want to pitch it? (start today, no code)

You don't need any of the code to show this to a prospect. Send them — or pull
up on your phone — the live demo and walk them through it:

- **Live demo:** https://violatethedresscode.github.io/command-center-demo/
- **Pitch script:** see `PITCH.md` in this repo (hook, 2-minute walkthrough,
  the expansion modules, objection handling, and the close).

That's it. Click "Enter Demo," tap the date buttons, add an expense live.

---

## B) Want to own it and sell it? (your own copy + your own link)

### 1. Get your own copy

**Easiest — fork it (GitHub web):**
1. Make a free GitHub account if you don't have one.
2. Go to https://github.com/violatethedresscode/command-center-demo
3. Click **Fork** (top right). You now have your own copy at
   `github.com/<your-username>/command-center-demo`.

**Or clone and push to a fresh repo (command line):**
```bash
git clone https://github.com/violatethedresscode/command-center-demo.git
cd command-center-demo
git remote set-url origin https://github.com/<your-username>/command-center-demo.git
git push -u origin master
```

### 2. Run it on your computer
Requires [Node.js](https://nodejs.org) 20+.
```bash
npm install
npm start
```
Open **http://localhost:3001** and click "Enter Demo."

### 3. Put up your own free live link (GitHub Pages)
So the URL is yours, not someone else's username:
```bash
npm run build:pages
cd client/dist
touch .nojekyll
git init -b gh-pages
git add -A
git commit -m "deploy"
git push -f https://github.com/<your-username>/command-center-demo.git gh-pages
```
Then in your repo on GitHub: **Settings → Pages → Build and deployment →
Source: Deploy from a branch → Branch: `gh-pages` / root → Save.**

After a minute your demo is live at
`https://<your-username>.github.io/command-center-demo/`.

### 4. Make it yours (white-label)
- **Name, tagline, accent color:** edit `client/src/brand.js`.
- **Logo:** edit `client/src/components/Logo.jsx` (or swap in an image).
- **Demo numbers** (to match a prospect's industry): edit
  `server/data/kpis.js`, then re-run `npm run build:pages` and redeploy.
- **Starter expenses:** edit `server/data/expenses.js`.

---

## When you land a paying client

The live demo runs on fake data. To run it on a client's *real* numbers you'll
build two things — see the "Turning the demo into a real product" section in
`README.md`:
1. **Real data** — replace `server/data/kpis.js` with a calculator that reads
   the client's actual store / ad accounts / database.
2. **Real login + per-client accounts** — replace the demo gate in
   `server/routes/auth.js` with real authentication.

Until then, the simplest model is one deployed copy per client, seeded with
numbers that look like their business.
