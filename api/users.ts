import type { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppUser } from '../types';
import { generateSeedState } from '../utils/seedData';

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Internal server error';
}

function missingRedisEnv(): boolean {
  return !REDIS_URL || !REDIS_TOKEN;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (missingRedisEnv()) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Missing Redis env: set KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) in Vercel project settings.',
    });
  }
  try {
    const { redis } = await import('../lib/redis');
    return await handle(req, res, redis);
  } catch (err) {
    const message = toMessage(err);
    console.error('[api/users]', err);
    return res.status(503).json({
      error: 'Service unavailable',
      message: message.includes('Missing Redis') ? message : 'Redis unavailable. Check server logs.',
    });
  }
}

async function handle(req: VercelRequest, res: VercelResponse, redis: Redis) {
  if (req.method === 'GET') {
    const users = (await redis.get<AppUser[]>('users')) ?? [];
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

    const users = (await redis.get<AppUser[]>('users')) ?? [];
    users.push(newUser);
    await redis.set('users', users);

    const seedState = generateSeedState();
    await redis.set(`user:${id}:state`, seedState);

    return res.status(201).json(newUser);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
