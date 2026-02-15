import type { VercelRequest, VercelResponse } from '@vercel/node';
import { redis } from './_redis';
import type { AppUser } from '../types';
import { generateSeedState } from '../utils/seedData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const users = await redis.get<AppUser[]>('users') ?? [];
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { name } = req.body as { name?: string };
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = crypto.randomUUID();
    const newUser: AppUser = {
      id,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    const users = await redis.get<AppUser[]>('users') ?? [];
    users.push(newUser);
    await redis.set('users', users);

    const seedState = generateSeedState();
    await redis.set(`user:${id}:state`, seedState);

    return res.status(201).json(newUser);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
