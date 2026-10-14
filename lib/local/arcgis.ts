// Helper for ArcGIS MapServer layers – the format most Swedish municipal open-data portals use.

type Attributes = Record<string, unknown>;
type Geometry = { x?: number; y?: number; paths?: number[][][]; rings?: number[][][] };
export type Row = { attributes: Attributes; km?: number }; // km = distance from the city centre
export type LatLng = { lat: number; lng: number };

const DAY = 60 * 60 * 24;

/** Distance in km between two points (haversine). */
function distanceKm(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Rough centre of a point, line or area (average of its first path/ring). */
function middle(g?: Geometry): LatLng | null {
  if (!g) return null;
  if (typeof g.x === "number" && typeof g.y === "number") return { lng: g.x, lat: g.y };
  const pts = g.paths?.[0] ?? g.rings?.[0];
  if (!pts?.length) return null;
  return { lng: pts.reduce((s, p) => s + p[0], 0) / pts.length, lat: pts.reduce((s, p) => s + p[1], 0) / pts.length };
}

/** Returns the rows of a layer, each with its distance from `centre`. Throws if the service is down. */
export async function queryLayer(layerUrl: string, centre: LatLng, signal: AbortSignal, limit = 50): Promise<{ rows: Row[]; nameField: string }> {
  // outSR=4326 → GPS coordinates; maxAllowableOffset simplifies long trails so the response stays small.
  const url = `${layerUrl}/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&maxAllowableOffset=0.001&resultRecordCount=${limit}&f=json`;
  const res = await fetch(url, { signal, next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`${layerUrl}: HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`${layerUrl}: ${json.error.message}`);
  return {
    rows: (json.features ?? []).map((f: { attributes: Attributes; geometry?: Geometry }) => {
      const mid = middle(f.geometry);
      return { attributes: f.attributes, km: mid ? distanceKm(centre, mid) : undefined };
    }),
    nameField: json.displayFieldName ?? "NAMN",
  };
}

/** Counts the features in a layer. */
export async function countLayer(layerUrl: string, signal: AbortSignal): Promise<number> {
  const res = await fetch(`${layerUrl}/query?where=1%3D1&returnCountOnly=true&f=json`, { signal, next: { revalidate: DAY } });
  const json = await res.json();
  if (json.error || typeof json.count !== "number") throw new Error(`${layerUrl}: no count`);
  return json.count;
}

/** Where a place is, by distance from the centre. */
function whereIs(km: number): string {
  if (km === Infinity) return "";
  if (km <= 4) return "central, walkable";
  if (km <= 9) return `edge of the city, ${Math.round(km)} km out – city bus or bike`;
  return `${Math.round(km)} km outside the city – needs regional bus or car`;
}

/**
 * Distinct display names, closest first, each tagged with where it is, e.g.
 * "Stadsskogen (length 2,5 km; central, walkable)" or "Fjällnora (length 2,7 km; 16 km outside the city – needs regional bus or car)".
 */
export function names(rows: Row[], nameField: string, extra?: (a: Attributes) => string): string[] {
  // A trail can be split into several features: keep the closest one per name.
  const byName = new Map<string, { a: Attributes; km: number }>();
  for (const { attributes: a, km = Infinity } of rows) {
    const name = String(a[nameField] ?? a.NAMN ?? a.Namn ?? "").trim();
    const seen = byName.get(name);
    if (name && (!seen || km < seen.km)) byName.set(name, { a, km });
  }
  return [...byName]
    .sort((x, y) => x[1].km - y[1].km)
    .map(([name, { a, km }]) => {
      const details = [extra?.(a), whereIs(km)].filter(Boolean).join("; ");
      return details ? `${name} (${details})` : name;
    });
}
