import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";
import { Button } from "react-bootstrap";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

//TODO: When user logged in, it should be fetched that if the movie is favorited or not.
//TODO: BuyTicket function is being waited.
export default function MovieCard({ movie }) {
  const t = useTranslations();

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : "/images/cinetime-logo.png";
  const [favorite, setFavorite] = useState(false);

  const handleClick = () => {
    console.log(`Clicked on: ${movie.id}`);
  };

  const handleFavorite = useCallback(
    (e) => {
      e.stopPropagation();
      setFavorite((prev) => !prev);
      console.log(
        `${movie.title} ${!favorite ? "added to" : "removed from"} favorites`
      );
    },
    [favorite, movie.title]
  );

  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();
      console.log(`Buy ticket for: ${movie.title}`);
    },
    [movie.title]
  );

  return (
    <Card className={styles["movie-card"]} onClick={handleClick} role="button">
      <div className={styles["movie-card__image-wrapper"]}>
        <Card.Img
          loading="lazy"
          src={imageUrl}
          alt={poster?.name || t("movies.addToFavorites")}
          className={styles["movie-card__image"]}
        />
      </div>

      <div className={styles["movie-card__overlay"]}></div>

      {/* Favorite Button (Top-left) */}
      <Button
        type="button"
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__favorite-button"]}`}
        onClick={handleFavorite}
        aria-label={t("movies.addToFavorites")}
      >
        {favorite ? (
          <i className="pi pi-heart-fill"></i>
        ) : (
          <i className="pi pi-heart"></i>
        )}
      </Button>

      {/* Buy Ticket Button (Top-right) - If the movie has not COMING_SOON status */}
      {movie.status !== "COMING_SOON" && (
        <Button
          type="button"
          className={`${styles["movie-card__icon-button"]} ${styles["movie-card__buy-button"]}`}
          onClick={handleBuyTicket}
          aria-label={t("movies.buyTicket")}
        >
          <i className="pi pi-ticket"></i>
        </Button>
      )}

      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          <div className={styles["movie-card__details"]}>
            {movie.releaseDate && (
              <div className={styles["movie-card__details__releaseDate"]}>
                {movie.releaseDate.substring(0, 4)}
              </div>
            )}
            {movie.rating != null && movie.rating !== 0 && (
              <div className={styles["movie-card__details__rating"]}>
                {String(movie.rating).substring(0, 3)}
                <i className="pi pi-star-fill"></i>
              </div>
            )}
          </div>
          {movie.title}
        </Card.Title>
        <Card.Text className={styles["movie-card__summary"]}>
          {movie.summary?.length > 70
            ? movie.summary.substring(0, 70) + t("movies.summaryEllipsis")
            : movie.summary}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
