import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {
  along,
  bearing,
  distance,
  greatCircle,
  length,
  lineSliceAlong,
  lineString,
} from '@turf/turf';
import './AdventureMap.css';
import visitedCountries from '../data/visited-countries.json';

// In dev MapLibre finds its worker next to its own module (see optimizeDeps in vite.config.js).
// In a production bundle that file is gone, so point it at the worker Vite emits.
if (import.meta.env.PROD) maplibregl.setWorkerUrl(workerUrl);

// Bounds covering Costa Rica through Argentina ([lng, lat] pairs)
const BOUNDS = [[-92.0, -56.0], [-32.0, 14.0]];

// Legs longer than this are drawn as great-circle arcs and travelled by plane
const FLIGHT_KM = 1200;

const EMPTY = { type: 'FeatureCollection', features: [] };

const STYLE = {
  version: 8,
  projection: { type: 'globe' },
  sources: {
    watercolor: {
      type: 'raster',
      tiles: ['https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'],
      tileSize: 256,
      maxzoom: 16,
      attribution:
        'Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Hosted by <a href="https://stadiamaps.com/">Stadia Maps</a>.',
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#e8d5a3' } },
    {
      id: 'watercolor',
      type: 'raster',
      source: 'watercolor',
      paint: { 'raster-saturation': -0.15, 'raster-brightness-max': 0.97 },
    },
  ],
};

// Builds one continuous route through all entries, with the distance (km)
// at which each entry sits along it and a flight/overland flag per leg.
function buildRoute(entries) {
  const coords = [];
  const entryDist = [];
  const legs = [];
  let total = 0;

  entries.forEach((entry, i) => {
    const here = [entry.coordinates.lng, entry.coordinates.lat];
    if (i === 0) {
      coords.push(here);
      entryDist.push(0);
      return;
    }
    const prev = coords[coords.length - 1];
    const flight = distance(prev, here) > FLIGHT_KM;
    const leg = flight
      ? greatCircle(prev, here, { npoints: 64 }).geometry.coordinates
      : [prev, here];
    coords.push(...leg.slice(1));
    const from = total;
    total += length(lineString(leg));
    entryDist.push(total);
    legs.push({ from, to: total, flight });
  });

  return { line: lineString(coords), entryDist, legs, total };
}

function slice(line, from, to) {
  if (to - from < 0.001) return EMPTY;
  return lineSliceAlong(line, from, to);
}

function createPin(entry, onClick) {
  const el = document.createElement('div');
  el.className = 'vintage-pin';
  el.innerHTML = `<div class="pin-body"><span class="pin-num">${entry.id}</span></div>`;
  el.addEventListener('click', onClick);
  return el;
}

const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function AdventureMap({ entries, selectedEntry, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const pinsRef = useRef([]);
  const vehicleRef = useRef(null);
  const progressRef = useRef(null);
  const prevIndexRef = useRef(-1);
  const prevCountryRef = useRef(null);
  const rafRef = useRef(0);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  const route = useMemo(() => buildRoute(entries), [entries]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create the map, layers, pins and vehicle once
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      bounds: BOUNDS,
      fitBoundsOptions: { padding: 30 },
      minZoom: 0.5,
      maxZoom: 16,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');
    map.addControl(new maplibregl.GlobeControl(), 'top-left');

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    map.on('load', () => {
      map.addSource('countries', { type: 'geojson', data: visitedCountries });
      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        paint: { 'fill-color': '#8b3a1a', 'fill-opacity': 0.1 },
      });
      map.addLayer({
        id: 'countries-line',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': '#8b3a1a',
          'line-opacity': 0.45,
          'line-width': 1.5,
          'line-dasharray': [4, 3],
        },
      });

      map.addSource('route-past', { type: 'geojson', data: EMPTY });
      map.addSource('route-future', { type: 'geojson', data: EMPTY });
      map.addLayer({
        id: 'route-future',
        type: 'line',
        source: 'route-future',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#8b3a1a',
          'line-opacity': 0.7,
          'line-width': 2.5,
          'line-dasharray': [0.5, 2],
        },
      });
      map.addLayer({
        id: 'route-past',
        type: 'line',
        source: 'route-past',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#8b3a1a', 'line-opacity': 0.85, 'line-width': 3 },
      });

      pinsRef.current = entries.map(entry => {
        const el = createPin(entry, () => onSelectRef.current(entry));
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -40],
          className: 'pin-tooltip',
        }).setText(`#${entry.id} · ${entry.title}`);
        const lngLat = [entry.coordinates.lng, entry.coordinates.lat];
        el.addEventListener('mouseenter', () => popup.setLngLat(lngLat).addTo(map));
        el.addEventListener('mouseleave', () => popup.remove());
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(lngLat)
          .addTo(map);
        return { marker, el };
      });

      const vehicleEl = document.createElement('div');
      vehicleEl.className = 'vehicle';
      vehicleEl.innerHTML = '<span></span>';
      vehicleEl.style.display = 'none';
      vehicleRef.current = {
        el: vehicleEl,
        icon: vehicleEl.firstChild,
        marker: new maplibregl.Marker({ element: vehicleEl, anchor: 'center' })
          .setLngLat([0, 0])
          .addTo(map),
      };

      setReady(true);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      progressRef.current = null;
      prevIndexRef.current = -1;
      prevCountryRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to the selected entry: pins, route progress, vehicle and camera
  useEffect(() => {
    const map = mapRef.current;
    const vehicle = vehicleRef.current;
    if (!ready || !map || !vehicle) return;

    const index = selectedEntry ? entries.findIndex(e => e.id === selectedEntry.id) : -1;

    pinsRef.current.forEach(({ el }, i) => el.classList.toggle('selected', i === index));

    // Draw the route up to distance d: solid behind, dotted ahead
    function setProgress(d, showVehicle) {
      progressRef.current = d;
      map.getSource('route-past').setData(slice(route.line, 0, d));
      map.getSource('route-future').setData(slice(route.line, d, route.total));

      if (!showVehicle) {
        vehicle.el.style.display = 'none';
        return;
      }
      const here = along(route.line, d).geometry.coordinates;
      const ahead = along(route.line, Math.min(d + 5, route.total)).geometry.coordinates;
      const heading = bearing(here, ahead);
      const leg = route.legs.find(l => d >= l.from && d <= l.to);
      const flight = leg?.flight ?? false;
      vehicle.icon.textContent = flight ? '✈️' : '🚐';
      // ✈️ points north-east in most fonts; the van faces left, so flip it when heading east
      vehicle.icon.style.transform = flight
        ? `rotate(${heading - 45}deg)`
        : `scaleX(${heading > 0 ? -1 : 1})`;
      vehicle.marker.setLngLat(here);
      vehicle.el.style.display = 'block';
    }

    cancelAnimationFrame(rafRef.current);
    const target = index >= 0 ? route.entryDist[index] : route.total;
    const from = progressRef.current ?? route.total;
    const wasNone = prevIndexRef.current < 0;
    prevIndexRef.current = index;

    if (wasNone || index < 0 || Math.abs(target - from) < 1) {
      setProgress(target, false);
    } else {
      const duration = Math.min(Math.max(700 + Math.abs(target - from) * 1.2, 900), 3500);
      const start = performance.now();
      const step = now => {
        const t = Math.min((now - start) / duration, 1);
        const done = t === 1;
        setProgress(from + (target - from) * easeInOut(t), !done);
        if (!done) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }

    // Only re-zoom when the country changes — same-country switches leave the camera alone
    const country = selectedEntry?.country ?? null;
    if (country && country !== prevCountryRef.current) {
      prevCountryRef.current = country;
      const inCountry = entries.filter(e => e.country === country);
      const lngs = inCountry.map(e => e.coordinates.lng);
      const lats = inCountry.map(e => e.coordinates.lat);
      // Fit after the panel has finished opening so the map knows its new width
      const fitTimer = setTimeout(() => {
        map.fitBounds(
          [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
          { padding: 60, maxZoom: 8, duration: 1200 },
        );
      }, 460);
      return () => clearTimeout(fitTimer);
    }
    if (!country) prevCountryRef.current = null;
  }, [selectedEntry, entries, route, ready]);

  return (
    <div className="adventure-map">
      <div ref={containerRef} className="map-canvas" />
      {selectedEntry && <div className="country-overlay">{selectedEntry.country}</div>}
    </div>
  );
}
