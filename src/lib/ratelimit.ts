import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'venueiq_ai',
})

export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  prefix: 'venueiq_global',
})
