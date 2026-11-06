import { useEffect, useState, useSyncExternalStore } from 'react';

// Below this the journal is a draggable bottom sheet instead of a side panel
export const SHEET_QUERY = '(max-width: 820px), (max-height: 500px)';

// Resting heights of the bottom sheet, in px
export const PEEK_HEIGHT = 140;

export function sheetHeights(viewportHeight) {
  return {
    peek: PEEK_HEIGHT,
    half: Math.round(viewportHeight * 0.7),
    full: Math.round(viewportHeight * 0.92),
  };
}

function subscribe(callback) {
  const mql = window.matchMedia(SHEET_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

export function useSheetMode() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(SHEET_QUERY).matches,
    () => false,
  );
}

export function useViewportHeight() {
  const [height, setHeight] = useState(() => window.innerHeight);
  useEffect(() => {
    const update = () => setHeight(window.innerHeight);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return height;
}
