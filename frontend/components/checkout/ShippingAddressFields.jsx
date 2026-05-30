"use client";

import { useState } from "react";
import { MapPin, Loader2, Navigation, Search, Check, Pencil } from "lucide-react";
import { useShippingLocation } from "@/hooks/useShippingLocation";
import { isShippingAddressReady, isShippingLocationComplete } from "@/utils/shippingAddress";

const inputClass =
  "w-full rounded-xl border border-[#d9b06d]/35 bg-white px-3 py-2 text-sm outline-none focus:border-[#7c3ea0]/50";

/**
 * Pincode / GPS fills area, city, state → user confirms or edits → house & landmark.
 */
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
  const canEnterHouse = isShippingAddressReady(shippingAddress);

  const confirmLocation = () => {
    if (!locationFilled) return;
    setIsEditingLocation(false);
    setShippingAddress((s) => ({ ...s, locationConfirmed: true }));
  };

  const startEditingLocation = () => {
    setIsEditingLocation(true);
    setShippingAddress((s) => ({ ...s, locationConfirmed: false }));
  };

  const saveEditedLocation = () => {
    if (!locationFilled) return;
    setIsEditingLocation(false);
    setShippingAddress((s) => ({ ...s, locationConfirmed: true }));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[#6b4a2f]/80 flex items-center gap-1">
          <MapPin size={12} />
          Delivery address
        </p>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1 rounded-full border border-[#7c3ea0]/40 bg-[#f8eddc]/60 px-2.5 py-1 text-[11px] font-medium text-[#4d1f73] hover:bg-[#f8eddc] transition disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Navigation size={11} />
          )}
          Use current location
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="shipping-pincode"
            inputMode="numeric"
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
            placeholder="Pincode *"
            maxLength={6}
            className={inputClass}
          />
          {pincodeLoading && (
            <Loader2
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#7c3ea0]"
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => lookupPincode(shippingAddress.pincode, { force: true })}
          disabled={pincodeLoading || shippingAddress.pincode?.length !== 6}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#7c3ea0]/40 px-3 py-2 text-xs font-medium text-[#4d1f73] hover:bg-[#f8eddc]/60 disabled:opacity-50"
          title="Find address by pincode"
        >
          <Search size={14} />
          Find
        </button>
      </div>

      {!locationFilled && (
        <p className="text-[11px] text-[#6b4a2f]/65">
          Enter pincode and tap Find, or use current location.
        </p>
      )}

      {locationFilled && isEditingLocation && (
        <div className="space-y-2 rounded-xl border border-[#7c3ea0]/30 bg-white p-3">
          <p className="text-xs font-medium text-[#4d1f73]">Edit your delivery area</p>
          <input
            value={shippingAddress.area}
            onChange={(e) =>
              setShippingAddress((s) => ({ ...s, area: e.target.value, locationConfirmed: false }))
            }
            placeholder="Area / locality *"
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={shippingAddress.city}
              onChange={(e) =>
                setShippingAddress((s) => ({ ...s, city: e.target.value, locationConfirmed: false }))
              }
              placeholder="City *"
              className={inputClass}
            />
            <input
              value={shippingAddress.state}
              onChange={(e) =>
                setShippingAddress((s) => ({ ...s, state: e.target.value, locationConfirmed: false }))
              }
              placeholder="State *"
              className={inputClass}
            />
          </div>
          <button
            type="button"
            onClick={saveEditedLocation}
            disabled={!isShippingLocationComplete(shippingAddress)}
            className="w-full rounded-full border border-[#7c3ea0]/50 bg-[#f8eddc]/80 py-2 text-xs font-semibold text-[#4d1f73] hover:bg-[#f8eddc] disabled:opacity-50"
          >
            Save & confirm
          </button>
        </div>
      )}

      {locationFilled && !isEditingLocation && !locationConfirmed && (
        <div className="space-y-3 rounded-xl border border-[#d9b06d]/35 bg-[#f8eddc]/40 p-3">
          <p className="text-sm font-medium text-[#2f0f45]">Is this delivery area correct?</p>
          <div className="text-sm text-[#5d3a22]">
            <p>{shippingAddress.area}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmLocation}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-[linear-gradient(135deg,#4d1f73,#7c3ea0)] py-2 text-xs font-semibold text-[#fff0d7]"
            >
              <Check size={14} />
              Yes, correct
            </button>
            <button
              type="button"
              onClick={startEditingLocation}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-[#7c3ea0]/45 py-2 text-xs font-semibold text-[#4d1f73] hover:bg-white/80"
            >
              <Pencil size={13} />
              No, edit
            </button>
          </div>
        </div>
      )}

      {locationFilled && !isEditingLocation && locationConfirmed && (
        <div className="flex items-start justify-between gap-2 rounded-xl border border-emerald-600/25 bg-emerald-50/50 p-3 text-sm text-[#5d3a22]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/80 mb-1">
              Delivery area confirmed
            </p>
            <p>{shippingAddress.area}</p>
            <p>
              {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
            </p>
          </div>
          <button
            type="button"
            onClick={startEditingLocation}
            className="shrink-0 text-[11px] font-medium text-[#4d1f73] underline underline-offset-2"
          >
            Edit
          </button>
        </div>
      )}

      <input
        id="shipping-house"
        value={shippingAddress.houseLandmark}
        onChange={(e) =>
          setShippingAddress((s) => ({ ...s, houseLandmark: e.target.value }))
        }
        placeholder={
          canEnterHouse
            ? "House no. & landmark *"
            : "Confirm delivery area above first"
        }
        className={inputClass}
        disabled={!canEnterHouse}
      />

      {includeContactFields && (
        <>
          <input
            type="email"
            id="shipping-email"
            value={shippingAddress.email}
            onChange={(e) => setShippingAddress((s) => ({ ...s, email: e.target.value }))}
            placeholder="Email Address *"
            className={inputClass}
          />
          <input
            type="tel"
            id="shipping-phone"
            value={shippingAddress.phone}
            onChange={(e) =>
              setShippingAddress((s) => ({
                ...s,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              }))
            }
            placeholder="Phone Number *"
            maxLength={10}
            className={inputClass}
          />
        </>
      )}
    </div>
  );
}
