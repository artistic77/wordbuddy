import { getThaiPhonetic } from '../src/services/phoneticService.ts';
import { CMU_DICT } from '../src/services/cmuDictData.ts';

const word = 'topology';
console.log('Word:', word);
console.log('CMU ARPAbet:', CMU_DICT[word]);
console.log('Thai Pronunciation (คำอ่านภาษาไทย):', getThaiPhonetic(word));
