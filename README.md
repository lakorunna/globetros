# Globetros

An interactive travel journal built from the 32 travel log entries ("travellogs") written during a backpacking trip through Costa Rica, Peru, Bolivia, Chile and Argentina in 2007. A full-screen map shows the route; click a pin to read that entry in a panel beside the map.

The journal text is in Danish and is kept as originally written.

Planned home: globetros.dk

## Running it locally

Requires Node.js and npm.

```bash
npm install
npm run dev        # dev server with hot reload
npm run build      # production build into dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
```

## Tech

- React 19 and Vite
- Leaflet via react-leaflet for the map
- Stamen Watercolor tiles, served by Stadia Maps

## Project layout

```
src/
  App.jsx                    layout and selected-entry state
  components/
    AdventureMap.jsx         map, pins, route line, country highlights
    JournalPanel.jsx         sliding panel that shows an entry
    PhotoGallery.jsx         photo grid with captions and a lightbox
  data/
    entries.json             the 32 entries (text, location, coordinates, photos)
    visited-countries.json   country outlines highlighted on the map
public/photos/               web-sized photos per entry (1200 px) and thumbnails, matched to the PDFs
scripts/
  extract-entries.js         one-time extraction of entries from the PDFs
original_content/            source material: the PDF travel logs, budget files, packing list
                             (original_content/Photos holds the full-size photos and is git-ignored)
```

## Regenerating the entries

`entries.json` was generated from the PDFs in `original_content/Travellog/`:

```bash
npm run extract
```

Note that this overwrites `src/data/entries.json`. Existing `photos` arrays are kept, but any other hand edits (such as coordinates) would be lost, so check the diff before committing.

## Roadmap

See [TODO.md](TODO.md).
