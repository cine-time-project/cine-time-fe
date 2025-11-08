"use client";

import React, { useEffect, useState } from "react";
import { Spinner, Container, Row, Col, Card } from "react-bootstrap";

import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { CinemaReadOnlyForm } from "@/components/dashboard/cinema/detail/CinemaReadOnlyForm";
import { CinemaImageReadOnlyView } from "@/components/dashboard/cinema/detail/CinemaImageReadOnlyView";
import { getDetailedCinema } from "@/service/cinema-service";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { useLocale, useTranslations } from "next-intl";

import Swal from "sweetalert2";
import { useParams } from "next/navigation";

export default function CinemaDetailPage() {
  const { cinemaId } = useParams();
  const locale = useLocale();

  const tCinemas = useTranslations("cinemas");

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  // -----------------------------
  // Local state
  // -----------------------------
  const [cinema, setCinema] = useState(null); // stores the cinema details
  const [loading, setLoading] = useState(true); // loading indicator for API calls

  // -----------------------------
  // Fetch detailed cinema data once token is available
  // -----------------------------
  useEffect(() => {
    const fetchCinema = async () => {
      setLoading(true);
      try {
        const data = await getDetailedCinema(cinemaId);
        setCinema(data);
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCinema();
  }, [cinemaId]);

  // -----------------------------
  // Render loading state if data is not ready
  // -----------------------------
  if (!cinemaId || loading)
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

      <Card
        className={`mb-4 border rounded-4 shadow-sm`}
        style={{
          backgroundColor: "#fff",
          borderColor: "#e5e7eb", // soft grey border
        }}
      >
        <Card.Header
          className="bg-light border-bottom py-3 px-4 d-flex justify-content-between align-items-center"
          style={{
            borderTopLeftRadius: "1rem",
            borderTopRightRadius: "1rem",
          }}
        >
          <span className="fs-3 fw-semibold">{tCinemas("cinemaInfo")}</span>
        </Card.Header>

        <Card.Body className="p-4">
          <Row>
            {/* Left column: Cinema image) */}
            <Col md={6}>
              <CinemaImageReadOnlyView cinema={cinema} tCinemas={tCinemas} />
            </Col>

            {/* Right column: Cinema info */}
            <Col md={6}>
              <CinemaReadOnlyForm cinema={cinema} tCinemas={tCinemas} />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {/* Halls and Movies section */}
      <Row className="mt-4">
        {/* Left column: list of halls */}
        <Col md={8}>
          <HallList cinema={cinema} tCinemas={tCinemas} L={L}/>
        </Col>

        {/* Right column: list of movies */}
        <Col md={4}>
          <MovieList movies={cinema.movies || []} tCinemas={tCinemas} />
        </Col>
      </Row>
    </Container>
  );
}
