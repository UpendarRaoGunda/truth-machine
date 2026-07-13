# The Truth Machine

A sharp, funny reality check followed by an evidence-led journey through the four-billion-year history of life.

## Interactive Tree of Us

The homepage includes an original React/SVG visual atlas with two connected views:

- **Life → Us** — cells, major animal branches, fishes, land vertebrates, mammals, primates, and humans.
- **Human Family** — early hominins, australopith radiations, multiple Homo lineages, extinct human cousins, and ancient gene flow.

The atlas provides:

- original organism, fossil, anatomy, and habitat glyphs
- colored geological and biological era bands
- guided journeys through major evolutionary transformations
- search by species, branch, trait, or region
- wheel/button zoom, drag-to-pan, fit-all, reset, and specimen focusing
- evidence, location, environment, defining change, and uncertainty panels
- solid, debated, symbiotic, and gene-flow relationship styles
- responsive desktop and mobile layouts
- keyboard-accessible specimen cards

The implementation is original and does not copy OneZoom’s current viewer code or Smithsonian artwork. Scientific structure and educational context are informed by:

- [OneZoom Tree of Life Explorer](https://www.onezoom.org/life/@biota=93302?otthome=%40_ozid%3D1)
- [Smithsonian Human Origins — Human Family Tree](https://humanorigins.si.edu/evidence/human-family-tree)
- [Open Tree of Life](https://tree.opentreeoflife.org/)

The human-family view is intentionally presented as an educational schematic rather than a claim that every named fossil species is a direct ancestor. Dashed links mark uncertain or debated relationships.

## Stack

- Next.js 14 App Router
- React 18
- Original dependency-free SVG atlas renderer
- No external database

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

## Project structure

- Reality checks, comparisons, contradictions, timeline steps, and evidence-backed facts: `lib/content.js`
- Life atlas data: `lib/evolutionLife.js`
- Human-family data: `lib/evolutionHuman.js`
- Shared atlas exports and references: `lib/evolutionTree.js`
- Organism and anatomy drawings: `app/components/SpeciesGlyph.js`
- Atlas interaction and rendering: `app/components/EvolutionTree.js`
- Page composition: `app/page.js`
- Visual design: `app/globals.css`
