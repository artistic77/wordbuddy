// ==============================================================================
// English -> Thai Phonetic Pronunciation Service (คำอ่านภาษาไทย)
// Core lightweight lookup + educational rules
// ==============================================================================

const COMMON_PHONETICS: Record<string, string> = {
  bat: 'แบท',
  cat: 'แคท',
  hat: 'แฮท',
  rat: 'แรท',
  mat: 'แมท',
  fat: 'แฟท',
  reading: 'รีดดิ้ง',
  read: 'รีด',
  play: 'เพลย์',
  playing: 'เพลย์อิ้ง',
  dog: 'ด็อก',
  book: 'บุ๊ค',
  school: 'สคูล',
  student: 'สติวเดนท์',
  teacher: 'ทีชเชอร์',
  pencil: 'เพนเซิล',
  apple: 'แอปเปิ้ล',
  banana: 'บานาน่า',
  orange: 'ออเรนจ์',
  animal: 'แอนิมอล',
  water: 'วอเทอร์',
  sun: 'ซัน',
  moon: 'มูน',
  star: 'สตาร์',
  tree: 'ทรี',
  flower: 'ฟลาวเวอร์',
  house: 'เฮาส์',
  car: 'คาร์',
  bus: 'บัส',
  train: 'เทรน',
  friend: 'เฟรนด์',
  family: 'แฟมิลี่',
  happy: 'แฮปปี้',
  beautiful: 'บิวตี้ฟูล',
  diligent: 'ดิลิเจินท์',
  courage: 'เคอริจ',
  courageous: 'เคอเรเจิส',
  explore: 'เอ็กซ์พลอร์',
  achieve: 'อะชีฟ',
  curious: 'คิวเรียส',
  brilliant: 'บริลเลียนท์',
  creativity: 'ครีเอทิวิตี้',
  enthusiasm: 'เอนทูซิแอสซึม',
  persevere: 'เพอร์ซิเวียร์',
  magnificent: 'แมกนิฟิเซินท์',
  resilience: 'เรซิลิเอนซ์',
  innovation: 'อินโนเวชั่น',
  leader: 'ลีดเดอร์',
  leadership: 'ลีดเดอร์ชิพ',
  lead: 'ลีด',
  write: 'ไรท์',
  writing: 'ไรท์ทิ้ง',
  speak: 'สปีค',
  speaking: 'สปีคกิ้ง',
  listen: 'ลิสเซิน',
  listening: 'ลิสเซินนิ่ง',
  premium: 'พรีเมียม',
  schedule: 'สเกดจูล',
  education: 'เอ็ดดูเคชั่น',
  battery: 'แบตเตอรี่',
  topology: 'โทโพโลยี',
  method: 'เมธอด',
  pattern: 'แพทเทิร์น',
  function: 'ฟังก์ชัน',
  algorithm: 'อัลกอริทึม',
  database: 'เดตาเบส',
  server: 'เซิร์ฟเวอร์',
};

// Initial consonant mapping
const INITIAL_CONSONANTS: Record<string, string> = {
  b: 'บ',
  c: 'ค',
  d: 'ด',
  f: 'ฟ',
  g: 'ก',
  h: 'ฮ',
  j: 'จ',
  k: 'ค',
  l: 'ล',
  m: 'ม',
  n: 'น',
  p: 'พ',
  qu: 'คว',
  r: 'ร',
  s: 'ซ',
  t: 'ท',
  v: 'ว',
  w: 'ว',
  x: 'ซ',
  y: 'ย',
  z: 'ซ',
  ch: 'ช',
  sh: 'ช',
  th: 'ธ',
  ph: 'ฟ',
  pl: 'พล',
  pr: 'พร',
  bl: 'บล',
  br: 'บร',
  cl: 'คล',
  cr: 'คร',
  fl: 'ฟล',
  fr: 'ฟร',
  gl: 'กล',
  gr: 'กร',
  sp: 'สป',
  st: 'สต',
  sk: 'สค',
  sc: 'สค',
  sm: 'สม',
  sn: 'สน',
  sl: 'สล',
  sw: 'สว',
  tr: 'ทร',
  dr: 'ดร',
};

// Final consonant mapping
const FINAL_CONSONANTS: Record<string, string> = {
  t: 'ท',
  d: 'ด',
  p: 'พ',
  b: 'บ',
  k: 'ก',
  c: 'ก',
  ck: 'ก',
  g: 'ก',
  m: 'ม',
  n: 'น',
  ng: 'ง',
  l: 'ล',
  s: 'ส์',
  ce: 'ซ์',
  se: 'ส์',
  x: 'กส์',
  sh: 'ช',
  ch: 'ช',
  th: 'ท์',
};

/**
 * Returns Thai phonetic reading (คำอ่านภาษาไทย)
 */
export const getThaiPhonetic = (englishWord: string): string => {
  const clean = englishWord.trim().toLowerCase();
  if (!clean) return '';

  // 1. Direct dictionary match
  if (COMMON_PHONETICS[clean]) {
    return COMMON_PHONETICS[clean];
  }

  // 2. Multi-word phrase support
  if (clean.includes(' ')) {
    return clean
      .split(/\s+/)
      .map((w) => getThaiPhonetic(w))
      .join(' ');
  }

  // 3. Suffix rule checks
  if (clean.endsWith('ing') && clean.length > 3) {
    const base = clean.slice(0, -3);
    return `${getThaiPhonetic(base)}อิ้ง`;
  }
  if (clean.endsWith('tion') && clean.length > 4) {
    const base = clean.slice(0, -4);
    return `${getThaiPhonetic(base)}ชั่น`;
  }
  if (clean.endsWith('ment') && clean.length > 4) {
    const base = clean.slice(0, -4);
    return `${getThaiPhonetic(base)}เมินท์`;
  }
  if (clean.endsWith('ness') && clean.length > 4) {
    const base = clean.slice(0, -4);
    return `${getThaiPhonetic(base)}เนส`;
  }
  if (clean.endsWith('ful') && clean.length > 3) {
    const base = clean.slice(0, -3);
    return `${getThaiPhonetic(base)}ฟูล`;
  }
  if (clean.endsWith('less') && clean.length > 4) {
    const base = clean.slice(0, -4);
    return `${getThaiPhonetic(base)}เลส`;
  }
  if (clean.endsWith('ly') && clean.length > 3) {
    const base = clean.slice(0, -2);
    return `${getThaiPhonetic(base)}ลี่`;
  }
  if (clean.endsWith('er') && clean.length > 3) {
    const base = clean.slice(0, -2);
    return `${getThaiPhonetic(base)}เออร์`;
  }

  // 4. CVC (Consonant-Vowel-Consonant) phonetic rules
  const cvcMatch = clean.match(/^([b-df-hj-np-tv-z]{1,2})([aeiou])([b-df-hj-np-tv-z]{1,2})$/);
  if (cvcMatch) {
    const [, init, vowel, fin] = cvcMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    const thaiFin = FINAL_CONSONANTS[fin] || 'ท์';

    if (vowel === 'a') return `แ${thaiInit}${thaiFin}`;
    if (vowel === 'e') return `เอ${thaiInit}${thaiFin}`;
    if (vowel === 'i') return `${thaiInit}ิ${thaiFin}`;
    if (vowel === 'o') return `${thaiInit}็อ${thaiFin}`;
    if (vowel === 'u') return `${thaiInit}ั${thaiFin}`;
  }

  if (clean.endsWith('ay') || clean.endsWith('ey')) {
    const baseCons = clean.slice(0, -2);
    const thaiInit = INITIAL_CONSONANTS[baseCons] || 'พ';
    return `เ${thaiInit}ย์`;
  }

  if (clean.includes('ee') || clean.includes('ea')) {
    const match = clean.match(/^([b-df-hj-np-tv-z]{1,2})(?:ee|ea)([b-df-hj-np-tv-z]*)$/);
    if (match) {
      const thaiInit = INITIAL_CONSONANTS[match[1]] || 'อ';
      const thaiFin = match[2] ? FINAL_CONSONANTS[match[2]] || 'ท์' : '';
      return `${thaiInit}ี${thaiFin}`;
    }
  }

  let result = '';
  let i = 0;
  while (i < clean.length) {
    const two = clean.slice(i, i + 2);
    if (INITIAL_CONSONANTS[two]) {
      result += INITIAL_CONSONANTS[two];
      i += 2;
      continue;
    }

    const char = clean[i];
    if (char === 'a') result += 'า';
    else if (char === 'e') result += 'เอ';
    else if (char === 'i') result += 'ิ';
    else if (char === 'o') result += 'อ';
    else if (char === 'u') result += 'ุ';
    else if (INITIAL_CONSONANTS[char]) {
      result += INITIAL_CONSONANTS[char];
    }
    i++;
  }

  return result || clean;
};
