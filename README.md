# WhatCard

**WhatCard** helps you choose the best credit card for a given transaction by combining three factors:

1. **Point valuations** — Category multipliers (e.g. 3x Dining, 5x Flights) are converted to dollar value using fixed point valuations (MR, UR).
2. **Perks and benefits** — Statement credits (Uber Cash, Saks, travel credits, etc.) that match the merchant are included, using your current benefit balances.
3. **Current offers** — Card-linked offers (spend $X get $Y, or % back) that apply to the merchant are stacked into the total value.

You enter a merchant and amount, pick a category (or pin a benefit), and get a ranked list of cards by total value. “Use This Card” applies the chosen card’s benefits/offers and updates balances and history. All data is stored in your browser (localStorage); no backend required.

---

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push the repo to GitHub. Ensure [.gitignore](.gitignore) is in place so `node_modules/`, `dist/`, and `.env` are not committed.
2. In [Vercel](https://vercel.com), import the project from GitHub.
3. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. The app is a static SPA; data lives in the browser via localStorage.

---

**Technical documentation** (architecture, design, file map): [docs/TECHNICAL.md](docs/TECHNICAL.md).
