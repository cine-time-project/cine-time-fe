"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "use-intl";
import { config } from "@/helpers/config.js";

const TicketSelector = ({ onFindTickets }) => {
  const t = useTranslations(); // same root namespace

  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [dates, setDates] = useState([]);
  const [movies, setMovies] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  // derive locale segment if the app is under /[locale]/...
  const localeSegment = pathname?.split("/")?.[1] || "";
  const basePath =
    localeSegment && !localeSegment.startsWith("(") ? `/${localeSegment}` : "";

  // Load countries (only those that have showtimes)
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

  // When country changes → fetch cities that have showtimes in that country
  useEffect(() => {
    if (!selectedCountry) {
      setCities([]);
      setSelectedCity("");
      setCinemas([]);
      setSelectedCinema("");
      setDates([]);
      setSelectedDate("");
      setMovies([]);
      setSelectedMovie("");
      return;
    }

    axios
      .get(`${config.apiURL}/show-times/cities-with-showtimes`, {
        params: { countryId: selectedCountry },
      })
      .then((res) => {
        const arr = Array.isArray(res.data?.returnBody)
          ? res.data.returnBody
          : [];
        setCities(arr);

        if (
          selectedCity &&
          !arr.some((c) => String(c.id) === String(selectedCity))
        ) {
          setSelectedCity("");
          setCinemas([]);
          setSelectedCinema("");
          setDates([]);
          setSelectedDate("");
          setMovies([]);
          setSelectedMovie("");
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
        setMovies([]);
        setSelectedMovie("");
      });
  }, [selectedCountry]);

  // When city changes → fetch cinemas
  useEffect(() => {
    if (selectedCity) {
      axios
        .get(`${config.apiURL}/cinemas?cityId=${selectedCity}`)
        .then((res) => {
          const page = res.data?.returnBody;
          setCinemas(page?.content ?? []);
        });
    } else {
      setCinemas([]);
      setSelectedCinema("");
    }
  }, [selectedCity]);

  // When cinema changes → fetch available dates
  useEffect(() => {
    if (!selectedCinema) {
      setDates([]);
      setSelectedDate("");
      return;
    }

    axios
      .get(`${config.apiURL}/show-times/cinema/${selectedCinema}`)
      .then((res) => {
        const body = res.data?.returnBody ?? res.data;
        const halls = Array.isArray(body) ? body : [];

        const allTimes = halls.flatMap((h) =>
          (h.movies || []).flatMap((m) => m.times || [])
        );

        const uniqueDates = [
          ...new Set(allTimes.map((t) => String(t).slice(0, 10))),
        ].sort();

        setDates(uniqueDates);

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
      {/* Title - hidden in sticky bar CSS on desktop anyway */}
      <h4 className="mb-3 text-warning">{t("buybar.title")}</h4>

      {/* Country */}
      <Form.Select
        className="mb-2"
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
      >
        <option value="">{t("buybar.countryPlaceholder")}</option>
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
        <option value="">{t("buybar.cityPlaceholder")}</option>
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
        <option value="">{t("buybar.cinemaPlaceholder")}</option>
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
        <option value="">{t("buybar.datePlaceholder")}</option>
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
        <option value="">{t("buybar.moviePlaceholder")}</option>
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
        {t("buybar.findTickets")}
      </Button>
    </div>
  );
};

export default TicketSelector;
