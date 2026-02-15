import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppUser } from '../types';
import { generateSeedState } from '../utils/seedData.js';
import { getRedisClient } from '../lib/redis.js';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[api/users][${requestId}] ${req.method} request started`);
  
  try {
    // Explicitly log env presence (not values) to debug Vercel settings
    const hasUrl = !!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL);
    const hasToken = !!(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN);
    console.log(`[api/users][${requestId}] Env check: URL=${hasUrl}, Token=${hasToken}`);

    const redis = getRedisClient();
    
    if (req.method === 'GET') {
      console.log(`[api/users][${requestId}] Fetching users...`);
      const users = (await redis.get<AppUser[]>('users')) ?? [];
      console.log(`[api/users][${requestId}] Successfully fetched ${users.length} users`);
      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      const { name } = req.body as { name?: string };
      console.log(`[api/users][${requestId}] POST body:`, JSON.stringify(req.body));
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const id = crypto.randomUUID();
      const newUser: AppUser = {
        id,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };

      console.log(`[api/users][${requestId}] Creating user:`, id);
      const users = (await redis.get<AppUser[]>('users')) ?? [];
      users.push(newUser);
      await redis.set('users', users);

      console.log(`[api/users][${requestId}] Generating seed state...`);
      const seedState = generateSeedState();
      await redis.set(`user:${id}:state`, seedState);

      return res.status(201).json(newUser);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(`[api/users][${requestId}] Fatal error:`, err);
    
    // Check if it's a connection/timeout error specifically
    const isTimeout = err instanceof Error && (err.message.includes('ETIMEDOUT') || err.message.includes('fetch failed'));
    
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? 'Gateway Timeout' : 'Internal Server Error',
      message: err instanceof Error ? err.message : String(err),
      requestId
    });
  }
}
