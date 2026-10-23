import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdventureMap.css';
import visitedCountries from '../data/visited-countries.json';

// Fix Leaflet's default icon path issue in Vite builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Bounds covering Costa Rica through Argentina
const BOUNDS = [[14.0, -92.0], [-56.0, -32.0]];

function createPin(entry, isSelected) {
  return L.divIcon({
    className: `vintage-pin${isSelected ? ' selected' : ''}`,
    html: `<div class="pin-body"><span class="pin-num">${entry.id}</span></div>`,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    tooltipAnchor: [16, -44],
  });
}

// Handles both invalidateSize (after panel slide) and country-bounds fitting.
// Only re-zooms when the country changes — same-country entry switches leave the map alone.
function MapController({ entries, selectedEntry }) {
  const map = useMap();
  const prevCountryRef = useRef(null);

  useEffect(() => {
    const country = selectedEntry?.country ?? null;
    const sameCountry = country === prevCountryRef.current;

    // Always invalidate after the panel CSS transition (400ms)
    const resizeTimer = setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 440);

    if (country && !sameCountry) {
      // New country selected — fit to all pins in that country
      prevCountryRef.current = country;
      const countryEntries = entries.filter(e => e.country === country);
      const lats = countryEntries.map(e => e.coordinates.lat);
      const lngs = countryEntries.map(e => e.coordinates.lng);
      const bounds = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
      // Fit after the panel has finished opening so the map knows its new width
      const fitTimer = setTimeout(() => {
        map.fitBounds(bounds, { padding: [60, 60], animate: true, duration: 0.8 });
      }, 460);
      return () => { clearTimeout(resizeTimer); clearTimeout(fitTimer); };
    }

    if (!country) {
      // Panel closed — reset so next open always zooms
      prevCountryRef.current = null;
    }

    return () => clearTimeout(resizeTimer);
  }, [selectedEntry, entries, map]);

  return null;
}

export default function AdventureMap({ entries, selectedEntry, onSelect }) {
  // Build the route polyline coordinates in entry order
  const routePositions = useMemo(
    () => entries.map(e => [e.coordinates.lat, e.coordinates.lng]),
    [entries]
  );

  return (
    <div className="adventure-map">
      <MapContainer
        bounds={BOUNDS}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg"
          attribution='Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Hosted by <a href="https://stadiamaps.com/">Stadia Maps</a>.'
          minZoom={3}
          maxZoom={16}
        />

        {/* Visited country highlight polygons — rendered below the route */}
        <GeoJSON
          data={visitedCountries}
          style={() => ({ className: 'country-highlight' })}
        />

        {/* Dashed route line connecting all pins in travel order */}
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: '#8b3a1a',
            weight: 2,
            opacity: 0.7,
            dashArray: '8, 6',
            lineCap: 'round',
            lineJoin: 'round',
            className: 'route-line',
          }}
        />

        {/* One marker per entry */}
        {entries.map(entry => (
          <Marker
            key={entry.id}
            position={[entry.coordinates.lat, entry.coordinates.lng]}
            icon={createPin(entry, selectedEntry?.id === entry.id)}
            eventHandlers={{ click: () => onSelect(entry) }}
          >
            <Tooltip
              className="pin-tooltip"
              direction="top"
              offset={[0, -36]}
              opacity={1}
            >
              #{entry.id} · {entry.title}
            </Tooltip>
          </Marker>
        ))}

        <MapController entries={entries} selectedEntry={selectedEntry} />
      </MapContainer>

      {selectedEntry && (
        <div className="country-overlay">
          {selectedEntry.country}
        </div>
      )}
    </div>
  );
}
