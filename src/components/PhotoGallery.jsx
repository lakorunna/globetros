import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './PhotoGallery.css';

const SWIPE_DISTANCE = 50; // px a horizontal drag must travel to change photo

export default function PhotoGallery({ photos, title }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [direction, setDirection] = useState(0); // +1 = came from the right, -1 = from the left
  const [dragX, setDragX] = useState(0);
  const swipeRef = useRef(null);
  const swipedRef = useRef(false); // a swipe's release can fire a click; don't treat it as a tap-to-close
  const isOpen = openIndex !== null;

  function go(delta) {
    setOpenIndex(i => {
      const next = Math.min(Math.max(i + delta, 0), photos.length - 1);
      if (next !== i) setDirection(delta);
      return next;
    });
  }

  // Keyboard controls for the lightbox. Registered in the capture phase so Escape
  // closes the lightbox without also closing the journal panel behind it.
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpenIndex(null);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else return;
      e.stopPropagation();
    }
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, photos.length]);

  // Start loading the neighbouring photos so stepping through feels instant
  useEffect(() => {
    if (openIndex === null) return;
    [openIndex - 1, openIndex + 1].forEach(i => {
      if (photos[i]) new Image().src = photos[i].src;
    });
  }, [openIndex, photos]);

  // Swipe left/right to change photo; the photo follows the finger
  function handlePointerDown(e) {
    swipedRef.current = false;
    swipeRef.current = { x: e.clientX, y: e.clientY, horizontal: false };
  }

  function handlePointerMove(e) {
    const swipe = swipeRef.current;
    if (!swipe) return;
    const dx = e.clientX - swipe.x;
    const dy = e.clientY - swipe.y;
    if (!swipe.horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      swipe.horizontal = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (swipe.horizontal) setDragX(dx);
  }

  function handlePointerUp(e) {
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe?.horizontal) return;
    swipedRef.current = true;
    const dx = e.clientX - swipe.x;
    setDragX(0);
    if (dx <= -SWIPE_DISTANCE) go(1);
    else if (dx >= SWIPE_DISTANCE) go(-1);
  }

  const photo = isOpen ? photos[openIndex] : null;

  return (
    <section className="photo-gallery">
      <h3 className="photo-gallery__heading">Billeder</h3>
      <div className="photo-gallery__grid">
        {photos.map((p, i) => (
          <figure key={p.src} className="photo-gallery__item">
            <button
              className="photo-gallery__thumb"
              onClick={() => setOpenIndex(i)}
              style={{ aspectRatio: `${p.w} / ${p.h}` }}
              aria-label={p.caption ?? `${title} — billede ${i + 1}`}
            >
              <img src={p.thumb} alt={p.caption ?? `${title} — billede ${i + 1}`} loading="lazy" />
            </button>
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {photo && createPortal(
        <div
          className="lightbox"
          onClick={() => {
            if (swipedRef.current) swipedRef.current = false;
            else setOpenIndex(null);
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="dialog"
          aria-modal="true"
        >
          <button className="lightbox__close" onClick={() => setOpenIndex(null)} aria-label="Luk billede">
            ×
          </button>
          <button
            className="lightbox__arrow lightbox__arrow--prev"
            onClick={e => { e.stopPropagation(); go(-1); }}
            disabled={openIndex === 0}
            aria-label="Forrige billede"
          >
            ‹
          </button>
          <figure
            key={openIndex}
            className={`lightbox__figure${direction ? ` lightbox__figure--from-${direction > 0 ? 'right' : 'left'}` : ''}`}
            style={dragX ? { transform: `translateX(${dragX}px)`, animation: 'none' } : undefined}
            onClick={e => e.stopPropagation()}
          >
            {/* The small thumbnail shows instantly behind the full photo while it loads */}
            <img
              src={photo.src}
              width={photo.w}
              height={photo.h}
              style={{ backgroundImage: `url(${photo.thumb})` }}
              alt={photo.caption ?? `${title} — billede ${openIndex + 1}`}
              draggable={false}
            />
            <figcaption>
              {photo.caption && <span className="lightbox__caption">{photo.caption}</span>}
              <span className="lightbox__count">{openIndex + 1} / {photos.length}</span>
            </figcaption>
          </figure>
          <button
            className="lightbox__arrow lightbox__arrow--next"
            onClick={e => { e.stopPropagation(); go(1); }}
            disabled={openIndex === photos.length - 1}
            aria-label="Næste billede"
          >
            ›
          </button>
        </div>,
        document.body,
      )}
    </section>
  );
}
