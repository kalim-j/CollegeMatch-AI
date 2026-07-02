import { groq } from '@/lib/groq';

export const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
export const FALLBACK_MODELS = ['llama-3.1-8b-instant'];

export async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2000,
  model = PRIMARY_MODEL,
  history: { role: string; content: string }[] = []
): Promise<string> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
        { role: 'user', content: userMessage },
      ],
      model: PRIMARY_MODEL,
      temperature: 0.7,
      max_tokens: maxTokens,
    });
    
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error('AI API Error:', error);
    throw new Error(error.message || 'Failed to connect to AI');
  }
}

export function parseJSON<T>(text: string): T {
  const clean = text.replace(/```json\n?/gi,'').replace(/```\n?/gi,'').trim();
  const start = clean.search(/[\[{]/);
  const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));
  if (start === -1 || end === -1) throw new Error('No JSON in response');
  return JSON.parse(clean.slice(start, end+1)) as T;
}
