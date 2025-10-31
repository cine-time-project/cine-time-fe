"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createShowtime,
  updateShowtime,
  listHalls,
  listMoviesAdmin,
  listShowtimes, // overlap için
} from "@/action/showtimes-actions";
import { BackButton } from "@/components/common/form-fields/BackButton";
import SubmitButton from "@/components/common/FormControls/SubmitButton";

/* --------------------- yardımcılar --------------------- */
const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RX = /^\d{2}:\d{2}(:\d{2})?$/;

const pad2 = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const toISODate = (v) => {
  if (!v) return "";
  if (DATE_RX.test(v)) return v;
  const d = new Date(v);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const asArray = (x) => (Array.isArray(x) ? x : []);

// saat -> saniye
const toSec = (t = "") => {
  const [h = "0", m = "0", s = "0"] = String(t).split(":");
  return (+h) * 3600 + (+m) * 60 + (+s || 0);
};
const nowHHMM = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
// [aStart, aEnd] ile [bStart, bEnd] çakışır mı?
const overlaps = (aStart, aEnd, bStart, bEnd) =>
  toSec(aStart) < toSec(bEnd) && toSec(aEnd) > toSec(bStart);

// Aynı gün + aynı salon kayıtlarını çekip saat çakışması var mı kontrol et
async function checkOverlapFE({ date, startTime, endTime, hallId }, currentId = null) {
  if (!date || !hallId) return false;
  const res = await listShowtimes({
    page: 0,
    size: 500,
    hallId: Number(hallId),
    dateFrom: date,
    dateTo: date, // gün-dahil
  });
  const rows = Array.isArray(res?.content) ? res.content : [];
  const others = rows.filter((r) => !currentId || Number(r.id) !== Number(currentId));
  return others.some((r) => overlaps(startTime, endTime, r.startTime, r.endTime));
}

/* --------------------- bileşen --------------------- */
export default function ShowtimesForm({ mode = "create", initial = null, onSaved }) {
  const [halls, setHalls] = useState([]);
  const [movies, setMovies] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const TODAY = useMemo(() => todayISO(), []);
  const [form, setForm] = useState(() => ({
    date: toISODate(initial?.date) || TODAY, // boşsa bugünle başlat
    startTime: initial?.startTime || "",
    endTime: initial?.endTime || "",
    hallId: initial?.hallId || "",
    movieId: initial?.movieId || "",
  }));

  useEffect(() => {
    setForm((s) => ({
      ...s,
      date: toISODate(initial?.date) || s.date || TODAY,
      startTime: initial?.startTime || s.startTime,
      endTime: initial?.endTime || s.endTime,
      hallId: initial?.hallId || s.hallId,
      movieId: initial?.movieId || s.movieId,
    }));
  }, [initial, TODAY]);

  useEffect(() => {
    (async () => {
      try {
        const [hs, ms] = await Promise.all([listHalls(), listMoviesAdmin()]);
        setHalls(asArray(hs));
        setMovies(asArray(ms));
      } catch (e) {
        console.error("Listeler yüklenemedi:", e?.response?.data || e?.message);
        setErr("Salon/Film listeleri yüklenemedi.");
      }
    })();
  }, []);

  const onChange = (e) => {
    setErr("");
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const msgs = [];

    // tarih format ve geçmiş tarih kontrolü
    if (!DATE_RX.test(form.date || "")) {
      msgs.push("Tarih formatı YYYY-MM-DD olmalı.");
    } else if (form.date < TODAY) {
      msgs.push("Geçmiş tarih seçilemez.");
    }

    // saat formatları
    if (!TIME_RX.test(form.startTime || "")) msgs.push("Başlangıç HH:mm olmalı.");
    if (!TIME_RX.test(form.endTime || "")) msgs.push("Bitiş HH:mm olmalı.");

    // bugün ise başlangıç saati >= şimdi olmalı (en basit kural)
    if (form.date === TODAY && TIME_RX.test(form.startTime)) {
      if (toSec(form.startTime) < toSec(nowHHMM())) {
        msgs.push("Bugün için başlangıç saati geçmiş olamaz.");
      }
    }

    // bitiş > başlangıç
    if (TIME_RX.test(form.startTime) && TIME_RX.test(form.endTime)) {
      if (toSec(form.endTime) <= toSec(form.startTime))
        msgs.push("Bitiş saati başlangıçtan büyük olmalı.");
    }

    // zorunlular
    if (!form.hallId) msgs.push("Salon seçiniz.");
    if (!form.movieId) msgs.push("Film seçiniz.");

    return msgs;
  };

  const canSubmit = useMemo(
    () =>
      form.date && form.startTime && form.endTime && form.hallId && form.movieId && !busy,
    [form, busy]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v.length) {
      setErr(v.join("\n"));
      return;
    }

    setBusy(true);
    try {
      // FE overlap kontrolü (aynı gün + aynı salon + saat aralığı)
      const conflict = await checkOverlapFE(
        {
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          hallId: Number(form.hallId),
        },
        mode === "edit" ? initial?.id : null
      );

      if (conflict) {
        const hall = halls.find((x) => Number(x.id) === Number(form.hallId));
        const hallLabel = hall?.cinemaName
          ? `${hall.cinemaName} — ${hall.name}`
          : hall?.name || "Seçili salon";
        setErr(
          `Aynı salonda (${hallLabel}) bu zaman aralığı başka bir gösterimle çakışıyor.`
        );
        setBusy(false);
        return;
      }

      const payload = {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        hallId: Number(form.hallId),
        movieId: Number(form.movieId),
      };

      if (mode === "edit" && initial?.id) {
        await updateShowtime(initial.id, payload);
      } else {
        await createShowtime(payload);
      }
      onSaved?.();
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
         <label className="form-label text-white">Tarih</label>
          {/* Tarih */}
<input
  type="date"
  className="form-control"
  name="date"
  value={form.date}
  onChange={onChange}
  min={TODAY}                 // sadece geçmiş günleri kapat
/>
        </div>
        <div className="col-md-4">
          <label className="form-label text-white">Başlangıç (HH:mm)</label>
         <input
  type="time"
  step="60"
  className="form-control"
  name="startTime"
  value={form.startTime}
  onChange={onChange}
  min={form.date === TODAY ? nowHHMM() : undefined}   // bugünse 'şimdiden küçük' olamaz
/>
        </div>
        <div className="col-md-4">
          <label className="form-label text-white">Bitiş (HH:mm)</label>
         {/* Bitiş (HH:mm) */}
<input
  type="time"
  step="60"
  className="form-control"
  name="endTime"
  value={form.endTime}
  onChange={onChange}
  min={
    form.startTime
      ? form.startTime                                 // bitiş >= başlangıç
      : form.date === TODAY
        ? nowHHMM()
        : undefined
  }
/>
        </div>

        <div className="col-md-6">
          <label className="form-label text-white">Salon</label>
          <select
            className="form-select"
            name="hallId"
            value={form.hallId}
            onChange={onChange}
          >
            <option value="">Seçiniz…</option>
            {halls.map((h) => (
              <option key={h.id} value={h.id}>
                {h.cinemaName ? `${h.cinemaName} — ${h.name}` : h.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label text-white">Film</label>
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
        <BackButton></BackButton>
        <SubmitButton disabled={!canSubmit}>
          {busy ? "Kaydediliyor…" : mode === "edit" ? "Güncelle" : "Oluştur"}</SubmitButton>
       
      </div>
    </form>
  );
}
