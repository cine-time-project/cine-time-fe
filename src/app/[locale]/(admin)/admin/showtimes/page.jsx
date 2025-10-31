"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
const AsyncSelect = dynamic(() => import("react-select/async"), { ssr: false });

import ShowtimesTable from "@/components/dashboard/showtimes/ShowtimesTable";
import {
  listShowtimes,
  deleteShowtime,
  searchCinemasByName,
  searchHallsByName,
  searchMoviesByTitle,
} from "@/action/showtimes-actions";
import SectionTitle from "@/components/common/SectionTitle";

export default function ShowtimesListPage() {
  const router = useRouter();
  const locale = useLocale();

  // --- Admin check (hydration-safe)
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const m = document.cookie.match(/(?:^|;\s*)authRoles=([^;]+)/);
      const fromCookie = m ? decodeURIComponent(m[1]).split(/[\s,]+/) : [];
      const fromLS = JSON.parse(localStorage.getItem("authUser") || "{}");
      const arr = [...fromCookie, ...(fromLS.roles || fromLS.authorities || [])];
      const roles = new Set(
        arr.map((r) => String(r.name ?? r).replace(/^ROLE_/, "").toUpperCase())
      );
      setIsAdmin(roles.has("ADMIN"));
    } catch {}
  }, []);

  // --- State
  const [rows, setRows] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 60, total: 0 });

  // Filters
  const [cinemaId, setCinemaId] = useState("");
  const [hallId, setHallId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [version, setVersion] = useState(0);

  // react-select yüksekliğini Bootstrap input ile eşitle
  const selectStyles = {
    control: (b) => ({ ...b, minHeight: 38, height: 38 }),
    indicatorsContainer: (b) => ({ ...b, height: 38 }),
    valueContainer: (b) => ({ ...b, height: 38, paddingTop: 4, paddingBottom: 4 }),
  };

  // Query
  const query = useMemo(
    () => ({
      page: pageInfo.page,
      size: pageInfo.size,
      cinemaId: Number(cinemaId) || undefined,
      hallId: Number(hallId) || undefined,
      movieId: Number(movieId) || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [cinemaId, hallId, movieId, dateFrom, dateTo, pageInfo.page, pageInfo.size]
  );

  // Fetch
  const fetchData = (q = query) =>
    startTransition(async () => {
      const res = await listShowtimes(q);
      setRows(res.content || []);
      setPageInfo((p) => ({
        ...p,
        total: res.totalElements ?? (res.content?.length || 0),
      }));
    });

  useEffect(() => {
    fetchData(query);
    const h = () => fetchData(query);
    window.addEventListener("showtimes:changed", h);
    return () => window.removeEventListener("showtimes:changed", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const onSearch = (e) => {
    e?.preventDefault();
    fetchData(query);
  };

  const clearFilters = () => {
    setCinemaId("");
    setHallId("");
    setMovieId("");
    setDateFrom("");
    setDateTo("");
    setVersion((v) => v + 1);
    fetchData({ page: pageInfo.page, size: pageInfo.size });
  };

  const onEdit = (row) => {
    if (!row?.id) return;
    router.push(`/${locale}/admin/showtimes/${row.id}`);
  };

  const onDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(`#${row.id} numaralı gösterim silinsin mi?`);
    if (!ok) return;
    const res = await deleteShowtime(row.id);
    if (!res.ok) {
      alert(res.message || "Silme sırasında hata oluştu.");
      return;
    }
    fetchData(query);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <SectionTitle align="center" textColor="text-light">
          Showtimes
        </SectionTitle>

        {mounted && isAdmin && (
          <button
            className="btn btn-warning"
            onClick={() => router.push(`/${locale}/admin/showtimes/new`)}
            disabled={isPending}
          >
            + New
          </button>
        )}
      </div>

      {/* Filter bar – aynı satırda: 3 + 2 + 3 + 2 + 2 + auto */}
      <form className="row g-2 align-items-end mb-3 whiteLabels" onSubmit={onSearch}>
        {/* Cinema (3) */}
        <div className="col-12 col-md-6 col-xl-3">
          <label className="form-label text-white">Cinema</label>
          <AsyncSelect
            key={`cinema-${version}`}
            instanceId="cinema-select"
            inputId="cinema-select-input"
            cacheOptions
            defaultOptions
            isClearable
            styles={selectStyles}
            loadOptions={(q) => searchCinemasByName(q)}
            placeholder="Cinema adıyla ara…"
            onChange={(opt) => {
              setCinemaId(opt?.value ? String(opt.value) : "");
              setHallId("");
            }}
          />
        </div>

        {/* Hall (2) */}
        <div className="col-12 col-md-6 col-xl-2">
          <label className="form-label text-white">Hall</label>
          <AsyncSelect
            key={`hall-${version}-${cinemaId || "no"}`}
            instanceId="hall-select"
            inputId="hall-select-input"
            isDisabled={!cinemaId}
            cacheOptions
            defaultOptions
            isClearable
            styles={selectStyles}
            loadOptions={(q) =>
              cinemaId ? searchHallsByName(cinemaId, q) : Promise.resolve([])
            }
            placeholder={cinemaId ? "Salon adıyla ara…" : "Önce Cinema seç"}
            onChange={(opt) => setHallId(opt?.value ? String(opt.value) : "")}
          />
        </div>

        {/* Movie (3) */}
        <div className="col-12 col-md-6 col-xl-3">
          <label className="form-label text-white">Movie</label>
          <AsyncSelect
            key={`movie-${version}`}
            instanceId="movie-select"
            inputId="movie-select-input"
            cacheOptions
            defaultOptions
            isClearable
            styles={selectStyles}
            loadOptions={(q) => searchMoviesByTitle(q)}
            placeholder="Film adıyla ara…"
            onChange={(opt) => setMovieId(opt?.value ? String(opt.value) : "")}
          />
        </div>

        {/* Başlangıç (2) */}
        <div className="col-6 col-md-3 col-xl-2">
          <label className="form-label text-white">Başlangıç</label>
          <input
            type="date"
            className="form-control"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        {/* Bitiş (2) */}
        <div className="col-6 col-md-3 col-xl-2">
          <label className="form-label text-white">Bitiş</label>
          <input
            type="date"
            className="form-control"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Buttons – sağa */}
        <div className="col-12 col-xl-auto d-flex gap-2 ms-xl-auto">
          <button className="btn btn-primary px-3" disabled={isPending}>
            <i className="pi pi-search me-2" /> Search
          </button>
          <button
            type="button"
            className="btn btn-outline-light px-3"
            onClick={clearFilters}
          >
            Temizle
          </button>
        </div>
      </form>

      <ShowtimesTable
        rows={rows}
        loading={isPending}
        onEdit={onEdit}
        onDelete={onDelete}
        canEdit={isAdmin}
        canDelete={isAdmin}
      />
    </div>
  );
}
