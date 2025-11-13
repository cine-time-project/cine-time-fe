"use client";

import React from "react";
import {
  Spinner,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";

import { PageHeader } from "@/components/common/page-header/PageHeader";
import { CinemaForm } from "@/components/dashboard/cinema/new/CinemaForm";
import { CinemaImageUploader } from "@/components/dashboard/cinema/new/CinemaImageUploader";
import { useParams } from "next/navigation";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { useTranslations } from "next-intl";
import { useCinemaDetails } from "@/components/cinemas/useCinemaDetails";
import { useAuth } from "@/lib/auth/useAuth";
import MovieListDashboardTable from "@/components/dashboard/cinema/detail/MovieListDashboardTable";
import HallListForDashboard from "@/components/dashboard/cinema/detail/HallListForDashboard";

export default function AdminCinemaDetailPage() {
  // Extract cinema ID from route params (Next.js 15+ uses promise-based params)
  const { id } = useParams();
  const { token } = useAuth();
  const tCinemas = useTranslations("cinemas");

  // -----------------------------
  // Local state
  // -----------------------------
  const {
    cinema,
    loading,
    canEdit, // Determines if user has edit permissions
    refreshCinema, // Function to refetch & refresh cinema data
  } = useCinemaDetails(id);

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
        leftActions={<BackButton title={tCinemas("back")} />}
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
            {/* Left column: Cinema image management (upload or read-only view) */}
            <Col md={6}>
              <CinemaImageUploader
                tCinemas={tCinemas}
                cinema={cinema}
                refreshCinema={refreshCinema}
                token={token}
              />
            </Col>

            {/* Right column: Cinema form or read-only view */}
            <Col md={6}>
              <CinemaForm
                token={token}
                tCinemas={tCinemas}
                cinema={cinema}
                locale="en"
                isEditMode={true}
                refreshCinema={refreshCinema} // parent state update callback
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mt-4">
        <Col xs={12} className="mb-4">
          <MovieListDashboardTable movies={cinema.movies || []} />
        </Col>

        <Col xs={12}>
          <HallListForDashboard
            halls={cinema?.halls}
            tCinemas={tCinemas}
            isEditMode={canEdit}
            isDashboard={true}
          />
        </Col>
      </Row>
    </Container>
  );
}
