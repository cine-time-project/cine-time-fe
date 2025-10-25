"use client";

import Card from "react-bootstrap/Card";
import styles from "./favorite-movie-card.module.scss";
import { Button } from "react-bootstrap";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useFavorites } from "@/lib/hooks/useFavorites";

/**
 * FavoriteMovieCard Component
 * ---------------------------
 * Enhanced movie card specifically for the favorites page
 * Features: Trailer preview on hover, favorite management
 * Uses the global useFavorites hook for persistent favorite state
 */
function FavoriteMovieCard({ movie }) {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  const videoRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const videoTimeoutRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : "/images/cinetime-logo.png";

  // Extract video URL from trailer URL (YouTube, Vimeo, etc.)
  const getVideoUrl = (trailerUrl) => {
    if (!trailerUrl) return null;

    // YouTube URL conversion - loop for 10 seconds
    if (trailerUrl.includes("youtube.com/watch")) {
      const videoId = trailerUrl.split("v=")[1]?.split("&")[0];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`
        : null;
    }

    // YouTube short URL - loop for 10 seconds
    if (trailerUrl.includes("youtu.be/")) {
      const videoId = trailerUrl.split("youtu.be/")[1]?.split("?")[0];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`
        : null;
    }

    // If it's already a direct video URL (mp4, webm, etc.)
    if (trailerUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return trailerUrl;
    }

    return null;
  };

  const trailerVideoUrl = getVideoUrl(movie.trailerUrl);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
      }
    };
  }, []);

  // Prefix the URL with locale if available
  const prefix = locale ? `/${locale}` : "";

  // Construct detail page URL using movie ID
  const detailsHref = movie?.slug
    ? `${prefix}/movies/${movie.slug}`
    : `${prefix}/movies/${movie.id}`;

  // Check if this movie is in favorites
  const isMovieFavorite = isFavorite(movie.id);

  /**
   * Handle mouse enter - start trailer preview after delay
   */
  const handleMouseEnter = useCallback(() => {
    if (!trailerVideoUrl) return;

    // Clear any existing timeouts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (videoTimeoutRef.current) {
      clearTimeout(videoTimeoutRef.current);
    }

    // Start video preview after 1 second hover
    hoverTimeoutRef.current = setTimeout(() => {
      setShowVideo(true);

      // Only try to play if it's a direct video file (not YouTube iframe)
      if (videoRef.current && !trailerVideoUrl.includes("youtube.com")) {
        videoRef.current.play().catch(() => {
          // Auto-play failed, which is normal
        });
      }

      // Stop video and return to poster after 10 seconds
      videoTimeoutRef.current = setTimeout(() => {
        if (videoRef.current && !trailerVideoUrl.includes("youtube.com")) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        setShowVideo(false);
      }, 10000); // 10 seconds
    }, 1000);
  }, [trailerVideoUrl]);

  /**
   * Handle mouse leave - stop trailer preview immediately and return to poster
   */
  const handleMouseLeave = useCallback(() => {
    // Clear all timeouts immediately
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (videoTimeoutRef.current) {
      clearTimeout(videoTimeoutRef.current);
      videoTimeoutRef.current = null;
    }

    // Stop video immediately and reset
    if (videoRef.current) {
      // For video elements
      if (videoRef.current.pause) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      // For iframes (YouTube), we'll rely on src change
    }

    // Hide video and show poster immediately
    setShowVideo(false);
    setIsVideoLoaded(false);
  }, []);

  /**
   * Handle video loaded
   */
  const handleVideoLoaded = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  /**
   * Navigate to movie detail page
   */
  const handleClick = () => {
    router.push(detailsHref);
  };

  /**
   * Toggle favorite state using the global favorites hook
   */
  const handleFavorite = useCallback(
    (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
    },
    [movie, toggleFavorite]
  );

  /**
   * Buy ticket click handler
   */
  const handleBuyTicket = useCallback(
    (e) => {
      e.stopPropagation();
      // Navigate to buy ticket page
      router.push(`${prefix}/movies/showtimes/${movie.id}`);
    },
    [movie.id, prefix, router]
  );

  return (
    <>
      {/* Backdrop overlay for screen darkening when video plays */}
      <div
        className={`${styles["favorite-movie-card__backdrop"]} ${
          showVideo ? styles.show : ""
        }`}
      />

      <Card
        className={styles["favorite-movie-card"]}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        aria-label={`Go to details for ${movie.title}`}
      >
        {/* Movie Poster with Video Preview */}
        <div
          className={styles["favorite-movie-card__image-wrapper"]}
          style={{ position: "relative" }}
        >
          <Card.Img
            loading="lazy"
            src={imageUrl}
            alt={poster?.name || movie.title}
            className={styles["favorite-movie-card__image"]}
            style={{
              opacity: showVideo && isVideoLoaded ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          />

          {/* Video Preview */}
          {trailerVideoUrl && showVideo && (
            <>
              {trailerVideoUrl.includes("youtube.com") ? (
                // YouTube iframe
                <iframe
                  ref={videoRef}
                  src={trailerVideoUrl}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    opacity: showVideo ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                  }}
                  allow="autoplay; encrypted-media"
                  onLoad={handleVideoLoaded}
                />
              ) : (
                // Direct video file
                <video
                  ref={videoRef}
                  muted
                  loop
                  playsInline
                  onLoadedData={handleVideoLoaded}
                  onEnded={() => {
                    // Return to poster when video ends naturally
                    setShowVideo(false);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: showVideo && isVideoLoaded ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                  }}
                >
                  <source src={trailerVideoUrl} type="video/mp4" />
                </video>
              )}
            </>
          )}
        </div>

        {/* Overlay gradient */}
        <div className={styles["favorite-movie-card__overlay"]}></div>

        {/* Favorite button (top-left) - Always show filled since this is favorites page */}
        <div
          type="button"
          className={`${styles["favorite-movie-card__icon-button"]} ${styles["favorite-movie-card__favorite-button"]}`}
          onClick={handleFavorite}
          title={t("movies.removeFromFavorites")}
          aria-label={t("movies.removeFromFavorites")}
        >
          <i
            className="pi pi-plus-circle"
            style={{ color: isMovieFavorite ? "#fffb04ff" : "#00000042" }}
          />
        </div>

        {/* Buy ticket button (top-right) */}
        {movie.status === "IN_THEATERS" && (
          <Image
            type="button"
            className={`${styles["favorite-movie-card__icon-button"]} ${styles["favorite-movie-card__buy-button"]}`}
            onClick={handleBuyTicket}
            title={t("movies.buyTicket")}
            aria-label={t("movies.buyTicket")}
            src="/icons/buy-tickets.png"
            alt="Buy Tickets"
            width={70}
            height={70}
          />
        )}

        {/* Movie status badge */}
        {movie.status && (
          <div className={`${styles["favorite-movie-card__status-badge"]}`}>
            <span
              className={`badge ${
                movie.status === "IN_THEATERS"
                  ? "bg-success"
                  : movie.status === "COMING_SOON"
                  ? "bg-primary"
                  : movie.status === "PRESALE"
                  ? "bg-warning"
                  : "bg-secondary"
              }`}
            >
              {t(`movies.status.${movie.status.toLowerCase()}`, {
                default: movie.status,
              })}
            </span>
          </div>
        )}

        {/* Card body: title, release date, rating, summary */}
        <Card.Body className={styles["favorite-movie-card__body"]}>
          <Card.Title className={styles["favorite-movie-card__title"]}>
            {movie.title}
          </Card.Title>
          <Card.Subtitle>
            <div className={styles["favorite-movie-card__details"]}>
              {movie.releaseDate && (
                <div
                  className={
                    styles["favorite-movie-card__details__releaseDate"]
                  }
                >
                  {movie.releaseDate.substring(0, 4)}
                </div>
              )}
              {movie.rating != null && movie.rating !== 0 && (
                <div className={styles["favorite-movie-card__details__rating"]}>
                  <span
                    className={
                      styles["favorite-movie-card__details__rating__text"]
                    }
                  >
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
          <Card.Text className={styles["favorite-movie-card__summary"]}>
            {movie.summary?.length > 250
              ? movie.summary.substring(0, 250) + "..."
              : movie.summary || "No description available."}
          </Card.Text>

          {/* Additional info for favorites page */}
          <div className="mt-2">
            {movie.genres && movie.genres.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-2">
                {movie.genres.slice(0, 2).map((genre, index) => (
                  <small
                    key={index}
                    className="badge bg-light text-dark"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {genre}
                  </small>
                ))}
                {movie.genres.length > 2 && (
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    +{movie.genres.length - 2}
                  </small>
                )}
              </div>
            )}

            {movie.duration && (
              <small className="text-muted">
                <i className="pi pi-clock me-1"></i>
                {movie.duration} {t("common.minutes")}
              </small>
            )}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

// Optimize re-rendering: only rerender if movie prop changes
export default React.memo(FavoriteMovieCard);
