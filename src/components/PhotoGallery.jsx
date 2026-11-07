import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './PhotoGallery.css';

// Full-screen viewer. The photos sit side by side on one wide strip that scrolls horizontally
// and snaps to each photo, so swiping drags the strip with your finger (native scrolling,
// momentum and all) instead of swapping images.
function Lightbox({ photos, startIndex, title, onClose }) {
  const trackRef = useRef(null);
  const currentRef = useRef(startIndex);
  const frameRef = useRef(0);
  const [current, setCurrent] = useState(startIndex);

  // Open on the photo that was tapped
  useLayoutEffect(() => {
    const track = trackRef.current;
    track.scrollLeft = startIndex * track.clientWidth;
  }, [startIndex]);

  function step(delta) {
    const track = trackRef.current;
    track.scrollBy({ left: delta * track.clientWidth, behavior: 'smooth' });
  }

  // Keyboard controls, registered in the capture phase so Escape closes the viewer
  // without also closing the journal panel behind it
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else return;
      e.stopPropagation();
    }
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [onClose]);

  // Keep the same photo in view when the window is resized or rotated
  useEffect(() => {
    function handleResize() {
      const track = trackRef.current;
      track.scrollLeft = currentRef.current * track.clientWidth;
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // Work out which photo is in view while the strip moves
  function handleScroll() {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      currentRef.current = index;
      setCurrent(index);
    });
  }

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true">
      <div className="lightbox__track" ref={trackRef} onScroll={handleScroll}>
        {photos.map((photo, i) => {
          // Only photos near the one in view load in full; the rest show their thumbnail
          const near = Math.abs(i - current) <= 2;
          const alt = photo.caption ?? `${title} — billede ${i + 1}`;
          return (
            <figure
              key={photo.src}
              className="lightbox__slide"
              onClick={e => e.target === e.currentTarget && onClose()}
            >
              <img
                src={near ? photo.src : undefined}
                width={photo.w}
                height={photo.h}
                style={{ backgroundImage: `url(${photo.thumb})` }}
                alt={near ? alt : ''}
                draggable={false}
              />
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          );
        })}
      </div>

      <button className="lightbox__close" onClick={onClose} aria-label="Luk billede">
        ×
      </button>
      <button
        className="lightbox__arrow lightbox__arrow--prev"
        onClick={() => step(-1)}
        disabled={current === 0}
        aria-label="Forrige billede"
      >
        ‹
      </button>
      <button
        className="lightbox__arrow lightbox__arrow--next"
        onClick={() => step(1)}
        disabled={current === photos.length - 1}
        aria-label="Næste billede"
      >
        ›
      </button>
      <div className="lightbox__count">
        {current + 1} / {photos.length}
      </div>
    </div>,
    document.body,
  );
}

export default function PhotoGallery({ photos, title }) {
  const [openIndex, setOpenIndex] = useState(null);

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

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={openIndex}
          title={title}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
