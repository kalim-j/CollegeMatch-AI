const fs = require('fs');

// Simple parser for .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const val = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
    process.env[key.trim()] = val;
  }
});

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

async function testOpenRouter() {
  console.log('Testing OpenRouter fetch...');
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-flash:free',
        messages: [
          { role: 'user', content: 'Say hello' }
        ],
      })
    });
    if (!response.ok) {
      console.error('OpenRouter failed:', response.status, await response.text());
      return;
    }
    const data = await response.json();
    console.log('OpenRouter Response:', data.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('OpenRouter Error:', err.message);
  }
}

testOpenRouter();
