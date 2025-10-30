"use client";

import axios from "axios";
import { authHeaders } from "@/lib/utils/http";
import {
  DISTRICT_LIST_API,
  DISTRICT_ADD_API,
  districtUpdateApi,
  districtDeleteApi,
  CITY_LIST_API,
  CITY_WITH_ITS_DISTRICT, // NOTE: use as a function: CITY_WITH_ITS_DISTRICT(cityId)
} from "@/helpers/api-routes";

/** Load all districts (generic list). */
export async function listDistricts() {
  const res = await axios.get(DISTRICT_LIST_API, { headers: authHeaders() });
  return res.data || [];
}

/** Add a district. Params: { name, cityId } */
export function addDistrict({ name, cityId }) {
  return axios.post(
    DISTRICT_ADD_API,
    { name: String(name || "").trim(), cityId: Number(cityId) },
    { headers: authHeaders({ "Content-Type": "application/json" }) }
  );
}

/** Update a district. Params: { id, name, cityId } */
export function updateDistrict({ id, name, cityId }) {
  return axios.put(
    districtUpdateApi(id),
    { name: String(name || "").trim(), cityId: Number(cityId) },
    { headers: authHeaders({ "Content-Type": "application/json" }) }
  );
}

/** Delete a district by id */
export function deleteDistrict(id) {
  return axios.delete(districtDeleteApi(id), { headers: authHeaders() });
}

/** Fetch cities for dropdown (id + name) */
export async function listCities() {
  const res = await axios.get(CITY_LIST_API, { headers: authHeaders() });
  return res.data || [];
}

/** Get a specific city WITH its districts using your util method. */
export async function getCityWithDistricts(cityId) {
  if (cityId == null) throw new Error("cityId is required");
  // IMPORTANT: call the helper as a function (no curly braces / no manual string)
  const url = CITY_WITH_ITS_DISTRICT(cityId);
  const res = await axios.get(url, { headers: authHeaders() });
  // Expected: { id, name, districtMiniResponses: [...] }
  return res.data || null;
}
