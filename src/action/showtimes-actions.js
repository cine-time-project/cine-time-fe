// src/action/showtimes-actions.js
"use client";

import { http } from "@/lib/utils/http";
import {
  // Showtimes
  SHOWTIMES_LIST_API,
  SHOWTIME_CREATE_API,
  showTimeByIdApi,
  showTimesByCinemaIdApi,
  showTimesByMovieIdApi,
  // Halls
  HALL_LIST_API,
  // Movies
  MOVIES_ADMIN_LIST_API,
  MOVIE_SEARCH_API,
  // Cinemas (halls fallback için)
  CINEMA_LIST_API,
  cinemaHallsApi,
} from "@/helpers/api-routes";

/* ======================= Helpers ======================= */
const unwrap = (r) => r?.data?.returnBody ?? r?.data ?? null;

const toHHMMSS = (t = "") => {
  const [hh = "00", mm = "00", ss = "00"] = String(t).split(":");
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(
    ss ?? "00"
  ).padStart(2, "0")}`;
};

function extractSpringErrors(respData) {
  if (!respData) return "";
  const buckets = [
    respData.validationErrors,
    respData.errors,
    respData.fieldErrors,
    respData.details,
  ].filter(Boolean);

  for (const b of buckets) {
    if (Array.isArray(b) && b.length) {
      return b
        .map(
          (e) =>
            `${e.field || e.name || e.objectName || "field"}: ${
              e.defaultMessage || e.message || e.code || "Geçersiz"
            }`
        )
        .join("\n");
    }
  }
  if (typeof respData.returnBody === "string") return respData.returnBody;
  if (typeof respData.message === "string") return respData.message;
  if (typeof respData.error === "string") return respData.error;
  return "";
}

const pickMsg = (e) =>
  extractSpringErrors(e?.response?.data) ||
  e?.response?.data?.message ||
  e?.response?.data?.error ||
  e?.response?.data?.returnBody ||
  e?.message ||
  "İşlem başarısız.";

const isPos = (v) => Number.isInteger(v) && v > 0;
const parseId = (v) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
};

const mapShowtimeRow = (s = {}) => ({
  id: s.id,
  date: s.date ?? "",
  startTime: s.startTime ?? s.start_time ?? "",
  endTime: s.endTime ?? s.end_time ?? "",
  hallName: s.hallName ?? s.hall?.name ?? (s.hallId ? `Hall #${s.hallId}` : ""),
  movieTitle: s.movieTitle ?? s.movie?.title ?? "",
  hallId: s.hallId ?? s.hall?.id,
  movieId: s.movieId ?? s.movie?.id,
});

/* ---------- Client-side tarih + id filtre yardımcıları ---------- */
const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;
const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (v) => {
  if (!v) return "";
  if (DATE_RX.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d)) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
function normalizeRange(from, to) {
  const f = toISODate(from) || "";
  const t = toISODate(to) || "";
  if (f && t && f > t) return [t, f]; // ters girildiyse düzelt
  return [f, t];
}
function filterByDate(items = [], from, to) {
  const [f, t] = normalizeRange(from, to);
  if (!f && !t) return items;
  return items.filter((r) => {
    const d = toISODate(r?.date);
    if (!d) return false;
    if (f && d < f) return false;
    if (t && d > t) return false;
    return true;
  });
}
/** AND mantığıyla (hallId && movieId && tarih) filtre */
function filterRowsAND(rows = [], { hallId, movieId, dateFrom, dateTo } = {}) {
  const hid = Number(hallId);
  const mid = Number(movieId);
  let out = filterByDate(rows, dateFrom, dateTo); // gün-dahil

  if (Number.isFinite(hid) && hid > 0) {
    out = out.filter((r) => Number(r.hallId) === hid);
  }
  if (Number.isFinite(mid) && mid > 0) {
    out = out.filter((r) => Number(r.movieId) === mid);
  }
  return out;
}

// Kayıt/Update/Delete sonrası listeyi yeniletmek için global event
function emitChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("showtimes:changed"));
  }
}

/* ======================= LIST ======================= */
/**
 * params: { page, size, cinemaId?, movieId?, hallId?, dateFrom?, dateTo?, ... }
 * NOT: hallId/movieId/tarih sadece FE’de filtrelenir (AND).
 */
export async function listShowtimes(params = {}) {
  const { page = 0, size = 60, cinemaId: rc, movieId: rm, ...rest } = params;
  const cinemaId = parseId(rc);
  const routeMovieId = parseId(rm); // endpoint seçimi için

  // FE filtre paramlarını BE paramlarından ayır
  const {
    hallId: fHallId,
    movieId: fMovieId,
    dateFrom,
    dateTo,
    ...queryToBE // BE’ye gönderilecek kalan (sayfa vb.)
  } = rest;

  try {
    // 1) cinemaId -> /show-times/cinema/{id}
    if (isPos(cinemaId)) {
      const res = await http.get(showTimesByCinemaIdApi(cinemaId), { params: queryToBE });
      const body = unwrap(res) ?? [];
      const rows = (Array.isArray(body) ? body : []).flatMap((h) =>
        (h?.showtimes ?? h?.showTimes ?? []).map((s) =>
          mapShowtimeRow({ ...s, hallName: h?.hallName ?? h?.name })
        )
      );
      const content = filterRowsAND(rows, { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo });
      return {
        content,
        pageable: { pageNumber: 0, pageSize: content.length || size },
        totalElements: content.length,
        totalPages: 1,
      };
    }

    // 2) movieId -> /show-times/movie/{id} (paginated)
    if (isPos(routeMovieId)) {
      const res = await http.get(showTimesByMovieIdApi(routeMovieId), {
        params: { page, size, ...queryToBE },
      });
      const pg = unwrap(res) ?? {};
      const rows = (Array.isArray(pg.content) ? pg.content : []).map(mapShowtimeRow);
      const content = filterRowsAND(rows, { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo });
      return {
        content,
        pageable: pg.pageable ?? { pageNumber: page, pageSize: size },
        totalElements: content.length,
        totalPages: 1,
      };
    }

    // 3) genel liste (paginated) – tarih/id filtreleri BE’ye GÖNDERİLMEZ
    const res = await http.get(SHOWTIMES_LIST_API, {
      params: { page, size, ...queryToBE },
    });
    const pg = unwrap(res) ?? {};
    const rows = (Array.isArray(pg.content) ? pg.content : []).map(mapShowtimeRow);
    const content = filterRowsAND(rows, { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo });
    return {
      content,
      pageable: pg.pageable ?? { pageNumber: page, pageSize: size },
      totalElements: content.length,
      totalPages: 1,
    };
  } catch (e) {
    const sc = e?.response?.status;
    console.error("SHOWTIMES LIST ERROR:", sc, e?.response?.data || e);
    // 5xx geldiğinde sayfayı patlatma; boş liste dön.
    return {
      content: [],
      pageable: { pageNumber: 0, pageSize: 0 },
      totalElements: 0,
      totalPages: 0,
      error: pickMsg(e),
    };
  }
}

/* ======================= GET ONE ======================= */
export async function getShowtime(id) {
  const sid = Number(String(id).trim());
  if (!Number.isFinite(sid) || sid <= 0) throw new Error("Geçersiz showtime id");

  try {
    const res = await http.get(showTimeByIdApi(sid));
    const data = unwrap(res);
    return mapShowtimeRow(data ?? {});
  } catch (e) {
    const data = e?.response?.data;
    const status = e?.response?.status;
    const buckets = [data?.validationErrors, data?.errors, data?.fieldErrors, data?.details].filter(Boolean);
    let vMsg = "";
    for (const b of buckets) {
      if (Array.isArray(b) && b.length) {
        vMsg = b.map(x => `${x.field || x.name || "field"}: ${x.defaultMessage || x.message || x.code || "Geçersiz"}`).join("\n");
        break;
      }
    }
    const msg =
      vMsg ||
      data?.message ||
      data?.error ||
      data?.returnBody ||
      (status === 401 ? "Yetkisiz (401)" : status === 403 ? "Erişim yok (403)" : status === 404 ? "Kayıt bulunamadı (404)" : "Sunucu hatası");

    console.error("GET SHOWTIME ERROR:", status, e?.response?.config?.url, data || e);
    throw new Error(msg);
  }
}

/* ======================= CREATE / UPDATE / DELETE ======================= */
export async function createShowtime(payload) {
  const body = {
    date: payload?.date,
    startTime: toHHMMSS(payload?.startTime),
    endTime: toHHMMSS(payload?.endTime),
    hallId: Number(payload?.hallId),
    movieId: Number(payload?.movieId),
  };
  try {
    const res = await http.post(SHOWTIME_CREATE_API, body);
    emitChanged();
    return unwrap(res);
  } catch (e) {
    console.error(
      "CREATE SHOWTIME ERROR:",
      e?.response?.status,
      e?.response?.config?.url,
      e?.response?.data || e
    );
    throw new Error(pickMsg(e));
  }
}

export async function updateShowtime(id, payload) {
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) throw new Error("Geçersiz showtime id");

  const body = {
    date: payload?.date,                         // "YYYY-MM-DD"
    startTime: toHHMMSS(payload?.startTime),     // "HH:mm" -> "HH:mm:ss"
    endTime:   toHHMMSS(payload?.endTime),
    hallId:    Number(payload?.hallId),
    movieId:   Number(payload?.movieId),
  };

  try {
    const res = await http.put(showTimeByIdApi(sid), body);
    emitChanged();
    return unwrap(res);
  } catch (e) {
    const data = e?.response?.data;
    const buckets = [data?.validationErrors, data?.errors, data?.fieldErrors, data?.details].filter(Boolean);
    let vMsg = "";
    for (const b of buckets) {
      if (Array.isArray(b) && b.length) {
        vMsg = b.map(x => `${x.field || x.name || "field"}: ${x.defaultMessage || x.message || x.code || "Geçersiz"}`).join("\n");
        break;
      }
    }
    const msg = vMsg || data?.message || data?.error || data?.returnBody || e?.message || "Güncelleme başarısız.";
    console.error("UPDATE SHOWTIME ERROR:", e?.response?.status, e?.response?.config?.url, data || e);
    throw new Error(msg);
  }
}

export async function deleteShowtime(id) {
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) throw new Error("Geçersiz showtime id");
  try {
    const res = await http.delete(showTimeByIdApi(sid));
    emitChanged();
    return res?.status === 204 ? true : res?.data?.returnBody ?? true;
  } catch (e) {
    const sc = e?.response?.status;
    console.error(
      "DELETE SHOWTIME ERROR:",
      sc,
      e?.response?.config?.url,
      e?.response?.data || e
    );
    if (sc === 404) throw new Error("Kayıt bulunamadı.");
    if (sc === 409)
      throw new Error("Bu gösterime bağlı bilet/rezervasyon olduğu için silinemez.");
    throw new Error(pickMsg(e) || "Sunucu hatası. Bağlı kayıt olabilir.");
  }
}

/* ======================= AUX: Halls & Movies ======================= */
// Halls: önce /api/hall (pageable), olmazsa sinemalardan fallback
// src/action/showtimes-actions.js  içinde SADECE bu fonksiyonu değiştir
export async function listHalls() {
  try {
    const r = await http.get(HALL_LIST_API, { params: { page: 0, size: 1000 } });
    const page = unwrap(r) ?? {};
    const items = Array.isArray(page.content) ? page.content : Array.isArray(page) ? page : [];
    return items.map((h) => ({
      id: h?.id ?? h?.hallId,
      name: h?.name ?? h?.hallName ?? `Hall ${h?.id ?? ""}`,
      // ↴ mümkünse bağlı sinema adını da taşı
      cinemaName: h?.cinema?.name ?? h?.cinemaName ?? h?.theatreName ?? "",
    }));
  } catch (e1) {
    console.warn(
      "HALLS /api/hall failed, fallback via cinemas...",
      e1?.response?.status,
      e1?.response?.data
    );
    try {
      const cr = await http.get(CINEMA_LIST_API, { params: { page: 0, size: 1000 } });
      const cBody = unwrap(cr) ?? {};
      const cinemas = Array.isArray(cBody?.content) ? cBody.content : Array.isArray(cBody) ? cBody : [];
      const all = [];
      for (const c of cinemas) {
        const cid = c?.id ?? c?.cinemaId;
        if (!cid) continue;
        try {
          const hr = await http.get(cinemaHallsApi(cid));
          const halls = unwrap(hr) ?? [];
          for (const h of (Array.isArray(halls) ? halls : [])) {
            all.push({
              id: h?.id ?? h?.hallId,
              name: h?.name ?? h?.hallName ?? `Hall ${h?.id ?? ""}`,
              cinemaName: c?.name ?? c?.cinemaName ?? "", // ↴ sinema adını buradan al
            });
          }
        } catch (e2) {
          console.warn("cinemaHalls fallback failed for cinema", cid, e2?.response?.status);
        }
      }
      const uniq = Object.values(all.reduce((acc, h) => ((acc[h.id] = h), acc), {}));
      return uniq;
    } catch (e3) {
      console.error("HALLS fallback via cinemas failed:", e3?.response?.status, e3?.response?.data);
      return [];
    }
  }
}


// Movies: önce /movies/admin, olmazsa /movies/search
export async function listMoviesAdmin(params = { page: 0, size: 1000 }) {
  try {
    const res = await http.get(MOVIES_ADMIN_LIST_API, { params });
    const body = unwrap(res);
    const items = Array.isArray(body?.content) ? body.content : Array.isArray(body) ? body : [];
    return items.map((m) => ({
      id: m?.id,
      title: m?.title ?? m?.movieTitle ?? `Movie #${m?.id ?? ""}`,
    }));
  } catch (e1) {
    console.warn(
      "MOVIES /admin failed, falling back to /search…",
      e1?.response?.status,
      e1?.response?.data
    );
    const res = await http.get(MOVIE_SEARCH_API, {
      params: { q: "", page: params.page ?? 0, size: params.size ?? 1000 },
    });
    const pg = unwrap(res) ?? {};
    const items = Array.isArray(pg.content) ? pg.content : Array.isArray(pg) ? pg : [];
    return items.map((m) => ({
      id: m?.id,
      title: m?.title ?? m?.movieTitle ?? `Movie #${m?.id ?? ""}`,
    }));
  }
}
