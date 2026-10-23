import { useEffect, useRef } from 'react';
import './JournalPanel.css';

export default function JournalPanel({ entry, prevEntry, nextEntry, onClose, onNavigate }) {
  const bodyRef = useRef(null);

  // Scroll back to top whenever a new entry opens
  const entryId = entry?.id;
  useEffect(() => {
    if (entryId && bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [entryId]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && entry) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div className="journal-panel">
      <header className="journal-panel__header">
        <button
          className="journal-panel__close"
          onClick={onClose}
          aria-label="Luk dagbogen"
          title="Luk (Esc)"
        >
          ×
        </button>
        <div className="journal-panel__meta">
          <span className="journal-panel__country">{entry.country}</span>
          <span className="journal-panel__entry-num">#{entry.id}</span>
          {entry.date && (
            <span className="journal-panel__date">{entry.date}</span>
          )}
        </div>
        <h2 className="journal-panel__title">{entry.title}</h2>
        <p className="journal-panel__location">{entry.location}</p>
      </header>

      <div className="journal-panel__body" ref={bodyRef}>
        <p className="journal-panel__text">{entry.text}</p>
      </div>

      {entry.photos && entry.photos.length > 0 && (
        <div className="journal-panel__gallery">
          {entry.photos.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${entry.title} — billede ${i + 1}`}
              className="journal-panel__photo"
            />
          ))}
        </div>
      )}

      <nav className="journal-panel__nav">
        <button
          className="journal-panel__nav-btn"
          onClick={() => prevEntry && onNavigate(prevEntry)}
          disabled={!prevEntry}
          title={prevEntry ? `#${prevEntry.id} ${prevEntry.title}` : undefined}
        >
          ← {prevEntry ? `#${prevEntry.id}` : ''}
        </button>
        <span className="journal-panel__nav-pos">
          {entry.id} / 32
        </span>
        <button
          className="journal-panel__nav-btn"
          onClick={() => nextEntry && onNavigate(nextEntry)}
          disabled={!nextEntry}
          title={nextEntry ? `#${nextEntry.id} ${nextEntry.title}` : undefined}
        >
          {nextEntry ? `#${nextEntry.id}` : ''} →
        </button>
      </nav>
    </div>
  );
}
