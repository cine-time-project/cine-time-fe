"use client";
import React, { useEffect, useState } from "react";
import { Spinner, Container, Row, Col, Card } from "react-bootstrap";
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
  const { id } = React.use(params);
  const [isEditMode, setEditMode] = useState(false);
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchCinema = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const data = await getDetailedCinema(id, token);
        setCinema(data);
        setToken(token);
      } catch (err) {
        Swal.fire("Error", err.response?.data?.message || err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCinema();
  }, [id, token]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!cinema) return <p className="text-center mt-5">Cinema not found.</p>;

  return (
    <Container className="my-4">
      <PageHeader title="Cinema Details" />
      <Row>
        <Col md={6}>
          {isEditMode ? (
            <CinemaForm
              cinema={cinema}
              isEditMode={isEditMode}
              setCinema={setCinema}
            />
          ) : (
            <CinemaReadOnlyView cinema={cinema} />
          )}
        </Col>
        <Col md={6}>
          {isEditMode ? (
            <CinemaImageUploader
              //cinema={{ id: newCinemaId }}
              cinema={cinema} // { id: 5, imageUrl: "..."}
              isEditMode={false}
              onUpload={async (id, file) => {
                const formData = new FormData();
                formData.append("image", file);
                await axios.post(`/api/cinemas/${id}/upload-image`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
              }}
            />
          ) : (
            <CinemaImageReadOnlyView cinema={cinema}/>
          )}
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={8}>
          <HallList halls={cinema.halls || []} />
        </Col>
        <Col md={4}>
          <MovieList movies={cinema.movies || []} />
        </Col>
      </Row>
    </Container>
  );
}
