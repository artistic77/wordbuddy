// ==============================================================================
// Text-to-Speech (TTS) Service
// Supports:
// 1. Microsoft Azure Cognitive Speech (Neural Voices: en-US-JennyNeural & th-TH-PremwadeeNeural)
// 2. Web Speech API (Browser Fallback)
// Includes in-memory audio caching for zero-latency instant replay
// ==============================================================================

// In-memory cache for audio elements to prevent redundant network fetches
const audioCache = new Map<string, HTMLAudioElement>();

const DEFAULT_AZURE_SPEECH_KEY_B64 = 'MkZiZzlBS1JIcWQwUHZZSVR2T04zZEVrNnczMlhUVlZ6b1BrdnY0bE9GUE1neGFwSTlaUkpRUUo5OUNIQUNxQkJMeVhKM3czQUFBWUFDT0dMNkhR';

export const getAzureSpeechKey = (): string => {
  const envKey = import.meta.env.VITE_AZURE_SPEECH_KEY || import.meta.env.VITE_AZURE_TRANSLATOR_KEY;
  if (envKey && envKey !== 'undefined' && envKey !== 'null' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  try {
    return atob(DEFAULT_AZURE_SPEECH_KEY_B64);
  } catch {
    return '';
  }
};

export const isAzureSpeechConfigured = (): boolean => {
  return Boolean(getAzureSpeechKey());
};

/**
 * Synthesizes speech using Microsoft Azure Cognitive Speech REST API
 */
const playAzureSpeech = async (
  text: string,
  lang: 'en' | 'th' = 'en',
  rate = '0%'
): Promise<void> => {
  const key = getAzureSpeechKey();
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION || 'southeastasia';

  if (!key) throw new Error('Azure Speech Key not configured');

  const voice = lang === 'th' ? 'th-TH-PremwadeeNeural' : 'en-US-JennyNeural';
  const xmlLang = lang === 'th' ? 'th-TH' : 'en-US';
  const prosodyRate = lang === 'en' ? '-10%' : rate;

  const cacheKey = `${text.trim().toLowerCase()}_${voice}_${prosodyRate}`;

  // Check cache first
  if (audioCache.has(cacheKey)) {
    const cachedAudio = audioCache.get(cacheKey)!;
    cachedAudio.currentTime = 0;
    await cachedAudio.play();
    return;
  }

  // Escape special XML characters for SSML
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const ssml = `<speak version='1.0' xml:lang='${xmlLang}'>
    <voice xml:lang='${xmlLang}' xml:gender='Female' name='${voice}'>
      <prosody rate='${prosodyRate}'>${escapedText}</prosody>
    </voice>
  </speak>`;

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'WordBuddy-App',
    },
    body: ssml,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Azure TTS Error (${res.status}): ${errText}`);
  }

  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);

  audioCache.set(cacheKey, audio);
  await audio.play();
};

/**
 * Fallback to browser Web Speech API
 */
const playWebSpeech = (text: string, lang = 'en-US', rate = 0.9): void => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(
    (v) => v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premwadee') || v.name.includes('Jenny'))
  ) || voices.find((v) => v.lang.startsWith(lang.split('-')[0]));

  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Speaks English or Thai text with Azure Neural Voice (or Web Speech fallback)
 */
export const speakWord = async (text: string, lang: 'en' | 'th' = 'en'): Promise<void> => {
  const clean = text.trim();
  if (!clean) return;

  // Auto-detect Thai if text contains Thai characters
  const isThai = lang === 'th' || /[\u0E00-\u0E7F]/.test(clean);
  const targetLang = isThai ? 'th' : 'en';

  if (isAzureSpeechConfigured()) {
    try {
      await playAzureSpeech(clean, targetLang);
      return;
    } catch (err) {
      console.warn(`Azure Cognitive Speech failed for ${targetLang}, falling back to Web Speech:`, err);
    }
  }

  // Fallback to Web Speech API
  playWebSpeech(clean, isThai ? 'th-TH' : 'en-US', 0.9);
};

/**
 * Explicit helper to pronounce English text
 */
export const speakEnglish = (text: string): Promise<void> => {
  return speakWord(text, 'en');
};

/**
 * Explicit helper to pronounce Thai text / คำอ่านภาษาไทย (เช่น "อ่านว่า แบท")
 */
export const speakThai = (text: string): Promise<void> => {
  return speakWord(text, 'th');
};
