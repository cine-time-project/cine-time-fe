import { authHeaders } from "@/lib/utils/http";
import { config } from "../helpers/config";

// -------------------- Hall API endpoints --------------------
export const HALL_API = `${config.apiURL}/hall`;

export const getHalls = async (page = 0, size = 10) => {
  const url = `${HALL_API}?page=${page}&size=${size}`;
  const res = await fetch(url, {
    headers: authHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Failed to load halls:", errorText);
    throw new Error(`Failed to load halls (${res.status})`);
  }

  return await res.json();
};

export const getHallById = async (id, token) => {
  const res = await fetch(`${HALL_API}/${id}`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch hall (${res.status})`);
  return await res.json();
};

export const createHall = async (data, token) => {
  const res = await fetch(HALL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Failed: ${res.status}`);
  }

  return JSON.parse(text);
};

export const updateHall = async (id, data, token) => {
  const res = await fetch(`${HALL_API}/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const deleteHall = async (id, token) => {
  const res = await fetch(`${HALL_API}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return await res.json();
};
