const STORAGE_KEY = "ruva_guest_order_tracking";

export function saveGuestOrderTracking({ order_id, guest_order_token, guest_email }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      order_id,
      guest_order_token,
      guest_email,
      savedAt: Date.now(),
    })
  );
}

export function getGuestOrderTracking() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearGuestOrderTracking() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
