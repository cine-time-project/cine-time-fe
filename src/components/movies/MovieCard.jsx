import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import styles from "./movie-card.module.scss"; // SCSS dosyamız

export default function MovieCard({ movie }) {
  // Poster resmi seç (poster varsa onu, yoksa ilk resmi)
  const poster = movie.images?.find(img => img.poster) || movie.images?.[0];
  const imageUrl = poster ? poster.url : null;

  return (
    <Card className={styles["movie-card"]}>
      {imageUrl ? (
        <div className={styles["movie-card__image-wrapper"]}>
          <Card.Img
            src={imageUrl}
            alt={poster.name}
            className={styles["movie-card__image"]}
          />
          <div className={styles["movie-card__overlay"]}>
            <Button variant="primary" className={styles["movie-card__button"]}>
              Details
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles["movie-card__no-image"]}>
          <span className="text-muted">No Image</span>
        </div>
      )}

      <Card.Body className={styles["movie-card__body"]}>
        <Card.Title className={styles["movie-card__title"]}>{movie.title}</Card.Title>
        <Card.Text className={styles["movie-card__summary"]}>
          {movie.summary?.length > 100
            ? movie.summary.substring(0, 100) + "..."
            : movie.summary}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
