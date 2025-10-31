"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ShowtimesTable from "@/components/dashboard/showtimes/ShowtimesTable";
import { listShowtimes, deleteShowtime } from "@/action/showtimes-actions";
import SectionTitle from "@/components/common/SectionTitle";

/* Küçük yardımcı: rolleri cookie+LS'ten oku */
function getMyRoles() {
  try {
    const m = document.cookie.match(/(?:^|;\s*)authRoles=([^;]+)/);
    const fromCookie = m ? decodeURIComponent(m[1]).split(/[\s,]+/) : [];
    const fromLS = JSON.parse(localStorage.getItem("authUser") || "{}");
    const arr = [...fromCookie, ...(fromLS.roles || fromLS.authorities || [])];
    return new Set(arr.map((r) => String(r.name ?? r).replace(/^ROLE_/, "").toUpperCase()));
  } catch {
    return new Set();
  }
}

export default function ShowtimesListPage() {
  const router = useRouter();
  const locale = useLocale();

  const roles = getMyRoles();
  const isAdmin = roles.has("ADMIN");

  const [rows, setRows] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 60, total: 0 });

  // Filtreler
  const [cinemaId, setCinemaId] = useState("");
  const [hallId, setHallId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  // Liste çek
  const fetchData = (q = query) =>
    startTransition(async () => {
      const res = await listShowtimes(q);
      setRows(res.content || []);
      setPageInfo((p) => ({ ...p, total: res.totalElements ?? (res.content?.length || 0) }));
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
    fetchData(query);
  };

  const onEdit = (row) => {
    if (!row?.id) return;
    router.push(`/${locale}/admin/showtimes/${row.id}`);
  };

  const onDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(`#${row.id} numaralı gösterim silinsin mi?`);
    if (!ok) return;
    try {
      await deleteShowtime(row.id);
      fetchData(query);
    } catch (err) {
      alert(err?.message || "Silme sırasında hata oluştu.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <SectionTitle align="center" textColor="text-light">
          Showtimes
        </SectionTitle>

        {/* + New sadece ADMIN'e görünür */}
        {isAdmin && (
          <button
            className="btn btn-warning"
            onClick={() => router.push(`/${locale}/admin/showtimes/new`)}
            disabled={isPending}
          >
            + New
          </button>
        )}
      </div>

      <form className={`row g-2 align-items-end mb-3 whiteLabels`} onSubmit={onSearch}>
        <div className="col-12 col-md-2">
          <label className="form-label text-white">Cinema Id</label>
          <input
            className="form-control"
            placeholder="örn: 1"
            value={cinemaId}
            onChange={(e) => setCinemaId(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label text-white">Hall Id</label>
          <input
            className="form-control"
            placeholder="örn: 5"
            value={hallId}
            onChange={(e) => setHallId(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label text-white">Movie Id</label>
          <input
            className="form-control"
            placeholder="örn: 9"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label text-white">Başlangıç</label>
          <input
            type="date"
            className="form-control"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label text-white">Bitiş</label>
          <input
            type="date"
            className="form-control"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-2">
          <button className="btn btn-primary w-100" disabled={isPending}>
            <i className="pi pi-search me-2" />
            Search
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
