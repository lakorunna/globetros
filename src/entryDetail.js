import { useEffect, useState } from 'react';

// The text and photos of each entry live in public/entries/<id>.json and are fetched when the
// entry is opened, so they don't weigh down the first load. Each file is fetched at most once.
const cache = new Map();

export function loadEntryDetail(id) {
  if (!cache.has(id)) {
    const request = fetch(`${import.meta.env.BASE_URL}entries/${id}.json`)
      .then(response => {
        if (!response.ok) throw new Error(`Entry ${id}: HTTP ${response.status}`);
        return response.json();
      })
      .catch(error => {
        cache.delete(id); // allow a retry next time
        throw error;
      });
    cache.set(id, request);
  }
  return cache.get(id);
}

// { detail, error, loading } for the given entry id (null when no entry is open)
export function useEntryDetail(id) {
  const [state, setState] = useState({ id: null, detail: null, error: false });

  useEffect(() => {
    if (id == null) return undefined;
    let cancelled = false;
    loadEntryDetail(id)
      .then(detail => !cancelled && setState({ id, detail, error: false }))
      .catch(() => !cancelled && setState({ id, detail: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.id !== id) return { detail: null, error: false, loading: id != null };
  return { detail: state.detail, error: state.error, loading: false };
}
