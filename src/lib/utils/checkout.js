// Simple helpers to pass order data from BuyTicket page -> Payment page
const KEY = "CT_PENDING_ORDER_V1";

export function savePendingOrder(order) {
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(KEY, JSON.stringify(order));
    }
  } catch {}
}

export function loadPendingOrder() {
  try {
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    }
  } catch {}
  return null;
}

export function clearPendingOrder() {
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(KEY);
    }
  } catch {}
}
