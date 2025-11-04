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
} from "react-bootstrap";

import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { CinemaForm } from "@/components/dashboard/cinema/new/CinemaForm";
import { CinemaReadOnlyForm } from "@/components/dashboard/cinema/detail/CinemaReadOnlyForm";
import { CinemaImageUploader } from "@/components/dashboard/cinema/new/CinemaImageUploader";
import { CinemaImageReadOnlyView } from "@/components/dashboard/cinema/detail/CinemaImageReadOnlyView";
import { getDetailedCinema } from "@/service/cinema-service";

export default function AdminCinemaDetailPage({ params }) {
  // Extract cinema ID from route params (Next.js 15+ uses promise-based params)
  const { id } = React.use(params);

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
      <PageHeader title="Cinema Details" />

      {/* Edit button: floating button for toggling edit mode, visible only for users with permission */}
      {canEdit && (
        <OverlayTrigger placement="bottom" overlay={<Tooltip>Edit</Tooltip>}>
          <Button
            onClick={toggleEditMode}
            className="btn rounded-circle position-fixed bottom-0 end-0 m-4 shadow"
            style={{ width: 50, height: 50, zIndex: 10 }}
            variant={isEditMode ? "secondary" : "warning"}
          >
            <i
              className={`pi ${isEditMode ? "pi-times" : "pi-file-edit"}`}
              style={{ fontSize: 20 }}
            />
          </Button>
        </OverlayTrigger>
      )}

      <Row>
        {/* Left column: Cinema form or read-only view */}
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

        {/* Right column: Cinema image management (upload or read-only view) */}
        <Col md={6}>
          {isEditMode ? (
            <CinemaImageUploader
              cinema={cinema}
              token={token}
              onUpdateCinema={async () => {
                // Re-fetch cinema data after image upload
                const fresh = await getDetailedCinema(id, token);
                setCinema(fresh);
                return fresh; // return updated cinema for uploader preview update
              }}
            />
          ) : (
            <CinemaImageReadOnlyView cinema={cinema} />
          )}
        </Col>
      </Row>

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
