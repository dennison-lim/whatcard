import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from '../../redis';
import type { PersistedState } from '../../../utils/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.method === 'GET') {
    const state = await redis.get<PersistedState>(`user:${id}:state`);
    if (!state) {
      return res.status(404).json({ error: 'User state not found' });
    }
    return res.status(200).json(state);
  }

  if (req.method === 'PUT') {
    const state = req.body as PersistedState;
    if (!state || !Array.isArray(state.cards)) {
      return res.status(400).json({ error: 'Invalid state payload' });
    }
    await redis.set(`user:${id}:state`, state);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}
