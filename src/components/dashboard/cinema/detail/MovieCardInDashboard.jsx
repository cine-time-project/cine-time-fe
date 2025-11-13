import { Card } from "react-bootstrap";
import styles from "./MovieCardInDashboard.module.scss";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Button } from "react-bootstrap";

function MovieCardInDashboard({ movie, hasShowtime }) {
  const t = useTranslations();
  const [hovered, setHovered] = useState(false);

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl =
    poster?.url || movie.posterUrl || "/images/cinetime-logo.png";

  const handleClick = () => {
    e.stopPropagation();
    console.log(movie.id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    console.log("Edit clicked:", movie.id);
  };

  return (
    <Card
      className={`${styles["movie-card"]} ${hovered ? styles["hovered"] : ""} ${
        !hasShowtime ? styles["no-showtime"] : ""
      }`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
    >
      {/* Poster */}
      <div className={styles["movie-card__image-wrapper"]}>
        <Card.Img
          loading="lazy"
          src={imageUrl}
          alt={poster?.name || t("movies.addToFavorites")}
          className={styles["movie-card__image"]}
        />
      </div>

      {/* Hover Overlay */}
      <div className={styles["movie-card__hover-overlay"]}>
        <Button
          variant="warning"
          size="lg"
          className={styles["movie-card__edit-button"]}
          onClick={handleEditClick}
        >
          {t("cinemas.edit")}
        </Button>
      </div>

      {/* SHOWTIME BADGE */}
      <div className={styles["movie-card__showtime-badge"]}>
        {hasShowtime ? (
          <span className="badge badge-success">
            Showtime
          </span>
        ) : (
          <span className="badge badge-danger">NoShowtime</span>
        )}
      </div>

      {/* Card Body */}
      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          {movie.title}
        </Card.Title>
        <Card.Subtitle>
          <div className={styles["movie-card__details"]}>
            {movie.rating != null && movie.rating !== 0 && (
              <div className={styles["movie-card__details__rating"]}>
                <span className={styles["movie-card__details__rating__text"]}>
                  {String(movie.rating).substring(0, 3)}{" "}
                </span>
                <i
                  className="pi pi-star-fill"
                  style={{ fontSize: "0.7rem" }}
                ></i>
              </div>
            )}
            {movie.duration && (
              <div className={styles["movie-card__details__releaseDate"]}>
                {movie.duration} {t("movies.minutes")}
              </div>
            )}
          </div>
        </Card.Subtitle>
        <Card.Text className={styles["movie-card__summary"]}>
          {movie.summary?.length > 70
            ? movie.summary.substring(0, 70) + "..."
            : movie.summary}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default React.memo(MovieCardInDashboard);
