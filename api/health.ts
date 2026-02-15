import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from '../lib/redis';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const redis = getRedisClient();
    const start = Date.now();
    await redis.ping();
    
    return res.status(200).json({
      ok: true,
      redis: 'up',
      latency: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[api/health] Redis check failed:', err);
    return res.status(503).json({
      ok: false,
      redis: 'down',
      error: err instanceof Error ? err.message : String(err)
    });
  }
}
