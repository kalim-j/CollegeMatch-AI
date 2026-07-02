export const PRIMARY_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
export const FALLBACK_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
];

export async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 2000,
  model = PRIMARY_MODEL,
  history: { role: string; content: string }[] = []
): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://collegematch-ai.vercel.app',
      'X-Title': 'CollegeMatch-AI',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 404 && model !== FALLBACK_MODELS[FALLBACK_MODELS.length-1]) {
      const next = FALLBACK_MODELS[FALLBACK_MODELS.indexOf(model)+1] || FALLBACK_MODELS[0];
      return callOpenRouter(systemPrompt, userMessage, maxTokens, next);
    }
    throw new Error(`OpenRouter ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export function parseJSON<T>(text: string): T {
  const clean = text.replace(/```json\n?/gi,'').replace(/```\n?/gi,'').trim();
  const start = clean.search(/[\[{]/);
  const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));
  if (start === -1 || end === -1) throw new Error('No JSON in response');
  return JSON.parse(clean.slice(start, end+1)) as T;
}
