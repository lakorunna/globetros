# Globetros – To-do

Only open items. Ordered by priority; the easter-egg section comes last.

## 1. Hosting
- [ ] Point globetros.dk at the Cloudflare Pages site (DNS + HTTPS). Waiting for the registry to release the domain (status "Reserved" at Punktum dk) so the nameservers can be switched to Cloudflare

## 2. Update anything out of date
- [ ] Register globetros.pages.dev and globetros.dk as domains in the Stadia Maps dashboard (free account, Manage Properties → Authentication Configuration); tiles currently load, but requests without a referer get 401. The free tier is non-commercial use only, which fits. Re-check the tiles on globetros.dk once it is connected

## 3. Content and data
- [ ] Add photos: populate the `photos` array in `src/data/entries.json` and show them in the journal panel (gallery)
- [ ] Check why `Travellog` has 35 files but only 32 entries; extract any missing ones
- [ ] Verify the coordinates, dates and titles of all 32 entries
- [ ] Decide whether to use `original_content/Regnskab` (budget) and `Globetros pakkeliste.doc` (packing list) as extra sections

## 4. Mobile layout
- [ ] Replace the 50/50 split with a full-screen or bottom-sheet journal view on small screens
- [ ] Simpler navigation: fixed buttons at the bottom (previous / next / map or list)
- [ ] Test on real phone sizes, including touch targets and safe areas

## 5. Map
- [ ] Check the map on mobile and with the globe/flat toggle
- [ ] Reduce the JS bundle (about 1.5 MB, mostly MapLibre): check Turf imports, code-split the map

## 6. Travel path
- [ ] Add waypoints so overland legs follow roads and coastlines instead of straight lines

## 7. Title screen / logo
- [ ] Design a title screen or logo
- [ ] Inspiration: Indiana Jones (map with a travelling red line), TaleSpin, The Jungle Book
- [ ] Decide on the intro flow (title screen, then the map)

## 8. About page
- [ ] About page: explain the name "Globetros", who was on the trip, and who made the homepage
- [ ] Decide how it is reached (a discreet link or icon, so the journey stays the focus)

## 9. Research (no implementation yet)
- [ ] Book view: is there an external library that shows a book that opens and can be flipped through, so the entries could live in one? Research only. First lead: react-pageflip (a React wrapper around StPageFlip); check its maintenance, mobile behavior and how it handles long Danish text before deciding anything

## 10. Easter-egg section (nice to have)
Guiding principle: the main experience stays focused on the journey. All bonus features live behind one easter-egg icon or section and are never in the way of reading the entries.
- [ ] Design the easter-egg entry point (an icon or hidden spot) and the menu it opens
- [ ] Guest book: show the old entries
- [ ] Guest book: allow new entries (needs a backend or service, and moderation/spam protection)
- [ ] Historical weather data for each entry's place and date, if a source is available
- [ ] Narrator voice: read the entries aloud (text-to-speech or a recorded/generated voice), with play/pause in the journal panel
- [ ] Spelling-corrected version: show the raw original by default, with a toggle to a cleaned-up spelling/language version (keep the original text as the source of truth, e.g. a `textCorrected` field per entry)
- [ ] Very last: alternative versions of the entries in different voices, selectable in the journal panel: a wise old man, a Disneyfied version, and other ideas
