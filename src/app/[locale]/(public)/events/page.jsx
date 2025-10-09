import Image from "next/image";
import "./events.scss";
import { getTranslations } from "next-intl/server";
import ZoomableEventsGrid from "./ZoomableGrid";

export default async function EventsPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });

  const eventItems = [
    {
      src: "/images/events/awards_gala.jpg",
      alt: t("awards.alt"),
      title: t("awards.title"),
      desc: t("awards.desc"),
      date: t("awards.date"),
    },
    {
      src: "/images/events/director_talk.jpg",
      alt: t("talk.alt"),
      title: t("talk.title"),
      desc: t("talk.desc"),
      date: t("talk.date"),
    },
    {
      src: "/images/events/film_festival.jpg",
      alt: t("festival.alt"),
      title: t("festival.title"),
      desc: t("festival.desc"),
      date: t("festival.date"),
    },
    {
      src: "/images/events/premiere_night.jpg",
      alt: t("premiere.alt"),
      title: t("premiere.title"),
      desc: t("premiere.desc"),
      date: t("premiere.date"),
    },
  ];

  return (
    <section className="events container">
      {/* Hero */}
      <header className="events__hero">
        <div className="hero__copy">
          <h1 className="hero__title">{t("heroTitle")}</h1>
          <p className="hero__subtitle">{t("heroSubtitle")}</p>
        </div>
        <div className="hero__media">
          <Image
            src="/images/events/film_festival.jpg"
            alt={t("heroAlt")}
            fill
            priority
            className="hero__img"
            sizes="(max-width: 1024px) 100vw, 48vw"
          />
        </div>
      </header>

      {/* Zoomable Grid */}
      <ZoomableEventsGrid items={eventItems} />

      {/* CTA */}
      <section className="events__cta">
        <h3>{t("ctaTitle")}</h3>
        <p>{t("ctaBody")}</p>
        <a className="btn-cta" href={`/${locale}/buy-ticket`}>
          {t("ctaBtn")}
        </a>
      </section>
    </section>
  );
}
