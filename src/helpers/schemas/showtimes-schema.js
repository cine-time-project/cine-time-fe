import { z } from "zod";

const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;      // YYYY-MM-DD
const TIME_RX = /^\d{2}:\d{2}(:\d{2})?$/;   // HH:mm veya HH:mm:ss

export const showtimeDefaults = {
  date: "",
  startTime: "",
  endTime: "",
  hallId: undefined,
  movieId: undefined,
};

function toHHMMSS(t = "") {
  if (!TIME_RX.test(t)) return "00:00:00";
  const [hh, mm, ss = "00"] = String(t).split(":");
  return [hh.padStart(2, "0"), mm.padStart(2, "0"), String(ss).padStart(2, "0")].join(":");
}
function timeToSec(t = "") {
  const [hh = "0", mm = "0", ss = "0"] = String(t).split(":");
  return (+hh) * 3600 + (+mm) * 60 + (+ss);
}
function coerceIds(v = {}) {
  return {
    ...v,
    hallId: v.hallId != null ? +v.hallId : v.hallId,
    movieId: v.movieId != null ? +v.movieId : v.movieId,
  };
}

const showtimeBase = z.object({
  date: z.string().regex(DATE_RX, "Tarih formatı YYYY-MM-DD olmalı"),
  startTime: z.string().regex(TIME_RX, "Başlangıç saati HH:mm olmalı"),
  endTime: z.string().regex(TIME_RX, "Bitiş saati HH:mm olmalı"),
  hallId: z.number().int().positive("Salon seçiniz"),
  movieId: z.number().int().positive("Film seçiniz"),
});

const timeRefinement = (val, ctx) => {
  const start = toHHMMSS(val.startTime);
  const end = toHHMMSS(val.endTime);
  if (timeToSec(end) <= timeToSec(start)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "Bitiş saati başlangıçtan büyük olmalı",
    });
  }
};

export const showtimeCreateSchema = showtimeBase.superRefine(timeRefinement);
export const showtimeUpdateSchema = showtimeBase
  .extend({ id: z.number().int().positive() })
  .superRefine(timeRefinement);

export function safeParseCreate(values) {
  const v = coerceIds(values);
  return showtimeCreateSchema.safeParse(v);
}
export function safeParseUpdate(values) {
  const v = coerceIds(values);
  return showtimeUpdateSchema.safeParse(v);
}

export function toShowtimePayload(formValues = {}) {
  const v = coerceIds(formValues);
  return {
    date: v.date,
    startTime: toHHMMSS(v.startTime),
    endTime: toHHMMSS(v.endTime),
    hallId: v.hallId,
    movieId: v.movieId,
  };
}

export function fromShowtimeDto(dto = {}) {
  return {
    id: dto.id,
    date: dto.date ?? "",
    startTime: String(dto.startTime || "").slice(0, 5),
    endTime: String(dto.endTime || "").slice(0, 5),
    hallId: dto.hall?.id ?? dto.hallId,
    movieId: dto.movie?.id ?? dto.movieId,
  };
}

