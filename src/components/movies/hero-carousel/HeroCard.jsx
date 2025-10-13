import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "use-intl";

//TODO: Card content will be arranged.
//TODO: Buttons must use stopPropagation in order to ignore Card's own onClick behaviour.
export const HeroCard = ({ movie }) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  // 🎬 Select the scene image for the movie
  // Prefer the one marked as not poster, otherwise use the first image available
  const scene = movie.images?.find((img) => !img.poster) || movie.images?.[0]; // poster fallback
  const imageUrl = scene?.url || "https://via.placeholder.com/600x400"; // ekstra güvenlik

  const handleClick = () => {
    router.push(`/${locale}/movies/${movie.id}`);
  };

  return (
    <div
      className="hero-card"
      style={{ backgroundImage: `url(${imageUrl})` }}
      onClick={handleClick}
      role="button"
    >
      <div className="hero-overlay" />

      <div className="hero-content">
        <h2 className="hero-title">{movie.title}</h2>
        <p className="hero-summary">{movie.summary}</p>
        <div className="hero-buttons">
          <button className="btn primary">🎟️ Buy Ticket</button>
          <button className="btn secondary">▶️ Watch Trailer</button>
        </div>
      </div>
    </div>
  );
};
