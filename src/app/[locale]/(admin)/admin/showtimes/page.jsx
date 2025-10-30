"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ShowtimesTable from "@/components/dashboard/showtimes/ShowtimesTable";
import { listShowtimes, deleteShowtime } from "@/action/showtimes-actions";

export default function ShowtimesListPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 100, total: 0 }); // daha geniş sayfa

  // filtreler
  const [cinemaId, setCinemaId] = useState("");
  const [hallId, setHallId] = useState("");
  const [movieId, setMovieId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const query = useMemo(
    () => ({
      page: pageInfo.page,
      size: pageInfo.size,
      sort: ["id,desc"],               // <-- yeni ek: en yeni üstte
      cinemaId: Number(cinemaId) || undefined,
      hallId: Number(hallId) || undefined,
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
        total: res.totalElements ?? res.content?.length ?? 0,
      }));
    });

  useEffect(() => {
    fetchData(); // ilk yükleme

    // create/update/delete sonrası otomatik yenile
    const onChanged = () => fetchData();
    window.addEventListener("showtimes:changed", onChanged);
    return () => window.removeEventListener("showtimes:changed", onChanged);
  }, []); // eslint-disable-line

  const onSearch = (e) => {
    e?.preventDefault();
    fetchData();
  };

  const onEdit = (row) => row?.id && router.push(`./showtimes/${row.id}`);

  const onDelete = async (row) => {
    if (!row?.id) return;
    const ok = window.confirm(`#${row.id} numaralı gösterim silinsin mi?`);
    if (!ok) return;
    try {
      await deleteShowtime(row.id);
      // delete içinde event tetikleniyor ama yine de güvence:
      fetchData();
    } catch (err) {
      alert(err?.message || "Silme sırasında hata oluştu.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Showtimes</h1>
        <button
          className="btn btn-primary"
          onClick={() => router.push("./showtimes/new")}
          disabled={isPending}
        >
          + New
        </button>
      </div>

      <form className="row g-2 align-items-end mb-3" onSubmit={onSearch}>
        <div className="col-12 col-md-2">
          <label className="form-label">Cinema Id</label>
          <input className="form-control" placeholder="örn: 1" value={cinemaId} onChange={(e) => setCinemaId(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Hall Id</label>
          <input className="form-control" placeholder="örn: 5" value={hallId} onChange={(e) => setHallId(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Movie Id</label>
          <input className="form-control" placeholder="örn: 9" value={movieId} onChange={(e) => setMovieId(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Başlangıç</label>
          <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <label className="form-label">Bitiş</label>
          <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="col-12 col-md-2">
          <button className="btn btn-primary w-100" disabled={isPending}>
            Ara
          </button>
        </div>
      </form>

      <ShowtimesTable rows={rows} loading={isPending} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
