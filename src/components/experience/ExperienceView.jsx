"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function ExperienceView({
  t,                 // next-intl çeviri fonksiyonu
  locale,            // sayfa dili (URL üretimi için)
  content,           // EXPERIENCES[slug]
  showImages = true, // tile’larda görsel olsun mu?
}) {
  const {
    variant = "hero",
    heroImage,
    titleKey,
    subtitleKey,
    bodyKey,
    tiles = [],
    features = [],
    ctaKey
  } = content || {};

  return (
    <section className="exp container">
      {/* HERO */}
      <header className={clsx("exp__hero", variant === "hero" && "exp__hero--big")}>
        <div className="exp__copy">
          <h1 className="exp__title">{t(titleKey)}</h1>
          <p className="exp__subtitle">{t(subtitleKey)}</p>
        </div>

        {heroImage && (
          <div className="exp__media">
            <Image
              src={heroImage}
              alt={t(titleKey)}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="exp__img"
            />
          </div>
        )}
      </header>

      {/* BODY */}
      <article className="exp__body">
        <p className="exp__lead">{t(bodyKey)}</p>

        {features?.length > 0 && (
          <ul className="exp__features">
            {features.map((f, i) => (
              <li key={i}>
                <span className="exp__icon">{f.icon}</span>
                <span>{t(f.textKey)}</span>
              </li>
            ))}
          </ul>
        )}
      </article>

      {/* TILES */}
      {tiles?.length > 0 && (
        <section className={clsx("exp__tiles", variant === "tiles" && "exp__tiles--grid")}>
          {tiles.map((tile, i) => (
            <article key={i} className="expTile">
              {showImages && tile.image && (
                <div className="expTile__media">
                  <Image
                    src={tile.image}
                    alt={t(tile.titleKey)}
                    fill
                    sizes="(max-width: 1200px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="expTile__content">
                <h3>{t(tile.titleKey)}</h3>
                <p className="expTile__desc">{t(tile.descKey)}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* CTA */}
      <section className="exp__cta">
        <Link className="btn-cta" href={`/${locale}/buy-ticket`}>
          {t(ctaKey)}
        </Link>
      </section>
    </section>
  );
}
