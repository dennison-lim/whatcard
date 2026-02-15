import { Redis } from '@upstash/redis';

/**
 * Creates a Redis client using the best available environment variables.
 * Vercel KV (legacy) used KV_REST_API_*, while Upstash uses UPSTASH_REDIS_REST_*.
 */
export function getRedisClient() {
  // Try to use fromEnv() first as it's optimized for Vercel/Upstash
  // but we provide explicit fallbacks to ensure it works regardless of which 
  // env var naming convention is active in project settings.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    console.error('[Redis] Missing credentials. URL exists:', !!url, 'Token exists:', !!token);
    throw new Error('Redis credentials missing. Please check Vercel environment variables.');
  }

  try {
    return new Redis({
      url,
      token,
      // In some serverless environments, retry strategy helps with cold starts
      retry: {
        retries: 3,
        backoff: (retryCount) => Math.exp(retryCount) * 50,
      },
    });
  } catch (err) {
    console.error('[Redis] Initialization error:', err);
    throw err;
  }
}
