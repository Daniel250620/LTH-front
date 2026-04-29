import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache to avoid redundant requests to Nominatim/Photon
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function fetchWithTimeout(url: string, options: any = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing latitude or longitude" },
      { status: 400 }
    );
  }

  const cacheKey = `${lat},${lon}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Returning cached address for ${cacheKey}`);
    return NextResponse.json(cached.data);
  }

  try {
    // 1. Try Nominatim first with a 3s timeout
    try {
      const nominatimResponse = await fetchWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": `LTH-Chatbot-App-${Math.random().toString(36).substring(7)}`,
          },
        },
        3000
      );

      if (nominatimResponse.ok) {
        const data = await nominatimResponse.json();
        if (data.display_name) {
          cache.set(cacheKey, { data, timestamp: Date.now() });
          return NextResponse.json(data);
        }
      }
    } catch (e: any) {
      console.warn(`Nominatim failed: ${e.message}`);
    }

    // 2. Try ArcGIS as a robust fallback (very reliable, no key needed for basic reverse geocode)
    try {
      console.log(`Trying ArcGIS fallback for ${cacheKey}...`);
      const arcgisResponse = await fetchWithTimeout(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${lon},${lat}`,
        {},
        3000
      );

      if (arcgisResponse.ok) {
        const arcgisData = await arcgisResponse.json();
        if (arcgisData.address && arcgisData.address.LongLabel) {
          const data = { display_name: arcgisData.address.LongLabel };
          cache.set(cacheKey, { data, timestamp: Date.now() });
          return NextResponse.json(data);
        }
      }
    } catch (e: any) {
      console.warn(`ArcGIS failed: ${e.message}`);
    }

    // 3. Try Photon (Komoot) as a final backup
    try {
      console.log(`Trying Photon fallback for ${cacheKey}...`);
      const photonResponse = await fetchWithTimeout(
        `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`,
        {},
        3000
      );

      if (photonResponse.ok) {
        const photonData = await photonResponse.json();
        if (photonData.features && photonData.features.length > 0) {
          const props = photonData.features[0].properties;
          const addressParts = [
            props.name,
            props.street,
            props.district,
            props.city,
            props.state,
            props.country
          ].filter(Boolean);
          
          const data = { display_name: addressParts.join(", ") };
          cache.set(cacheKey, { data, timestamp: Date.now() });
          return NextResponse.json(data);
        }
      }
    } catch (e: any) {
      console.warn(`Photon failed: ${e.message}`);
    }

    throw new Error("All geocoding services failed or timed out");
  } catch (error: any) {
    console.error("Geocoding proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}
