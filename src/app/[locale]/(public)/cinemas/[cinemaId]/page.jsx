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

  // Local state
  const [selectedMovieID, setSelectedMovieID] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [allDates, setAllDates] = useState([]);
  const [movies, setMovies] = useState([]);

  // Fetch cinema details
  const { cinema, loading } = useCinemaDetails(cinemaId);

  // ---------------------------------------
  // Extract dates + uniq movies from showtimes
  // ---------------------------------------
  useEffect(() => {
    if (!cinema) return;

    // --- Extract all dates ---
    const allShowtimeDates = [
      ...new Set(
        cinema.halls?.flatMap((hall) => hall.showtimes?.map((s) => s.date)) || []
      ),
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDates = allShowtimeDates
      .map((d) => new Date(d))
      .filter((date) => date >= today)
      .sort((a, b) => a - b)
      .map((d) => d.toISOString().split("T")[0]);

    setAllDates(upcomingDates);

    if (!selectedDate && upcomingDates.length > 0) {
      setSelectedDate(upcomingDates[0]);
    }

    // --- Extract uniq movies from showtimes ---
    const uniqMovies = Object.values(
      cinema.halls
        ?.flatMap((hall) => hall.showtimes?.map((s) => s.movie) || [])
        .reduce((acc, movie) => {
          if (movie && !acc[movie.id]) acc[movie.id] = movie;
          return acc;
        }, {}) || {}
    );

    setMovies(uniqMovies);
  }, [cinema]);

  // Reset selected movie if date changes
  useEffect(() => {
    setSelectedMovieID(null);
  }, [selectedDate]);

  // ---------------------------------------
  // FILTER MOVIES
  // ---------------------------------------
  const filteredMovies = useMemo(() => {
    if (!movies.length) return [];

    // Case 1: Filter by selected date (and optionally by selectedMovieID)
    if (selectedDate) {
      const movieIdsForDate = new Set(
        cinema.halls?.flatMap((hall) =>
          hall.showtimes
            ?.filter((s) => s.date === selectedDate)
            .map((s) => s.movieId)
        )
      );

      return movies.filter((m) => movieIdsForDate.has(m.id));
    }

    // Case 2: Filter by movie only (no date)
    if (selectedMovieID) {
      return movies.filter((m) => m.id === selectedMovieID);
    }

    // Case 3: No filters
    return movies;
  }, [movies, cinema, selectedDate, selectedMovieID]);

  // ---------------------------------------
  // FILTER HALLS
  // ---------------------------------------
  const filteredHalls = useMemo(() => {
    if (!cinema) return [];

    return cinema.halls?.filter((hall) =>
      hall.showtimes?.some((s) => {
        const matchDate = selectedDate ? s.date === selectedDate : true;
        const matchMovie = selectedMovieID ? s.movieId === selectedMovieID : true;
        return matchDate && matchMovie;
      })
    );
  }, [cinema, selectedDate, selectedMovieID]);

  // ---------------------------------------
  // RENDER STATES
  // ---------------------------------------
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
        <PageHeader
          title={tCinemas("cinemaDetails")}
          leftActions={<BackButton variant="outline-light" icon="angle-left" />}
        />

        <CinemaHeroCard cinema={cinema} tCinemas={tCinemas} />

        <Alert variant="danger" className="text-center fs-3 py-5 my-5">
          {tCinemas("noShowtimes")}
        </Alert>
      </Container>
    );
  }

  // ---------------------------------------
  // MAIN RENDER
  // ---------------------------------------
  return (
    <Container className="my-4">
      <PageHeader
        title={tCinemas("cinemaDetails")}
        leftActions={<BackButton variant="outline-light" icon="angle-left" />}
      />

      <CinemaHeroCard cinema={cinema} tCinemas={tCinemas} />

      <Row className="mt-5">
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

        <Col xs={12}>
          {filteredHalls?.length > 0 ? (
            <HallList
              halls={filteredHalls}
              tCinemas={tCinemas}
              selectedMovieID={selectedMovieID}
              selectedDate={selectedDate}
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
