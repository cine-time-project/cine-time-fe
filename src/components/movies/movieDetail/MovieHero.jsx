"use client";
import Link from "next/link";              
import MovieMeta from "./MovieMeta";
import ActionsBar from "./ActionsBar";
import styles from "./movie-hero.module.scss";
import { useParams } from "next/navigation";


export default function MovieHero({ movie }) {
  const bg = movie.backdropUrl || movie.posterUrl || "/images/demo-backdrop.jpg";

   const { locale } = useParams();        // [locale] segmenti (tr/en vs.)
  const prefix = locale ? `/${locale}` : "";

 const detailsHref = movie?.id ? `${prefix}/movies/${movie.id}` : "#";

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url('${bg}')` }}
      aria-label={`${movie.title} hero`}
    >
      <div className={styles.overlay} />

      {/*  Görselin tamamını tıklanabilir yapan şeffaf katman */}
      <Link
        href={detailsHref}
        aria-label={`${movie?.title || "movie"} details`}
        className={styles.clickArea}
      />

      <div className="container position-relative">
        <div className="row">
          <div className="col-lg-8 col-md-10">
            <h1 className={styles.title}>{movie.title}</h1>

            <div className={styles.metaRow}>
              <MovieMeta movie={movie} />
            </div>

            {movie.summary && <p className={styles.summary}>{movie.summary}</p>}

            <ActionsBar movie={movie} />
          </div>
        </div>
      </div>
    </section>
  );
}
