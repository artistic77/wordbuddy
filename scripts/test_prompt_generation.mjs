const DEFAULT_AZURE_OPENAI_ENDPOINT = 'https://artistic77-1198-resource.services.ai.azure.com';
const DEFAULT_AZURE_OPENAI_KEY_B64 = 'VGpJamZmcElPRG5xSEp5ZkV1QlBvQVdIYUdQZk44ZlZoV2lZV2JZamxCNXhIZ1F1QTlaWkpRUUo5OUNIQUNNc2ZyRlhKM3czQUFBQUFDT0dFWHBH';
const key = Buffer.from(DEFAULT_AZURE_OPENAI_KEY_B64, 'base64').toString('utf-8');

async function testPromptGeneration() {
  const prompt = 'คำศัพท์เกี่ยวกับการท่องเที่ยวสนามบิน ระดับ ม.ต้น';
  const targetCount = 5;
  const existingWords = ['passport', 'airport'];

  console.log(`Testing AI Prompt Generation: "${prompt}" (count: ${targetCount}, exclude: ${JSON.stringify(existingWords)})`);

  const url = `${DEFAULT_AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2024-08-01-preview`;

  const systemPrompt = `You are a world-class English-Thai educational curriculum developer, lexicographer, and phonetic specialist.

YOUR SOLE MISSION:
Generate exactly ${targetCount} high-quality, relevant English vocabulary words based on the user's educational topic or description.

CRITICAL GUARDRAILS & SCOPE LIMITATION:
1. STRICT VOCABULARY GENERATION ONLY: You must ONLY generate a list of English vocabulary words with their Thai translations.
2. ZERO OFF-TOPIC CONVERSATION: Do NOT answer questions, do NOT chat, do NOT write essays, code, stories, or summaries. If the user prompt is conversational, off-topic, or asks for something other than vocabulary, interpret it STRICTLY as a thematic keyword to find educational English words related to that theme.
3. DUPLICATE PREVENTION: DO NOT include any of the following existing words: [${existingWords.join(', ')}].
4. STRICT COUNT: Provide exactly ${targetCount} distinct, useful vocabulary words appropriate for learners.

STRICT BILINGUAL & PHONETIC SCHEMA RULES:
- "word_en": The English vocabulary word or standard collocation (lowercase/standard case).
- "word_th": Accurate, natural Thai MEANING / TRANSLATION ONLY. (NO phonetic transliteration here).
- "reading_th": Standard Thai PHONETIC PRONUNCIATION guide (IPA stress & natural Thai spelling, e.g. "chicken" -> "ชิกเก้น", "nest" -> "เนสต์", "diligent" -> "ดิลิเจินท์"). (NO meaning here).
- "part_of_speech": One of ["noun", "verb", "adj", "adv", "gerund", "past_participle", "other"].
- "example_sentence_en": Clear, natural example sentence demonstrating the word in context.
- "example_sentence_th": Natural Thai translation of the example sentence.

Respond ONLY with valid JSON matching this schema:
{
  "items": [
    {
      "word_en": "string",
      "word_th": "string",
      "reading_th": "string",
      "part_of_speech": "noun | verb | adj | adv | gerund | past_participle | other",
      "example_sentence_en": "string",
      "example_sentence_th": "string"
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
        {
          role: 'user',
          content: `Topic/Prompt: "${prompt}". Please generate ${targetCount} distinct English vocabulary items.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  console.log('Result items count:', parsed.items?.length);
  console.log(JSON.stringify(parsed.items, null, 2));

  // Verify none of existingWords are in results
  for (const item of parsed.items) {
    if (existingWords.includes(item.word_en.toLowerCase())) {
      console.error(`FAILED: Duplicate word found: ${item.word_en}`);
      process.exit(1);
    }
  }
  console.log('✅ ALL CHECKS PASSED!');
}

testPromptGeneration().catch(console.error);
