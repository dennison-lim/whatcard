import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    const errorMsg = 'Missing Redis environment variables. Ensure KV_REST_API_URL and KV_REST_API_TOKEN are set.';
    console.error('[Redis Config] Error:', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    _redis = new Redis({
      url,
      token,
    });
    console.log('[Redis Config] Redis client initialized');
    return _redis;
  } catch (err) {
    console.error('[Redis Config] Initialization failed:', err);
    throw err;
  }
}

// Still export the proxy but make it more transparent
export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    const instance = getRedis();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
