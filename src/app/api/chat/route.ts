import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { aiLimiter, globalLimiter } from '@/lib/ratelimit'
import type { ChatMessage } from '@/lib/types'

/** Maximum allowed values for input validation */
const MAX_MESSAGES = 15
const MAX_MESSAGE_LENGTH = 600
const MAX_SYSTEM_PROMPT_LENGTH = 2000

/**
 * Strips HTML tags from a string to prevent XSS in stored/reflected content.
 */
function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

/**
 * POST /api/chat
 * Accepts user chat messages, validates & sanitizes input,
 * applies rate limiting, and returns an AI-generated reply via Gemini.
 */
export async function POST(req: Request) {
  // 1. Extract client IP for rate limiting
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip') ?? '127.0.0.1'

  // 2. Global rate limit
  const global = await globalLimiter.limit(ip)
  if (!global.success) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // 3. AI-specific rate limit
  const ai = await aiLimiter.limit(ip)
  if (!ai.success) {
    return NextResponse.json(
      { error: 'AI limit reached. Wait a moment.' },
      { status: 429, headers: { 'Retry-After': '30' } }
    )
  }

  // 4. Parse and validate request body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { messages, systemPrompt } = body as {
    messages: ChatMessage[]
    systemPrompt: string
  }

  if (
    !Array.isArray(messages) ||
    messages.length < 1 ||
    messages.length > MAX_MESSAGES ||
    messages.some(
      (m) =>
        typeof m.content !== 'string' ||
        m.content.length > MAX_MESSAGE_LENGTH ||
        !['user', 'assistant'].includes(m.role)
    ) ||
    typeof systemPrompt !== 'string' ||
    systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // 5. Sanitize all user-provided content
  const sanitizedMessages: ChatMessage[] = messages.map((m) => ({
    ...m,
    content: sanitize(m.content),
  }))

  // 6. Call Gemini AI
  try {
    const reply = await callGemini(sanitizedMessages, systemPrompt)
    return NextResponse.json({ reply }, { status: 200 })
  } catch (err) {
    console.error('[/api/chat error]', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
