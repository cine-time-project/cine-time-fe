"use client";
import MovieMeta from "./MovieMeta";
import ActionsBar from "./ActionsBar";
import styles from "./movie-hero.module.scss";

export default function MovieHero({ movie }) {
  const bg = movie.backdropUrl || movie.posterUrl || "/images/demo-backdrop.jpg";

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url('${bg}')` }}
      aria-label={`${movie.title} hero`}
    >
      <div className={styles.overlay} />

      <div className="container position-relative">
        <div className="row">
          <div className="col-lg-8 col-md-10">
            <h1 className={styles.title}>{movie.title}</h1>

            <div className={styles.metaRow}>
              <MovieMeta movie={movie} />
            </div>

            {movie.summary && <p className={styles.summary}>{movie.summary}</p>}

            {/* Aksiyon şeridi: Bilet Al + ikonlar */}
            <ActionsBar movie={movie} />
          </div>
        </div>
      </div>
    </section>
  );
}
