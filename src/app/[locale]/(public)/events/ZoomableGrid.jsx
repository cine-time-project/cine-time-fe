"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ZoomableEventsGrid({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  // ESC ile lightbox kapatma
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && setOpenIndex(null);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <section className="events__grid">
        {items.map((item, i) => (
          <article key={i} className="eventCard">
            <button
              className="eventCard__media"
              onClick={() => setOpenIndex(i)}
              aria-label="Resmi büyüt"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 1200px) 100vw, 33vw"
                className="eventCard__image"
                priority={i === 0}
              />
            </button>
            <div className="eventCard__content">
              <h3>{item.title}</h3>
              <p className="eventCard__desc">{item.desc}</p>
              <span className="eventCard__date">{item.date}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Lightbox */}
      {openIndex !== null && (
        <div
          className="events__lightbox"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="events__lightbox-inner"
            role="dialog"
            aria-modal="true"
          >
            <Image
              src={items[openIndex].src}
              alt={items[openIndex].alt}
              width={1600}
              height={900}
              className="events__lightbox-img"
            />
          </div>
        </div>
      )}
    </>
  );
}
