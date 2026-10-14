// Local data for Uppsala: municipal open data, UL traffic disruptions and Trafiklab journeys.
import type { CityProvider, LocalSource } from "./types";
import { countLayer, names, queryLayer } from "./arcgis";
import { resrobotJourney } from "./resrobot";

// Uppsala kommun open data (https://opendata.uppsala.se) – ArcGIS layers, no key needed.
// The nature layers live on a second server that is sometimes down; failed layers are just skipped.
const MAP = "https://kartportal.uppsala.se/mapping/rest/services/iExternaKartan";
// Stora torget – used to tell what is in the city and what needs a bus or car.
const CENTRE = { lat: 59.8586, lng: 17.6389 };
const NATURE = "https://kartportal.uppsala.se/geosecma_fce/rest/services/iExternaKartan/ParkNaturFriluft/MapServer";

const LAYERS: { label: string; url: string; extra?: (row: Record<string, unknown>) => string }[] = [
  { label: "Nature reserves and outdoor areas", url: `${NATURE}/55` },
  { label: "Hiking trails", url: `${NATURE}/80` },
  { label: "Linnaeus trails (Linnéstigar)", url: `${NATURE}/65` },
  { label: "Swimming spots", url: `${NATURE}/70` },
  { label: "Bird towers and viewpoints", url: `${NATURE}/69` },
  { label: "Wind shelters", url: `${NATURE}/56` },
  { label: "Rest cabins", url: `${NATURE}/62` },
  { label: "Ski trails", url: `${NATURE}/60` },
  { label: "Ice-skating trails", url: `${NATURE}/59` },
  { label: "Mountain-bike trails", url: `${NATURE}/64` },
  {
    label: "Running/walking tracks",
    url: `${MAP}/IdrottFritid/MapServer/86`,
    extra: (r) => [r.LANGD && `length ${r.LANGD}`, r.UTGAR_FRAN && `starts at ${r.UTGAR_FRAN}`].filter(Boolean).join(", "),
  },
  ...[0, 4, 5, 6, 7].map((i) => ({ label: "Public art walks", url: `${MAP}/Kultur/MapServer/${i}` })),
];

const openData: LocalSource = {
  name: "Uppsala kommun öppna data",
  url: "https://opendata.uppsala.se/",
  async load({ signal }) {
    const results = await Promise.allSettled(LAYERS.map((l) => queryLayer(l.url, CENTRE, signal)));
    const byLabel = new Map<string, string[]>();
    results.forEach((r, i) => {
      if (r.status !== "fulfilled") return;
      const list = byLabel.get(LAYERS[i].label) ?? [];
      list.push(...names(r.value.rows, r.value.nameField, LAYERS[i].extra));
      byLabel.set(LAYERS[i].label, list);
    });
    const facts = [...byLabel]
      .filter(([, list]) => list.length > 0)
      .map(([label, list]) => `${label}: ${[...new Set(list)].slice(0, 15).join("; ")}`);

    const pumps = await countLayer("https://kartportal.uppsala.se/mapping/rest/services/iOpenData/Trafik_Cykelpumpar/MapServer/0", signal).catch(() => 0);
    if (pumps > 0) facts.push(`There are ${pumps} free public air pumps for bicycle tyres around the city (for bikes only – not drinking water). Uppsala is a cycling city.`);
    return facts;
  },
};

// UL (Upplands Lokaltrafik) – the regional bus/train operator. Undocumented endpoint used by ul.se itself,
// so it may change without notice; failures are skipped.
type Deviation = {
  title?: string;
  header?: string;
  severity?: number;
  scopes?: { from?: string; to?: string; stops?: { name?: string }[]; lines?: { name?: string; description?: string }[] }[];
};

const ulDisruptions: LocalSource = {
  name: "UL trafikinformation",
  url: "https://www.ul.se/trafikinformation/",
  async load({ request, signal }) {
    const res = await fetch("https://www.ul.se/api/deviations/pull/", { signal, next: { revalidate: 60 * 15 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = Array.isArray(json) ? json[0] : json;
    const all: Deviation[] = [...(data?.currentBusDeviations ?? []), ...(data?.currentTrainDeviations ?? [])];

    // Keep disruptions in Uppsala that overlap the trip dates.
    const tripStart = `${request.startDate}T00:00:00Z`;
    const tripEnd = `${request.endDate}T23:59:59Z`;
    const relevant = all.filter((d) =>
      (d.scopes ?? []).some(
        (s) =>
          (!s.from || s.from <= tripEnd) &&
          (!s.to || s.to >= tripStart) &&
          /uppsala/i.test(JSON.stringify([s.stops, s.lines])),
      ),
    );
    return relevant
      .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))
      .slice(0, 6)
      .map((d) => {
        const lines = [...new Set((d.scopes ?? []).flatMap((s) => (s.lines ?? []).map((l) => l.name)).filter(Boolean))];
        return `Disruption during the trip${lines.length ? ` (line ${lines.slice(0, 4).join(", ")})` : ""}: ${d.title ?? d.header}`;
      });
  },
};

export const uppsala: CityProvider = {
  city: "Uppsala",
  names: ["uppsala"],
  sources: [openData, ulDisruptions, resrobotJourney("Uppsala Centralstation")],
};
