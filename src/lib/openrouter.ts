const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

// Working free models on OpenRouter as of 2026
// Listed in priority order — first one is tried first
export const FREE_MODELS = [
  'deepseek/deepseek-v4-flash:free',
  'minimax/minimax-m2.5:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'qwen/qwen3-coder:free',
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
    console.error(`OpenRouter error with model ${model}:`, errorText);

    // Try fallback models if the current one fails for any reason
    const modelIndex = FREE_MODELS.indexOf(model);
    if (modelIndex !== -1 && modelIndex < FREE_MODELS.length - 1) {
      const nextModel = FREE_MODELS[modelIndex + 1];
      console.log(`Trying fallback model: ${nextModel}`);
      return callOpenRouter(systemPrompt, userMessage, nextModel);
    }

    // Ultimate fallback to Groq if all OpenRouter models fail/are rate-limited
    if (process.env.GROQ_API_KEY) {
      console.log('All OpenRouter models failed. Falling back to Groq Llama-3.3...');
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
          }),
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          if (groqData.choices && groqData.choices.length > 0) {
            console.log('Groq fallback successful!');
            return groqData.choices[0].message.content;
          }
        } else {
          console.error('Groq fallback failed status:', groqResponse.status, await groqResponse.text());
        }
      } catch (groqError) {
        console.error('Groq fallback error:', groqError);
      }
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
