import { CMU_DICT } from '../src/services/cmuDictData.ts';
import { arpabetToThai } from '../src/services/arpabetToThai.ts';
import { getThaiPhonetic } from '../src/services/phoneticService.ts';

console.log('Testing Local CMUdict + ARPAbet-to-Thai Phoneme Synthesizer...\n');

const testWords = [
  'premium',
  'bat',
  'cat',
  'reading',
  'play',
  'leader',
  'schedule',
  'education',
  'battery',
  'computer',
  'digital',
  'internet',
  'resilience',
  'magnificent',
  'innovation',
  'dog',
  'cup',
  'bus',
];

console.log('------------------------------------------------------------');
console.log(' Word        | CMU ARPAbet Phonemes             | Thai Reading');
console.log('------------------------------------------------------------');

for (const word of testWords) {
  const phonemes = CMU_DICT[word] || ['(rule-based)'];
  const reading = getThaiPhonetic(word);
  const wordPadded = word.padEnd(11, ' ');
  const phonemesPadded = phonemes.join(' ').padEnd(32, ' ');
  console.log(` ${wordPadded} | ${phonemesPadded} | ${reading}`);
}

console.log('------------------------------------------------------------');
console.log('🎉 Local CMUdict + Phoneme Synthesizer test completed successfully!');
