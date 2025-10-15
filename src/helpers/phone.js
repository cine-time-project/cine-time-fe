export function normalizePhoneForApi(raw) {
  let v = (raw || "").trim().replace(/[^\d+]/g, "");
  return v;
}
