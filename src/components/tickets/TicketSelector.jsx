"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { useRouter, usePathname } from "next/navigation";

 

const TicketSelector = ({ onFindTickets }) => {
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [dates, setDates] = useState([]);
  const [movies, setMovies] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  // derive locale segment if the app is under /[locale]/...
  const localeSegment = pathname?.split("/")?.[1] || "";
  const basePath = localeSegment && !localeSegment.startsWith("(") ? `/${localeSegment}` : "";

  console.log("API_BASE", process.env.NEXT_PUBLIC_API_BASE_URL); // should log http://localhost:8090/api
  // Load cities on mount
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cities`)
      .then((res) => setCities(res.data));
  }, []);

  // When city changes → fetch cinemas
  useEffect(() => {
    if (selectedCity) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/cinemas?cityId=${selectedCity}`
        )
        .then((res) => {
          const page = res.data?.returnBody; // ResponseMessage<Page<...>>
          setCinemas(page?.content ?? []); // <-- unwrap Page content
        });
    } else {
      setCinemas([]);
      setSelectedCinema("");
    }
  }, [selectedCity]);

  // When cinema changes → fetch available dates (from times[])
  useEffect(() => {
    if (!selectedCinema) {
      setDates([]);
      setSelectedDate("");
      return;
    }

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/show-times/cinema/${selectedCinema}`
      )
      .then((res) => {
        // unwrap ResponseMessage<List<HallWithShowtimesResponse>>
        const body = res.data?.returnBody ?? res.data;
        const halls = Array.isArray(body) ? body : [];

        // Flatten all times strings across all halls & movies
        const allTimes = halls.flatMap((h) =>
          (h.movies || []).flatMap((m) => m.times || [])
        );

        // Normalize to YYYY-MM-DD, unique & sorted
        const uniqueDates = [
          ...new Set(allTimes.map((t) => String(t).slice(0, 10))),
        ].sort();

        setDates(uniqueDates);
        // Clear invalid selectedDate if needed
        if (selectedDate && !uniqueDates.includes(selectedDate)) {
          setSelectedDate("");
        }
      })
      .catch(() => {
        setDates([]);
        setSelectedDate("");
      });
  }, [selectedCinema]);

  // When date changes → derive movies (from show-times payload)
  useEffect(() => {
    if (!selectedCinema || !selectedDate) {
      setMovies([]);
      setSelectedMovie("");
      return;
    }

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/show-times/cinema/${selectedCinema}`
      )
      .then((res) => {
        const body = res.data?.returnBody ?? res.data;
        const halls = Array.isArray(body) ? body : [];

        const seen = new Set();
        const moviesForDate = [];

        halls.forEach((h) => {
          (h.movies || []).forEach((mm) => {
            const times = mm.times || [];
            const isOnDate = times.some(
              (t) => String(t).slice(0, 10) === selectedDate
            );
            if (isOnDate && mm.movie && !seen.has(mm.movie.id)) {
              seen.add(mm.movie.id);
              moviesForDate.push({ id: mm.movie.id, title: mm.movie.title });
            }
          });
        });

        setMovies(moviesForDate);
        if (
          selectedMovie &&
          !moviesForDate.some((m) => m.id === +selectedMovie)
        ) {
          setSelectedMovie("");
        }
      })
      .catch(() => {
        setMovies([]);
        setSelectedMovie("");
      });
  }, [selectedCinema, selectedDate]);

  const handleFindTickets = () => {
    if (selectedCity && selectedCinema && selectedDate && selectedMovie) {
      const q = new URLSearchParams({
        cityId: String(selectedCity),
        cinemaId: String(selectedCinema),
        date: selectedDate,
        movieId: String(selectedMovie),
      }).toString();

      // Navigate to Buy Ticket page, preserving locale segment if present
      router.push(`${basePath}/buy-ticket?${q}`);

      // still call parent callback if provided
      if (typeof onFindTickets === "function") {
        onFindTickets({
          cityId: selectedCity,
          cinemaId: selectedCinema,
          date: selectedDate,
          movieId: selectedMovie,
        });
      }
    }
  };

  return (
    <div className="p-3 bg-dark text-light rounded">
      <h4 className="mb-3 text-warning">🎟️ Bilet Al</h4>

      {/* City */}
      <Form.Select
        className="mb-2"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
      >
        <option value="">Şehir Seçiniz</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </Form.Select>

      {/* Cinema */}
      <Form.Select
        className="mb-2"
        value={selectedCinema}
        onChange={(e) => setSelectedCinema(e.target.value)}
        disabled={!selectedCity}
      >
        <option value="">Sinema Seçiniz</option>
        {cinemas.map((cinema) => (
          <option key={cinema.id} value={cinema.id}>
            {cinema.name}
          </option>
        ))}
      </Form.Select>

      {/* Date */}
      <Form.Select
        className="mb-2"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        disabled={!selectedCinema}
      >
        <option value="">Tarih Seçiniz</option>
        {dates.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Form.Select>

      {/* Movie */}
      <Form.Select
        className="mb-2"
        value={selectedMovie}
        onChange={(e) => setSelectedMovie(e.target.value)}
        disabled={!selectedDate}
      >
        <option value="">Film Seçiniz</option>
        {movies.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </Form.Select>

      {/* Find Tickets button */}
      <Button
        variant="warning"
        className="w-100"
        onClick={handleFindTickets}
        disabled={!selectedMovie}
      >
        Biletleri Bul
      </Button>
    </div>
  );
};

export default TicketSelector;
