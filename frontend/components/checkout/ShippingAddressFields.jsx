"use client";

import { useState } from "react";
import { MapPin, Loader2, Navigation, Search, Check, Pencil } from "lucide-react";
import { useShippingLocation } from "@/hooks/useShippingLocation";
import { isShippingLocationComplete } from "@/utils/shippingAddress";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const inputCls =
  "w-full border-0 border-b border-gray-200 bg-transparent px-0 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-600 transition-colors";
const labelCls = "absolute left-0 top-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider pointer-events-none";

function FloatingField({ label, children }) {
  return (
    <div className="relative pt-4 pb-1">
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}

export default function ShippingAddressFields({
  shippingAddress,
  setShippingAddress,
  includeContactFields = true,
}) {
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const {
    locating,
    pincodeLoading,
    onPincodeChange,
    lookupPincode,
    useCurrentLocation,
  } = useShippingLocation(setShippingAddress);

  const locationFilled = isShippingLocationComplete(shippingAddress);
  const locationConfirmed = Boolean(shippingAddress.locationConfirmed);

  const set = (field) => (e) =>
    setShippingAddress((s) => ({ ...s, [field]: e.target.value }));

  const confirmLocation = () => {
    if (!locationFilled) return;
    setIsEditingLocation(false);
    setShippingAddress((s) => ({ ...s, locationConfirmed: true }));
  };

  const startEditing = () => {
    setIsEditingLocation(true);
    setShippingAddress((s) => ({ ...s, locationConfirmed: false }));
  };

  return (
    <div className="space-y-0">

      {/* ── Contact ── */}
      {includeContactFields && (
        <>
          <FloatingField label="Email">
            <input
              id="shipping-email"
              type="email"
              value={shippingAddress.email}
              onChange={set("email")}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputCls}
            />
          </FloatingField>
          <div className="h-px bg-gray-100 my-3" />
        </>
      )}

      {/* ── Delivery header ── */}
      <p className="text-base font-semibold text-gray-800 pt-2 pb-1">Delivery</p>

      {/* Country (static) */}
      <FloatingField label="Country / Region">
        <div className={`${inputCls} flex items-center justify-between cursor-default`}>
          <span>India</span>
          <span className="text-gray-400">🇮🇳</span>
        </div>
      </FloatingField>

      {/* First / Last name */}
      <div className="grid grid-cols-2 gap-4">
        <FloatingField label="First name">
          <input
            id="shipping-firstname"
            type="text"
            value={shippingAddress.firstName || ""}
            onChange={set("firstName")}
            placeholder="Priya"
            autoComplete="given-name"
            className={inputCls}
          />
        </FloatingField>
        <FloatingField label="Last name">
          <input
            id="shipping-lastname"
            type="text"
            value={shippingAddress.lastName || ""}
            onChange={set("lastName")}
            placeholder="Sharma"
            autoComplete="family-name"
            className={inputCls}
          />
        </FloatingField>
      </div>

      {/* Address + GPS lookup */}
      <FloatingField label="Address">
        <div className="flex items-end gap-2">
          <input
            id="shipping-address"
            type="text"
            value={shippingAddress.address || ""}
            onChange={set("address")}
            placeholder="House no., Street, Area"
            autoComplete="street-address"
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            title="Use current location"
            className="shrink-0 mb-2 text-[#4d1f73] hover:text-[#7c3ea0] transition disabled:opacity-50"
          >
            {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          </button>
        </div>
      </FloatingField>

      {/* Apartment (optional) */}
      <FloatingField label="Apartment, suite, etc. (optional)">
        <input
          id="shipping-apartment"
          type="text"
          value={shippingAddress.apartment || ""}
          onChange={set("apartment")}
          placeholder="Flat 4B, Tower C"
          autoComplete="address-line2"
          className={inputCls}
        />
      </FloatingField>

      {/* City */}
      <FloatingField label="City">
        <input
          id="shipping-city"
          type="text"
          value={shippingAddress.city}
          onChange={set("city")}
          placeholder="Bengaluru"
          autoComplete="address-level2"
          className={inputCls}
        />
      </FloatingField>

      {/* State + PIN */}
      <div className="grid grid-cols-2 gap-4">
        <FloatingField label="State">
          <select
            id="shipping-state"
            value={shippingAddress.state}
            onChange={set("state")}
            className={`${inputCls} appearance-none cursor-pointer`}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FloatingField>

        <FloatingField label="PIN code">
          <div className="flex items-end gap-1">
            <input
              id="shipping-pincode"
              inputMode="numeric"
              maxLength={6}
              value={shippingAddress.pincode}
              onChange={(e) => {
                setIsEditingLocation(false);
                onPincodeChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  lookupPincode(shippingAddress.pincode, { force: true });
                }
              }}
              placeholder="560001"
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={() => lookupPincode(shippingAddress.pincode, { force: true })}
              disabled={pincodeLoading || shippingAddress.pincode?.length !== 6}
              className="shrink-0 mb-2 text-[#4d1f73] hover:text-[#7c3ea0] transition disabled:opacity-40"
              title="Look up PIN code"
            >
              {pincodeLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            </button>
          </div>
        </FloatingField>
      </div>

      {/* PIN auto-fill confirmation */}
      {locationFilled && !isEditingLocation && !locationConfirmed && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-gray-700">
          <p className="font-medium text-gray-800 mb-1">Confirm delivery area</p>
          <p className="text-xs text-gray-500 mb-3">
            {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={confirmLocation}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#4d1f73] py-1.5 text-xs font-semibold text-white">
              <Check size={13} /> Yes, correct
            </button>
            <button type="button" onClick={startEditing}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 py-1.5 text-xs font-semibold text-gray-600">
              <Pencil size={12} /> Edit
            </button>
          </div>
        </div>
      )}

      {locationFilled && locationConfirmed && !isEditingLocation && (
        <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs text-gray-600">
          <span>
            <span className="font-semibold text-emerald-700">✓ Area confirmed:</span>{" "}
            {shippingAddress.city}, {shippingAddress.state}
          </span>
          <button type="button" onClick={startEditing}
            className="text-[#4d1f73] underline underline-offset-2 font-medium">
            Edit
          </button>
        </div>
      )}

      {/* Phone */}
      <FloatingField label="Phone">
        <div className="flex items-end gap-2">
          <span className="mb-2.5 shrink-0 text-sm text-gray-500">🇮🇳 +91</span>
          <input
            id="shipping-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={shippingAddress.phone}
            onChange={(e) =>
              setShippingAddress((s) => ({
                ...s,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              }))
            }
            placeholder="98765 43210"
            autoComplete="tel-national"
            className={`${inputCls} flex-1`}
          />
        </div>
      </FloatingField>

    </div>
  );
}
