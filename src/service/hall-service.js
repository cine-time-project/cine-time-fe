import { authHeaders } from "@/lib/utils/http";
import { config } from "../helpers/config";

// -------------------- Hall API endpoints --------------------
export const HALL_API = `${config.apiURL}/hall`;
console.log("HALL_API =>", HALL_API);

export const getHalls = async (page = 0, size = 10) => {
  const url = `${HALL_API}?page=${page}&size=${size}`;
  const res = await fetch(url, {
    headers: authHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn("No halls found (404)");
      return { content: [] };
    }
    const errorText = await res.text();
    console.error("Failed to load halls:", errorText);
    throw new Error(`Failed to load halls (${res.status})`);
  }

  return await res.json();
};

export const searchHalls = async (token, query = "") => {
  const url = `${HALL_API}/search-halls?query=${encodeURIComponent(query)}`;
  console.log("search URL:", url);

  const res = await fetch(url, {
    headers: authHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Failed to fetch halls: ${res.statusText}`);

  const data = await res.json();

  console.log("search response...", data);

  return data;
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
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = new Error(body?.message || `Failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
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
