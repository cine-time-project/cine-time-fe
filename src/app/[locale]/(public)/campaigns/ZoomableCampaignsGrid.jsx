"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ZoomableCampaignsGrid({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  // ESC ile lightbox kapatma
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && setOpenIndex(null);
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <section className="campaigns__grid">
        {items.map((item, i) => (
          <article key={i} className="campaignCard">
            <button
              className="campaignCard__media"
              onClick={() => setOpenIndex(i)}
              aria-label="Resmi büyüt"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 1200px) 100vw, 33vw"
                className="campaignCard__image"
                priority={i === 0}
              />
            </button>
            <div className="campaignCard__content">
              <h3>{item.title}</h3>
              <p className="campaignCard__desc">{item.body}</p>
              <span className="campaignCard__date">{item.date}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Lightbox */}
      {openIndex !== null && (
        <div
          className="campaigns__lightbox"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="campaigns__lightbox-inner"
            role="dialog"
            aria-modal="true"
          >
            <Image
              src={items[openIndex].src}
              alt={items[openIndex].alt}
              width={1600}
              height={900}
              className="campaigns__lightbox-img"
            />
          </div>
        </div>
      )}
    </>
  );
}

