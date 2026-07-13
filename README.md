# The Truth Machine

A sharp, funny reality check — evolution over superstition. Sarcastic roasts, better metaphors, savage oxymorons, and the real 4-billion-year story of you.

## Stack
- Next.js 14 (App Router)
- Backend: API routes (`/api/roast`, `/api/facts`)
- Frontend: single responsive page (desktop + mobile)
- Zero external DB — content lives in `lib/content.js` (easy to edit/expand)

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Deploy on Vercel
1. Push this folder to a GitHub repo (or drag-drop in the Vercel dashboard).
2. In Vercel: **New Project → Import** → framework auto-detects **Next.js**.
3. Click **Deploy**. No env vars needed.

Or with the CLI:
```bash
npm i -g vercel
vercel
```

## Edit the content
All roasts, metaphors, oxymorons, ladder steps, and facts are in `lib/content.js`. Add more entries and redeploy.
# truth-machine
