"use client";
import styles from "./movie-details-panel.module.scss";

// Küçük yardımcılar
const fmtMinutes = (min) => (min ? `${min} dk` : null);
const fmtDate = (d) => {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString();
};

export default function MovieDetailsPanel({ movie = {} }) {
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
    { label: "Yönetmen", value: director },
    { label: "Oyuncular", value: cast.join(", ") || null },
    { label: "Tür", value: genre.length ? genre : null, isChips: true },
    { label: "Süre", value: fmtMinutes(duration) },
    { label: "Vizyon", value: fmtDate(releaseDate) },
    { label: "Formatlar", value: formats.length ? formats : null, isChips: true },
    { label: "Özel Salonlar", value: halls.length ? halls : null, isChips: true },
    { label: "IMDb", value: rating != null ? `${Number(rating).toFixed(1)}` : null },
    { label: "Durum", value: status },
  ].filter((x) => !!x.value);

  return (
    <section className={styles.detailsWrap}>
      {/* Sol: Özet */}
      <div className={styles.col}>
        <h3 className={styles.title}>Özet</h3>
        {summary ? (
          <p className={styles.summary}>{summary}</p>
        ) : (
          <p className={styles.empty}>Özet bilgisi bulunamadı.</p>
        )}
      </div>

      {/* Sağ: Ayrıntılar */}
      <div className={styles.col}>
        <h3 className={styles.title}>Ayrıntılar</h3>

        <dl className={styles.list}>
          {details.map((row, i) => (
            <div key={i} className={styles.item}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={styles.value}>
                {row.isChips ? (
                  <span className={styles.chips}>
                    {row.value.map((t, idx) => (
                      <span key={idx} className={styles.chip}>{t}</span>
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
