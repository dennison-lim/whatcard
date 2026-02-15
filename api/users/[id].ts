import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppUser } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { redis } = await import('../../lib/redis');
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (req.method === 'DELETE') {
      const users = (await redis.get<AppUser[]>('users')) ?? [];
      const filtered = users.filter(u => u.id !== id);

      if (filtered.length === users.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      await redis.set('users', filtered);
      await redis.del(`user:${id}:state`);

      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[api/users/[id]]', err);
    return res.status(503).json({
      error: 'Service unavailable',
      message: message.includes('Missing Redis') ? message : 'Redis unavailable.',
    });
  }
}
