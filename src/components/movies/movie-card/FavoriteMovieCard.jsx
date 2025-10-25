"use client";

import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";
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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : "/images/cinetime-logo.png";
  
  // Extract video URL from trailer URL (YouTube, Vimeo, etc.)
  const getVideoUrl = (trailerUrl) => {
    if (!trailerUrl) return null;
    
    // YouTube URL conversion
    if (trailerUrl.includes('youtube.com/watch')) {
      const videoId = trailerUrl.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&start=0&end=5` : null;
    }
    
    // YouTube short URL
    if (trailerUrl.includes('youtu.be/')) {
      const videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&start=0&end=5` : null;
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
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Start video preview after 1 second hover
    hoverTimeoutRef.current = setTimeout(() => {
      setShowVideo(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Auto-play failed, which is normal
        });
        
        // Stop video after 5 seconds
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          setShowVideo(false);
        }, 5000);
      }
    }, 1000);
  }, [trailerVideoUrl]);

  /**
   * Handle mouse leave - stop trailer preview
   */
  const handleMouseLeave = useCallback(() => {
    // Clear timeout if user leaves before 1 second
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Stop video immediately
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowVideo(false);
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
    <Card
      className={styles["movie-card"]}
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
      <div className={styles["movie-card__image-wrapper"]} style={{ position: 'relative' }}>
        <Card.Img
          loading="lazy"
          src={imageUrl}
          alt={poster?.name || movie.title}
          className={styles["movie-card__image"]}
          style={{ 
            opacity: showVideo && isVideoLoaded ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
        
        {/* Video Preview */}
        {trailerVideoUrl && (
          <>
            {trailerVideoUrl.includes('youtube.com') ? (
              // YouTube iframe
              <iframe
                ref={videoRef}
                src={showVideo ? trailerVideoUrl : ''}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  opacity: showVideo ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }}
                allow="autoplay; encrypted-media"
                onLoad={handleVideoLoaded}
              />
            ) : (
              // Direct video file
              <video
                ref={videoRef}
                muted
                playsInline
                onLoadedData={handleVideoLoaded}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: showVideo && isVideoLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }}
              >
                <source src={trailerVideoUrl} type="video/mp4" />
              </video>
            )}
          </>
        )}
      </div>

      {/* Overlay gradient */}
      <div className={styles["movie-card__overlay"]}></div>

      {/* Trailer indicator */}
      {trailerVideoUrl && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '50px',
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            opacity: showVideo ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
          title={t("movies.trailerAvailable")}
        >
          <i className="pi pi-play" />
        </div>
      )}

      {/* Favorite button (top-left) - Always show filled since this is favorites page */}
      <div
        type="button"
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__favorite-button"]}`}
        onClick={handleFavorite}
        title={t("movies.removeFromFavorites")}
        aria-label={t("movies.removeFromFavorites")}
      >
        <i
          className="pi pi-heart-fill"
          style={{ color: isMovieFavorite ? "#ff4081" : "#ccc" }}
        />
      </div>

      {/* Buy ticket button (top-right) */}
      {movie.status === "IN_THEATERS" && (
        <Image
          type="button"
          className={`${styles["movie-card__icon-button"]} ${styles["movie-card__buy-button"]}`}
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
        <div className={`${styles["movie-card__status-badge"]}`}>
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
  );
}

// Optimize re-rendering: only rerender if movie prop changes
export default React.memo(FavoriteMovieCard);
