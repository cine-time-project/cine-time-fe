"use client";

import { Spinner, Container, Row, Col, Card } from "react-bootstrap";

import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { CinemaReadOnlyForm } from "@/components/dashboard/cinema/detail/CinemaReadOnlyForm";
import { CinemaImageReadOnlyView } from "@/components/dashboard/cinema/detail/CinemaImageReadOnlyView";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { useTranslations } from "next-intl";

import { useParams } from "next/navigation";
import { useCinemaDetails } from "@/components/cinemas/useCinemaDetails";
import { CinemaDetailCard } from "@/components/dashboard/cinema/detail/CinemaDetailCard";

export default function CinemaDetailPage() {
  const { cinemaId } = useParams();

  const tCinemas = useTranslations("cinemas");

  // -----------------------------
  // Local state
  // -----------------------------
  const {
    cinema,
    loading,
    canEdit, // Determines if user has edit permissions
    refreshCinema, // Function to refetch & refresh cinema data
  } = useCinemaDetails(cinemaId);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );

  if (!cinema)
    return <p className="text-center mt-5">{tCinemas("noCinemaData")}</p>;

  // -----------------------------
  // Main render
  // -----------------------------
  return (
    <Container className="my-4">
      {/* Page header */}
      <PageHeader
        title={tCinemas("cinemaDetails")}
        leftActions={<BackButton />}
      />

      <CinemaDetailCard cinema={cinema} tCinemas={tCinemas}  />
      {/* Halls and Movies section */}
      <Row className="mt-4">
        <Col xs={12} className="mb-4">
          <MovieList movies={cinema.movies || []} tCinemas={tCinemas} />
        </Col>

        <Col xs={12}>
          <HallList cinema={cinema} tCinemas={tCinemas} />
        </Col>
      </Row>
    </Container>
  );
}
