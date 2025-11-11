"use client";

import { Spinner, Container, Row, Col, Card } from "react-bootstrap";

import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { useTranslations } from "next-intl";

import { useParams } from "next/navigation";
import { useCinemaDetails } from "@/components/cinemas/useCinemaDetails";
import { CinemaDetailCard } from "@/components/dashboard/cinema/detail/CinemaDetailCard";
import { useEffect, useState } from "react";
import { ShowtimeDateSelector } from "@/components/dashboard/cinema/detail/ShowtimeDateSelector";

export default function CinemaDetailPage() {
  const { cinemaId } = useParams();
  const tCinemas = useTranslations("cinemas");

  // -----------------------------
  // Local state
  // -----------------------------
  const [selectedMovieID, setSelectedMovieID] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [allDates, setAllDates] = useState([]);
  const {
    cinema,
    loading,
    canEdit, // Determines if user has edit permissions
    refreshCinema, // Function to refetch & refresh cinema data
  } = useCinemaDetails(cinemaId);

useEffect(() => {
  if (!cinema) return;

  // Tüm showtime tarihlerini al ve unique yap
  const allShowtimeDates = [
    ...new Set(
      cinema.halls.flatMap((hall) => hall.showtimes.map((s) => s.date))
    ),
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Sadece tarih karşılaştırması için

  // Bugünden önceki tarihleri çıkar ve sırala
  const upcomingDates = allShowtimeDates
    .map((d) => new Date(d))
    .filter((date) => date >= today)
    .sort((a, b) => a - b)
    .map((d) => d.toISOString().split("T")[0]); // YYYY-MM-DD format

  setAllDates(upcomingDates);

  // selectedDate yoksa ilk uygun tarihi set et
  if (!selectedDate && upcomingDates.length > 0) {
    setSelectedDate(upcomingDates[0]);
  }
}, [cinema]);



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

      <CinemaDetailCard cinema={cinema} tCinemas={tCinemas} />
      {/* Halls and Movies section */}
      <Row className="mt-4">
        <Col xs={12} className="mb-4">
          <ShowtimeDateSelector
            dates={allDates}
            tCinemas={tCinemas}
            onDateChange={setSelectedDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <MovieList
            movies={cinema.movies || []}
            tCinemas={tCinemas}
            selectedMovieID={selectedMovieID}
            pickMovie={setSelectedMovieID}
          />
        </Col>

        <Col xs={12}>
          <HallList
            cinema={cinema}
            tCinemas={tCinemas}
            selectedMovieID={selectedMovieID}
            selectedDate={selectedDate}
          />
        </Col>
      </Row>
    </Container>
  );
}
