import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const health: any = { ok: true, timestamp: new Date().toISOString() };
  
  try {
    const { redis } = await import('../lib/redis');
    const start = Date.now();
    await redis.ping();
    health.redis = {
      status: 'up',
      latency: `${Date.now() - start}ms`
    };
  } catch (err) {
    health.ok = false;
    health.redis = {
      status: 'down',
      error: err instanceof Error ? err.message : String(err)
    };
  }

  return res.status(health.ok ? 200 : 503).json(health);
}
