"use client";
import React, { useEffect, useState } from "react";
import { Spinner, Container, Row, Col } from "react-bootstrap";
import Swal from "sweetalert2";
import { useAuth } from "@/lib/auth/useAuth";
import { getDetailedCinema } from "@/service/cinema-service";
import CinemaDetailCard from "@/components/dashboard/cinema/detail/CinemaDetailCard";
import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";

export default function AdminCinemaDetailPage({ params }) {
  const { id } = React.use(params);
  const { token } = useAuth();

  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinema = async () => {
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

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!cinema) return <p className="text-center mt-5">Cinema not found.</p>;

  return (
    <Container className="my-4">
      <PageHeader title={`Detail Page for - ${cinema?.name}`} />
      <CinemaDetailCard cinema={cinema} />

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
