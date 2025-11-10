// src/service/movie-service.server.js

import { config } from "@/helpers/config";

export const getMovieById = async (id) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || config.baseUrl;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
  }
  const res = await fetch(`${baseUrl}/movies/id/${id}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch movie ${id}: ${res.status} ${res.statusText}`
    );
  }
  const data = await res.json();
  return data.returnBody;
};

export const getActors = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || config.apiURL;
  const res = await fetch(`${baseUrl}/movies/actors`, { cache: "no-store" });

  if (!res.ok) throw new Error(`Failed to fetch actors: ${res.status}`);
  const data = await res.json();
  return data.returnBody || [];
};


export const updateMovie = async (payload, token = "") => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || config.apiURL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
  }
  if (!payload?.id) {
    throw new Error("Movie ID is missing in payload");
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/movies/update/${payload.id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Failed to update movie ${payload.id}: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const data = await res.json();
  return data.returnBody || data;
};


export const deleteMovieServer = async (id, token = "") => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || config.apiURL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
  }
  if (!id) throw new Error("Movie ID is missing");

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/movies/del/${id}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Failed to delete movie ${id}: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const data = await res.json();
  return data.returnBody || data;
};

export const createMovie = async (payload, token = "") => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || config.apiURL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in .env.local");
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/movies/save`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Failed to create movie: ${res.status} ${res.statusText} - ${errText}`
    );
  }

  const data = await res.json();
  return data.returnBody || data;
};
