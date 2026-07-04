const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limitPerMinute: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (bucket.count >= limitPerMinute) {
    return false;
  }

  bucket.count += 1;
  return true;
}
