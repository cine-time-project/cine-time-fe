"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "react-bootstrap";
import { useTranslations } from "next-intl";
import {
  searchCinemasByName,
  searchHallsByName,
  searchMoviesByTitle,
} from "@/action/showtimes-actions";

const AsyncSelect = dynamic(() => import("react-select/async"), { ssr: false });

// Bootstrap input yüksekliği ile hizalama
const selectStyles = {
  control: (b) => ({ ...b, minHeight: 38, height: 38 }),
  indicatorsContainer: (b) => ({ ...b, height: 38 }),
  valueContainer: (b) => ({
    ...b,
    height: 38,
    paddingTop: 4,
    paddingBottom: 4,
  }),
};

export default function ShowtimesSearchBar({
  initial = {},
  onSearch,
  onClear,
}) {
  const t = useTranslations("showtimes");
  const tCommon = useTranslations("common");

  const [form, setForm] = useState({
    cinemaId: initial.cinemaId ?? null,
    hallId: initial.hallId ?? null,
    movieId: initial.movieId ?? null,
    dateFrom: initial.dateFrom ?? "",
    dateTo: initial.dateTo ?? "",
  });

  const loadCinemas = (q) => searchCinemasByName(q);

  const loadHalls = (q) => {
    console.log("🔍 loadHalls çağrıldı:", form.cinemaId, q);
    return form.cinemaId
      ? searchHallsByName(form.cinemaId, q)
      : Promise.resolve([]);
  };

  const loadMovies = (q) => searchMoviesByTitle(q);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    onSearch?.({
      cinemaId: form.cinemaId ?? undefined,
      hallId: form.hallId ?? undefined,
      movieId: form.movieId ?? undefined,
      dateFrom: form.dateFrom || undefined,
      dateTo: form.dateTo || undefined,
    });
  };

  const handleClear = () => {
    setForm({
      cinemaId: null,
      hallId: null,
      movieId: null,
      dateFrom: "",
      dateTo: "",
    });
    onClear?.();
  };

  return (
    <form
      onSubmit={handleSearch}
      className="row g-2 align-items-end whiteLabels mb-3"
    >
      {/* Cinema */}
      <div className="col-12 col-xl-3 col-lg-3">
        <label className="form-label text-white">
          {t("filters.cinema", { default: "Cinema" })}
        </label>
        <AsyncSelect
          cacheOptions
          defaultOptions
          isClearable
          styles={selectStyles}
          loadOptions={loadCinemas}
          placeholder={t("placeholders.searchCinema", {
            default: "Search cinema…",
          })}
          onChange={(opt) =>
            setForm((v) => ({
              ...v,
              cinemaId: opt?.value ?? null,
              hallId: null,
            }))
          }
        />
      </div>

      {/* Hall (dependent) */}
      <div className="col-12 col-xl-2 col-lg-2">
        <label className="form-label text-white">
          {t("filters.hall", { default: "Hall" })}
        </label>
        <AsyncSelect
          key={form.cinemaId || "no-cinema"} // 🎯 ZORUNLU — cinema değişince bileşen resetlenir
          isDisabled={!form.cinemaId}
          cacheOptions
          defaultOptions={!!form.cinemaId} // cinema seçiliyse otomatik sorgu başlatır
          isClearable
          styles={selectStyles}
          loadOptions={(q) => {
            console.log("🔍 loadHalls çağrıldı:", form.cinemaId, q);
            return form.cinemaId
              ? searchHallsByName(form.cinemaId, q)
              : Promise.resolve([]);
          }}
          placeholder={
            form.cinemaId
              ? t("placeholders.searchHall", { default: "Search hall…" })
              : t("placeholders.selectCinemaFirst", {
                  default: "Select a cinema first",
                })
          }
          onChange={(opt) => {
            console.log("🎭 Hall seçildi:", opt);
            setForm((v) => ({ ...v, hallId: opt?.value ?? null }));
          }}
        />
      </div>

      {/* Movie */}
      <div className="col-12 col-xl-3 col-lg-3">
        <label className="form-label text-white">
          {t("filters.movie", { default: "Movie" })}
        </label>
        <AsyncSelect
          cacheOptions
          defaultOptions
          isClearable
          styles={selectStyles}
          loadOptions={loadMovies}
          placeholder={t("placeholders.searchMovie", {
            default: "Search movie…",
          })}
          onChange={(opt) =>
            setForm((v) => ({ ...v, movieId: opt?.value ?? null }))
          }
        />
      </div>

      {/* Date from */}
      <div className="col-6 col-xl-2 col-lg-2">
        <label className="form-label text-white">
          {t("filters.dateFrom", { default: "Start date" })}
        </label>
        <input
          type="date"
          className="form-control"
          value={form.dateFrom}
          onChange={(e) => setForm((v) => ({ ...v, dateFrom: e.target.value }))}
        />
      </div>

      {/* Date to */}
      <div className="col-6 col-xl-2 col-lg-2">
        <label className="form-label text-white">
          {t("filters.dateTo", { default: "End date" })}
        </label>
        <input
          type="date"
          className="form-control"
          value={form.dateTo}
          onChange={(e) => setForm((v) => ({ ...v, dateTo: e.target.value }))}
        />
      </div>

      {/* Actions */}
      <div className="col-12 col-xl-auto d-flex gap-2 ms-xl-auto justify-content-end">
        <Button type="submit" className="btn btn-primary">
          <i className="pi pi-search me-2" />
          {tCommon("search", { default: "Search" })}
        </Button>
        <Button type="button" variant="outline-light" onClick={handleClear}>
          {tCommon("clear", { default: "Clear" })}
        </Button>
      </div>
    </form>
  );
}
