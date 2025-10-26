// /src/components/experience/ExperienceView.jsx
import Image from "next/image";
import Link from "next/link";

const cx = (...a) => a.filter(Boolean).join(" ");

export default function ExperienceView({ t, locale, content, showImages = true }) {
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

  const RenderIcon = ({ item }) => {
    if (item?.pi) return <i className={`pi ${item.pi} exp__pi`} aria-hidden="true" />;
    if (item?.icon) return <span className="exp__emoji" aria-hidden="true">{item.icon}</span>;
    return null;
  };

  return (
    <section className="exp container">
      {/* HERO */}
      <header className={cx("exp__hero", variant === "hero" && "exp__hero--big")}>
        <div className="exp__copy">
          <h1 className="exp__title">{t(titleKey)}</h1>
          <p className="exp__subtitle">{t(subtitleKey)}</p>

          {/* UZUN AÇIKLAMA: başlığın hemen altında */}
          <p className="exp__lead exp__lead--inHero">{t(bodyKey)}</p>
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

      {/* ÖZELLİKLER */}
      {features?.length > 0 && (
        <ul className="exp__features">
          {features.map((f, i) => (
            <li key={i} className="exp__featureItem">
              <RenderIcon item={f} />
              <span className="exp__featureText">{t(f.textKey)}</span>
            </li>
          ))}
        </ul>
      )}

      {/* TILES */}
      {tiles?.length > 0 && (
        <section className={cx("exp__tiles", variant === "tiles" && "exp__tiles--grid")}>
          {tiles.map((tile, i) => (
            <article key={i} className="expTile">
              {showImages && tile.image && (
                <div className="expTile__media">
                  <Image src={tile.image} alt={t(tile.titleKey)} fill sizes="100vw" />
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
        <Link className="btn-cta" href={`/${locale}/find-showtime`}>
          {t(ctaKey)}
        </Link>
      </section>
    </section>
  );
}
