import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Creates a rate limiter backed by Upstash Redis.
 * Falls back to a no-op limiter if env vars are not configured.
 */
function createRateLimiter(
  windowRequests: number,
  windowDuration: string,
  prefix: string
): { limit: (key: string) => Promise<{ success: boolean }> } {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // No-op limiter — allows all requests when Redis is not configured
    return { limit: async () => ({ success: true }) }
  }

  const redis = new Redis({ url, token })

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(windowRequests, windowDuration as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix,
  })
}

/** Per-IP AI endpoint rate limit: 10 requests per 60 seconds */
export const aiLimiter = createRateLimiter(10, '60 s', 'venueiq_ai')

/** Per-IP global rate limit: 60 requests per 60 seconds */
export const globalLimiter = createRateLimiter(60, '60 s', 'venueiq_global')
