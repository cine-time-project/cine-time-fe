import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss";

export default function MovieCard({ movie }) {
  // 🎬 Select the poster image for the movie
  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : null;

  // 🖱️ Handle click event on the entire card
  const handleClick = () => {
    console.log(`Clicked on: ${movie.id}`);
    // Future: navigate(`/movies/${movie.id}`);
  };

  // ❤️ Handle favorite button click
  const handleFavorite = (e) => {
    e.stopPropagation(); // Prevent triggering card click
    console.log(`Favorited: ${movie.title}`);
  };

  // 🎟️ Handle buy ticket button click
  const handleBuyTicket = (e) => {
    e.stopPropagation(); // Prevent triggering card click
    console.log(`Buy ticket for: ${movie.title}`);
  };

  return (
    <Card className={styles["movie-card"]} onClick={handleClick} role="button">
      {/* 🖼️ Movie poster */}
      {imageUrl ? (
        <div className={styles["movie-card__image-wrapper"]}>
          <Card.Img
            src={imageUrl}
            alt={poster?.name || "Movie Poster"}
            className={styles["movie-card__image"]}
          />
        </div>
      ) : (
        <div className={styles["movie-card__no-image"]}>
          <span className="text-muted">No Image</span>
        </div>
      )}

      {/* 🌫️ Overlay effect */}
      <div className={styles["movie-card__overlay"]}></div>

      {/* ❤️ Favorite Button (Top-left corner) */}
      <button
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__favorite-button"]}`}
        onClick={handleFavorite}
        aria-label="Add to favorites"
      >
        <i className="pi pi-heart"></i>
      </button>

      {/* 🎟️ Buy Ticket Button (Top-right corner, always visible and small) */}
      <button
        className={`${styles["movie-card__icon-button"]} ${styles["movie-card__buy-button"]}`}
        onClick={handleBuyTicket}
        aria-label="Buy ticket"
      >
        <i className="pi pi-ticket"></i>
      </button>

      {/* 📝 Card content */}
      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          <div className={styles["movie-card__details"]}>
            <div className={styles["movie-card__details__releaseDate"]}>
              {movie.releaseDate?.substring(0, 4)}
            </div>
            <div className={styles["movie-card__details__rating"]}>
              {movie.rating != null ? String(movie.rating).substring(0, 3) : ""}{" "}
              <i className="pi pi-star-fill"></i>
            </div>
          </div>
          {movie.title}
        </Card.Title>

        <Card.Text className={styles["movie-card__summary"]}>
          {movie.summary?.length > 70
            ? movie.summary.substring(0, 70) + "..."
            : movie.summary}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
