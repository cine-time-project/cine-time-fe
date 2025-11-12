"use client";

import { useEffect, useState, useMemo } from "react";
import { Spinner, Container, Row, Col, Alert } from "react-bootstrap";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import HallList from "@/components/dashboard/cinema/detail/HallList";
import MovieList from "@/components/dashboard/cinema/detail/MovieList";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { useCinemaDetails } from "@/components/cinemas/useCinemaDetails";
import { ShowtimeDateSelector } from "@/components/dashboard/cinema/detail/ShowtimeDateSelector";
import { CinemaHeroCard } from "@/components/dashboard/cinema/detail/CinemaHeroCard";

export default function CinemaDetailPage() {
  const { cinemaId } = useParams();
  const tCinemas = useTranslations("cinemas");

  // -----------------------------
  // Local state
  // -----------------------------
  const [selectedMovieID, setSelectedMovieID] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [allDates, setAllDates] = useState([]);

  // Fetch cinema details and permissions
  const { cinema, loading, canEdit } = useCinemaDetails(cinemaId);

  // -----------------------------
  // Extract unique and sorted upcoming showtime dates
  // -----------------------------
  useEffect(() => {
    if (!cinema) return;

    const allShowtimeDates = [
      ...new Set(
        cinema.halls?.flatMap((hall) => hall.showtimes?.map((s) => s.date))
      ),
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDates = allShowtimeDates
      .map((d) => new Date(d))
      .filter((date) => date >= today)
      .sort((a, b) => a - b)
      .map((d) => d.toISOString().split("T")[0]); // YYYY-MM-DD

    setAllDates(upcomingDates);

    // Automatically pick the first date if none selected
    if (!selectedDate && upcomingDates.length > 0) {
      setSelectedDate(upcomingDates[0]);
    }
  }, [cinema, selectedDate]);

  // Reset selected movie when date changes
  useEffect(() => {
    setSelectedMovieID(null);
  }, [selectedDate]);

  // -----------------------------
  // Movie filtering logic
  // -----------------------------
  const filteredMovies = useMemo(() => {
    if (!cinema) return [];

    // Case 1: Filter by selected date (and movie if selected)
    if (selectedDate) {
      const movieIdsForDate = new Set(
        cinema.halls?.flatMap((hall) =>
          hall.showtimes
            ?.filter((s) => s.date === selectedDate)
            .map((s) => s.movieId)
        )
      );
      return cinema.movies?.filter((m) => movieIdsForDate.has(m.id)) || [];
    }

    // Case 2: Only selectedMovieID (no date)
    if (selectedMovieID) {
      return cinema.movies?.filter((m) => m.id === selectedMovieID) || [];
    }

    // Case 3: No filters — show all
    return cinema.movies || [];
  }, [cinema, selectedDate, selectedMovieID]);

  // -----------------------------
  // Hall filtering logic
  // -----------------------------
  const filteredHalls = useMemo(() => {
    if (!cinema) return [];

    // Case 1: Filter by selected date (and movie if selected)
    if (selectedDate) {
      return cinema.halls?.filter((hall) =>
        hall.showtimes?.some((s) => {
          const matchDate = s.date === selectedDate;
          const matchMovie = selectedMovieID
            ? s.movieId === selectedMovieID
            : true;
          return matchDate && matchMovie;
        })
      );
    }

    // Case 2: Only selectedMovieID (no date)
    if (selectedMovieID) {
      return cinema.halls?.filter((hall) =>
        hall.showtimes?.some((s) => s.movieId === selectedMovieID)
      );
    }

    // Case 3: No filters — show all
    return cinema.halls || [];
  }, [cinema, selectedDate, selectedMovieID]);

  // -----------------------------
  // Loading & empty state handling
  // -----------------------------
  if (loading && !cinema) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!loading && !cinema) {
    return <Alert variant="danger">{tCinemas("noCinemaData")}</Alert>;
  }

  if (!selectedDate) {
    return (
      <Container className="my-4">
        {/* Page header with back navigation */}
        <PageHeader
          title={tCinemas("cinemaDetails")}
          leftActions={<BackButton variant="outline-light" icon="angle-left" />}
        />

        {/* Cinema info section */}
        <CinemaHeroCard cinema={cinema} tCinemas={tCinemas} />

        <Alert variant="danger" className="text-center fs-3 py-5 my-5">
          {tCinemas("noShowtimes")}
        </Alert>
      </Container>
    );
  }

  // -----------------------------
  // Main render
  // -----------------------------
  return (
    <Container className="my-4">
      {/* Page header with back navigation */}
      <PageHeader
        title={tCinemas("cinemaDetails")}
        leftActions={<BackButton variant="outline-light" icon="angle-left" />}
      />

      {/* Cinema info section */}
      <CinemaHeroCard cinema={cinema} tCinemas={tCinemas} />

      <Row className="mt-5">
        {/* Movie list section with date selector */}
        <Col xs={12} className="mb-4">
          {allDates.length > 0 ? (
            <div className="d-flex gap-3 align-items-center">
              <ShowtimeDateSelector
                dates={allDates}
                tCinemas={tCinemas}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
              <h3 className="fw-bold mb-3 text-warning">
                {tCinemas("currentMovies")}
              </h3>
            </div>
          ) : (
            <Alert variant="danger" className="text-center fs-3 py-5">
              {tCinemas("noShowtimes")}
            </Alert>
          )}

          <MovieList
            movies={filteredMovies}
            tCinemas={tCinemas}
            selectedMovieID={selectedMovieID}
            pickMovie={setSelectedMovieID}
            selectedDate={selectedDate}
          />
        </Col>

        {/* Hall list section */}
        <Col xs={12}>
          {filteredHalls?.length > 0 ? (
            <HallList
              halls={filteredHalls}
              tCinemas={tCinemas}
              selectedMovieID={selectedMovieID}
              selectedDate={selectedDate}
              isEditMode={canEdit}
            />
          ) : (
            <Alert variant="warning" className="mt-3">
              {tCinemas("noHalls")}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}
