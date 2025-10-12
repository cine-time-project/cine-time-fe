"use client";
import { useTranslations } from "next-intl";
import styles from "./movie-details-panel.module.scss";

// Küçük yardımcılar
const fmtMinutes = (min, t) => (min ? `${min} ${t("minutes")}` : null);
const fmtDate = (d) => {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString();
};

export default function MovieDetailsPanel({ movie = {} }) {
  const t = useTranslations("movies");

  const {
    summary,
    director,
    cast = [],
    genre = [],
    formats = [],
    specialHalls,            // "IMAX, 3D" string olabilir
    releaseDate,
    duration,
    rating,
    status,                  // (NOW_SHOWING / COMING_SOON / IN_THEATRES vs…)
  } = movie;

  const halls = (specialHalls || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Ayrıntı satırları (boş olanlar otomatik gizlenir)
  const details = [
    { label: t("director"), value: director },
    { label: t("cast"), value: cast.join(", ") || null },
    { label: t("genres"), value: genre.length ? genre : null, isChips: true },
    { label: t("duration"), value: fmtMinutes(duration, t) },
    { label: t("releaseDate"), value: fmtDate(releaseDate) },
    { label: t("formats", { default: "Formatlar" }), value: formats.length ? formats : null, isChips: true },
    { label: t("halls", { default: "Özel Salonlar" }), value: halls.length ? halls : null, isChips: true },
    { label: "IMDb", value: rating != null ? `${Number(rating).toFixed(1)}` : null },
    { label: t("statusLabel", { default: "Durum" }), value: status },
  ].filter((x) => !!x.value);

  return (
    <section className={styles.detailsWrap}>
      {/* Sol: Özet */}
      <div className={styles.col}>
        <h3 className={styles.title}>{t("summary")}</h3>
        {summary ? (
          <p className={styles.summary}>{summary}</p>
        ) : (
          <p className={styles.empty}>{t("noSummary", { default: "Özet bilgisi bulunamadı." })}</p>
        )}
      </div>

      {/* Sağ: Ayrıntılar */}
      <div className={styles.col}>
        <h3 className={styles.title}>{t("details")}</h3>

        <dl className={styles.list}>
          {details.map((row, i) => (
            <div key={i} className={styles.item}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>
                {row.isChips ? (
                  <span className={styles.chips}>
                    {row.value.map((tkn, idx) => (
                      <span key={idx} className={styles.chip}>{tkn}</span>
                    ))}
                  </span>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
