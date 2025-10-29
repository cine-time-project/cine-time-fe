// src/action/showtimes-actions.js
import { http } from "@/lib/utils/http";
import {
  SHOWTIMES_LIST_API,                 // GET /show-times (page,size,...)
  SHOWTIME_CREATE_API,                // POST /show-times
  showTimeByIdApi,                    // /show-times/{id}
  showTimesByCinemaIdApi,             // /show-times/cinema/{cinemaId}
  showTimesByMovieIdApi,              // /show-times/movie/{movieId}
} from "@/helpers/api-routes";

import { HALL_LIST_API, MOVIES_ADMIN_LIST_API } from "@/helpers/api-routes";

/* ---------------- helpers ---------------- */
const unwrap = (r) => r?.data?.returnBody ?? r?.data ?? null;
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


/* ---------------- LIST ---------------- */
export async function listShowtimes(params = {}) {
  const { page = 0, size = 50, cinemaId: rawCinemaId, movieId: rawMovieId, ...rest } = params;
  const cinemaId = parseId(rawCinemaId);
  const movieId = parseId(rawMovieId);

  try {
    // 1) cinemaId -> halls + showtimes (Page değil)
    if (isPos(cinemaId)) {
      const res = await http.get(showTimesByCinemaIdApi(cinemaId), { params: rest });
      const body = unwrap(res) ?? [];
      const content = (Array.isArray(body) ? body : []).flatMap((h) =>
        (h?.showtimes ?? h?.showTimes ?? []).map((s) =>
          mapShowtimeRow({ ...s, hallName: h?.hallName ?? h?.name })
        )
      );
      return {
        content,
        pageable: { pageNumber: 0, pageSize: content.length || size },
        totalElements: content.length,
        totalPages: 1,
      };
    }

    // 2) movieId -> Page
    if (isPos(movieId)) {
      const res = await http.get(showTimesByMovieIdApi(movieId), { params: { page, size, ...rest } });
      const pageData = unwrap(res) ?? {};
      const items = Array.isArray(pageData.content) ? pageData.content : [];
      return {
        content: items.map(mapShowtimeRow),
        pageable: pageData.pageable ?? { pageNumber: page, pageSize: size },
        totalElements: pageData.totalElements ?? items.length,
        totalPages: pageData.totalPages ?? 1,
      };
    }

    // 3) genel sayfalı liste
    const res = await http.get(SHOWTIMES_LIST_API, { params: { page, size, ...rest } });
    const pageData = unwrap(res) ?? {};
    const items = Array.isArray(pageData.content) ? pageData.content : [];
    return {
      content: items.map(mapShowtimeRow),
      pageable: pageData.pageable ?? { pageNumber: page, pageSize: size },
      totalElements: pageData.totalElements ?? items.length,
      totalPages: pageData.totalPages ?? 1,
    };
  } catch (e) {
    const sc = e?.response?.status;
    console.error("SHOWTIMES LIST ERROR:", sc, e?.response?.data || e);
    if ([400, 401, 403, 404].includes(sc)) {
      return { content: [], pageable: { pageNumber: 0, pageSize: 0 }, totalElements: 0, totalPages: 0 };
    }
    throw e;
  }
}

/* ---------------- GET ONE ---------------- */
export async function getShowtime(id) {
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) throw new Error("Geçersiz showtime id");
  const res = await http.get(showTimeByIdApi(sid));       // GET /api/show-times/{id}
  const data = unwrap(res);                                // ResponseMessage<ShowtimeResponse>
  return mapShowtimeRow(data ?? {});                       // form için uygun obje
}

/* ---------------- CREATE / UPDATE / DELETE ---------------- */
export async function createShowtime(payload) {
  const res = await http.post(SHOWTIME_CREATE_API, payload);
  return unwrap(res);
}
export async function updateShowtime(id, payload) {
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) throw new Error("Geçersiz showtime id");
  const res = await http.put(showTimeByIdApi(sid), payload);
  return unwrap(res);
}
export async function deleteShowtime(id) {
  const sid = Number(id);
  if (!Number.isFinite(sid) || sid <= 0) throw new Error("Geçersiz showtime id");
  const res = await http.delete(showTimeByIdApi(sid));
  return unwrap(res) ?? true;
}



export async function listHalls() {
  const res = await http.get(HALL_LIST_API);
  const arr = unwrap(res) || [];
  // -> [{ id, name }]
  return (Array.isArray(arr) ? arr : []).map(h => ({
    id: h?.id ?? h?.hallId,
    name: h?.name ?? h?.hallName ?? `Hall ${h?.id ?? ""}`,
  }));
}

export async function listMoviesAdmin(params = { page: 0, size: 1000 }) {
  const res = await http.get(MOVIES_ADMIN_LIST_API, { params });
  const body = unwrap(res);
  const items = Array.isArray(body?.content) ? body.content : (Array.isArray(body) ? body : []);
  // -> [{ id, title }]
  return items.map(m => ({
    id: m?.id,
    title: m?.title ?? m?.movieTitle ?? `Movie #${m?.id ?? ""}`,
  }));
}