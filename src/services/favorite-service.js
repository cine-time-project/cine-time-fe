"use client";

import axios from "axios";
import { axiosAuth } from "@/lib/utils/http";
import { favoriteMovieApi } from "@/helpers/api-routes";

/** Favoriye ekle — 409 (zaten ekli) durumunu başarı sayar */
export async function addFavoriteMovie(movieId) {
  try {
    const { data } = await axios.post(favoriteMovieApi(movieId), null, axiosAuth());
    return { ok: true, data };
  } catch (e) {
    const st = e?.response?.status;
    if (st === 409) return { ok: true, already: true }; // idempotent
    throw e;
  }
}

/** Favoriden çıkar — 404 (zaten yok) durumunu başarı sayar */
export async function removeFavoriteMovie(movieId) {
  try {
    const { data } = await axios.delete(favoriteMovieApi(movieId), axiosAuth());
    return { ok: true, data };
  } catch (e) {
    const st = e?.response?.status;
    if (st === 404) return { ok: true, alreadyRemoved: true }; // idempotent
    throw e;
  }
}

// İsterseniz default import da çalışsın diye:
export default { addFavoriteMovie, removeFavoriteMovie };
