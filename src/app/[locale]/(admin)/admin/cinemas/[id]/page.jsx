"use client";
import React, { useEffect, useState } from "react";
import {
  Spinner,
  Container,
  Row,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
  Button,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { getDetailedCinema } from "@/service/cinema-service";
import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { CinemaForm } from "@/components/dashboard/cinema/new/CinemaForm";
import { CinemaReadOnlyView } from "@/components/dashboard/cinema/detail/CinemaReadOnlyView";
import { CinemaImageUploader } from "@/components/dashboard/cinema/new/CinemaImageUploader";
import { CinemaImageReadOnlyView } from "@/components/dashboard/cinema/detail/CinemaImageReadOnlyView";

export default function AdminCinemaDetailPage({ params }) {
  // ⚙️ Extract cinema ID from route params
  const { id } = React.use(params);

  // 🧠 Local state declarations
  const [isEditMode, setEditMode] = useState(false); // toggles edit/read-only mode
  const [cinema, setCinema] = useState(null); // stores fetched cinema details
  const [loading, setLoading] = useState(true); // loading indicator
  const [token, setToken] = useState(""); // auth token
  const [canEdit, setCanEdit] = useState(false); // determines if current user can edit
  const editRoles = ["ADMIN"]; // roles allowed to edit

  // 🔄 Toggles between edit and read-only view
  const toogleEditMode = () => {
    setEditMode(!isEditMode);
  };

  // 📦 Fetch cinema details and user role data on mount or ID/token change
  useEffect(() => {
    const fetchCinema = async () => {
      try {
        // 🔐 Retrieve auth data from localStorage
        const token = localStorage.getItem("authToken");
        const storedUserRaw = localStorage.getItem("authUser");
        const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

        // 🧾 Check if current user has one of the edit roles
        setCanEdit(storedUser?.roles?.some((r) => editRoles.includes(r)));

        // 🎬 Fetch detailed cinema data from API
        const data = await getDetailedCinema(id, token);
        setCinema(data);
        setToken(token);
      } catch (err) {
        // ❌ Show error alert if something goes wrong
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      } finally {
        // ✅ Stop loading spinner once data is handled
        setLoading(false);
      }
    };

    fetchCinema();
  }, [id, token]);

  // 🌀 Display a full-screen loading spinner while data is being fetched
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  // ⚠️ Handle the case when no cinema data is found
  if (!cinema) return <p className="text-center mt-5">Cinema not found.</p>;

  // 🧩 Main render section
  return (
    <Container className="my-4">
      {/* ✏️ Floating edit button (only visible if user has edit permissions) */}
      {canEdit && (
        <OverlayTrigger placement="bottom" overlay={<Tooltip>Edit</Tooltip>}>
          <Button
            onClick={toogleEditMode}
            className="btn rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: 50, height: 50 }}
            variant="warning"
          >
            <i className="pi pi-file-edit" style={{ fontSize: 25 }}></i>
          </Button>
        </OverlayTrigger>
      )}

      {/* 🧾 Page header */}
      <PageHeader title="Cinema Details" />

      <Row>
        {/* 🏢 Left column: Cinema info (form or read-only view) */}
        <Col md={6}>
          {isEditMode ? (
            <CinemaForm
              cinema={cinema}
              isEditMode={isEditMode}
              setCinema={setCinema}
            />
          ) : (
            <CinemaReadOnlyView
              cinema={cinema}
              toogleEditMode={toogleEditMode}
            />
          )}
        </Col>

        {/* 🖼️ Right column: Cinema image management (upload or read-only) */}
        <Col md={6}>
          {isEditMode ? (
            <CinemaImageUploader
              // cinema={{ id: newCinemaId }}
              cinema={cinema} // { id: 5, imageUrl: "..." }
              onUpdateCinema={(updatedCinema) => setCinema(updatedCinema)}
              token={token}
            />
          ) : (
            <CinemaImageReadOnlyView
              cinema={cinema}
            />
          )}
        </Col>
      </Row>

      {/* 🎞️ Halls and Movies section */}
      <Row className="mt-4">
        {/* 🎟️ Left column: list of halls */}
        <Col md={8}>
          <HallList halls={cinema.halls || []} />
        </Col>

        {/* 🎬 Right column: list of movies */}
        <Col md={4}>
          <MovieList movies={cinema.movies || []} />
        </Col>
      </Row>
    </Container>
  );
}
