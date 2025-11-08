import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Badge, Row, Col } from "react-bootstrap";
import styles from "./cinemas.module.scss";
import { resolveCinemaImage } from "./utils";

export default function CinemaCard({ cinema, L }) {

  const imgSrc = resolveCinemaImage(cinema);

  const cityName = cinema.city?.name;

  const detailHref = L(`cinemas/${cinema.id}`);

  return (
    <Card
      className={`${styles.cinemaCard} bg-dark text-light`}
      as={Link}
      href={detailHref}
    >
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
            <div>
              <Card.Title className={styles.title}>{cinema.name}</Card.Title>
              {cityName && (
                <Badge bg="warning" className={styles.cityLabel}>
                  {cityName}
                </Badge>
              )}
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}
