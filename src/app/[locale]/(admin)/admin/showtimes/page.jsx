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

  // --- HYDRATION-FRIENDLY ADMIN CHECK ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const m = document.cookie.match(/(?:^|;\s*)authRoles=([^;]+)/);
      const fromCookie = m ? decodeURIComponent(m[1]).split(/[\s,]+/) : [];
      const fromLS = JSON.parse(localStorage.getItem("authUser") || "{}");
      const arr = [...fromCookie, ...(fromLS.roles || fromLS.authorities || [])];
      const roles = new Set(arr.map((r) => String(r.name ?? r).replace(/^ROLE_/, "").toUpperCase()));
      setIsAdmin(roles.has("ADMIN"));
    } catch {
      /* ignore */
    }
  }, []);

  // --- STATE ---
  const [rows, setRows] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 20, total: 0, totalPages: 1 });

  // Filtreler
  const [cinemaId, setCinemaId] = useState("");
  const [hallId, setHallId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [version, setVersion] = useState(0); // select’leri remount etmek için

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

  // Data fetch
  const fetchData = (q = query) =>
    startTransition(async () => {
      const res = await listShowtimes(q);
      setRows(res.content || []);
      setPageInfo((p) => ({
        ...p,
        total: res.totalElements ?? (res.content?.length || 0),
        totalPages: res.totalPages ?? 1,
      }));
    });

  useEffect(() => {
    fetchData(query);
    const h = () => fetchData(query);
    window.addEventListener("showtimes:changed", h);
    return () => window.removeEventListener("showtimes:changed", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e?.preventDefault();
    setPageInfo((p) => ({ ...p, page: 0 }));
    fetchData({ ...query, page: 0, size: pageInfo.size });
  };

  const clearFilters = () => {
    setCinemaId("");
    setHallId("");
    setMovieId("");
    setDateFrom("");
    setDateTo("");
    setVersion((v) => v + 1);
    setPageInfo((p) => ({ ...p, page: 0 }));
    fetchData({ page: 0, size: pageInfo.size });
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

  // ---------- Pagination helpers ----------
  const pageNumbers = useMemo(() => {
    const total = pageInfo.totalPages || 1;
    const cur = pageInfo.page || 0;
    const span = 5;
    let start = Math.max(0, cur - Math.floor(span / 2));
    let end = Math.min(total - 1, start + span - 1);
    start = Math.max(0, end - (span - 1));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [pageInfo.page, pageInfo.totalPages]);

  function goPage(p) {
    if (p < 0 || p >= (pageInfo.totalPages || 1)) return;
    setPageInfo((prev) => ({ ...prev, page: p }));
    fetchData({ ...query, page: p, size: pageInfo.size });
  }

  function changeSize(sz) {
    const size = Number(sz) || 20;
    setPageInfo((prev) => ({ ...prev, page: 0, size }));
    fetchData({ ...query, page: 0, size });
  }

  // react-select yüksekliklerini Bootstrap input ile eşitle
  const selectStyles = {
    control: (b) => ({ ...b, minHeight: 38, height: 38 }),
    indicatorsContainer: (b) => ({ ...b, height: 38 }),
    valueContainer: (b) => ({ ...b, height: 38, paddingTop: 4, paddingBottom: 4 }),
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

      {/* FİLTRE BAR – isimle seçim, ID göndeririz */}
    <form className="row g-2 align-items-end mb-3 whiteLabels" onSubmit={onSearch}>
  {/* Cinema – 3 */}
  <div className="col-12 col-xl-3 col-lg-3">
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

  {/* Hall – 2 */}
  <div className="col-12 col-xl-2 col-lg-2">
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
      loadOptions={(q) => (cinemaId ? searchHallsByName(cinemaId, q) : Promise.resolve([]))}
      placeholder={cinemaId ? "Salon adıyla ara…" : "Önce Cinema seç"}
      onChange={(opt) => setHallId(opt?.value ? String(opt.value) : "")}
    />
  </div>

  {/* Movie – 3 */}
  <div className="col-12 col-xl-3 col-lg-3">
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

  {/* Başlangıç – 2 */}
  <div className="col-6 col-xl-2 col-lg-2">
    <label className="form-label text-white">Başlangıç</label>
    <input
      type="date"
      className="form-control"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
    />
  </div>

  {/* Bitiş – 2 */}
  <div className="col-6 col-xl-2 col-lg-2">
    <label className="form-label text-white">Bitiş</label>
    <input
      type="date"
      className="form-control"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
    />
  </div>

 <div className="col-12 col-xl-auto d-flex gap-2 ms-xl-auto justify-content-end">
  <button className="btn btn-primary" disabled={isPending}>
    <i className="pi pi-search me-2" />
    Search
  </button>
  <button type="button" className="btn btn-outline-light" onClick={clearFilters}>
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

      {/* Pagination */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="text-white-50 small">
          Page <strong>{pageInfo.page + 1}</strong> / {pageInfo.totalPages || 1}
          {" · "}
          Total: <strong>{pageInfo.total}</strong>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-white-50 small">Rows:</div>
          <select
            className="form-select form-select-sm"
            style={{ width: 90 }}
            value={pageInfo.size}
            onChange={(e) => changeSize(e.target.value)}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pageInfo.page === 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goPage(0)} aria-label="First">
                  «
                </button>
              </li>
              <li className={`page-item ${pageInfo.page === 0 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goPage(pageInfo.page - 1)} aria-label="Prev">
                  ‹
                </button>
              </li>

              {pageNumbers.map((n) => (
                <li key={n} className={`page-item ${n === pageInfo.page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => goPage(n)}>
                    {n + 1}
                  </button>
                </li>
              ))}

              <li
                className={`page-item ${
                  pageInfo.page >= (pageInfo.totalPages - 1 || 0) ? "disabled" : ""
                }`}
              >
                <button className="page-link" onClick={() => goPage(pageInfo.page + 1)} aria-label="Next">
                  ›
                </button>
              </li>
              <li
                className={`page-item ${
                  pageInfo.page >= (pageInfo.totalPages - 1 || 0) ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => goPage((pageInfo.totalPages || 1) - 1)}
                  aria-label="Last"
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
