import { callGroq } from '@/lib/groq'
import { aiLimiter, globalLimiter } from '@/lib/ratelimit'
import { ChatMessage } from '@/lib/types'

export async function POST(req: Request) {
  // 1. Get IP
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers.get('x-real-ip') ?? '127.0.0.1'

  // 2. Global rate limit
  const global = await globalLimiter.limit(ip)
  if (!global.success)
    return Response.json({ error: 'Too many requests.' }, { status: 429 })

  // 3. AI rate limit
  const ai = await aiLimiter.limit(ip)
  if (!ai.success)
    return Response.json(
      { error: 'AI limit reached. Wait a moment.' },
      { status: 429 }
    )

  // 4. Parse body
  const body = await req.json()
  const { messages, systemPrompt } = body as {
    messages: ChatMessage[]
    systemPrompt: string
  }

  // 5. Validate
  if (
    !Array.isArray(messages) ||
    messages.length < 1 ||
    messages.length > 15 ||
    messages.some(
      (m) => typeof m.content !== 'string' || m.content.length > 600
    ) ||
    typeof systemPrompt !== 'string' ||
    systemPrompt.length > 2000
  ) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }

  // 6. Call Groq
  try {
    const reply = await callGroq(messages, systemPrompt)
    return Response.json({ reply }, { status: 200 })
  } catch (err) {
    console.error('[/api/chat error]', err)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
