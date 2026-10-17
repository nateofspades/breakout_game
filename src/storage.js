export function read(storage, key, fallback) {
  try {
    const raw = storage?.getItem("prism-break." + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
export function write(storage, key, value) {
  try {
    storage?.setItem("prism-break." + key, JSON.stringify(value));
    return Boolean(storage);
  } catch {
    return false;
  }
}
export function record(storage, score) {
  const old = read(storage, "best", 0);
  const best = Math.max(Number.isFinite(old) && old >= 0 ? old : 0, score);
  write(storage, "best", best);
  return best;
}
