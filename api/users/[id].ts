import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppUser } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[api/users/[id]] Handling ${req.method} request for ID:`, req.query.id);
  
  try {
    const { redis } = await import('../../lib/redis');
    const { id } = req.query;
    
    if (typeof id !== 'string') {
      console.error('[api/users/[id]] Invalid ID:', id);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (req.method === 'DELETE') {
      console.log('[api/users/[id]] Deleting user:', id);
      const users = (await redis.get<AppUser[]>('users')) ?? [];
      const filtered = users.filter(u => u.id !== id);

      if (filtered.length === users.length) {
        console.warn('[api/users/[id]] User not found for deletion:', id);
        return res.status(404).json({ error: 'User not found' });
      }

      await redis.set('users', filtered);
      await redis.del(`user:${id}:state`);

      console.log('[api/users/[id]] User deleted successfully:', id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/users/[id]] Uncaught error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({
      error: 'Internal server error',
      message: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
}
