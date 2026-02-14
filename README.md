<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WhatCard

Choose the best credit card for each purchase. Run locally or deploy to Vercel.

View your app in AI Studio: https://ai.studio/apps/drive/193fbMCVTjebCTg0z9WVpf6DDSeoJlEkf

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Copy [.env.example](.env.example) to `.env` or `.env.local` and set `GEMINI_API_KEY` if you want to use Gemini-based categorization. The app runs without it.
3. Run the app:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploy to GitHub and Vercel

- **GitHub:** Push this repo to a GitHub repository. Ensure [.gitignore](.gitignore) is in place so `node_modules/`, `dist/`, and `.env` (or `.env.local`) are not committed.

- **Vercel:**
  1. Import the project from GitHub in [Vercel](https://vercel.com).
  2. Build command: `npm run build` (default for Vite). Output directory: `dist`.
  3. (Optional) If you use Gemini, add `GEMINI_API_KEY` in the project's Environment Variables.
  4. Deploy. The app is a static SPA; data is stored in the browser via localStorage (no database required).
