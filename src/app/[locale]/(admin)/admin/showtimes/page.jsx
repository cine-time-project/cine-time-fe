"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ShowtimesTable from "@/components/dashboard/showtimes/ShowtimesTable";
import { listShowtimes, deleteShowtime } from "@/action/showtimes-actions";

export default function ShowtimesListPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, startTransition] = useTransition();
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 50, total: 0 });

  // ---- Filtre state’leri ----
  const [cinemaId, setCinemaId] = useState("");
  const [hallId, setHallId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const query = useMemo(
    () => ({
      page: pageInfo.page,
      size: pageInfo.size,
      cinemaId: Number(cinemaId) || undefined,
      hallId: Number(hallId) || undefined,     // BE şu an hallId’i dikkate almıyorsa uçmayacak
      movieId: Number(movieId) || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [cinemaId, hallId, movieId, dateFrom, dateTo, pageInfo.page, pageInfo.size]
  );

  const fetchData = () =>
    startTransition(async () => {
      const res = await listShowtimes(query);
      setRows(res.content || []);
      setPageInfo((p) => ({
        ...p,
        total: res.totalElements ?? (res.content?.length || 0),
      }));
    });

  useEffect(() => { fetchData(); /* sayfa ilk açılış */ }, []);

  const onSearch = (e) => {
    e?.preventDefault();
    fetchData();
  };

  const onEdit = (row) => {
    if (!row?.id) return;
    router.push(`./showtimes/${row.id}`);
  };

  const onDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(`#${row.id} numaralı gösterim silinsin mi?`);
    if (!ok) return;
    await deleteShowtime(row.id);
    fetchData();
  };

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Showtimes</h1>

        <button
    type="button"
    className="btn btn-primary"
    onClick={() => router.push("./showtimes/new")}
    disabled={loading}
  >
    + New
  </button>

      {/* --- Filtre formu --- */}
      <form className="row g-2 align-items-end mb-3" onSubmit={onSearch}>
        <div className="col-12 col-md-2">
          <label className="form-label">Cinema Id</label>
          <input className="form-control" placeholder="örn: 1"
                 value={cinemaId} onChange={(e)=>setCinemaId(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Hall Id</label>
          <input className="form-control" placeholder="örn: 5"
                 value={hallId} onChange={(e)=>setHallId(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Movie Id</label>
          <input className="form-control" placeholder="örn: 9"
                 value={movieId} onChange={(e)=>setMovieId(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Başlangıç</label>
          <input type="date" className="form-control"
                 value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Bitiş</label>
          <input type="date" className="form-control"
                 value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <button className="btn btn-primary w-100" disabled={loading}>Ara</button>
        </div>
      </form>

      <ShowtimesTable
        rows={rows}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
