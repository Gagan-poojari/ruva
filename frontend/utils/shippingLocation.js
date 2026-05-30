import api from "@/utils/api";

/** India pincode → city, state, area (via backend proxy — avoids browser CORS). */
export async function lookupIndianPincode(pincode) {
  const cleaned = String(pincode).replace(/\D/g, "");
  if (cleaned.length !== 6) return null;

  const { data } = await api.get(`/location/pincode/${cleaned}`);
  return data;
}

/** Browser geolocation → pincode, city, state, area (not house/landmark). */
export async function reverseGeocodeFromCoords(latitude, longitude) {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", "en");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  const areaParts = [
    data.locality,
    data.localityInfo?.administrative?.[2]?.name,
    data.city,
  ].filter(Boolean);
  const area = [...new Set(areaParts)].join(", ");

  return {
    pincode: data.postcode?.replace(/\D/g, "").slice(0, 6) || "",
    city: data.city || data.locality || "",
    state: data.principalSubdivision || "",
    area: area || data.locality || "",
  };
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 60000,
    });
  });
}
