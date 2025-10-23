import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useTranslations } from "next-intl";
import CinemaCard from "./CinemaCard";
import styles from "./cinemas.module.scss";
import useCinemas from "@/components/cinemas/useCinemas";
import useFirstDates from "@/components/cinemas/useFirstDate";

export default function CinemasGrid({ cityFilter = "", L }) {
  const t = useTranslations ? useTranslations("cinemas") : () => (k) => k;
  const { cinemas, loading, error } = useCinemas(cityFilter);
  const firstDatesByCinema = useFirstDates(cinemas);

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <div className="mt-2">{t ? t("loading") : "Yükleniyor…"}</div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{t ? t("noCinemas") : "Cinemalar yüklenemedi."}</Alert>;
  }

  if (!cinemas || cinemas.length === 0) {
    return <div className="text-secondary py-5">{t ? t("empty") : "Şu an kriterlere uyan sinema bulunamadı."}</div>;
  }

  return (
    <Container className={styles.gridContainer}>
      <Row xs={1} sm={2} md={3} lg={3} xl={4} className="g-4">
        {cinemas.map((c) => (
          <Col key={c.id}>
            <CinemaCard
              cinema={c}
              firstDate={firstDatesByCinema[c.id]}
              L={L}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}