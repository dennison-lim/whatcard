import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { PersistedState } from '../../../utils/storage.js';
import { getRedisClient } from '../../../lib/redis.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  console.log(`[api/users/[id]/state] Handling ${req.method} request for ID:`, id);

  try {
    const redis = getRedisClient();
    
    if (typeof id !== 'string') {
      console.error('[api/users/[id]/state] Invalid ID:', id);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (req.method === 'GET') {
      console.log('[api/users/[id]/state] Fetching state for:', id);
      const state = await redis.get<PersistedState>(`user:${id}:state`);
      if (!state) {
        console.warn('[api/users/[id]/state] State not found for:', id);
        return res.status(404).json({ error: 'User state not found' });
      }
      return res.status(200).json(state);
    }

    if (req.method === 'PUT') {
      const state = req.body as PersistedState;
      console.log('[api/users/[id]/state] Updating state for:', id);
      
      if (!state || !Array.isArray(state.cards)) {
        console.error('[api/users/[id]/state] Invalid payload for:', id);
        return res.status(400).json({ error: 'Invalid state payload' });
      }
      await redis.set(`user:${id}:state`, state);
      console.log('[api/users/[id]/state] State updated successfully for:', id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/users/[id]/state] Uncaught error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({
      error: 'Internal server error',
      message: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
}
