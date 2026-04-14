import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.NEXT_PUBLIC_APP_URL ?? '',
].filter(Boolean)

export function proxy(req: NextRequest) {
  const origin = req.headers.get('origin') ?? ''
  const isAllowed = !origin || ALLOWED_ORIGINS.includes(origin)

  if (!isAllowed) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const res = NextResponse.next()
  if (origin) res.headers.set('Access-Control-Allow-Origin', origin)
  return res
}

export const config = { matcher: ['/api/:path*'] }
