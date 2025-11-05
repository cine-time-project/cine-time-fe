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

export default function AdminCinemaDetailPage() {
  // Extract cinema ID from route params (Next.js 15+ uses promise-based params)
  const { id } = useParams();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("editMode") === "true";

  // -----------------------------
  // Local state
  // -----------------------------
  const [isEditMode, setEditMode] = useState(false); // toggle between edit and read-only view
  const [cinema, setCinema] = useState(null); // stores the cinema details
  const [loading, setLoading] = useState(true); // loading indicator for API calls
  const [token, setToken] = useState(""); // authentication token
  const [canEdit, setCanEdit] = useState(false); // determines if the user has edit permissions

  const editRoles = ["ADMIN"]; // roles allowed to edit cinema

  // -----------------------------
  // Toggle edit/read-only mode
  // -----------------------------
  const toggleEditMode = () => setEditMode((prev) => !prev);

  // -----------------------------
  // EditMode is active if user comes from "new" page.
  // -----------------------------
  useEffect(() => {
    setEditMode(editMode);
  }, []);

  // -----------------------------
  // Load authentication token and user roles from localStorage
  // -----------------------------
  useEffect(() => {
    const loadAuth = () => {
      const storedToken = localStorage.getItem("authToken");
      const userRaw = localStorage.getItem("authUser");
      const user = userRaw ? JSON.parse(userRaw) : null;

      setToken(storedToken || "");
      setCanEdit(user?.roles?.some((r) => editRoles.includes(r)) || false);
    };
    loadAuth();
  }, []);

  // -----------------------------
  // Fetch detailed cinema data once token is available
  // -----------------------------
  useEffect(() => {
    if (!token) return; // do not fetch if token is not ready

    const fetchCinema = async () => {
      setLoading(true);
      try {
        const data = await getDetailedCinema(id, token);
        setCinema(data);
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCinema();
  }, [id, token]);

  // -----------------------------
  // Render loading state if data is not ready
  // -----------------------------
  if (loading || !token)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );

  // -----------------------------
  // Handle case when cinema is not found
  // -----------------------------
  if (!cinema) return <p className="text-center mt-5">Cinema not found.</p>;

  // -----------------------------
  // Main render
  // -----------------------------
  return (
    <Container className="my-4">
      {/* Page header */}
      <PageHeader title="Cinema Details" leftActions={<BackButton />} />

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
          <span className="fs-3 fw-semibold">Cinema Information</span>
          {/* Edit button: Button for toggling edit mode, visible only for users with permission */}
          {canEdit && (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Edit</Tooltip>}
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
                Edit
              </Button>
            </OverlayTrigger>
          )}
        </Card.Header>

        <Card.Body className="p-4">
          <Row>
            {/* Left column: Cinema image management (upload or read-only view) */}
            <Col md={6}>
              {isEditMode ? (
                <CinemaImageUploader
                  cinema={cinema}
                  token={token}
                  onUpdateCinema={async () => {
                    const fresh = await getDetailedCinema(id, token);
                    setCinema(fresh);
                    return fresh;
                  }}
                />
              ) : (
                <CinemaImageReadOnlyView cinema={cinema} />
              )}
            </Col>

            {/* Right column: Cinema form or read-only view */}
            <Col md={6}>
              {isEditMode ? (
                <CinemaForm
                  cinema={cinema}
                  token={token}
                  locale="en"
                  isEditMode={true}
                  setCinema={setCinema} // parent state update callback
                />
              ) : (
                <CinemaReadOnlyForm cinema={cinema} />
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Halls and Movies section */}
      <Row className="mt-4">
        {/* Left column: list of halls */}
        <Col md={8}>
          <HallList halls={cinema.halls || []} />
        </Col>

        {/* Right column: list of movies */}
        <Col md={4}>
          <MovieList movies={cinema.movies || []} />
        </Col>
      </Row>
    </Container>
  );
}
