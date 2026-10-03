type Settings = Record<string, string | undefined>;

export interface RouteEstimateRequest {
  origin: {
    latitude: number;
    longitude: number;
  };
  destination: string;
  eventStartsAt: string;
}

export interface RouteEstimate {
  durationMinutes: number;
  trafficDurationMinutes: number;
  distanceKm?: number | undefined;
  provider?: string | undefined;
}

export type RouteEstimateResult =
  | { available: true; estimate: RouteEstimate }
  | {
      available: false;
      reason: "not_configured" | "provider_error" | "invalid_response";
    };

function validCoordinate(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function boundedNumber(
  value: unknown,
  min: number,
  max: number,
): number | undefined {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
    ? value
    : undefined;
}

export async function resolveRouteEstimate(
  input: RouteEstimateRequest,
  settings: Settings = process.env,
): Promise<RouteEstimateResult> {
  if (
    !validCoordinate(input.origin.latitude, input.origin.longitude) ||
    !input.destination.trim() ||
    !Number.isFinite(Date.parse(input.eventStartsAt))
  ) {
    return { available: false, reason: "invalid_response" };
  }

  const endpoint = settings["TAKATAK_ROUTE_MATRIX_URL"]?.trim();
  const token = settings["TAKATAK_ROUTE_SERVICE_TOKEN"]?.trim();

  if (!endpoint || !token) {
    return { available: false, reason: "not_configured" };
  }

  let url: URL;
  try {
    url = new URL(endpoint);
    if (url.protocol !== "https:") {
      return { available: false, reason: "not_configured" };
    }
  } catch {
    return { available: false, reason: "not_configured" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tenant: "ahmverdun",
        source: "phone-smart-departure",
        mode: "driving",
        origin: input.origin,
        destination: {
          address: input.destination,
        },
        eventStartsAt: input.eventStartsAt,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return { available: false, reason: "provider_error" };
    }

    const value = (await response.json()) as Record<string, unknown>;
    const durationMinutes = boundedNumber(
      value["durationMinutes"],
      1,
      1440,
    );
    const trafficDurationMinutes =
      boundedNumber(value["trafficDurationMinutes"], 1, 1440) ??
      durationMinutes;
    const distanceKm = boundedNumber(value["distanceKm"], 0, 5000);
    const provider =
      typeof value["provider"] === "string"
        ? value["provider"].slice(0, 80)
        : undefined;

    if (!durationMinutes || !trafficDurationMinutes) {
      return { available: false, reason: "invalid_response" };
    }

    return {
      available: true,
      estimate: {
        durationMinutes,
        trafficDurationMinutes,
        distanceKm,
        provider,
      },
    };
  } catch (error) {
    console.error("[AHMV smart departure route provider]", error);
    return { available: false, reason: "provider_error" };
  }
}

export function arrivalBufferMinutes(
  settings: Settings = process.env,
) {
  const parsed = Number(
    settings["AHMV_DEPARTURE_ARRIVAL_BUFFER_MINUTES"] ?? "30",
  );
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 180
    ? parsed
    : 30;
}

export function recommendedDepartureAt(input: {
  eventStartsAt: string;
  trafficDurationMinutes: number;
  arrivalBufferMinutes: number;
}) {
  const startsAt = Date.parse(input.eventStartsAt);
  if (
    !Number.isFinite(startsAt) ||
    !Number.isFinite(input.trafficDurationMinutes) ||
    !Number.isFinite(input.arrivalBufferMinutes)
  ) {
    return null;
  }

  return new Date(
    startsAt -
      (input.trafficDurationMinutes + input.arrivalBufferMinutes) * 60_000,
  ).toISOString();
}
