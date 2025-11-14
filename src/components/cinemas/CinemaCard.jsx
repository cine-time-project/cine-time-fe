import React from "react";
import Link from "next/link";
import { Card } from "react-bootstrap";
import styles from "./cinemaCard.module.scss";
import { resolveCinemaImage } from "./utils";

export default function CinemaCard({ cinema, L, t }) {
  
  if (!cinema) return null;

  const imageUrl = cinema?.cinemaImageUrl || cinema?.imageUrl || "";
  const city = cinema.city?.name || "";
  const detailHref = L(`cinemas/${cinema.id}`);

  return (
    <Card
      as={Link}
      title={t("cinemaDetails")}
      href={detailHref}
      className={styles.cinemaHeroCard}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className={styles.cinemaHeroOverlay} />

      <div className={styles.cinemaHeroContent}>
        <h2 className={styles.cinemaHeroTitle}>{cinema.name || "No Name"}</h2>
        <p className={styles.cinemaHeroLocation}>{city}</p>
      </div>
    </Card>
  );
}
