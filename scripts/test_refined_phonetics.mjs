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

const words = [
  "quadrilateral",
  "parallelogram",
  "rhombus",
  "kite",
  "trapezium",
  "diagonal",
  "perimeter",
  "area",
  "innovation",
  "project",
  "urban",
  "design",
  "arcology",
  "nest",
  "hen",
  "chicken",
  "seeds",
  "chick",
  "hatch",
  "heaviest"
];

async function testAccuratePhonetics() {
  const systemPrompt = `You are a world-class English-Thai educational linguist, dictionary editor, and phonetic specialist for Thai schools.

Your mission is to generate 100% accurate, natural, and standard Thai phonetic pronunciation guides ("reading_th") following authentic English phonetics (IPA) and standard Thai transliteration conventions used in educational dictionaries.

STRICT RULES FOR THAI PHONETIC PRONUNCIATION ("reading_th"):
1. Follow natural spoken English phonetics (IPA stress & vowel quality):
   - "chicken" -> "ชิกเก้น" (NOT "ชิคเกิน", NOT "ชิเคน")
   - "perimeter" -> "เพอริมิเทอร์" or "เพอริมมิเตอร์" (NOT "พีริมิเทอร์")
   - "quadrilateral" -> "ควอดริแลเทอรอล" or "ควอดริแลทเทอรัล" (/kwɑːdrɪˈlætərəl/)
   - "parallelogram" -> "แพแรลเลโลแกรม" (/ˌpærəˈleləɡræm/)
   - "trapezium" -> "ทราพีเซียม" or "ทระพีเซียม" (/trəˈpiːziəm/)
   - "diagonal" -> "ไดแอกกะนอล" or "ไดแอกโกนอล" (/daɪˈæɡənəl/)
   - "heaviest" -> "เฮฟวิเอสต์" or "เฮฟวี่เอสต์" (/ˈheviɪst/)
   - "rhombus" -> "รอมบัส" (/ˈrɑːmbəs/)
   - "seeds" -> "ซีดส์"
   - "nest" -> "เนสต์"
   - "hatch" -> "แฮทช์"
   - "chick" -> "ชิค"
   - "hen" -> "เฮน"
   - "urban" -> "เออร์บัน"
   - "arcology" -> "อาร์โคโลจี"
   - "method" -> "เมธอด"
   - "schedule" -> "สเกดจูล"
   - "pattern" -> "แพทเทิร์น"
   - "apple" -> "แอปเปิ้ล"
   - "banana" -> "บานาน่า"

2. Use correct Thai vowel and consonant symbols:
   - Final /st/ -> "สต์" (e.g. nest -> เนสต์, heaviest -> เฮฟวิเอสต์)
   - Final /tʃ/ -> "ทช์" or "ช์" (e.g. hatch -> แฮทช์, watch -> วอทช์)
   - Final /d/ or /dz/ -> "ด" or "ดส์" (e.g. seeds -> ซีดส์)
   - Ending -en / -in -> "เก้น" / "เซ่น" / "เท่น" (e.g. chicken -> ชิกเก้น, kitten -> คิทเท่น, listen -> ลิสเซิน)
   - Weak syllables with /ə/ or /ɪ/ -> use natural Thai vowel representations ("เออ", "อะ", "อิ" depending on English stress).

3. NEVER output translation as reading (e.g. for "method" never output "วิธี", output "เมธอด").

Respond ONLY with valid JSON:
{
  "items": [
    {
      "word_en": "string",
      "word_th": "accurate Thai translation",
      "reading_th": "standard Thai phonetic spelling",
      "part_of_speech": "noun | verb | adj | adv | gerund | past_participle | other",
      "example_sentence_en": "clear example sentence",
      "example_sentence_th": "natural Thai translation of example sentence"
    }
  ]
}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify({ words }) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  console.log('\n=== REFINED THAI PHONETIC PRONUNCIATIONS ===');
  parsed.items.forEach((item, idx) => {
    console.log(`${idx+1}. ${item.word_en.padEnd(16)} -> คำอ่าน: ${item.reading_th.padEnd(18)} | แปล: ${item.word_th}`);
  });
}

testAccuratePhonetics();
