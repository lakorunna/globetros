import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// pdf-parse v1 exports a function directly (v2 has a different API)
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PDF_DIR = join(ROOT, 'original_content', 'Travellog');
const OUTPUT = join(ROOT, 'src', 'data', 'entries.json');

// Pre-assigned metadata and coordinates for each numbered entry
const METADATA = {
  1:  { title: 'Finally here',                              country: 'Costa Rica', location: 'San José',                   lat:   9.9281, lng: -84.0907 },
  2:  { title: 'Første dag i Paradis',                      country: 'Costa Rica', location: 'Montezuma',                  lat:   9.6546, lng: -85.0696 },
  3:  { title: "Just can't leave Montezuma",                country: 'Costa Rica', location: 'Montezuma',                  lat:   9.6446, lng: -85.0596 },
  4:  { title: 'Pura Vida i Montezuma',                     country: 'Costa Rica', location: 'Montezuma',                  lat:   9.6646, lng: -85.0796 },
  5:  { title: 'Santa Elena',                               country: 'Costa Rica', location: 'Santa Elena / Monteverde',   lat:  10.3238, lng: -84.8205 },
  6:  { title: 'Sidste dage i Santa Elena',                 country: 'Costa Rica', location: 'Monteverde Cloud Forest',    lat:  10.2998, lng: -84.7945 },
  7:  { title: 'Et par dage ved Tenorio',                   country: 'Costa Rica', location: 'Tenorio Volcano NP',         lat:  10.7360, lng: -85.0130 },
  8:  { title: 'La Fortuna, Arenal og Lava Lava',           country: 'Costa Rica', location: 'La Fortuna / Arenal',        lat:  10.4632, lng: -84.6436 },
  9:  { title: 'Lets go rafting!',                          country: 'Costa Rica', location: 'Pacuare River',              lat:   9.9000, lng: -83.6800 },
  10: { title: 'Sol og strand og Zulu-mand',                country: 'Costa Rica', location: 'Manuel Antonio',             lat:   9.3929, lng: -84.1401 },
  11: { title: 'Mere badeferie - nu ogsaa med kabel-TV!',   country: 'Costa Rica', location: 'Jacó',                       lat:   9.6150, lng: -84.6261 },
  12: { title: 'Mens vi venter paa nye eventyr',            country: 'Costa Rica', location: 'San José',                   lat:   9.9381, lng: -84.1007 },
  13: { title: 'Fotoshoot i Lima',                          country: 'Peru',       location: 'Lima',                       lat: -12.0464, lng: -77.0428 },
  14: { title: 'Hostel San Isidro, Islas Ballestas & Paracas', country: 'Peru',   location: 'Paracas / Islas Ballestas',  lat: -13.8348, lng: -76.2506 },
  15: { title: 'Skeletter med kasketter og uSANDsynligt sjov ørkent ur', country: 'Peru', location: 'Huacachina',         lat: -14.0876, lng: -75.7645 },
  16: { title: 'Og quiz-vinderen er...',                    country: 'Peru',       location: 'Ica',                        lat: -14.0667, lng: -75.7333 },
  17: { title: 'Nazca linjerne',                            country: 'Peru',       location: 'Nazca',                      lat: -14.8285, lng: -74.9476 },
  18: { title: 'Arequipa og The Colca Canyon',              country: 'Peru',       location: 'Arequipa',                   lat: -16.4090, lng: -71.5375 },
  19: { title: 'Boing boing!',                              country: 'Peru',       location: 'Colca Canyon',               lat: -15.5800, lng: -71.8700 },
  20: { title: 'The Lost City of The Incas',                country: 'Peru',       location: 'Machu Picchu',               lat: -13.1631, lng: -72.5450 },
  21: { title: 'Den dag Mølle-drengen blev til Mølle-manden', country: 'Peru',     location: 'Cusco',                      lat: -13.5319, lng: -71.9675 },
  22: { title: 'Lake Titicaca',                             country: 'Peru',       location: 'Lake Titicaca / Puno',       lat: -15.8402, lng: -70.0219 },
  23: { title: 'Verdens farligste vej!',                    country: 'Bolivia',    location: 'Death Road, La Paz',         lat: -16.4897, lng: -67.8500 },
  24: { title: 'Lagkageparken',                             country: 'Chile',      location: 'San Pedro de Atacama',       lat: -22.9087, lng: -68.2000 },
  25: { title: 'Iquique',                                   country: 'Chile',      location: 'Iquique',                    lat: -20.2208, lng: -70.1431 },
  26: { title: 'Valparaíso og Viña del Mar',                country: 'Chile',      location: 'Valparaíso',                 lat: -33.0472, lng: -71.6127 },
  27: { title: 'Fiskeri og vulkantur ved Pucón',            country: 'Chile',      location: 'Pucón / Villarrica',         lat: -39.2720, lng: -71.9780 },
  28: { title: 'Mere spas i Pucón',                         country: 'Chile',      location: 'Pucón',                      lat: -39.2820, lng: -71.9680 },
  29: { title: 'Glaciar Perito Moreno',                     country: 'Argentina',  location: 'Perito Moreno Glacier',      lat: -50.4964, lng: -73.0770 },
  30: { title: 'Trekking ved Monte Fitz Roy',               country: 'Argentina',  location: 'El Chaltén / Fitz Roy',      lat: -49.3306, lng: -72.8861 },
  31: { title: 'Trekking ved Torres del Paine',             country: 'Chile',      location: 'Torres del Paine',           lat: -50.9423, lng: -73.4068 },
  32: { title: 'Buenos Aires',                              country: 'Argentina',  location: 'Buenos Aires',               lat: -34.6037, lng: -58.3816 },
};

/**
 * Strip the website boilerplate and photo-caption sidebar from raw PDF text,
 * and extract the publication date.
 *
 * Every PDF was saved from travelmarket.dk and contains:
 *   1. Top navigation / site header (always the same)
 *   2. "Beretnings info" block with country, date, author, comments
 *   3. Breadcrumb:  globetros » Beretninger » <title>
 *   4. "Billeder" + photo captions (short fragmented lines from a sidebar)
 *   5. The entry title repeated on its own line  ← real text starts here
 *   6. The actual blog post body
 *
 * Returns { date: string|null, text: string }
 */
function parseEntry(rawText) {
  // Normalise first so we work with clean lines
  const normalised = rawText
    .replace(/\f/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 1. Extract the date from the header block (e.g. "04. jan. 2007")
  const dateMatch = normalised.match(/(\d{2}\. \w{3,4}\. \d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  // 2. Find the LAST breadcrumb occurrence (the real one — the nav also has
  //    a "Billeder" entry before the real breadcrumb section)
  const CRUMB_PREFIX = 'globetros » Beretninger » ';
  const crumbIdx = normalised.lastIndexOf(CRUMB_PREFIX);
  if (crumbIdx === -1) {
    // No breadcrumb found — return normalised text as-is
    return { date, text: normalised };
  }

  // 3. Extract the breadcrumb title (it's the text on that line after the prefix)
  const afterCrumb = normalised.slice(crumbIdx + CRUMB_PREFIX.length);
  const crumbTitle = afterCrumb.split('\n')[0].trim();

  // 4. Find the title line that marks the start of the real text body.
  //    It appears on its own line right after all the photo captions.
  //    We search for "\n<title>\n" after the breadcrumb.
  const escapedTitle = crumbTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const titleLineRe = new RegExp(`\n(${escapedTitle})\n`);
  const titleMatch = afterCrumb.match(titleLineRe);

  let text;
  if (titleMatch) {
    const titleLineIdx = afterCrumb.indexOf(titleMatch[0]);
    // Skip the title line itself — the title is already shown in the panel header
    text = afterCrumb.slice(titleLineIdx + 1 + crumbTitle.length + 1).trim();
  } else {
    // Fallback: skip the breadcrumb line and "Billeder" header, take everything after
    text = afterCrumb.replace(/^.*?\nBilleder\n/s, '').trim();
  }

  // Final whitespace cleanup
  text = text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { date, text };
}

async function extractEntries() {
  const files = readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));

  // Sort numerically: extract leading number from filename
  const numbered = files
    .map(f => ({ filename: f, num: parseInt(f.match(/^(\d+)\./)?.[1], 10) }))
    .filter(f => !isNaN(f.num))
    .sort((a, b) => a.num - b.num);

  console.log(`Found ${numbered.length} numbered PDFs`);

  const entries = [];

  for (const { filename, num } of numbered) {
    const meta = METADATA[num];
    if (!meta) {
      console.warn(`  [!] No metadata defined for entry #${num} (${filename}) — skipping`);
      continue;
    }

    const filepath = join(PDF_DIR, filename);
    let text = '';
    let date = null;
    try {
      const buffer = readFileSync(filepath);
      const parsed = await pdfParse(buffer);
      ({ date, text } = parseEntry(parsed.text));
      console.log(`  ✓ #${num} "${meta.title}" — ${text.length} chars, date: ${date ?? '(not found)'}`);
    } catch (err) {
      console.error(`  ✗ #${num} "${meta.title}" — extraction failed: ${err.message}`);
    }

    entries.push({
      id: num,
      title: meta.title,
      country: meta.country,
      location: meta.location,
      date,
      coordinates: { lat: meta.lat, lng: meta.lng },
      text,
      filename,
      photos: [],
    });
  }

  writeFileSync(OUTPUT, JSON.stringify(entries, null, 2), 'utf8');
  console.log(`\nWrote ${entries.length} entries to src/data/entries.json`);
}

extractEntries().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
