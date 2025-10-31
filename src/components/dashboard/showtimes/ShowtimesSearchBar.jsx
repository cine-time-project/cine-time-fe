"use client";
import { useState, useMemo } from "react";
import AsyncSelect from "react-select/async";
import { Button } from "react-bootstrap";
import {
  searchCinemasByName,
  searchHallsByName,
  searchMoviesByTitle,
} from "@/action/showtimes-actions";

export default function ShowtimesSearchBar({ initial = {}, onSearch }) {
  const [form, setForm] = useState({
    cinemaId: initial.cinemaId ?? null,
    hallId: initial.hallId ?? null,
    movieId: initial.movieId ?? null,
  });

  const loadCinemas = (input) => searchCinemasByName(input);
  const loadHalls   = (input) => form.cinemaId ? searchHallsByName(form.cinemaId, input) : Promise.resolve([]);
  const loadMovies  = (input) => searchMoviesByTitle(input);

  const handleSearch = () => {
    onSearch?.({
      cinemaId: form.cinemaId ?? undefined,
      hallId: form.hallId ?? undefined,
      movieId: form.movieId ?? undefined,
    });
  };

  return (
    <div className="d-grid d-lg-flex gap-2 align-items-center">
      {/* Cinema */}
      <div style={{ minWidth: 260 }}>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadCinemas}
          placeholder="Cinema adıyla ara…"
          onChange={(opt) =>
            setForm((v) => ({ ...v, cinemaId: opt?.value ?? null, hallId: null }))
          }
        />
      </div>

      {/* Hall (dependent) */}
      <div style={{ minWidth: 240 }}>
        <AsyncSelect
          isDisabled={!form.cinemaId}
          cacheOptions
          defaultOptions={false}
          loadOptions={loadHalls}
          placeholder={form.cinemaId ? "Salon adı…" : "Önce Cinema seç"}
          onChange={(opt) => setForm((v) => ({ ...v, hallId: opt?.value ?? null }))}
        />
      </div>

      {/* Movie */}
      <div style={{ minWidth: 260 }}>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadMovies}
          placeholder="Film adıyla ara…"
          onChange={(opt) => setForm((v) => ({ ...v, movieId: opt?.value ?? null }))}
        />
      </div>

      {/* Search */}
      <Button onClick={handleSearch} className="ms-lg-2">
        Search
      </Button>
    </div>
  );
}
