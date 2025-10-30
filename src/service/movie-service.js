"use client";

import {
  MOVIES_ADMIN_LIST_API,
  MOVIE_SAVE_API,
  movieByIdApi,
  movieUpdateApi,
  movieDeleteApi,
} from "@/helpers/api-routes";
import { authHeaders } from "@/lib/utils/http";

/**
 * Client-side version of getAllMoviesByPage.
 * Works with authHeaders() that depend on localStorage or browser tokens.
 */
export const getAllMoviesByPage = async (
  page = 0,
  size = 10,
  sort = "title",
  type = "asc",
  q = "",
  status = ""
) => {
  const params = new URLSearchParams({
    q: q || "",
    page: page,
    size: size,
    sort: sort,
    type: type,
  });

  if (status) {
    params.append("status", status);
  }

  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };

  const response = await fetch(
    `${MOVIES_ADMIN_LIST_API}?${params.toString()}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  return response.json();
};

export const createMovie = async (payload) => {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  return fetch(MOVIE_SAVE_API, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
};

export const getMovieById = async (id) => {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  if (!id) throw new Error("Id is missing");
  return fetch(movieByIdApi(id), {
    headers,
  });
};

export const updateMovieAction = async (prevState, formData) => {
  const token = formData.get("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  // Convert all form fields to an object
  const fields = transformFormDataToJSON(formData);

  // Convert comma-separated cast string to array
  const castArray = (fields.cast || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  // If your MultipleSelect inputs send JSON strings, parse them
  const genreArray = JSON.parse(fields.genre || "[]");
  const formatsArray = JSON.parse(fields.formats || "[]");

  const payload = {
    ...fields,
    id: parseInt(fields.id),
    duration: parseInt(fields.duration),
    genre: genreArray,
    formats: formatsArray,
    cast: castArray,
  };

  const res = await fetch(movieUpdateApi(payload.id), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) return response(false, data?.message);
  revalidatePath(`/${formData.get("locale")}/admin/movies`);
  redirect(`/${formData.get("locale")}/admin/movies`);
};

export const deleteMovie = async (id) => {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  return fetch(movieDeleteApi(id), {
    method: "DELETE",
    headers,
  });
};
