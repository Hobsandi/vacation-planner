/** "Berlin, Germany" → "berlin", "Malmö" → "malmo". Compares the part before the first comma. */
export function cityKey(place: string): string {
  return place
    .split(",")[0]
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, ""); // strip accents left over by NFD
}

export function sameCity(a: string, b: string): boolean {
  return cityKey(a) !== "" && cityKey(a) === cityKey(b);
}
