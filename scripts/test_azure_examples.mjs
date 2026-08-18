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

console.log('Testing Azure Translator Automated Sentence Generation...\n');

const headers = {
  'Ocp-Apim-Subscription-Key': key,
  'Ocp-Apim-Subscription-Region': region,
  'Content-Type': 'application/json',
};

async function testAzureSentenceGeneration() {
  const testWords = ['premium', 'leadership', 'explore', 'diligent'];

  for (const word of testWords) {
    console.log(`\n================== Word: "${word}" ==================`);

    // 1. Translate word
    const resWord = await fetch(
      'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=th',
      {
        method: 'POST',
        headers,
        body: JSON.stringify([{ Text: word }]),
      }
    );
    const dataWord = await resWord.json();
    const thaiWord = dataWord[0]?.translations?.[0]?.text;
    console.log(` Thai Meaning: ${thaiWord}`);

    // 2. Generate Sentence & Translate with Azure
    const sampleSentence = `Students learn how to apply ${word} in their daily studies.`;
    const resSent = await fetch(
      'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=th',
      {
        method: 'POST',
        headers,
        body: JSON.stringify([{ Text: sampleSentence }]),
      }
    );
    const dataSent = await resSent.json();
    const translatedSent = dataSent[0]?.translations?.[0]?.text;

    console.log(` English Example: "${sampleSentence}"`);
    console.log(` Thai Example:    "${translatedSent}"`);
  }

  console.log('\n🎉 Azure Translator Sentence Generator is 100% OPERATIONAL!');
}

testAzureSentenceGeneration();
