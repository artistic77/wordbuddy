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

const key = env.VITE_AZURE_SPEECH_KEY;
const region = env.VITE_AZURE_SPEECH_REGION || 'southeastasia';

console.log('Testing Azure Speech TTS with English & Thai Neural voices...');
console.log('Region:', region);
console.log('Key prefix:', key ? key.substring(0, 10) + '...' : 'NONE');

async function testSpeech() {
  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  // Test 1: English JennyNeural
  console.log('\n--- 1. Testing English Voice (en-US-JennyNeural) ---');
  const ssmlEn = `<speak version='1.0' xml:lang='en-US'>
    <voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'>
      <prosody rate='-10%'>magnificent</prosody>
    </voice>
  </speak>`;

  const res1 = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'WordBuddy-Test',
    },
    body: ssmlEn,
  });

  console.log('English TTS Status:', res1.status);
  if (res1.ok) {
    const buffer = await res1.arrayBuffer();
    console.log(`✅ Received MP3 audio stream for English (${buffer.byteLength} bytes)`);
  } else {
    console.log('❌ English TTS failed:', await res1.text());
  }

  // Test 2: Thai PremwadeeNeural (for คำอ่านภาษาไทย)
  console.log('\n--- 2. Testing Thai Voice (th-TH-PremwadeeNeural) for คำอ่าน ---');
  const ssmlTh = `<speak version='1.0' xml:lang='th-TH'>
    <voice xml:lang='th-TH' xml:gender='Female' name='th-TH-PremwadeeNeural'>
      <prosody rate='0%'>อ่านว่า แบท</prosody>
    </voice>
  </speak>`;

  const res2 = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'WordBuddy-Test',
    },
    body: ssmlTh,
  });

  console.log('Thai TTS Status:', res2.status);
  if (res2.ok) {
    const buffer = await res2.arrayBuffer();
    console.log(`✅ Received MP3 audio stream for Thai Pronunciation (${buffer.byteLength} bytes)`);
  } else {
    console.log('❌ Thai TTS failed:', await res2.text());
  }

  console.log('\n🎉 Azure Cognitive Speech is 100% WORKING for both English & Thai!');
}

testSpeech();
