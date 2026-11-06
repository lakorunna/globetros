# Globetros – To-do

Only open items. Ordered by priority; the easter-egg section comes last.

## 1. Content and data
- [ ] Find the 95 photos that appear in the travel logs but were not in the Photos folder (list and thumbnails in `original_content/_missing_photos/`), then add them to the entries
- [ ] Check why `Travellog` has 35 files but only 32 entries; extract any missing ones
- [ ] Verify the coordinates, dates and titles of all 32 entries
- [ ] Decide whether to use `original_content/Regnskab` (budget) and `Globetros pakkeliste.doc` (packing list) as extra sections

## 2. Look and feel
- [ ] Fine-tune the field-journal look: the vehicle emoji, the lightbox, spacing, and anything that feels off on a real phone
- [ ] Carry the same style into the title screen, logo and About page

## 3. Mobile layout
- [ ] Test on a real phone (touch targets, safe areas, the iOS address bar); so far only checked in the browser's phone-size emulation
- [ ] Optional polish: swipe left/right in the photo lightbox, and keep the pin highlighted when returning to the map with the Kort button

## 4. Map
- [ ] Check the map on mobile and with the globe/flat toggle
- [ ] Reduce the JS bundle (about 1.5 MB, mostly MapLibre): check Turf imports, code-split the map

## 5. Travel path
- [ ] Add waypoints so overland legs follow roads and coastlines instead of straight lines

## 6. Title screen / logo
- [ ] Design a title screen or logo
- [ ] Inspiration: Indiana Jones (map with a travelling red line), TaleSpin, The Jungle Book
- [ ] Decide on the intro flow (title screen, then the map)
- [ ] Refine the opening fly-in from Denmark to the first entry (currently a simple 7 s fly-to; ideas: a start marker in Denmark, the route drawing itself, a plane, skip button)

## 7. About page
- [ ] About page: explain the name "Globetros", who was on the trip, and who made the homepage
- [ ] Decide how it is reached (a discreet link or icon, so the journey stays the focus)

## 8. Research (no implementation yet)
- [ ] Book view: is there an external library that shows a book that opens and can be flipped through, so the entries could live in one? Research only. First lead: react-pageflip (a React wrapper around StPageFlip); check its maintenance, mobile behavior and how it handles long Danish text before deciding anything

## 9. Easter-egg section (nice to have)
Guiding principle: the main experience stays focused on the journey. All bonus features live behind one easter-egg icon or section and are never in the way of reading the entries.
- [ ] Design the easter-egg entry point (an icon or hidden spot) and the menu it opens
- [ ] Guest book: show the old entries
- [ ] Guest book: allow new entries (needs a backend or service, and moderation/spam protection)
- [ ] Historical weather data for each entry's place and date, if a source is available
- [ ] Narrator voice: read the entries aloud (text-to-speech or a recorded/generated voice), with play/pause in the journal panel
- [ ] Spelling-corrected version: show the raw original by default, with a toggle to a cleaned-up spelling/language version (keep the original text as the source of truth, e.g. a `textCorrected` field per entry)
- [ ] Very last: alternative versions of the entries in different voices, selectable in the journal panel: a wise old man, a Disneyfied version, and other ideas
