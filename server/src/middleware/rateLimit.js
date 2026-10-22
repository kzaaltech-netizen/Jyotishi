// Small in-memory rate limiter for sensitive endpoints (sign-in, sign-up, guest
// sessions). Keyed by client IP. Each server instance counts on its own, which is
// enough to slow down password guessing; it is not a substitute for a shared store.

const buckets = new Map();

// Client headers can be forged, so they are trusted only behind Vercel's proxy,
// which overwrites them with the real client address.
export function clientIp(req) {
  if (process.env.VERCEL) {
    const forwarded = req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function rateLimit({ name, windowMs, max, message }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${name}:${clientIp(req)}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.reset <= now) {
      bucket = { count: 0, reset: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.ceil((bucket.reset - now) / 1000));
      return res.status(429).json({ error: message, code: 'RATE_LIMITED' });
    }
    next();
  };
}

// Drop expired buckets now and then so memory does not grow.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.reset <= now) buckets.delete(key);
}, 60_000).unref();
