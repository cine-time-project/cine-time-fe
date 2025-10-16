"use client";

import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";
import { Button } from "react-bootstrap";
import React, { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

/**
 * MovieCard Component
 * -------------------
 * Displays a movie card with poster, title, rating, release year, and summary.
 * Includes buttons for "Favorite" and "Buy Ticket".
 * Clicking the card navigates to the movie's detail page, respecting locale.
 */
function MovieCard({ movie }) {
  const t = useTranslations(); // Translation hook
  const router = useRouter(); // Next.js router
  const { locale } = useParams(); // Current locale segment from URL

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : "/images/cinetime-logo.png";
  const [favorite, setFavorite] = useState(false);

  // Prefix the URL with locale if available
  const prefix = locale ? `/${locale}` : "";

  // Construct detail page URL using movie ID
  const detailsHref = movie?.slug
    ? `${prefix}/movies/${movie.slug}`
    : movie?.id ?? `${prefix}/movies/${movie.id}`;

  /**
   * Navigate to movie detail page
   */
  const handleClick = () => {
    router.push(detailsHref);
  };

  /**
   * Toggle favorite state without triggering card click
   */
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

  /**
   * Buy ticket click handler
   */
  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();
      console.log(`Buy ticket for: ${movie.title}`);
    },
    [movie.title]
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
      {/* Movie Poster */}
      <div className={styles["movie-card__image-wrapper"]}>
        <Card.Img
          loading="lazy"
          src={imageUrl}
          alt={poster?.name || t("movies.addToFavorites")}
          className={styles["movie-card__image"]}
        />
      </div>

      {/* Overlay gradient */}
      <div className={styles["movie-card__overlay"]}></div>

      {/* Favorite button (top-left) */}
      <div
        type="button"
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__favorite-button"]}`}
        onClick={handleFavorite}
        title={t("movies.addToFavorites", { default: "Add to Favorites" })}
        aria-label={t("movies.addToFavorites")}
      >
        {favorite ? (
          <i className="pi pi-heart-fill" style={{color: "#ff4081"}}></i>
        ) : (
          <i className="pi pi-heart" style={{color: "#220514ff"}}></i>
        )}
      </div>

      {/* Buy ticket button (top-right) */}
      {movie.status === "IN_THEATERS" && (
        <div
          type="button"
          className={`${styles["movie-card__icon-button"]} ${styles["movie-card__buy-button"]}`}
          onClick={handleBuyTicket}
          title={t("movies.buyTicket", { default: "Buy Ticket" })}
          aria-label={t("movies.buyTicket", { default: "Buy Ticket" })}
        >
           <Image
            src="/icons/buy-tickets.png" // public klasöründeki bir resim
            alt="Buy Tickets"
            width={70} // orijinal genişlik
            height={70} // orijinal yükseklik
          />
        </div>
      )}

      {/* Card body: title, release date, rating, summary */}
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
                <i
                  className="pi pi-star-fill"
                  style={{ fontSize: "0.7rem" }}
                ></i>
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

// Optimize re-rendering: only rerender if movie prop changes
export default React.memo(MovieCard);
