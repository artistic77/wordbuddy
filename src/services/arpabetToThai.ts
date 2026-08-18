// ==============================================================================
// ARPAbet -> Thai Phoneme Synthesizer
// Compiles ARPAbet phoneme sequences into natural Thai script
// ==============================================================================

const VOWEL_PHONEMES = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'
]);

interface Syllable {
  onset: string[];
  vowel: string;
  stress: number;
  coda: string[];
}

const ONSET_CLUSTER_MAP: Record<string, string> = {
  'P R': 'พร',
  'P L': 'พล',
  'B R': 'บร',
  'B L': 'บล',
  'K R': 'คร',
  'K L': 'คล',
  'G R': 'กร',
  'G L': 'กล',
  'F R': 'ฟร',
  'F L': 'ฟล',
  'T R': 'ทร',
  'D R': 'ดร',
  'S T R': 'สตร',
  'S P R': 'สปร',
  'S K R': 'สคร',
  'S T': 'สต',
  'S P': 'สป',
  'S K': 'สค',
  'S L': 'สล',
  'S M': 'สม',
  'S N': 'สน',
  'S W': 'สว',
  'K W': 'คว',
  'T W': 'ทว',
};

const SINGLE_ONSET_MAP: Record<string, string> = {
  B: 'บ',
  CH: 'ช',
  D: 'ด',
  DH: 'ด',
  F: 'ฟ',
  G: 'ก',
  HH: 'ฮ',
  JH: 'จ',
  K: 'ค',
  L: 'ล',
  M: 'ม',
  N: 'น',
  NG: 'ง',
  P: 'พ',
  R: 'ร',
  S: 'ซ',
  SH: 'ช',
  T: 'ท',
  TH: 'ท',
  V: 'ว',
  W: 'ว',
  Y: 'ย',
  Z: 'ซ',
  ZH: 'ช',
};

const CODA_MAP: Record<string, string> = {
  B: 'บ',
  CH: 'ช',
  D: 'ด',
  DH: 'ด',
  F: 'ฟ',
  G: 'ก',
  JH: 'จ',
  K: 'ก',
  L: 'ล',
  M: 'ม',
  N: 'น',
  NG: 'ง',
  P: 'พ',
  R: 'ร์',
  S: 'ส์',
  SH: 'ช',
  T: 'ท',
  TH: 'ท์',
  V: 'ฟ',
  Z: 'ส์',
  ZH: 'ช',
};

/**
 * Splits an ARPAbet phoneme array into structured syllables
 */
export const segmentSyllables = (phonemes: string[]): Syllable[] => {
  const syllables: Syllable[] = [];
  let currentOnset: string[] = [];

  let i = 0;
  while (i < phonemes.length) {
    const rawPhoneme = phonemes[i];
    const basePhoneme = rawPhoneme.replace(/[0-9]/g, '');
    const stress = parseInt(rawPhoneme.replace(/[^0-9]/g, '') || '0', 10);

    if (VOWEL_PHONEMES.has(basePhoneme)) {
      // Find following coda consonants until next vowel onset
      const coda: string[] = [];
      let j = i + 1;

      // Lookahead: assign coda consonants respecting maximum onset principle
      while (j < phonemes.length) {
        const nextBase = phonemes[j].replace(/[0-9]/g, '');
        if (VOWEL_PHONEMES.has(nextBase)) {
          break;
        }
        // If next token is consonant and after that is another vowel, reserve at least 1 consonant for next onset
        if (j + 1 < phonemes.length && VOWEL_PHONEMES.has(phonemes[j + 1].replace(/[0-9]/g, ''))) {
          break;
        }
        coda.push(nextBase);
        j++;
      }

      syllables.push({
        onset: currentOnset,
        vowel: basePhoneme,
        stress,
        coda,
      });

      currentOnset = [];
      i = j;
    } else {
      currentOnset.push(basePhoneme);
      i++;
    }
  }

  // Trailing consonants attached to last syllable
  if (currentOnset.length > 0 && syllables.length > 0) {
    syllables[syllables.length - 1].coda.push(...currentOnset);
  }

  return syllables;
};

/**
 * Renders a single structured syllable into Thai text
 */
export const renderSyllableToThai = (s: Syllable): string => {
  // 1. Determine Initial Consonant (Onset)
  const onsetKey = s.onset.join(' ');
  let onsetThai = ONSET_CLUSTER_MAP[onsetKey] || '';

  if (!onsetThai) {
    if (s.onset.length === 0) {
      onsetThai = 'อ';
    } else {
      onsetThai = s.onset.map((c) => SINGLE_ONSET_MAP[c] || '').join('');
    }
  }

  // 2. Determine Final Consonant (Coda)
  let codaThai = '';
  if (s.coda.length > 0) {
    if (s.coda.length === 1) {
      codaThai = CODA_MAP[s.coda[0]] || '';
    } else {
      // Compound codas like "K S" (box -> กส์), "N T" (ment -> นท์)
      const codaKey = s.coda.join(' ');
      if (codaKey === 'K S') codaThai = 'กส์';
      else if (codaKey === 'N T') codaThai = 'นท์';
      else if (codaKey === 'S T') codaThai = 'สต์';
      else if (codaKey === 'L D') codaThai = 'ลด์';
      else if (codaKey === 'R D') codaThai = 'ร์ด';
      else if (codaKey === 'R K') codaThai = 'ร์ก';
      else if (codaKey === 'N S') codaThai = 'นซ์';
      else {
        codaThai = s.coda.map((c) => CODA_MAP[c] || '').join('');
      }
    }
  }

  // 3. Assemble Vowel with Onset and Coda
  const v = s.vowel;

  // Special full-syllable overrides
  if (s.onset.length === 1 && s.onset[0] === 'SH' && v === 'AH' && s.coda.includes('N')) {
    return 'ชั่น';
  }

  switch (v) {
    case 'AE': // "bat" -> แบท, "plan" -> แพลน
      return `แ${onsetThai}${codaThai || 'ะ'}`;

    case 'IY': // "see" -> ซี, "reading" -> รีด
      return `${onsetThai}ี${codaThai}`;

    case 'IH': // "pin" -> พิน, "sit" -> ซิท, "ing" -> อิ้ง
      if (codaThai === 'ง') {
        return `${onsetThai}ิ${codaThai}`;
      }
      return `${onsetThai}ิ${codaThai}`;

    case 'EY': // "play" -> เพลย์, "grade" -> เกรด, "game" -> เกม
      if (codaThai) {
        return `เ${onsetThai}${codaThai}`;
      }
      return `เ${onsetThai}ย์`;

    case 'EH': // "pen" -> เพน, "bed" -> เบด
      return `เ${onsetThai}${codaThai}`;

    case 'ER': // "teacher" -> เชอร์, "leader" -> เดอร์, "water" -> เทอร์
      return `เ${onsetThai}อร์${codaThai ? codaThai : ''}`;

    case 'AA': // "box" -> บ็อกซ์, "hot" -> ฮ็อท
    case 'AO': // "dog" -> ด็อก, "call" -> คอล
      if (codaThai === 'ก' || codaThai === 'กส์' || codaThai === 'ท' || codaThai === 'ด') {
        return `${onsetThai}็อ${codaThai}`;
      }
      if (codaThai) {
        return `${onsetThai}อ${codaThai}`;
      }
      return `${onsetThai}า`;

    case 'AH': // "cup" -> คัพ, "bus" -> บัส, "run" -> รัน
      if (codaThai) {
        return `${onsetThai}ั${codaThai}`;
      }
      return `${onsetThai}ะ`;

    case 'UW': // "school" -> สคูล, "rule" -> รูล, "blue" -> บลู
      return `${onsetThai}ู${codaThai}`;

    case 'UH': // "book" -> บุ๊ค, "good" -> กู้ด
      return `${onsetThai}ุ${codaThai}`;

    case 'OW': // "goal" -> โกล, "show" -> โชว์
      return `โ${onsetThai}${codaThai || 'ว์'}`;

    case 'AW': // "house" -> เฮาส์, "power" -> พาว
      return `เ${onsetThai}า${codaThai}`;

    case 'AY': // "like" -> ไลค์, "time" -> ไทม์
      return `ไ${onsetThai}${codaThai ? codaThai : ''}`;

    case 'OY': // "boy" -> บอย, "toy" -> ทอย
      return `${onsetThai}อย${codaThai}`;

    default:
      return `${onsetThai}${codaThai}`;
  }
};

/**
 * Transpiles an ARPAbet phoneme sequence to Thai script
 */
export const arpabetToThai = (phonemes: string[]): string => {
  if (!phonemes || phonemes.length === 0) return '';

  // Special compound idioms (e.g. "P R IY M IY AH M" -> "พรีเมียม")
  const flat = phonemes.map((p) => p.replace(/[0-9]/g, '')).join(' ');

  if (flat === 'P R IY M IY AH M') return 'พรีเมียม';
  if (flat === 'S K EH JH UW L') return 'สเกดจูล';
  if (flat === 'EH JH AH K EY SH AH N') return 'เอ็ดดูเคชั่น';
  if (flat === 'B AE T ER IY') return 'แบตเตอรี่';
  if (flat === 'K AH M P Y UW T ER') return 'คอมพิวเตอร์';
  if (flat === 'D IH JH AH T AH L') return 'ดิจิทัล';
  if (flat === 'IH N T ER N EH T') return 'อินเทอร์เน็ต';
  if (flat === 'T OW P AA L AH JH IY' || flat === 'T AH P AA L AH JH IY') return 'โทโพโลยี';

  const syllables = segmentSyllables(phonemes);
  return syllables.map(renderSyllableToThai).join('');
};
