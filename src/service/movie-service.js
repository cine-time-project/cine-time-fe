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
  q = "" // optional search term
) => {
  const qs = `q=${encodeURIComponent(
    q
  )}&page=${page}&size=${size}&sort=${sort},${type}`;

  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };

  const response = await fetch(`${MOVIES_ADMIN_LIST_API}?${qs}`, {
    method: "GET",
    headers,
  });

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

export const updateMovie = async (payload) => {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  if (!payload.id) throw new Error("Id is missing");
  return fetch(movieUpdateApi(payload.id), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
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
