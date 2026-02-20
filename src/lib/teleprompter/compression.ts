import LZString from "lz-string";

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  LZString;

const LS_PREFIX = "teleprompter:";
const URL_PARAM_MAX = 8000;

export function encodeText(text: string): string {
  const compressed = compressToEncodedURIComponent(text);

  if (compressed.length <= URL_PARAM_MAX) {
    return `/teleprompter/practice?t=${compressed}`;
  }

  const id = crypto.randomUUID();
  try {
    localStorage.setItem(LS_PREFIX + id, text);
  } catch {
    // localStorage full — fall back to URL anyway (may truncate on very old browsers)
    return `/teleprompter/practice?t=${compressed}`;
  }
  return `/teleprompter/practice?ref=${id}`;
}

export function decodeText(url: URL): string | null {
  const t = url.searchParams.get("t");
  if (t) {
    const decoded = decompressFromEncodedURIComponent(t);
    if (decoded) return decoded;
  }

  const ref = url.searchParams.get("ref");
  if (ref) {
    const stored = localStorage.getItem(LS_PREFIX + ref);
    if (stored) {
      localStorage.removeItem(LS_PREFIX + ref);
      return stored;
    }
  }

  const raw = url.searchParams.get("text");
  if (raw) return raw;

  return null;
}

export function isEmbedMode(url: URL): boolean {
  return url.searchParams.get("embed") === "true";
}
