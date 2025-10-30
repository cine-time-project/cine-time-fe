"use client";

import axios from "axios";
import { authHeaders } from "@/lib/utils/http";
import {
  CITY_LIST_ALL_API,
  CITY_ADD_API,
  cityUpdateApi,
  cityDeleteApi,
  COUNTRY_LIST_API,
  COUNTRY_ADD_API,
} from "@/helpers/api-routes.js";

/**
 * Fetch raw cities (with countryMiniResponse) from backend.
 * Returns: array like [{ id, name, countryMiniResponse: { id, name } }, ...]
 */
export async function listAllCities() {
  const res = await axios.get(CITY_LIST_ALL_API, { headers: authHeaders() });
  return res.data || [];
}

/**
 * Utility: group cities by country name for your UI.
 * Input: list from listAllCities()
 * Output: { [countryName]: [{id, name}], ... }
 */
export function groupCitiesByCountry(list = []) {
  const map = {};
  list.forEach((c) => {
    const countryName = c?.countryMiniResponse?.name || "Unknown Country";
    if (!map[countryName]) map[countryName] = [];
    map[countryName].push({ id: c.id, name: c.name });
  });
  return map;
}

/**
 * Fetch countries for dropdowns.
 * Returns: array like [{ id, name }, ...]
 */
export async function listCountries() {
  const res = await axios.get(COUNTRY_LIST_API, { headers: authHeaders() });
  return res.data || [];
}

/**
 * Add a new city.
 * Params: { name: string, countryId: number }
 * Throws on error (so your existing try/catch keeps working).
 */
export async function addCity({ name, countryId }) {
  return axios.post(
    CITY_ADD_API,
    { name: String(name || "").trim(), countryId: Number(countryId) },
    { headers: authHeaders({ "Content-Type": "application/json" }) }
  );
}

/**
 * Update an existing city.
 * Params: { id: number, name: string, countryId: number }
 */
export async function updateCity({ id, name, countryId }) {
  return axios.put(
    cityUpdateApi(id),
    { name: String(name || "").trim(), countryId: Number(countryId) },
    { headers: authHeaders({ "Content-Type": "application/json" }) }
  );
}

/**
 * Delete a city by id.
 */
export async function deleteCity(id) {
  return axios.delete(cityDeleteApi(id), { headers: authHeaders() });
}

/**
 * Add a country (from the inline form on the Cities page).
 * Params: { name: string }
 */
export async function addCountry({ name }) {
  return axios.post(
    COUNTRY_ADD_API,
    { name: String(name || "").trim() },
    { headers: authHeaders({ "Content-Type": "application/json" }) }
  );
}
