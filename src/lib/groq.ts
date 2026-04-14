import Groq from 'groq-sdk'
import type { ChatMessage } from './types'

/**
 * Singleton Groq SDK client.
 * Requires GROQ_API_KEY in environment variables.
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

/**
 * Sends a chat completion request to Groq's LLaMA model.
 *
 * @param messages - The conversation history (user + assistant turns).
 * @param systemPrompt - System instruction providing venue context.
 * @returns The assistant's reply text.
 * @throws {Error} If the response is empty or the API call fails.
 */
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
