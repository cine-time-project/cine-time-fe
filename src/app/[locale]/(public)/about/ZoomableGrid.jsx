"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ZoomableGrid({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  // ESC ile kapat
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenIndex(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <section className="about__grid">
        {items.map((it, i) => (
          <article key={i} className="card">
            <button
              className="card__media"
              onClick={() => setOpenIndex(i)}
              aria-label="Resmi büyüt"
            >
              <Image
                src={it.src}
                alt={it.alt}
                fill
                sizes="(max-width: 1200px) 100vw, 33vw"
                className="about__img"
                priority={i === 0}
              />
            </button>
            <div className="card__body">
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Lightbox */}
      {openIndex !== null && (
        <div className="about__lightbox" onClick={() => setOpenIndex(null)}>
          <div
            className="about__lightbox-inner"
            role="dialog"
            aria-modal="true"
          >
            <Image
              src={items[openIndex].src}
              alt={items[openIndex].alt}
              width={1600}
              height={900}
              className="about__lightbox-img"
            />
          </div>
        </div>
      )}
    </>
  );
}
