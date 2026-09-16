/** Content-addressed hashing for sealed receipts. */

export function fnv1a(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function chainHash(prev: string, body: string): string {
  return fnv1a(`${prev}|${body}`);
}

export function shaLike(input: string): string {
  // Lightweight content address (fnv cascade) for sealed payloads / bundles.
  return fnv1a(input) + fnv1a(`:${input}:shadowbook`);
}

export function stableId(prefix: string, body: string): string {
  return `${prefix}_${fnv1a(body)}`;
}
