// Builds src/data/route-legs.json: the road geometry for each overland leg of the trip.
//
// For every pair of consecutive entries (except the flight) this asks the public OSRM routing
// service for the driving route between them, simplifies it and stores it, so the map draws
// the route along real roads instead of straight lines. The result is committed, so this only
// needs to be re-run when entries or their coordinates change:  npm run route
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { distance, lineString, simplify } from '@turf/turf';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENTRIES = join(__dirname, '..', 'src', 'data', 'entries.json');
const OUTPUT = join(__dirname, '..', 'src', 'data', 'route-legs.json');

const OSRM = 'https://router.project-osrm.org/route/v1/driving';
const SIMPLIFY_TOLERANCE = 0.01; // degrees, about 1 km: plenty for a line on a map
const SAME_PLACE_KM = 8; // legs shorter than this stay straight (e.g. several entries in one town)
const MAX_DETOUR = 3; // a road route this many times longer than the crow flies looks wrong

const entries = JSON.parse(readFileSync(ENTRIES, 'utf8'));
const legs = {};
const report = [];

for (let i = 0; i < entries.length - 1; i++) {
  const from = entries[i];
  const to = entries[i + 1];
  const a = [from.coordinates.lng, from.coordinates.lat];
  const b = [to.coordinates.lng, to.coordinates.lat];
  const label = `#${from.id} ${from.location} → #${to.id} ${to.location}`;

  if (to.arrival === 'flight') {
    report.push(`  ✈  ${label} (flight, drawn as an arc)`);
    continue;
  }

  const crowFlies = distance(a, b);
  if (crowFlies < SAME_PLACE_KM) {
    report.push(`  ·  ${label} (${crowFlies.toFixed(1)} km, left straight)`);
    continue;
  }

  const url = `${OSRM}/${a.join(',')};${b.join(',')}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.code !== 'Ok') {
    report.push(`  !  ${label}: ${data.code}, left straight`);
    continue;
  }

  const route = data.routes[0];
  const roadKm = route.distance / 1000;
  if (roadKm > crowFlies * MAX_DETOUR) {
    report.push(`  !  ${label}: road ${roadKm.toFixed(0)} km vs ${crowFlies.toFixed(0)} km straight, left straight`);
    continue;
  }

  // Start and end exactly on the pins, with the road in between
  const road = simplify(lineString(route.geometry.coordinates), { tolerance: SIMPLIFY_TOLERANCE })
    .geometry.coordinates;
  legs[from.id] = [a, ...road, b].map(([lng, lat]) => [+lng.toFixed(4), +lat.toFixed(4)]);
  report.push(`  ✓  ${label}: ${roadKm.toFixed(0)} km by road, ${legs[from.id].length} points`);

  await new Promise(resolve => setTimeout(resolve, 400)); // be polite to the public server
}

writeFileSync(OUTPUT, JSON.stringify(legs));
console.log(report.join('\n'));
console.log(`\nWrote ${Object.keys(legs).length} road legs to src/data/route-legs.json`);
