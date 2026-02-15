import type { Redis } from '@upstash/redis';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppUser } from '../types';
import { generateSeedState } from '../utils/seedData';
import { randomUUID } from 'node:crypto';

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function missingRedisEnv(): boolean {
  return !REDIS_URL || !REDIS_TOKEN;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[api/users] Handling ${req.method} request`);
  
  if (missingRedisEnv()) {
    console.error('[api/users] Missing Redis environment variables');
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Missing Redis env: set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel project settings.',
    });
  }

  try {
    const { redis } = await import('../lib/redis');
    console.log('[api/users] Redis lib imported');
    return await handle(req, res, redis);
  } catch (err) {
    const message = toMessage(err);
    console.error('[api/users] Uncaught error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
}

async function handle(req: VercelRequest, res: VercelResponse, redis: Redis) {
  if (req.method === 'GET') {
    try {
      console.log('[api/users] Fetching users from Redis...');
      const users = (await redis.get<AppUser[]>('users')) ?? [];
      console.log(`[api/users] Found ${users.length} users`);
      return res.status(200).json(users);
    } catch (err) {
      console.error('[api/users] Error in GET /api/users:', err);
      throw err;
    }
  }

  if (req.method === 'POST') {
    try {
      const { name } = req.body as { name?: string };
      console.log('[api/users] Creating user with name:', name);
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const id = randomUUID();
      const newUser: AppUser = {
        id,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };

      console.log('[api/users] Saving new user to Redis:', id);
      const users = (await redis.get<AppUser[]>('users')) ?? [];
      users.push(newUser);
      await redis.set('users', users);

      console.log('[api/users] Generating seed state for user:', id);
      const seedState = generateSeedState();
      await redis.set(`user:${id}:state`, seedState);

      console.log('[api/users] User created successfully:', id);
      return res.status(201).json(newUser);
    } catch (err) {
      console.error('[api/users] Error in POST /api/users:', err);
      throw err;
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
