"use client";

import { useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  lookupIndianPincode,
  reverseGeocodeFromCoords,
  getCurrentPosition,
} from "@/utils/shippingLocation";

export function useShippingLocation(setShippingAddress) {
  const [locating, setLocating] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const lastLookupPincode = useRef("");

  const applyLocationPatch = useCallback(
    (patch) => {
      setShippingAddress((prev) => ({
        ...prev,
        pincode: patch.pincode ?? prev.pincode,
        city: patch.city ?? prev.city,
        state: patch.state ?? prev.state,
        area: patch.area ?? prev.area,
        locationConfirmed: false,
      }));
    },
    [setShippingAddress]
  );

  const lookupPincode = useCallback(
    async (pincode, { force = false } = {}) => {
      const cleaned = String(pincode).replace(/\D/g, "");
      if (cleaned.length !== 6) {
        toast.error("Enter a 6-digit pincode.");
        return;
      }
      if (!force && lastLookupPincode.current === cleaned) return;

      setPincodeLoading(true);
      lastLookupPincode.current = cleaned;
      try {
        const result = await lookupIndianPincode(cleaned);
        if (!result?.city || !result?.state) {
          toast.error("Could not find details for this pincode.");
          lastLookupPincode.current = "";
          return;
        }
        applyLocationPatch(result);
        toast.success("Please confirm your area is correct.");
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Pincode lookup failed. Please try again.";
        toast.error(msg);
        lastLookupPincode.current = "";
      } finally {
        setPincodeLoading(false);
      }
    },
    [applyLocationPatch]
  );

  const onPincodeChange = useCallback(
    (value) => {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      if (digits.length === 6) {
        setShippingAddress((prev) => ({ ...prev, pincode: digits }));
        lookupPincode(digits);
        return;
      }
      lastLookupPincode.current = "";
      setShippingAddress((prev) => ({
        ...prev,
        pincode: digits,
        area: "",
        city: "",
        state: "",
        locationConfirmed: false,
      }));
    },
    [setShippingAddress, lookupPincode]
  );

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const result = await reverseGeocodeFromCoords(latitude, longitude);
      if (!result?.city && !result?.state) {
        toast.error("Could not resolve your location. Try pincode instead.");
        return;
      }
      applyLocationPatch(result);
      if (result.pincode?.length === 6) {
        lastLookupPincode.current = result.pincode;
      }
      toast.success("Please confirm your area is correct.");
    } catch (err) {
      const code = err?.code;
      if (code === 1) {
        toast.error("Location permission denied. Use pincode or enter manually.");
      } else if (code === 2) {
        toast.error("Location unavailable. Try pincode instead.");
      } else if (code === 3) {
        toast.error("Location request timed out. Try again.");
      } else {
        toast.error(err?.message || "Could not get your location.");
      }
    } finally {
      setLocating(false);
    }
  }, [applyLocationPatch]);

  return {
    locating,
    pincodeLoading,
    onPincodeChange,
    lookupPincode,
    useCurrentLocation,
  };
}
