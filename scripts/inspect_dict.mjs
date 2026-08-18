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

const key = env.VITE_AZURE_TRANSLATOR_KEY;
const region = env.VITE_AZURE_TRANSLATOR_REGION || 'eastasia';

async function inspectDict() {
  const res = await fetch(
    'https://api.cognitive.microsofttranslator.com/dictionary/lookup?api-version=3.0&from=en&to=th',
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ Text: 'persevere' }]),
    }
  );

  console.log('Dict status:', res.status);
  const data = await res.json();
  console.log('Dict response:', JSON.stringify(data, null, 2));
}

inspectDict();
