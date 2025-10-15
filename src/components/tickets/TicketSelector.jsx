// src/components/tickets/TicketSelector.jsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { config } from "@/helpers/config.js";

const TicketSelector = ({ onFindTickets }) => {
  // data
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [dates, setDates] = useState([]);
  const [movies, setMovies] = useState([]);

  // selections
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");

  // routing helpers
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // locale-aware base path (e.g. /tr)
  const localeSegment = pathname?.split("/")?.[1] || "";
  const basePath =
    localeSegment && !localeSegment.startsWith("(") ? `/${localeSegment}` : "";

  // --- Prefill from query (when coming from movie detail) ---
  const preMovieId = searchParams.get("movieId");
  const preMovieTitle = searchParams.get("movieTitle") || "Seçili Film";
  const lockedByPrefill = !!preMovieId; // if true, keep movie preselected even before date

  // 1) Load countries that have showtimes
  useEffect(() => {
    axios
      .get(`${config.apiURL}/show-times/countries-with-showtimes`)
      .then((res) => {
        const arr = Array.isArray(res.data?.returnBody)
          ? res.data.returnBody
          : [];
        setCountries(arr);
      })
      .catch((err) => {
        console.error("[countries-with-showtimes] failed:", err);
        setCountries([]);
      });
  }, []);

  // 2) On mount, apply movie prefill (if any)
  useEffect(() => {
    if (!preMovieId) return;
    setSelectedMovie(String(preMovieId));
    setMovies((prev) => {
      const exists = prev.some((m) => String(m.id) === String(preMovieId));
      return exists
        ? prev
        : [...prev, { id: Number(preMovieId), title: preMovieTitle }];
    });
  }, [preMovieId, preMovieTitle]);

  // 3) When country changes → fetch cities (and soft-reset while respecting prefill)
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      setSelectedCity("");
      setCinemas([]);
      setSelectedCinema("");
      setDates([]);
      setSelectedDate("");
      setMovies((prev) => (lockedByPrefill ? prev : []));
      if (!lockedByPrefill) setSelectedMovie("");
      return;
    }

    axios
      .get(`${config.apiURL}/show-times/cities-with-showtimes`, {
        params: { countryId: Number(selectedCountry) },
      })
      .then((res) => {
        const arr = Array.isArray(res.data?.returnBody)
          ? res.data.returnBody
          : [];
        setCities(arr);

        // Clear selected city if not in list
        if (
          selectedCity &&
          !arr.some((c) => String(c.id) === String(selectedCity))
        ) {
          setSelectedCity("");
          setCinemas([]);
          setSelectedCinema("");
          setDates([]);
          setSelectedDate("");
          if (!lockedByPrefill) {
            setMovies([]);
            setSelectedMovie("");
          }
        }
      })
      .catch((err) => {
        console.error("[cities-with-showtimes by country] failed:", err);
        setCities([]);
        setSelectedCity("");
        setCinemas([]);
        setSelectedCinema("");
        setDates([]);
        setSelectedDate("");
        if (!lockedByPrefill) {
          setMovies([]);
          setSelectedMovie("");
        }
      });
  }, [selectedCountry, lockedByPrefill]); // respect prefill

  // 4) When city changes → fetch cinemas
  useEffect(() => {
    if (selectedCity) {
      axios
        .get(`${config.apiURL}/cinemas?cityId=${selectedCity}`)
        .then((res) => {
          const page = res.data?.returnBody;
          setCinemas(page?.content ?? []);
        })
        .catch(() => setCinemas([]));
    } else {
      setCinemas([]);
      setSelectedCinema("");
    }
  }, [selectedCity]);

  // 5) When cinema changes → fetch available dates from showtimes
  useEffect(() => {
    if (!selectedCinema) {
      setDates([]);
      setSelectedDate("");
      if (!lockedByPrefill) {
        setMovies([]);
        setSelectedMovie("");
      }
      return;
    }

    axios
      .get(`${config.apiURL}/show-times/cinema/${selectedCinema}`)
      .then((res) => {
        const body = res.data?.returnBody ?? res.data;
        const halls = Array.isArray(body) ? body : [];

        // collect all times
        const allTimes = halls.flatMap((h) =>
          (h.movies || []).flatMap((m) => m.times || [])
        );

        // YYYY-MM-DD unique
        const uniqueDates = [...new Set(allTimes.map((t) => String(t).slice(0, 10)))].sort();

        setDates(uniqueDates);
        if (selectedDate && !uniqueDates.includes(selectedDate)) {
          setSelectedDate("");
        }
      })
      .catch(() => {
        setDates([]);
        setSelectedDate("");
      });
  }, [selectedCinema, selectedDate, lockedByPrefill]);

  // 6) When date changes → derive movies for that date
  useEffect(() => {
    if (!selectedCinema || !selectedDate) {
      if (!lockedByPrefill) {
        setMovies([]);
        setSelectedMovie("");
      }
      return;
    }

    axios
      .get(`${config.apiURL}/show-times/cinema/${selectedCinema}`)
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

        // keep prefilled movie even if not in that date (user değiştirebilir)
        const withPrefill =
          lockedByPrefill &&
          preMovieId &&
          !moviesForDate.some((m) => String(m.id) === String(preMovieId))
            ? [
                ...moviesForDate,
                { id: Number(preMovieId), title: preMovieTitle },
              ]
            : moviesForDate;

        setMovies(withPrefill);

        if (
          selectedMovie &&
          !withPrefill.some((m) => String(m.id) === String(selectedMovie)) &&
          !lockedByPrefill
        ) {
          setSelectedMovie("");
        }
      })
      .catch(() => {
        if (!lockedByPrefill) {
          setMovies([]);
          setSelectedMovie("");
        }
      });
  }, [selectedCinema, selectedDate, lockedByPrefill, preMovieId, preMovieTitle, selectedMovie]);

  // 7) Navigate to /buy-ticket
  const handleFindTickets = () => {
    if (selectedCity && selectedCinema && selectedDate && selectedMovie) {
      const q = new URLSearchParams({
        cityId: String(selectedCity),
        cinemaId: String(selectedCinema),
        date: selectedDate,
        movieId: String(selectedMovie),
      }).toString();

      router.push(`${basePath}/buy-ticket?${q}`);

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

      {/* Country */}
      <Form.Select
        className="mb-2"
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
      >
        <option value="">Ülke Seçiniz</option>
        {countries.map((country) => (
          <option key={country.id} value={String(country.id)}>
            {country.name}
          </option>
        ))}
      </Form.Select>

      {/* City */}
      <Form.Select
        className="mb-2"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        disabled={!selectedCountry}
      >
        <option value="">Şehir Seçiniz</option>
        {cities.map((city) => (
          <option key={city.id} value={String(city.id)}>
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
        // ✅ detaydan geldiysek (prefill) film seçimi aktif kalsın:
        disabled={!selectedDate && !lockedByPrefill}
      >
        <option value="">
          {lockedByPrefill ? "Film seçildi" : "Film Seçiniz"}
        </option>
        {movies.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title}
          </option>
        ))}
      </Form.Select>

      {/* Find Tickets */}
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
