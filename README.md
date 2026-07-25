# The Truth Machine

A sharp, funny reality check followed by an evidence-led journey through the four-billion-year history of life.

## Android app and daily live wallpaper

The repository now includes a native Android app under `android/`.

The app provides:

- one deterministic evidence-minded quote per day
- a native `WallpaperService` live wallpaper
- automatic refresh after local midnight
- modern Abyss, Aurora, and Dawn visual moods
- Android’s native picker for the home screen, lock screen, or both
- quote sharing and direct links to the web Reality Check and Life Atlas
- no account, ads, analytics, or background tracking
- English-only interface and wallpaper content

The public website provides the install page at `/download`. GitHub Actions tests and builds the Android app, then publishes the verified APK to:

```text
public/downloads/TruthMachine.apk
```

Android controls the final live-wallpaper destination. Devices that support live wallpaper on the lock screen show **Home and lock screens** or **Both** in the system picker. Some manufacturer builds expose only the home-screen option.

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

## Scientists versus superstition

A dedicated section presents short, attributed quotations from Richard Feynman, Carl Sagan, Charles Darwin, and Marie Curie. Each quotation links to its source and is followed by a separately labelled sarcastic interpretation written for this project, so historical quotations are not mixed with invented lines.

## Reliability changes

- rotating homepage material is imported directly instead of depending on client-side requests during startup
- user-triggered sharing and clipboard actions have browser-safe fallbacks
- atlas wheel handling uses a non-passive listener and cleans itself up correctly
- direct page rendering remains usable even when an optional API route is unavailable
- Android and web builds are verified together in GitHub Actions
- the website publishes only the APK produced by the passing Android build

## Stack

- Next.js 14 App Router
- React 18
- Original dependency-free SVG atlas renderer
- Native Android Java app
- Android Material 3
- Android `WallpaperService`
- No external database

## Run the website locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production web build

```bash
npm run build
npm start
```

## Build Android locally

Install JDK 17 and Gradle 8.7, then run:

```bash
gradle -p android testDebugUnitTest lintDebug assembleDebug
```

The APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Project structure

- Reality checks, comparisons, contradictions, scientist quotations, timeline steps, and evidence-backed facts: `lib/content.js`
- Life atlas data: `lib/evolutionLife.js`
- Human-family data: `lib/evolutionHuman.js`
- Shared atlas exports and references: `lib/evolutionTree.js`
- Organism and anatomy drawings: `app/components/SpeciesGlyph.js`
- Atlas interaction and rendering: `app/components/EvolutionTree.js`
- Homepage composition: `app/page.js`
- Android download page: `app/download/page.js`
- Native Android project: `android/`
- Android live wallpaper engine: `android/app/src/main/java/com/truthmachine/app/DailyQuoteWallpaperService.java`
- Android daily quote library: `android/app/src/main/java/com/truthmachine/app/QuoteRepository.java`
- Combined Android/web CI and APK publication: `.github/workflows/android-and-web.yml`
- Main visual system: `app/globals.css`
- Scientist-card visual system: `app/scientists.css`
