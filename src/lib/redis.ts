import { Redis } from '@upstash/redis';

// Redis client for caching
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface CacheConfig {
  ttl?: number; // Time to live in seconds
  key: string;
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data as T;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCached<T>(key: string, data: T, ttl: number = 60): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttl, data);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis del error:', error);
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  // Try cache first
  const cached = await getCached<T>(key);
  if (cached) {
    return cached;
  }
  
  // Fetch fresh data
  const data = await fetchFn();
  
  // Cache the result
  await setCached(key, data, ttl);
  
  return data;
}

// Cache keys for different data types
export const CACHE_KEYS = {
  signals: (filter?: string) => `signals:${filter || 'all'}`,
  markets: () => 'markets:all',
  predictions: () => 'predictions:all',
  earthquakes: () => 'earthquakes:all',
  conflicts: () => 'conflicts:all',
  weather: (lat: number, lon: number) => `weather:${lat}:${lon}`,
  rss: (url: string) => `rss:${Buffer.from(url).toString('base64').substring(0, 32)}`,
};

export { redis };
