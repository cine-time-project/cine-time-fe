"use client";

import { http, authHeaders } from "@/lib/utils/http";
import {
  // Assignments
  SPECIALHALL_ASSIGNMENTS_API,
  specialHallAssignmentByIdApi,
  // Types
  SPECIALHALL_TYPES_API,
  // Halls (aux list)
  HALL_LIST_API,
} from "@/helpers/api-routes";

/* ------------------------------- helpers ------------------------------- */
const unwrap = (r) => r?.data?.returnBody ?? r?.data ?? null;
const qp = (page = 0, size = 20, sort = "id,asc") => ({ page, size, sort });
const reqOpts = () => ({ ...authHeaders() });
const emptyPage = (page = 0, size = 20) => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: page,
  size,
});

/* ============================== ASSIGNMENTS ============================== */
/** Page<List<SpecialHallResponse>> */
export async function fetchSpecialHalls({ page = 0, size = 20, sort = "id,desc" } = {}) {
  try {
    const r = await http.get(SPECIALHALL_ASSIGNMENTS_API, {
      params: { page, size, sort },
      ...reqOpts(),
    });
    const body = unwrap(r);
    if (Array.isArray(body?.content)) return body;
    if (Array.isArray(body)) {
      return {
        content: body,
        totalElements: body.length,
        totalPages: 1,
        number: 0,
        size: body.length,
      };
    }
    return emptyPage(page, size);
  } catch (err) {
    const code = err?.response?.status;
    const msg = err?.response?.data?.message || err?.message || "Listeleme başarısız";
    if (code === 401 || code === 403) throw new Error(`Erişim reddedildi (${code}). ${msg}`);
    throw new Error(msg);
  }
}

export async function fetchSpecialHallById(id) {
  try {
    const r = await http.get(specialHallAssignmentByIdApi(id), { ...reqOpts() });
    return unwrap(r) ?? null;
  } catch {
    return null;
  }
}

export async function createSpecialHall(payload /* { hallId, typeId } */) {
  try {
    const r = await http.post(SPECIALHALL_ASSIGNMENTS_API, payload, { ...reqOpts() });
    return unwrap(r);
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Special hall oluşturma başarısız"
    );
  }
}

export async function updateSpecialHall(id, payload /* { hallId, typeId } */) {
  try {
    const r = await http.put(specialHallAssignmentByIdApi(id), payload, { ...reqOpts() });
    return unwrap(r);
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Special hall güncelleme başarısız"
    );
  }
}

export async function deleteSpecialHall(id) {
  try {
    const r = await http.delete(specialHallAssignmentByIdApi(id), { ...reqOpts() });
    return unwrap(r);
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Special hall silme başarısız"
    );
  }
}

/* ================================= TYPES ================================= */
/** List<SpecialHallTypeResponse> */
export async function fetchSpecialHallTypes({ page = 0, size = 200, sort = "name,asc" } = {}) {
  try {
    const r = await http.get(SPECIALHALL_TYPES_API, {
      params: qp(page, size, sort),
      ...reqOpts(),
    });
    const body = unwrap(r);
    if (Array.isArray(body?.content)) return body.content;
    if (Array.isArray(body)) return body;
    return [];
  } catch {
    return [];
  }
}

/** { id, name, priceDiffPercent, ... } */
export async function createSpecialHallType(payload /* { name, priceDiffPercent } */) {
  try {
    const r = await http.post(SPECIALHALL_TYPES_API, payload, { ...reqOpts() });
    return unwrap(r);
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Özel salon tipi oluşturulamadı"
    );
  }
}

/** { id, name, priceDiffPercent, ... } */
export async function updateSpecialHallType(id, payload /* { name, priceDiffPercent } */) {
  try {
    const url = `${SPECIALHALL_TYPES_API}/${id}`;
    const r = await http.put(url, payload, { ...reqOpts() });
    return unwrap(r);
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Özel salon tipi güncellenemedi"
    );
  }
}

export async function deleteSpecialHallType(id) {
  try {
    const url = `${SPECIALHALL_TYPES_API}/${id}`;
    const r = await http.delete(url, { ...reqOpts() });
    return unwrap(r);
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Özel salon tipi silinemedi"
    );
  }
}

/* ================================= HALLS ================================= */
export async function fetchHalls({ page = 0, size = 200, sort = "id,asc" } = {}) {
  try {
    const r = await http.get(HALL_LIST_API, {
      params: qp(page, size, sort),
      ...reqOpts(),
    });
    const body = unwrap(r);
    if (Array.isArray(body?.content)) return body.content;
    if (Array.isArray(body)) return body;
    return [];
  } catch {
    return [];
  }
}

/* ----------------------------- alias exports ----------------------------- */
// FE tarafında isimler böyle kullanılıyorsa kırılmasın diye alias bırakıyoruz
export { createSpecialHall as createSpecialHallAssignment };
export { updateSpecialHall as updateSpecialHallAssignment };
export { deleteSpecialHall as deleteSpecialHallAssignment };
