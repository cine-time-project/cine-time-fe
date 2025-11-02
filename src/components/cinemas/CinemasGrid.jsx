// CinemasGrid.jsx
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { useLocale, useTranslations } from "next-intl";
import CinemaCard from "./CinemaCard";
import useFirstDates from "@/components/cinemas/useFirstDate";
import SectionTitle from "@/components/common/SectionTitle";

export default function CinemasGrid({
  cinemas = [],
  loading,
  error,
  pagination,
  setPage,
  isWhole,
  cityFilter,
  L,
}) {
  const t = useTranslations("cinemas");
  const locale = useLocale;
  const firstDatesByCinema = useFirstDates(cinemas);

  if (loading)
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <div className="mt-2">{t("loading")}</div>
      </div>
    );

  if (error) return <Alert variant="danger">{t("noCinemas")}</Alert>;
  if (!cinemas.length)
    return <div className="text-secondary py-5">{t("empty")}</div>;

  const { page, totalPages } = pagination || {};
  const maxButtons = 5;
  const start = Math.max(0, page - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons);

  const pageItems = [];
  for (let i = start; i < end; i++) {
    pageItems.push(
      <Pagination.Item key={i} active={i === page} onClick={() => setPage(i)}>
        {i + 1}
      </Pagination.Item>
    );
  }

  return (
    <Container className="my-5">
      {!isWhole ? (
        <SectionTitle textColor="text-light">{t("aroundCinemas", {city: cityFilter.toLocaleUpperCase(locale)})}</SectionTitle>
      ) : cityFilter.toLocaleUpperCase(locale) ? (
        <Alert variant="danger">
          {t("aroundNoCinemas", {city: cityFilter.toLocaleUpperCase(locale)})}
          <SectionTitle>{t("allCinemas")}</SectionTitle>
        </Alert>
      ) : (
        <SectionTitle textColor="text-light">{t("allCinemas")}</SectionTitle>
      )}
      <Row xs={1} sm={2} md={3} lg={3} xl={4} className="g-4">
        {cinemas.map((c) => (
          <Col key={c.id} className="d-flex align-items-stretch">
            <CinemaCard cinema={c} firstDate={firstDatesByCinema[c.id]} L={L} />
          </Col>
        ))}
      </Row>

      {pagination?.totalPages > 1 && (
        <Pagination className="justify-content-center mt-4">
          <Pagination.First onClick={() => setPage(0)} disabled={page === 0} />
          <Pagination.Prev
            onClick={() => setPage(Math.max(page - 1, 0))}
            disabled={page === 0}
          />
          {pageItems}
          <Pagination.Next
            onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
          />
          <Pagination.Last
            onClick={() => setPage(totalPages - 1)}
            disabled={page === totalPages - 1}
          />
        </Pagination>
      )}
    </Container>
  );
}
