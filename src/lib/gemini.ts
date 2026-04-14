import { GoogleGenAI } from '@google/genai'
import type { ChatMessage } from './types'

/**
 * Singleton Gemini SDK client.
 * Requires GEMINI_API_KEY in environment variables.
 */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

/**
 * Sends a chat completion request to Google's Gemini model.
 *
 * @param messages - The conversation history (user + assistant turns).
 * @param systemPrompt - System instruction providing venue context.
 * @returns The assistant's reply text.
 * @throws {Error} If the response is empty or the API call fails.
 */
export async function callGemini(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  // Convert our chat format to Gemini's expected Content format
  const formattedMessages = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: formattedMessages,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 350,
      temperature: 0.6,
    },
  })

  const content = response.text

  if (!content) {
    throw new Error('Empty response from Gemini')
  }

  return content
}
