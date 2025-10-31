"use client";

import { http } from "@/lib/utils/http";
import {
  SHOWTIMES_LIST_API,
  SHOWTIME_CREATE_API,
  showTimeByIdApi,
  showTimesByCinemaIdApi,
  showTimesByMovieIdApi,
  showTimesByCinemaIdFlatApi,
  HALL_LIST_API,
  MOVIES_ADMIN_LIST_API,
  MOVIE_SEARCH_API,
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
  e?.message ||
  "İşlem sırasında beklenmeyen bir hata.";

const isPos = (v) => Number.isInteger(v) && v > 0;
const parseId = (v) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
};

/* ---------- Tarih + id filtre yardımcıları ---------- */
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
  if (f && t && f > t) return [t, f];
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
function filterRowsAND(rows = [], { hallId, movieId, dateFrom, dateTo } = {}) {
  const hid = Number(hallId);
  const mid = Number(movieId);
  let out = filterByDate(rows, dateFrom, dateTo);

  if (Number.isFinite(hid) && hid > 0) {
    out = out.filter((r) => Number(r.hallId) === hid);
  }
  if (Number.isFinite(mid) && mid > 0) {
    out = out.filter((r) => Number(r.movieId) === mid);
  }
  return out;
}

/* ---------- ISO parçalama ---------- */
const timeFromIso = (iso = "") => {
  if (!iso) return ["", ""];
  const [d, t] = String(iso).split("T");
  return [d || "", (t || "").slice(0, 8)];
};

/* ---------- Mapper ---------- */
const mapShowtimeRow = (s = {}) => {
  const isoStart =
    s.startDateTime || s.startDate || s.startTimeIso || s.startTimeISO || s.start || "";
  const isoEnd = s.endDateTime || s.endDate || s.endTimeIso || s.endTimeISO || s.end || "";
  const [dateFromIso, startFromIso] = timeFromIso(isoStart);
  const [, endFromIso] = timeFromIso(isoEnd);

  const date = s.date || dateFromIso || "";
  const startTime = s.startTime || s.start_time || startFromIso || "";
  const endTime = s.endTime || s.end_time || endFromIso || "";

  return {
    id: s.id ?? s.showtimeId ?? null,
    date,
    startTime,
    endTime,
    hallName: s.hallName ?? s.hall?.name ?? (s.hallId ? `Hall #${s.hallId}` : ""),
    movieTitle: s.movieTitle ?? s.movie?.title ?? "",
    hallId: s.hallId ?? s.hall?.id ?? null,
    movieId: s.movieId ?? s.movie?.id ?? null,
  };
};

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
function flattenCinemaBody(body = []) {
  const arr = Array.isArray(body) ? body : (Array.isArray(body?.content) ? body.content : []);
  return arr.flatMap((h) => {
    const hallId = h?.id ?? h?.hallId ?? null;
    const hallName = h?.name ?? h?.hallName ?? (hallId ? `Hall #${hallId}` : "");
    const movies = Array.isArray(h?.movies) ? h.movies : [];
    return movies.flatMap((mb) => {
      const movieId = mb?.movie?.id ?? mb?.movieId ?? null;
      const movieTitle = mb?.movie?.title ?? mb?.movieTitle ?? (movieId ? `Movie #${movieId}` : "");
      const sts = Array.isArray(mb?.showtimes ?? mb?.showTimes) ? (mb.showtimes ?? mb.showTimes) : [];
      return sts.map((s) => ({
        id: s.id ?? s.showtimeId ?? null,
        date: s.date ?? "",
        startTime: s.startTime ?? "",
        endTime: s.endTime ?? "",
        hallName,
        movieTitle,
        hallId,
        movieId,
      }));
    });
  });
}

export async function listShowtimes(params = {}) {
  const { page = 0, size = 20, cinemaId: rc, ...rest } = params; // default size: 20
  const cinemaId = parseId(rc);
  const routeMovieId = parseId(params.movieId);
  const { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo, ...queryToBE } = rest;

  try {
    // 1) cinemaId → önce /flat, 404 ise eski route’a düş
    if (isPos(cinemaId)) {
      try {
        const r1 = await http.get(showTimesByCinemaIdFlatApi(cinemaId));
        const body = unwrap(r1) ?? [];
        const rows = (Array.isArray(body) ? body : []).map((s) => ({
          id: s.showtimeId ?? s.id ?? null,
          date: s.date ?? "",
          startTime: s.startTime ?? "",
          endTime: s.endTime ?? "",
          hallName: s.hallName ?? (s.hallId ? `Hall #${s.hallId}` : ""),
          movieTitle: s.movieTitle ?? "",
          hallId: s.hallId ?? null,
          movieId: s.movieId ?? null,
        }));

        // FE filtre + FE pagination
        const filtered = filterRowsAND(rows, { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo });
        const totalElements = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / size));
        const start = page * size;
        const content = filtered.slice(start, start + size);

        return {
          content,
          pageable: { pageNumber: page, pageSize: size },
          totalElements,
          totalPages,
        };
      } catch (e) {
        if (e?.response?.status === 404) {
          // Fallback: eski endpoint + flatten + FE pagination
          const r2 = await http.get(showTimesByCinemaIdApi(cinemaId), { params: queryToBE });
          const body = unwrap(r2) ?? [];
          const rows = flattenCinemaBody(body);
          const filtered = filterRowsAND(rows, { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo });

          const totalElements = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalElements / size));
          const start = page * size;
          const content = filtered.slice(start, start + size);

          return {
            content,
            pageable: { pageNumber: page, pageSize: size },
            totalElements,
            totalPages,
          };
        }
        throw e;
      }
    }

    // 2) movieId -> BE paginated endpoint
    if (isPos(routeMovieId)) {
      try {
        const res = await http.get(showTimesByMovieIdApi(routeMovieId), {
          params: { page, size, ...queryToBE },
        });
        const pg = unwrap(res) ?? {};
        const rows = (Array.isArray(pg.content) ? pg.content : []).map(mapShowtimeRow);
        const content = filterRowsAND(rows, { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo });
        return {
          content,
          pageable: pg.pageable ?? { pageNumber: page, pageSize: size },
          totalElements: pg.totalElements ?? content.length,
          totalPages: pg.totalPages ?? Math.max(1, Math.ceil((pg.totalElements ?? content.length) / size)),
        };
      } catch (e) {
        if (e?.response?.status === 404) {
          return {
            content: [],
            pageable: { pageNumber: 0, pageSize: size },
            totalElements: 0,
            totalPages: 0,
          };
        }
        throw e;
      }
    }

    // 3) genel liste -> BE paginated
    const res = await http.get(SHOWTIMES_LIST_API, { params: { page, size, ...queryToBE } });
    const pg = unwrap(res) ?? {};
    const rows = (Array.isArray(pg.content) ? pg.content : []).map(mapShowtimeRow);
    const content = filterRowsAND(rows, { hallId: fHallId, movieId: fMovieId, dateFrom, dateTo });
    return {
      content,
      pageable: pg.pageable ?? { pageNumber: page, pageSize: size },
      totalElements: pg.totalElements ?? content.length,
      totalPages: pg.totalPages ?? Math.max(1, Math.ceil((pg.totalElements ?? content.length) / size)),
    };
  } catch (e) {
    const sc = e?.response?.status;
    console.error("SHOWTIMES LIST ERROR:", sc, e?.response?.data || e);
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
        vMsg = b
          .map((x) => `${x.field || x.name || "field"}: ${x.defaultMessage || x.message || x.code || "Geçersiz"}`)
          .join("\n");
        break;
      }
    }
    const msg =
      vMsg ||
      data?.message ||
      data?.error ||
      data?.returnBody ||
      (status === 401
        ? "Yetkisiz (401)"
        : status === 403
        ? "Erişim yok (403)"
        : status === 404
        ? "Kayıt bulunamadı (404)"
        : "Sunucu hatası");

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
    console.error("CREATE SHOWTIME ERROR:", e?.response?.status, e?.response?.config?.url, e?.response?.data || e);
    throw new Error(pickMsg(e));
  }
}

export async function updateShowtime(id, payload) {
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) throw new Error("Geçersiz showtime id");

  const body = {
    date: payload?.date,
    startTime: toHHMMSS(payload?.startTime),
    endTime: toHHMMSS(payload?.endTime),
    hallId: Number(payload?.hallId),
    movieId: Number(payload?.movieId),
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
        vMsg = b
          .map((x) => `${x.field || x.name || "field"}: ${x.defaultMessage || x.message || x.code || "Geçersiz"}`)
          .join("\n");
        break;
      }
    }
    const msg = vMsg || data?.message || data?.error || data?.returnBody || e?.message || "Güncelleme başarısız.";
    console.error("UPDATE SHOWTIME ERROR:", e?.response?.status, e?.response?.config?.url, data || e);
    throw new Error(msg);
  }
}

export async function deleteShowtime(id) {
  try {
    const r = await http.delete(showTimeByIdApi(id));
    return { ok: true, status: r?.status ?? 200 };
  } catch (e) {
    const sc = e?.response?.status;

    if (sc === 404) return { ok: false, status: 404, message: "Kayıt bulunamadı." };

    if (sc === 409) {
      const beMsg =
        e?.response?.data?.message || "Bu gösterime bağlı bilet/rezervasyon olduğu için silinemez.";
      return { ok: false, status: 409, message: beMsg };
    }

    return { ok: false, status: sc ?? 0, message: pickMsg(e) || "Sunucu hatası." };
  }
}

/* ======================= AUX: Halls & Movies ======================= */
// Halls: önce /api/hall (pageable), olmazsa sinemalardan fallback
export async function listHalls() {
  try {
    const r = await http.get(HALL_LIST_API, { params: { page: 0, size: 1000 } });
    const page = unwrap(r) ?? {};
    const items = Array.isArray(page.content) ? page.content : Array.isArray(page) ? page : [];
    return items.map((h) => ({
      id: h?.id ?? h?.hallId,
      name: h?.name ?? h?.hallName ?? `Hall ${h?.id ?? ""}`,
      cinemaName: h?.cinema?.name ?? h?.cinemaName ?? h?.theatreName ?? "",
    }));
  } catch (e1) {
    console.warn("HALLS /api/hall failed, fallback via cinemas...", e1?.response?.status, e1?.response?.data);
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
          for (const h of Array.isArray(halls) ? halls : []) {
            all.push({
              id: h?.id ?? h?.hallId,
              name: h?.name ?? h?.hallName ?? `Hall ${h?.id ?? ""}`,
              cinemaName: c?.name ?? c?.cinemaName ?? "",
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
    console.warn("MOVIES /admin failed, falling back to /search…", e1?.response?.status, e1?.response?.data);
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

/* ======================= AUTOCOMPLETE (name ile arama) ======================= */
const _mem = { cinemas: null, hallsByCinema: new Map() }; // basit cache
const toOptions = (arr = [], labelKey = "name") =>
  (Array.isArray(arr) ? arr : []).map((x) => ({
    value: x?.id,
    label: x?.[labelKey] ?? x?.name ?? x?.title ?? `#${x?.id ?? ""}`,
    raw: x,
  }));

function _includes(hay = "", needle = "") {
  return String(hay || "").toLocaleLowerCase("tr").includes(String(needle || "").toLocaleLowerCase("tr"));
}

/** Cinema: isimle ara */
export async function searchCinemasByName(q = "", { size = 10 } = {}) {
  const params = { page: 0, size, q: String(q || "").trim() };
  try {
    const res = await http.get(CINEMA_LIST_API, { params });
    const body = unwrap(res);
    let items = Array.isArray(body?.content) ? body.content : (Array.isArray(body) ? body : []);

    if (!params.q) {
      _mem.cinemas = items;
    } else if (Array.isArray(body?.content) === false && !_mem.cinemas) {
      const all = await http.get(CINEMA_LIST_API, { params: { page: 0, size: 1000 } });
      _mem.cinemas = Array.isArray(unwrap(all)?.content) ? unwrap(all).content : unwrap(all);
    }
    if (_mem.cinemas && params.q) {
      items = _mem.cinemas.filter((c) => _includes(c?.name, params.q)).slice(0, size);
    }

    return toOptions(items, "name");
  } catch (e) {
    console.error("searchCinemasByName:", e?.response?.status, e?.response?.data || e);
    return [];
  }
}

/** Hall: seçilen cinemaId altında isimle ara */
export async function searchHallsByName(cinemaId, q = "", { size = 20 } = {}) {
  const cid = Number(cinemaId);
  if (!Number.isFinite(cid) || cid <= 0) return [];

  const params = { page: 0, size, q: String(q || "").trim() };
  try {
    const res = await http.get(cinemaHallsApi(cid), { params });
    const body = unwrap(res);
    let items = Array.isArray(body?.content) ? body.content : (Array.isArray(body) ? body : []);

    const key = String(cid);
    if (!params.q) {
      _mem.hallsByCinema.set(key, items);
    } else if (Array.isArray(body?.content) === false && !_mem.hallsByCinema.get(key)) {
      const all = await http.get(cinemaHallsApi(cid), { params: { page: 0, size: 1000 } });
      const allItems = Array.isArray(unwrap(all)?.content) ? unwrap(all).content : unwrap(all);
      _mem.hallsByCinema.set(key, allItems || []);
    }
    if (_mem.hallsByCinema.get(key) && params.q) {
      items = _mem.hallsByCinema.get(key).filter((h) => _includes(h?.name, params.q)).slice(0, size);
    }

    return toOptions(items, "name");
  } catch (e) {
    console.error("searchHallsByName:", e?.response?.status, e?.response?.data || e);
    return [];
  }
}

/** Movie: başlıkla ara */
export async function searchMoviesByTitle(q = "", { page = 0, size = 10 } = {}) {
  try {
    const r = await http.get(MOVIE_SEARCH_API, { params: { q: String(q || "").trim(), page, size } });
    const pg = unwrap(r) ?? {};
    const items = Array.isArray(pg.content) ? pg.content : (Array.isArray(pg) ? pg : []);
    return toOptions(items, "title");
  } catch (e) {
    console.error("searchMoviesByTitle:", e?.response?.status, e?.response?.data || e);
    return [];
  }
}
