export function emptyShippingForm() {
  return {
    houseLandmark: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
    phone: "",
    locationConfirmed: false,
  };
}

/** Merge house/landmark + area into `street` for the order API. */
export function formatShippingForOrder(form) {
  const house = (form.houseLandmark || "").trim();
  const area = (form.area || "").trim();
  const street = [house, area].filter(Boolean).join(", ");

  return {
    street,
    city: (form.city || "").trim(),
    state: (form.state || "").trim(),
    pincode: (form.pincode || "").trim(),
    email: (form.email || "").trim(),
    phone: (form.phone || "").trim(),
  };
}

export function isShippingLocationComplete(form) {
  return Boolean(
    form.pincode?.length === 6 &&
      form.city?.trim() &&
      form.state?.trim() &&
      form.area?.trim()
  );
}

export function isShippingAddressReady(form) {
  return isShippingLocationComplete(form) && Boolean(form.locationConfirmed);
}
