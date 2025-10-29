"use client";
import { useEffect, useMemo, useState } from "react";
import { createShowtime, updateShowtime, listHalls, listMoviesAdmin } from "@/action/showtimes-actions";

const asArray = (d) => (Array.isArray(d) ? d : []);

function pad2(n) { return String(n).padStart(2, "0"); }
function toISODateValue(v) {
  // Date/LocalDate string bekleniyor -> "YYYY-MM-DD"
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const dt = new Date(v);
  if (isNaN(dt)) return "";
  return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
}

export default function ShowtimesForm({ mode = "create", initial = null, onSaved }) {
  const [halls, setHalls] = useState([]);
  const [movies, setMovies] = useState([]);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState(() => ({
    date: toISODateValue(initial?.date) || "",
    startTime: initial?.startTime || "",
    endTime: initial?.endTime || "",
    hallId: initial?.hallId || initial?.hall?.id || "",
    movieId: initial?.movieId || initial?.movie?.id || "",
  }));

  useEffect(() => {
    (async () => {
      try {
        const [hs, ms] = await Promise.all([listHalls(), listMoviesAdmin()]);
        setHalls(asArray(hs));
        setMovies(asArray(ms));
      } catch (e) {
        console.error("Listeler yüklenemedi:", e?.response?.data || e.message);
        alert("Salon/Film listeleri yüklenemedi.");
        setHalls([]);
        setMovies([]);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const canSubmit = useMemo(() => {
    return form.date && form.startTime && form.endTime && form.hallId && form.movieId && !busy;
  }, [form, busy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    try {
      const payload = {
        date: form.date,           // "YYYY-MM-DD"
        startTime: form.startTime, // "HH:mm:ss" ya da "HH:mm"
        endTime: form.endTime,     // "HH:mm:ss" ya da "HH:mm"
        hallId: Number(form.hallId),
        movieId: Number(form.movieId),
      };
      let saved;
      if (mode === "edit" && initial?.id) {
        saved = await updateShowtime(initial.id, payload);
      } else {
        saved = await createShowtime(payload);
      }
      if (onSaved) onSaved(saved);
    } catch (err) {
      console.error("Kaydetme hatası:", err?.response?.data || err.message);
      alert("Kayıt sırasında hata oluştu.");
    } finally {
      setBusy(false);
    }
  };

  
  return (
    <form onSubmit={handleSubmit} className="vstack gap-3">
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Tarih</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={form.date}
            onChange={onChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Başlangıç (HH:mm)</label>
          <input
            type="time"
            step="60"
            className="form-control"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Bitiş (HH:mm)</label>
          <input
            type="time"
            step="60"
            className="form-control"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Salon</label>
          <select
            className="form-select"
            name="hallId"
            value={form.hallId}
            onChange={onChange}
          >
            <option value="">Seçiniz…</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Film</label>
          <select
            className="form-select"
            name="movieId"
            value={form.movieId}
            onChange={onChange}
          >
            <option value="">Seçiniz…</option>
            {movies.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end pt-2">
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          {busy ? "Kaydediliyor…" : (mode === "edit" ? "Güncelle" : "Oluştur")}
        </button>
      </div>
    </form>
  );
}
