export function emptyShippingForm() {
  return {
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
    phone: "",
    locationConfirmed: false,
    // legacy fields kept for backward compat
    houseLandmark: "",
    area: "",
  };
}

/** Merge all address parts into the street field for the order API. */
export function formatShippingForOrder(form) {
  const nameParts = [form.firstName?.trim(), form.lastName?.trim()].filter(Boolean);
  const fullName = nameParts.join(" ");

  const streetParts = [
    form.address?.trim(),
    form.apartment?.trim(),
    form.houseLandmark?.trim(),
    form.area?.trim(),
  ].filter(Boolean);
  const street = streetParts.join(", ");

  return {
    name: fullName || undefined,
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
      // Accept either new address field or legacy area field
      (form.address?.trim() || form.area?.trim())
  );
}

export function isShippingAddressReady(form) {
  return isShippingLocationComplete(form) && Boolean(form.locationConfirmed);
}
