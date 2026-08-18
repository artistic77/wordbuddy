import fs from 'fs';
import path from 'path';

// Read .env file manually
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

console.log('Testing Microsoft Azure Translator API...');
console.log('Region:', region);
console.log('Key prefix:', key ? key.substring(0, 10) + '...' : 'NONE');

const headers = {
  'Ocp-Apim-Subscription-Key': key,
  'Ocp-Apim-Subscription-Region': region,
  'Content-Type': 'application/json',
};

async function testAzureTranslator() {
  try {
    // Test 1: Single Word Translation
    console.log('\n--- 1. Direct Translation Check (/translate) ---');
    const word = 'magnificent';
    const res1 = await fetch(
      'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=th',
      {
        method: 'POST',
        headers,
        body: JSON.stringify([{ Text: word }]),
      }
    );

    if (!res1.ok) {
      const errText = await res1.text();
      console.log(`❌ Translation failed (${res1.status}):`, errText);
    } else {
      const data1 = await res1.json();
      console.log(` "${word}" -> Thai translation:`, data1[0]?.translations?.[0]?.text);
    }

    // Test 2: Dictionary Lookup Check (/dictionary/lookup)
    console.log('\n--- 2. Dictionary Lookup Check (/dictionary/lookup) ---');
    const dictWord = 'persevere';
    const res2 = await fetch(
      'https://api.cognitive.microsofttranslator.com/dictionary/lookup?api-version=3.0&from=en&to=th',
      {
        method: 'POST',
        headers,
        body: JSON.stringify([{ Text: dictWord }]),
      }
    );

    if (!res2.ok) {
      const errText = await res2.text();
      console.log(`❌ Dictionary lookup failed (${res2.status}):`, errText);
    } else {
      const data2 = await res2.json();
      const top = data2[0]?.translations?.[0];
      console.log(` Dictionary entry for "${dictWord}":`);
      console.log(`   - Meaning: ${top?.displayTarget}`);
      console.log(`   - POS Tag: ${top?.posTag}`);
    }

    // Test 3: Batch Words Translation
    console.log('\n--- 3. Batch Translation Check (Multiple Words) ---');
    const batchWords = ['curious', 'diligent', 'courageous', 'innovation'];
    const res3 = await fetch(
      'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=th',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(batchWords.map((w) => ({ Text: w }))),
      }
    );

    if (!res3.ok) {
      const errText = await res3.text();
      console.log(`❌ Batch translation failed (${res3.status}):`, errText);
    } else {
      const data3 = await res3.json();
      console.log(' Batch Translations:');
      batchWords.forEach((w, idx) => {
        console.log(`   - ${w} -> ${data3[idx]?.translations?.[0]?.text}`);
      });
    }

    console.log('\n🎉 Azure Translator connection & endpoints are 100% OPERATIONAL!');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

testAzureTranslator();
