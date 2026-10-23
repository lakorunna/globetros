# Globetros – To-do

Ordered by priority. Items marked *(nice to have)* come last.

## 1. Housekeeping
- [ ] `git init`, add a sensible `.gitignore` (node_modules, dist), make the first commit
- [ ] Push to a remote repo (GitHub) so there is a backup
- [ ] Replace the Vite-template README with a real one (what it is, `npm run dev`, `npm run extract`)

## 2. Hosting
- [ ] Pick a host (Netlify / Vercel / Cloudflare Pages / GitHub Pages)
- [ ] Set up deploy from the git repo
- [ ] Point globetros.dk at it (DNS + HTTPS)

## 3. Update anything out of date
- [ ] Run `npm outdated` and update dependencies (React, Vite, react-leaflet, eslint, etc.)
- [ ] Run `npm run lint` and `npm run build`, fix any warnings
- [ ] Check that the Stamen Watercolor tile source still works and is correctly credited (see Map below)
- [ ] Remove unused template leftovers (`src/assets/react.svg`, `vite.svg`, `hero.png` if unused)

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
- [ ] Consider switching to Mapbox (compare cost, styling options and look vs. the Watercolor feel)
- [ ] If switching: pick a style, handle the access token and URL restrictions, migrate pins, route and country highlights

## 7. Travel path
- [ ] Past travel = solid line, future travel = dotted line, relative to the currently selected entry
- [ ] Animate the line as you move between stories
- [ ] Moving marker (car, plane or something else entirely) that travels along the path as you move through the entries
  - [ ] Choose the vehicle per leg (plane between countries, bus/car overland)?

## 8. Title screen / logo
- [ ] Design a title screen or logo
- [ ] Inspiration: Indiana Jones (map with a travelling red line), TaleSpin, The Jungle Book
- [ ] Decide on the intro flow (title screen, then the map)

## 9. Nice to have
- [ ] Guest book: show the old entries
- [ ] Guest book: allow new entries (needs a backend or service, and moderation/spam protection)
- [ ] Historical weather data for each entry's place and date, if a source is available
