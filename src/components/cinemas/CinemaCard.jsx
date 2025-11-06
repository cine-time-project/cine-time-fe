import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Badge, Row, Col } from "react-bootstrap";

import styles from "./cinemas.module.scss";
import { useTranslations } from "next-intl";
import { resolveCinemaImage } from "./utils";

export default function CinemaCard({ cinema, firstDate, L }) {
  const t = useTranslations ? useTranslations("cinemas") : () => (k) => k;

  const imgSrc = resolveCinemaImage(cinema);

  const cityName =
    cinema.city?.name ||
    cinema.cityName ||
    (typeof cinema.city === "string" ? cinema.city : "-");

  const detailHref = L(`cinemas/${cinema.id}`);
  const buyHref = `${detailHref}${firstDate ? `?date=${firstDate}` : ""}`;

  return (
    <Card className={`${styles.cinemaCard} bg-dark text-light`}>
      <Row className="g-0 flex-column flex-lg-row">
        {/* Image Section — 2/3 on large screens */}
        <Col xs={12} lg={6}>
          <div className={styles.mediaWrap}>
            <Image
              src={imgSrc}
              alt={cinema.name}
              fill
              unoptimized
              sizes="(max-width: 1000px) 100vw, 420px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </Col>

        {/* Body Section — 1/3 on large screens */}
        <Col xs={12} lg={6}>
          <Card.Body className={styles.cardBody}>
            <div className="d-flex align-items-start flex-column gap-3">
              <Card.Title className={styles.title}>{cinema.name}</Card.Title>
              {cityName && <Badge bg="secondary">{cityName}</Badge>}
            </div>

            <div className="mt-2 d-flex flex-column gap-3">
              <Link href={detailHref} className="btn btn-outline-dark">
                {t ? t("details") : "Detay"}<i className="pi pi-angle-right"></i>
              </Link>

              <Link href={buyHref} className="btn btn-warning fw-semibold">
                {t ? t("buyTicket") : "Bilet Al"}
              </Link>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}
