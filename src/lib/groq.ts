import Groq from 'groq-sdk'
import { ChatMessage } from './types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function callGroq(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const mapped = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 350,
    temperature: 0.6,
    messages: [{ role: 'system', content: systemPrompt }, ...mapped],
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from Groq')
  }

  return content
}
