import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim().replace(/^['"]|['"]$/g, '');
    env[match[1]] = value;
  }
});

const key = env.VITE_AZURE_OPENAI_KEY;
const endpoint = env.VITE_AZURE_OPENAI_ENDPOINT || '';
const deployment = env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-mini';
const apiVersion = '2024-08-01-preview';

let baseHost = endpoint;
try {
  const u = new URL(endpoint);
  baseHost = `${u.protocol}//${u.host}`;
} catch {
  baseHost = endpoint.replace(/\/+$/, '');
}

const url = `${baseHost}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

async function testPromptLogic() {
  console.log('Testing Multimodal Vision & Layout understanding prompt logic...');
  const systemPrompt = `You are an expert AI vision assistant specializing in analyzing educational English worksheets, spelling word lists, textbooks, flashcards, and student study sheets.

Your task:
1. Identify and extract all TARGET English vocabulary words from the image.
2. Ignore noise, row numbers, indices (e.g. 1, 2, 3, 4, 11, 12...), page numbers, dates (e.g. "Date: 20/8/26", "Spelling Test Day: 3/9/26"), instructions, and column headers.
3. Preserve correct sequential reading order (e.g., if there are multiple columns numbered 1 to 10 on the left and 11 to 20 on the right, return them in order 1, 2, 3, ... 20).
4. Identify any worksheet or list title/topic if visible (e.g., "Spelling Word List (6)", "Science Unit 3", etc.).
5. Ensure words are clean, lower-cased/standard-cased without leading/trailing numbers or punctuation.

Respond ONLY with valid JSON matching this schema:
{
  "title": "Detected Title or empty string",
  "words": ["word1", "word2", "word3", ...]
}`;

  // Testing text simulated table structure
  const userText = `Here is the transcribed layout of the image:
Header:
Date: 20/8/26
Spelling Word List (6)
Spelling Test Day: 3/9/26

Table columns:
Col 1:
1 quadrilateral
2 parallelogram
3 rhombus
4 kite
5 trapezium
6 diagonal
7 perimeter
8 area
9 innovation
10 project

Col 2:
11 urban
12 design
13 arcology
14 nest
15 hen
16 chicken
17 seeds
18 chick
19 hatch
20 heaviest
`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  console.log('Result:', JSON.stringify(parsed, null, 2));
}

testPromptLogic();
