# Globetros – To-do

Ordered by priority. Items marked *(nice to have)* come last.

## 1. Housekeeping
- [x] `git init`, add a sensible `.gitignore` (node_modules, dist), make the first commit (done, branch `main`)
- [x] Push to a remote repo (GitHub) so there is a backup (github.com/lakorunna/globetros, public)
- [x] Replace the Vite-template README with a real one (what it is, `npm run dev`, `npm run extract`)

## 2. Hosting
- [x] Pick a host: Cloudflare Pages
- [x] Set up deploy from the git repo (live at https://globetros.pages.dev, deploys on push to main)
- [ ] Point globetros.dk at it (DNS + HTTPS)

## 3. Update anything out of date
- [x] Run `npm outdated` and update dependencies (done; held back eslint 10 and pdf-parse 2, both major bumps with no pressing need)
- [x] Run `npm run lint` and `npm run build`, fix any warnings (lint is clean; build warns the JS bundle is 571 kB, worth code-splitting later)
- [ ] Stamen Watercolor tiles come from Stadia Maps (tiles load fine on globetros.pages.dev; requests without a referer get 401, so re-check on globetros.dk once connected); check their free-tier terms and whether production at globetros.dk needs an API key or domain registration (see Map below)
- [x] Remove unused template leftovers (`src/assets/*`, `public/icons.svg`)

## 4. Content and data
- [ ] Add photos: populate the `photos` array in `src/data/entries.json` and show them in the journal panel (gallery)
- [ ] Check why `Travellog` has 35 files but only 32 entries; extract any missing ones
- [ ] Verify the coordinates, dates and titles of all 32 entries
- [ ] Decide whether to use `original_content/Regnskab` (budget) and `Globetros pakkeliste.doc` (packing list) as extra sections

## 5. Mobile layout
- [ ] Replace the 50/50 split with a full-screen or bottom-sheet journal view on small screens
- [ ] Simpler navigation: fixed buttons at the bottom (previous / next / map or list)
- [ ] Test on real phone sizes, including touch targets and safe areas

## 6. Map
- [x] Switched from Leaflet to MapLibre GL JS (globe view, keeps the Watercolor tiles, no token or usage bill); Mapbox not needed for now
- [ ] Check the map on mobile and with the globe/flat toggle
- [ ] Reduce the JS bundle (about 1.5 MB, mostly MapLibre): check Turf imports, code-split the map

## 7. Travel path
- [x] Past travel = solid line, future travel = dotted line, relative to the currently selected entry
- [x] Animate the line as you move between stories
- [x] Moving marker (car, plane or something else entirely) that travels along the path as you move through the entries
  - [x] Vehicle per leg: plane for legs over 1,200 km (great-circle arcs), van otherwise; could become a per-entry field
  - [ ] Add waypoints so overland legs follow roads and coastlines instead of straight lines

## 8. Title screen / logo
- [ ] Design a title screen or logo
- [ ] Inspiration: Indiana Jones (map with a travelling red line), TaleSpin, The Jungle Book
- [ ] Decide on the intro flow (title screen, then the map)

## 9. About page
- [ ] About page: explain the name "Globetros", who was on the trip, and who made the homepage
- [ ] Decide how it is reached (a discreet link or icon, so the journey stays the focus)

## 10. Easter-egg section (nice to have)
Guiding principle: the main experience stays focused on the journey. All bonus features live behind one easter-egg icon or section and are never in the way of reading the entries.
- [ ] Design the easter-egg entry point (an icon or hidden spot) and the menu it opens
- [ ] Guest book: show the old entries
- [ ] Guest book: allow new entries (needs a backend or service, and moderation/spam protection)
- [ ] Historical weather data for each entry's place and date, if a source is available
- [ ] Narrator voice: read the entries aloud (text-to-speech or a recorded/generated voice), with play/pause in the journal panel
- [ ] Spelling-corrected version: show the raw original by default, with a toggle to a cleaned-up spelling/language version (keep the original text as the source of truth, e.g. a `textCorrected` field per entry)
- [ ] Very last: alternative versions of the entries in different voices, selectable in the journal panel: a wise old man, a Disneyfied version, and other ideas
