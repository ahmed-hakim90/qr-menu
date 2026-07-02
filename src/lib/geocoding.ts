const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";
const USER_AGENT = process.env.GEOCODING_USER_AGENT || "qr-menu/1.0";

interface NominatimAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

function formatAddress(address: NominatimAddress | undefined, fallback?: string): string {
  if (!address) return fallback ?? "";

  const parts = [
    [address.house_number, address.road || address.pedestrian || address.footway]
      .filter(Boolean)
      .join(" "),
    address.suburb || address.neighbourhood || address.quarter,
    address.city || address.town || address.village || address.municipality,
    address.state,
    address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : (fallback ?? "");
}

async function nominatimReverse(
  latitude: number,
  longitude: number,
  acceptLanguage: string
): Promise<string> {
  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": acceptLanguage,
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Nominatim request failed (${res.status})`);
  }

  const data = (await res.json()) as NominatimResponse;
  return formatAddress(data.address, data.display_name);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ addressAr: string; addressEn: string }> {
  const addressEn = await nominatimReverse(latitude, longitude, "en");
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const addressAr = await nominatimReverse(latitude, longitude, "ar");

  return {
    addressAr: addressAr || addressEn,
    addressEn: addressEn || addressAr,
  };
}
