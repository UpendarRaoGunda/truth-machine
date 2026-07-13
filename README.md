# The Truth Machine

A sharp, funny reality check — evolution over superstition. Sarcastic roasts, better metaphors, savage oxymorons, and the real 4-billion-year story of you.

## New: Interactive Tree of Us

The homepage now includes an original, dependency-free React/SVG evolution explorer with two connected views:

- **Life → Us** — a zoomable route from all known life through animals, vertebrates, mammals, primates, and humans.
- **Human Family** — a branching hominin relationship map with extinct species, debated placements, and Neanderthal/Denisovan gene-flow links.

Interaction features include wheel/button zoom, drag-to-pan, search, node focus, evidence details, uncertainty labels, responsive layouts, and keyboard-selectable nodes.

The implementation is original React/SVG code. It does **not** copy OneZoom's viewer code or Smithsonian artwork. Scientific structure and educational context are informed by:

- [OneZoom Tree of Life Explorer](https://www.onezoom.org/life/@biota=93302?otthome=%40_ozid%3D1)
- [Smithsonian Human Origins — Human Family Tree](https://humanorigins.si.edu/evidence/human-family-tree)
- [Open Tree of Life](https://tree.opentreeoflife.org/)

The human-family view is intentionally presented as a learning schematic rather than a claim that every named fossil species is a direct ancestor. Dashed links mark uncertain or debated relationships.

## Stack

- Next.js 14 (App Router)
- React 18
- Backend API routes (`/api/roast`, `/api/facts`)
- Original SVG tree renderer; no charting dependency
- Zero external database — editorial content lives in `lib/content.js`; tree data lives in `lib/evolutionTree.js`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Import this GitHub repository in Vercel.
2. Let Vercel detect Next.js automatically.
3. Deploy. No environment variables are required.

## Edit the content

- Roasts, metaphors, oxymorons, timeline steps, and facts: `lib/content.js`
- Evolution tree nodes, relationships, evidence notes, and sources: `lib/evolutionTree.js`
- Tree interaction and SVG rendering: `app/components/EvolutionTree.js`
- Visual styling: `app/globals.css`
