import { useEffect, useRef } from 'react';
import PhotoGallery from './PhotoGallery';
import './JournalPanel.css';

// The PDFs hard-wrapped every line at about 80 characters, which looks ragged in a narrower
// panel. Join those wrapped lines back together, but keep breaks after short lines
// (headings such as dates, intentional line breaks) and blank lines between paragraphs.
function reflow(text) {
  return text.replace(/([^\n]{50,})\n(?!\n)/g, '$1 ');
}

export default function JournalPanel({
  entry,
  prevEntry,
  nextEntry,
  onClose,
  onNavigate,
  sheetMode,
  snap,
  heights,
  onSnapChange,
  onStart,
}) {
  const bodyRef = useRef(null);
  const sheetRef = useRef(null);
  const dragRef = useRef(null);

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

  // Bottom sheet dragging: grab the header, drag up or down, and it settles on the nearest
  // resting height (peek / half / full), taking the flick velocity into account.
  function handlePointerDown(e) {
    if (!sheetMode || !entry || e.target.closest('button')) return;
    const el = sheetRef.current;
    dragRef.current = {
      startY: e.clientY,
      startHeight: el.offsetHeight,
      lastY: e.clientY,
      lastTime: e.timeStamp,
      velocity: 0, // px per ms, positive = moving up
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    el.classList.add('journal-panel--dragging');
  }

  function handlePointerMove(e) {
    const drag = dragRef.current;
    if (!drag) return;
    const delta = drag.startY - e.clientY;
    if (Math.abs(delta) > 4) drag.moved = true;
    const height = Math.min(heights.full, Math.max(heights.peek, drag.startHeight + delta));
    sheetRef.current.style.height = `${height}px`;
    const elapsed = e.timeStamp - drag.lastTime;
    if (elapsed > 0) drag.velocity = (drag.lastY - e.clientY) / elapsed;
    drag.lastY = e.clientY;
    drag.lastTime = e.timeStamp;
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const el = sheetRef.current;
    el.classList.remove('journal-panel--dragging');

    let next;
    if (!drag.moved) {
      // A tap on the handle toggles between the bar and half height
      next = snap === 'half' ? 'peek' : 'half';
    } else {
      const projected = el.offsetHeight + drag.velocity * 200;
      next = Object.keys(heights).reduce((best, key) =>
        Math.abs(heights[key] - projected) < Math.abs(heights[best] - projected) ? key : best,
      );
    }
    el.style.height = `${heights[next]}px`;
    onSnapChange(next);
  }

  if (!entry && !sheetMode) return null;

  const panelClass = `journal-panel${sheetMode ? ' journal-panel--sheet' : ''}`;

  // Bottom sheet with nothing selected: a bar inviting the visitor to start
  if (!entry) {
    return (
      <div className={panelClass} style={{ height: heights.peek }} ref={sheetRef}>
        <header className="journal-panel__header">
          <div className="journal-panel__handle" aria-hidden="true" />
          <h2 className="journal-panel__title">Globetros</h2>
          <p className="journal-panel__intro">Tryk på en nål på kortet, eller følg rejsen fra start.</p>
        </header>
        <nav className="journal-panel__nav">
          <button className="journal-panel__nav-btn journal-panel__nav-start" onClick={onStart}>
            Begynd rejsen →
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div
      className={panelClass}
      style={sheetMode ? { height: heights[snap] } : undefined}
      ref={sheetRef}
    >
      <header
        className="journal-panel__header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {sheetMode && <div className="journal-panel__handle" aria-hidden="true" />}
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
          <span className="journal-panel__location">{entry.location}</span>
          <span className="journal-panel__entry-num">#{entry.id}</span>
          {entry.date && <span className="journal-panel__date">{entry.date}</span>}
        </div>
        <h2 className="journal-panel__title">{entry.title}</h2>
      </header>

      <div className="journal-panel__body" ref={bodyRef}>
        <div className="journal-panel__content">
          <p className="journal-panel__text">{reflow(entry.text)}</p>
          {entry.photos && entry.photos.length > 0 && (
            <PhotoGallery key={entry.id} photos={entry.photos} title={entry.title} />
          )}
        </div>
      </div>

      <nav className="journal-panel__nav">
        <button
          className="journal-panel__nav-btn"
          onClick={() => prevEntry && onNavigate(prevEntry)}
          disabled={!prevEntry}
          title={prevEntry ? `#${prevEntry.id} ${prevEntry.title}` : undefined}
        >
          ← {prevEntry ? `#${prevEntry.id}` : ''}
        </button>
        <button
          className="journal-panel__nav-btn journal-panel__nav-map"
          onClick={() => onSnapChange(snap === 'peek' ? 'half' : 'peek')}
        >
          {snap === 'peek' ? 'Læs' : 'Kort'}
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
