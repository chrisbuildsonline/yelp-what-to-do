import fs from 'fs';
import path from 'path';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_DIR = path.join(process.cwd(), '.yelp-cache');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getCacheKey(location: string, term: string, categories: string): string {
  // Create a deterministic cache key from search parameters
  const key = `${location}|${term}|${categories}`;
  return Buffer.from(key).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

function getCacheFilePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

export function getCachedYelpResults(location: string, term: string, categories: string): any | null {
  const key = getCacheKey(location, term, categories);
  const filePath = getCacheFilePath(key);

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const entry: CacheEntry = JSON.parse(content);

    // Check if cache has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      fs.unlinkSync(filePath);
      return null;
    }

    console.log(`[YELP-CACHE] Cache hit for: ${location} | ${term}`);
    return entry.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function setCachedYelpResults(location: string, term: string, categories: string, data: any): void {
  const key = getCacheKey(location, term, categories);
  const filePath = getCacheFilePath(key);

  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    };

    fs.writeFileSync(filePath, JSON.stringify(entry), 'utf-8');
    console.log(`[YELP-CACHE] Cached results for: ${location} | ${term}`);
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

export function clearYelpCache(): void {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      fs.rmSync(CACHE_DIR, { recursive: true, force: true });
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      console.log('[YELP-CACHE] Cache cleared');
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
