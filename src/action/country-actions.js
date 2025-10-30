"use client";

import axios from "axios";
import { authHeaders } from "@/lib/utils/http";
import {
  COUNTRY_LIST_API,
  COUNTRY_ADD_API,
  COUNTRY_EDIT_API,
  COUNTRY_DELETE_API,
} from "@/helpers/api-routes.js";

/** Load all countries: [{ id, name }, ...] */
export async function listCountries() {
  const res = await axios.get(COUNTRY_LIST_API, { headers: authHeaders() });
  return res.data || [];
}

/** Add a new country. Params: { name } */
export async function addCountry({ name }) {
  return axios.post(
    COUNTRY_ADD_API,
    { name: String(name || "").trim() },
    { headers: authHeaders({ "Content-Type": "application/json" }) }
  );
}

/** Update a country. Params: { id, name } */
export async function updateCountry({ id, name }) {
  return axios.put(
    COUNTRY_EDIT_API(id),
    { name: String(name || "").trim() },
    { headers: authHeaders({ "Content-Type": "application/json" }) }
  );
}

/** Delete a country by id */
export async function deleteCountry(id) {
  return axios.delete(COUNTRY_DELETE_API(id), { headers: authHeaders() });
}
