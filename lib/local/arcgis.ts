// Helper for ArcGIS MapServer layers – the format most Swedish municipal open-data portals use.

type Attributes = Record<string, unknown>;

const DAY = 60 * 60 * 24;

/** Returns the attribute rows of a layer (no geometry). Throws if the service is down. */
export async function queryLayer(layerUrl: string, signal: AbortSignal, limit = 50): Promise<{ rows: Attributes[]; nameField: string }> {
  const url = `${layerUrl}/query?where=1%3D1&outFields=*&returnGeometry=false&resultRecordCount=${limit}&f=json`;
  const res = await fetch(url, { signal, next: { revalidate: DAY } });
  if (!res.ok) throw new Error(`${layerUrl}: HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`${layerUrl}: ${json.error.message}`);
  return {
    rows: (json.features ?? []).map((f: { attributes: Attributes }) => f.attributes),
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

/** Distinct, non-empty display names of a layer, e.g. ["Nåntuna-Vilan", ...]. */
export function names(rows: Attributes[], nameField: string, extra?: (row: Attributes) => string): string[] {
  const out = new Set<string>();
  for (const row of rows) {
    const name = String(row[nameField] ?? row.NAMN ?? row.Namn ?? "").trim();
    if (!name) continue;
    const detail = extra?.(row);
    out.add(detail ? `${name} (${detail})` : name);
  }
  return [...out];
}
