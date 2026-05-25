const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Working free models on OpenRouter as of 2026
// Listed in priority order — first one is tried first
export const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
];

export const PRIMARY_MODEL = FREE_MODELS[0];

export async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  model: string = PRIMARY_MODEL
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://collegematch-ai.vercel.app',
      'X-Title': 'CollegeMatch-AI',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', errorText);

    // If model not found, try fallback models
    if (response.status === 404 && model !== FREE_MODELS[FREE_MODELS.length - 1]) {
      const nextModel = FREE_MODELS[FREE_MODELS.indexOf(model) + 1];
      console.log(`Trying fallback model: ${nextModel}`);
      return callOpenRouter(systemPrompt, userMessage, nextModel);
    }

    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from OpenRouter API');
  }

  return data.choices[0].message.content;
}

export function parseJSON(text: string): any {
  const clean = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/[\[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse AI JSON response');
  }
}
