"use client";

import React, { useEffect, useState } from "react";
import {
  Spinner,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Button,
  Card,
} from "react-bootstrap";

import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { CinemaForm } from "@/components/dashboard/cinema/new/CinemaForm";
import { CinemaReadOnlyForm } from "@/components/dashboard/cinema/detail/CinemaReadOnlyForm";
import { CinemaImageUploader } from "@/components/dashboard/cinema/new/CinemaImageUploader";
import { CinemaImageReadOnlyView } from "@/components/dashboard/cinema/detail/CinemaImageReadOnlyView";
import { getDetailedCinema } from "@/service/cinema-service";
import { useParams, useSearchParams } from "next/navigation";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { useTranslations } from "next-intl";
import { useCinemaDetails } from "@/components/cinemas/useCinemaDetails";

export default function AdminCinemaDetailPage() {
  // Extract cinema ID from route params (Next.js 15+ uses promise-based params)
  const { id } = useParams();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("editMode") === "true";

  const tCinemas = useTranslations("cinemas");

  // -----------------------------
  // Local state
  // -----------------------------
  const {
    cinema,
    loading,
    canEdit, // Determines if user has edit permissions
    isEditMode, // Toggles edit vs read-only UI
    toggleEditMode,
    refreshCinema, // Function to refetch & refresh cinema data
  } = useCinemaDetails(id);

  //If ADMIN came from new Cinema Registration page, turn on editMode automatically.
  useEffect(() => {
    if (editMode && canEdit) toggleEditMode();
  }, []);

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
        rightActions={
          canEdit ? (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>{tCinemas("edit")}</Tooltip>}
            >
              <Button
                onClick={toggleEditMode}
                className="btn rounded shadow-sm"
                variant={isEditMode ? "secondary" : "warning"}
              >
                <i
                  className={`pi ${isEditMode ? "pi-times" : "pi-file-edit"}`}
                  style={{ fontSize: 20 }}
                />{" "}
                {tCinemas("edit")}
              </Button>
            </OverlayTrigger>
          ) : null
        }
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
              {isEditMode ? (
                <CinemaImageUploader
                  tCinemas={tCinemas}
                  cinema={cinema}
                  onUpdateCinema={async () => {
                    refreshCinema();
                    return fresh;
                  }}
                />
              ) : (
                <CinemaImageReadOnlyView cinema={cinema} tCinemas={tCinemas} />
              )}
            </Col>

            {/* Right column: Cinema form or read-only view */}
            <Col md={6}>
              {isEditMode ? (
                <CinemaForm
                  tCinemas={tCinemas}
                  cinema={cinema}
                  locale="en"
                  isEditMode={true}
                  refreshCinema // parent state update callback
                />
              ) : (
                <CinemaReadOnlyForm cinema={cinema} tCinemas={tCinemas} />
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

       <Row className="mt-4">{/*
        <Col xs={12} className="mb-4">
          <MovieList movies={cinema.movies || []} tCinemas={tCinemas} />
        </Col>
*/}
        <Col xs={12}>
          <HallList
            cinema={cinema}
            tCinemas={tCinemas}
            isEditMode={isEditMode}
          />
        </Col>
      </Row> 
    </Container>
  );
}
