"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/dashboard-api";

const MapPicker = dynamic(() => import("./map-picker").then((m) => m.MapPicker), {
  ssr: false,
  loading: () => (
    <div className="h-56 rounded-2xl border border-border/50 bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
  onAddressResolved?: (addresses: { addressAr: string; addressEn: string }) => void;
  onGeocodingChange?: (geocoding: boolean) => void;
}

const DEFAULT_CENTER = { lat: 30.0444, lng: 31.2357 };

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressResolved,
  onGeocodingChange,
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = latitude ?? DEFAULT_CENTER.lat;
  const lng = longitude ?? DEFAULT_CENTER.lng;

  const resolveAddress = async (coords: { latitude: number; longitude: number }) => {
    if (!onAddressResolved) return;

    setGeocoding(true);
    onGeocodingChange?.(true);
    try {
      const addresses = await apiRequest<{ addressAr: string; addressEn: string }>(
        `/api/geocode/reverse?lat=${coords.latitude}&lng=${coords.longitude}`
      );
      onAddressResolved(addresses);
    } catch {
      setError("Could not resolve address for this location. You can enter it manually.");
    } finally {
      setGeocoding(false);
      onGeocodingChange?.(false);
    }
  };

  const handleCoordsChange = (coords: { latitude: number; longitude: number }) => {
    onChange(coords);
    void resolveAddress(coords);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;
    }

    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleCoordsChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setError("Could not get your location. Please pick a point on the map.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Branch Location
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={useCurrentLocation} disabled={locating}>
          <Navigation className="h-4 w-4" />
          {locating ? "Locating..." : "Use my location"}
        </Button>
      </div>

      <MapPicker latitude={lat} longitude={lng} onPick={handleCoordsChange} />

      {geocoding && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Resolving address...
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function googleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
