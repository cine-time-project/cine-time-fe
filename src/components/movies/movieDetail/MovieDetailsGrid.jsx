import styles from "./movie-details.module.scss";

export default function MovieDetailsGrid({ movie }) {
  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <h2 className={`h5 ${styles.sectionTitle}`}>Özet</h2>
        <p className={styles.desc}>{movie.summary}</p>
      </div>

      <div className="col-lg-4">
        <h2 className={`h5 ${styles.sectionTitle}`}>Ayrıntılar</h2>
        <dl className={`row small mb-0 ${styles.dl}`}>
          {movie.director && (<><dt className="col-5">Yönetmen</dt><dd className="col-7">{movie.director}</dd></>)}
          {(movie.cast || []).length > 0 && (<><dt className="col-5">Oyuncular</dt><dd className="col-7">{movie.cast.join(", ")}</dd></>)}
          {(movie.formats || []).length > 0 && (<><dt className="col-5">Format</dt><dd className="col-7">{movie.formats.join(", ")}</dd></>)}
          {movie.specialHalls && (<><dt className="col-5">Özel Salonlar</dt><dd className="col-7">{movie.specialHalls}</dd></>)}
          {movie.status && (<><dt className="col-5">Durum</dt><dd className="col-7">{movie.status}</dd></>)}
        </dl>
      </div>
    </div>
  );
}
