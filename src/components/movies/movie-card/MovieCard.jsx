import Card from "react-bootstrap/Card";
import styles from "./movie-card.module.scss"; // Custom SCSS module for styling

export default function MovieCard({ movie }) {
  // 🎬 Select the poster image for the movie
  // Prefer the one marked as poster, otherwise use the first image available
  const poster = movie.images?.find((img) => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : null;

  // 🖱️ Handle click event on the entire card
  // Currently logs the movie ID, but can later navigate to a detail page
  const handleClick = () => {
    console.log(`Clicked on: ${movie.id}`);
    // Future use: navigate(`/movies/${movie.id}`);
  };

  return (
    // 📦 Main card container
    // role="button" improves accessibility by signaling it's clickable
    // onClick makes the entire card interactive
    <Card className={styles["movie-card"]} onClick={handleClick} role="button">
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

      <div className={styles["movie-card__overlay"]}></div>

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
