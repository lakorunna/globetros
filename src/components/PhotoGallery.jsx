import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './PhotoGallery.css';

export default function PhotoGallery({ photos, title }) {
  const [openIndex, setOpenIndex] = useState(null);
  const isOpen = openIndex !== null;

  // Keyboard controls for the lightbox. Registered in the capture phase so Escape
  // closes the lightbox without also closing the journal panel behind it.
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpenIndex(null);
      else if (e.key === 'ArrowRight') setOpenIndex(i => Math.min(i + 1, photos.length - 1));
      else if (e.key === 'ArrowLeft') setOpenIndex(i => Math.max(i - 1, 0));
      else return;
      e.stopPropagation();
    }
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isOpen, photos.length]);

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
        <div className="lightbox" onClick={() => setOpenIndex(null)} role="dialog" aria-modal="true">
          <button className="lightbox__close" onClick={() => setOpenIndex(null)} aria-label="Luk billede">
            ×
          </button>
          <button
            className="lightbox__arrow lightbox__arrow--prev"
            onClick={e => { e.stopPropagation(); setOpenIndex(openIndex - 1); }}
            disabled={openIndex === 0}
            aria-label="Forrige billede"
          >
            ‹
          </button>
          <figure className="lightbox__figure" onClick={e => e.stopPropagation()}>
            <img src={photo.src} alt={photo.caption ?? `${title} — billede ${openIndex + 1}`} />
            <figcaption>
              {photo.caption && <span className="lightbox__caption">{photo.caption}</span>}
              <span className="lightbox__count">{openIndex + 1} / {photos.length}</span>
            </figcaption>
          </figure>
          <button
            className="lightbox__arrow lightbox__arrow--next"
            onClick={e => { e.stopPropagation(); setOpenIndex(openIndex + 1); }}
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
