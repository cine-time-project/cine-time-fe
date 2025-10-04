import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import styles from "./movie-card.module.scss"; // Custom SCSS module for styling

export default function MovieCard({ movie }) {
  // 🎬 Select the poster image for the movie
  // Prefer the one marked as poster, otherwise use the first image available
  const poster = movie.images?.find(img => img.poster) || movie.images?.[0];
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
      
      {/* 🎞️ Image section */}
      {imageUrl ? (
        <div className={styles["movie-card__image-wrapper"]}>
          <Card.Img
            src={imageUrl}
            alt={poster.name}
            className={styles["movie-card__image"]}
          />

          {/* 🔹 Overlay that appears on hover, containing the Details button */}
          <div className={styles["movie-card__overlay"]}>
            <Button
              variant="primary"
              className={styles["movie-card__button"]}
              // Optional: prevent button click from triggering the card click
              // onClick={(e) => e.stopPropagation()}
            >
              Details
            </Button>
          </div>
        </div>
      ) : (
        // 🚫 Fallback if no image is available
        <div className={styles["movie-card__no-image"]}>
          <span className="text-muted">No Image</span>
        </div>
      )}

      {/* 🧾 Card body section with title and summary */}
      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>
          {movie.title}
        </Card.Title>

        <Card.Text className={styles["movie-card__summary"]}>
          {/* Truncate long summaries to 100 characters */}
          {movie.summary?.length > 100
            ? movie.summary.substring(0, 100) + "..."
            : movie.summary}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
