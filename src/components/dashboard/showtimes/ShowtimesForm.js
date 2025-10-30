"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createShowtime,
  updateShowtime,
  listHalls,
  listMoviesAdmin,
} from "@/action/showtimes-actions";

/* ---------- helpers ---------- */
const asArray = (d) => (Array.isArray(d) ? d : []);
const pad2 = (n) => String(n).padStart(2, "0");
const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RX = /^\d{2}:\d{2}(:\d{2})?$/;

const localTodayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // yerel güne sabitle
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const toISODateValue = (v) => {
  if (!v) return "";
  if (DATE_RX.test(v)) return v;
  const dt = new Date(v);
  if (isNaN(dt)) return "";
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
};

const toSec = (t = "") => {
  const [h = "0", m = "0", s = "0"] = String(t).split(":");
  return (+h) * 3600 + (+m) * 60 + (+s || 0);
};

/**
 * Props:
 *  - mode: "create" | "edit"
 *  - initial: { id?, date, startTime, endTime, hallId, movieId }
 *  - onSaved?: () => void            // başarılı kayıttan sonra tetiklenir
 *  - backHref?: string               // onSaved yoksa buraya yönlendirir (default: "../")
 */
export default function ShowtimesForm({
  mode = "create",
  initial = null,
  onSaved,
  backHref = "../",
}) {
  const [halls, setHalls] = useState([]);
  const [movies, setMovies] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [todayISO] = useState(localTodayISO());

  const [form, setForm] = useState(() => ({
    date: toISODateValue(initial?.date) || "",
    startTime: initial?.startTime || "",
    endTime: initial?.endTime || "",
    hallId: initial?.hallId || "",
    movieId: initial?.movieId || "",
  }));

  /* initial değişince formu güncelle */
  useEffect(() => {
    setForm({
      date: toISODateValue(initial?.date) || "",
      startTime: initial?.startTime || "",
      endTime: initial?.endTime || "",
      hallId: initial?.hallId || "",
      movieId: initial?.movieId || "",
    });
  }, [initial]);

  /* select listeleri */
  useEffect(() => {
    (async () => {
      try {
        const [hs, ms] = await Promise.all([listHalls(), listMoviesAdmin()]);
        setHalls(asArray(hs));
        setMovies(asArray(ms));
      } catch (e) {
        console.error("Listeler yüklenemedi:", e?.response?.data || e?.message);
        setErr("Salon/Film listeleri yüklenemedi.");
        setHalls([]);
        setMovies([]);
      }
    })();
  }, []);

  const onChange = (e) => {
    setErr("");
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  /* FE doğrulama */
  const validate = () => {
    const msgs = [];
    if (!DATE_RX.test(form.date || "")) msgs.push("Tarih formatı YYYY-MM-DD olmalı.");
    if (!TIME_RX.test(form.startTime || "")) msgs.push("Başlangıç HH:mm olmalı.");
    if (!TIME_RX.test(form.endTime || "")) msgs.push("Bitiş HH:mm olmalı.");
    if (!form.hallId) msgs.push("Salon seçiniz.");
    if (!form.movieId) msgs.push("Film seçiniz.");
    if (DATE_RX.test(form.date || "") && form.date < todayISO) {
      msgs.push("Tarih bugün veya sonrası olmalı.");
    }
    if (TIME_RX.test(form.startTime) && TIME_RX.test(form.endTime)) {
      if (toSec(form.endTime) <= toSec(form.startTime)) {
        msgs.push("Bitiş saati başlangıçtan büyük olmalı.");
      }
    }
    return msgs;
  };

  const canSubmit = useMemo(
    () =>
      form.date &&
      form.startTime &&
      form.endTime &&
      form.hallId &&
      form.movieId &&
      !busy,
    [form, busy]
  );

  const doRedirect = () => {
    if (typeof onSaved === "function") {
      onSaved();
    } else if (typeof window !== "undefined") {
      // Sayfa içinde kullanılıyorsa ebeveyne dön
      window.location.assign(backHref || "../");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v.length) {
      setErr(v.join("\n"));
      return;
    }

    setBusy(true);
    try {
      const payload = {
        date: form.date,
        startTime: form.startTime, // action HH:mm:ss’e çevirecek
        endTime: form.endTime,
        hallId: Number(form.hallId),
        movieId: Number(form.movieId),
      };

      if (mode === "edit" && initial?.id) {
        await updateShowtime(initial.id, payload);
      } else {
        await createShowtime(payload);
      }

      doRedirect(); // ✅ başarılıysa listeye dön
    } catch (error) {
      setErr(error?.message || "Kayıt sırasında hata oluştu.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vstack gap-3">
      {!!err && (
        <div className="alert alert-warning" style={{ whiteSpace: "pre-line" }}>
          {err}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Tarih</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={form.date}
            onChange={onChange}
            min={todayISO}                 /* geçmiş tarih kapalı */
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
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
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
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-end pt-2">
        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          {busy ? "Kaydediliyor…" : mode === "edit" ? "Güncelle" : "Oluştur"}
        </button>
      </div>
    </form>
  );
}
