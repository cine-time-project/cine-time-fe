"use client";

import React, { useCallback } from "react";
import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useFavorites } from "@/lib/hooks/useFavorites";

function MovieCard({ movie }) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : "/images/cinetime-logo.png";

  const isMovieFavorite = isFavorite(movie.id);

  const prefix = locale ? `/${locale}` : "";
  const detailsHref = movie?.slug
    ? `${prefix}/movies/${movie.slug}`
    : `${prefix}/movies/${movie.id}`;
  const showtimesHref = movie?.id ? `${prefix}/movies/showtimes/${movie.id}` : "#";

  const handleClick = useCallback(() => {
    router.push(detailsHref);
  }, [router, detailsHref]);

  const handleFavorite = useCallback(
    (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
    },
    [movie, toggleFavorite]
  );

  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();
      if (movie.status === "IN_THEATERS") {
        router.push(showtimesHref);
      }
    },
    [movie.status, showtimesHref, router]
  );

  return (
    <Card
      className={styles["movie-card"]}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      aria-label={`Go to details for ${movie.title}`}
    >
      <div className={styles["movie-card__image-wrapper"]}>
        <Card.Img
          loading="lazy"
          src={imageUrl}
          alt={poster?.name || movie.title}
          className={styles["movie-card__image"]}
        />
      </div>

      <div className={styles["movie-card__overlay"]} />

      {/* Favorite */}
      <div
        role="button"
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__favorite-button"]}`}
        onClick={handleFavorite}
        title={
          !isLoggedIn
            ? t("movies.loginToFavorite")
            : isMovieFavorite
            ? t("movies.removeFromFavorites")
            : t("movies.addToFavorites")
        }
        aria-label={
          !isLoggedIn
            ? t("movies.loginToFavorite")
            : isMovieFavorite
            ? t("movies.removeFromFavorites")
            : t("movies.addToFavorites")
        }
      >
        {!isLoggedIn ? (
          <i className="pi pi-heart" style={{ color: "#888" }} />
        ) : isMovieFavorite ? (
          <i className="pi pi-heart-fill" style={{ color: "#ff4081" }} />
        ) : (
          <i className="pi pi-heart" style={{ color: "#220514ff" }} />
        )}
      </div>

      {/* Buy ticket */}
      {movie.status === "IN_THEATERS" && (
        <Image
          role="button"
          className={`${styles["movie-card__icon-button"]} ${styles["movie-card__buy-button"]}`}
          onClick={handleBuyTicket}
          title={t("movies.buyTicket", { default: "Buy Ticket" })}
          aria-label={t("movies.buyTicket", { default: "Buy Ticket" })}
          src="/icons/buy-tickets.png"
          alt="Buy Tickets"
          width={70}
          height={70}
        />
      )}

      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          {movie.title}
        </Card.Title>

        <Card.Subtitle>
          <div className={styles["movie-card__details"]}>
            {movie.releaseDate && (
              <div className={styles["movie-card__details__releaseDate"]}>
                {movie.releaseDate.substring(0, 4)}
              </div>
            )}
            {movie.rating != null && movie.rating !== 0 && (
              <div className={styles["movie-card__details__rating"]}>
                <span className={styles["movie-card__details__rating__text"]}>
                  {String(movie.rating).substring(0, 3)}{" "}
                </span>
                <i className="pi pi-star-fill" style={{ fontSize: "0.7rem" }} />
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

export default React.memo(MovieCard);
