import Image from "next/image";
import "./about.scss";
import { getTranslations } from "next-intl/server";
import ZoomableGrid from "./ZoomableGrid";



export default async function AboutPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" }); 

  const gridItems = [
    {
      src: "/images/about/cinema-hall-lux.jpg",
      alt: t("grid1.alt"),
      title: t("grid1.title"),
      body: t("grid1.body"),
    },
    {
      src: "/images/about/cinema-store.jpg",
      alt: t("grid2.alt"),
      title: t("grid2.title"),
      body: t("grid2.body"),
    },
    {
      src: "/images/about/cinema-waiting-area.jpg",
      alt: t("grid3.alt"),
      title: t("grid3.title"),
      body: t("grid3.body"),
    },
  ];

  const milestones = [
    {
      year: "1995",
      title: t("m1995.title"),
      desc: t("m1995.desc"),
      points: [t("m1995.p1"), t("m1995.p2"), t("m1995.p3"), t("m1995.p4")],
    },
    {
      year: "2005",
      title: t("m2005.title"),
      desc: t("m2005.desc"),
      points: [t("m2005.p1"), t("m2005.p2"), t("m2005.p3")],
    },
    {
      year: "2015",
      title: t("m2015.title"),
      desc: t("m2015.desc"),
      points: [t("m2015.p1"), t("m2015.p2"), t("m2015.p3"), t("m2015.p4")],
    },
    {
      year: "2020",
      title: t("m2020.title"),
      desc: t("m2020.desc"),
      points: [t("m2020.p1"), t("m2020.p3")],
    },
    {
      year: "2025",
      title: t("m2025.title"),
      desc: t("m2025.desc"),
      points: [t("m2025.p1"), t("m2025.p2"), t("m2025.p4")],
    },
  ];

  return (
    <section className="about container">
      <section className="about__introHero">
        <div className="introHero__copy">
          <div className="introHero__brand">
            <Image
              src="/images/cinetime-logo.png"
              alt="CineTime Logo"
              width={120}
              height={120}
              className="brand__logo"
              priority
            />
            <h1 className="brand__title">CINETIME HAKKIMIZDA</h1>
          </div>

          <p>
            <strong>CineTime</strong>’ın temelleri 90’ların ortasında, film
            projeksiyonunun analogdan dijitale evrildiği dönemde atıldı.
            Yeniliğe açık bir vizyonla kurulan marka, sinema deneyimini yalnızca
            bir izleme eylemi değil, başlı başına bir atmosfer olarak tanımladı.
          </p>

          <p>
            İlk salonumuz 180 koltuk kapasitesiyle kapılarını açtı. 35mm
            projektörlerle başlayan bu yolculukta sahne, perde ve akustik
            sistemlere yapılan yatırımlar sayesinde izleyici konforu her zaman
            öncelikli oldu.
          </p>

          {/* mini istatistikler */}
          <div className="introHero__stats">
            <div className="stat">
              <span className="v">25</span>
              <span className="l">Lokasyon</span>
            </div>
            <div className="stat">
              <span className="v">84</span>
              <span className="l">Salon</span>
            </div>
            <div className="stat">
              <span className="v">8K+</span>
              <span className="l">Koltuk</span>
            </div>
            <div className="stat">
              <span className="v">Dolby</span>
              <span className="l">Atmos</span>
            </div>
          </div>
        </div>

        {/* Sağ: Hero görsel */}
        <div className="introHero__media">
          <Image
            src="/images/about/cinema-hall-delux.jpg"
            alt={t("heroAlt")}
            fill
            className="introHero__img"
            priority
            sizes="(max-width: 1024px) 100vw, 48vw"
          />
        </div>
      </section>
      {/* Misyon */}
      <section className="about__block">
        <h2>{t("missionTitle")}</h2>
        <p>{t("missionBody")}</p>
      </section>
      <ZoomableGrid items={gridItems} />
      {/* Timeline */}
      <section className="about__timeline">
        <h2>{t("timelineTitle")}</h2>
        <ol className="timeline" aria-label={t("timelineAria")}>
          {milestones.map((m) => (
            <li key={m.year} className="timeline__item">
              <div className="timeline__dot" aria-hidden />
              <div className="timeline__content">
                <span className="timeline__year">{m.year}</span>
                <h3 className="timeline__title">{m.title}</h3>
                <p className="timeline__desc">{m.desc}</p>
                {m.points?.length > 0 && (
                  <ul className="timeline__list">
                    {m.points.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
      {/* CTA */}
      <section className="about__cta">
        <h3>{t("ctaTitle")}</h3>
        <p>{t("ctaBody")}</p>
        <a className="btn-cta" href={`/${locale}/buy-ticket`}>
          {t("ctaBtn")}
        </a>
      </section>
    </section>
  );
}
