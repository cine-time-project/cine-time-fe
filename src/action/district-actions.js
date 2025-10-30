"use server";

import { revalidatePath } from "next/cache";
import {
  DISTRICT_ADD_API,
  districtUpdateApi,
  districtDeleteApi,
} from "@/helpers/api-routes";

const ok = (message = "OK", data = null) => ({ ok: true, message, data });
const fail = (message = "Failed", data = null) => ({
  ok: false,
  message,
  data,
});

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function addDistrictAction({
  name,
  cityId,
  token,
  revalidate = null,
}) {
  if (!token) return fail("Missing token");
  if (!name?.trim()) return fail("District name is required");
  if (!cityId) return fail("cityId is required");

  try {
    const res = await fetch(DISTRICT_ADD_API, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name: name.trim(), cityId: Number(cityId) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return fail(data?.message || "Failed to add district", data);
    if (revalidate) revalidatePath(revalidate);
    return ok(data?.message || "District added", data);
  } catch (e) {
    return fail(e.message);
  }
}

export async function updateDistrictAction({
  id,
  name,
  cityId,
  token,
  revalidate = null,
}) {
  if (!token) return fail("Missing token");
  if (!id) return fail("District id is required");
  if (!name?.trim()) return fail("District name is required");
  if (!cityId) return fail("cityId is required");

  try {
    const res = await fetch(districtUpdateApi(id), {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ name: name.trim(), cityId: Number(cityId) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return fail(data?.message || "Failed to update district", data);
    if (revalidate) revalidatePath(revalidate);
    return ok(data?.message || "District updated", data);
  } catch (e) {
    return fail(e.message);
  }
}

export async function deleteDistrictAction({ id, token, revalidate = null }) {
  if (!token) return fail("Missing token");
  if (!id) return fail("District id is required");

  try {
    const res = await fetch(districtDeleteApi(id), {
      method: "DELETE",
      headers: authHeaders(token),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      return fail(data?.message || "Failed to delete district", data);
    if (revalidate) revalidatePath(revalidate);
    return ok(data?.message || "District deleted", data);
  } catch (e) {
    return fail(e.message);
  }
}
