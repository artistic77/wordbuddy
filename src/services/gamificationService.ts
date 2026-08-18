export type PetType =
  | 'moji'
  | 'bubble'
  | 'puipui'
  | 'luno'
  | 'milly'
  | 'creamy'
  | 'gonga'
  | 'wingy'
  | 'shadow'
  | 'citra';

export interface PetAccessory {
  hat?: string;
  glasses?: string;
  clothes?: string;
}

export interface PetData {
  id: string;
  name: string;
  nameTh: string;
  personality: string;
  type: PetType;
  level: number;
  exp: number;
  maxExp: number;
  hunger: number; // 0 - 100
  happiness: number; // 0 - 100
  str: number; // Attack
  agi: number; // Speed / Critical
  intStat: number; // Magic / Defense
  power: number; // Special Burst
  equippedAccessories?: PetAccessory;
}

export interface ShopItem {
  id: string;
  name: string;
  nameTh: string;
  type: 'food' | 'potion' | 'glasses' | 'outfit';
  icon: string;
  price: number;
  hungerRestore?: number;
  happinessGain?: number;
  expGain?: number;
  statBonus?: {
    str?: number;
    agi?: number;
    intStat?: number;
    power?: number;
  };
  description: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardCoins: number;
  rewardExp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface BossStage {
  id: number;
  stageNumber: number;
  name: string;
  title: string;
  icon: string;
  avatarBg: string;
  maxHp: number;
  atk: number;
  rewardCoins: number;
  rewardExp: number;
  isUnlocked: boolean;
  bgClass: string;
}

export const FASHION_GLASSES: ShopItem[] = [
  { id: 'gl_round', name: 'Round Glasses', nameTh: 'แว่นกลม', type: 'glasses', icon: '👓', price: 45, description: 'แว่นตากลมสไตล์เด็กเนิร์ดสุดน่ารัก (+2 INT)', statBonus: { intStat: 2 } },
  { id: 'gl_clear_round', name: 'Clear Round Glasses', nameTh: 'แว่นกลมใส', type: 'glasses', icon: '👓', price: 50, description: 'แว่นตากลมเลนส์ใสกรอบบางเบา (+2 AGI)', statBonus: { agi: 2 } },
  { id: 'gl_star', name: 'Star Glasses', nameTh: 'แว่นดาว', type: 'glasses', icon: '⭐', price: 65, description: 'แว่นทรงดาวสีเหลืองเปล่งประกาย (+3 POWER)', statBonus: { power: 3 } },
  { id: 'gl_pixel', name: 'Pixel Shades', nameTh: 'แว่นพิกเซล', type: 'glasses', icon: '🕶️', price: 80, description: 'แว่นตาดำ 8-bit สาย Thug Life สุดเท่ (+3 STR)', statBonus: { str: 3 } },
  { id: 'gl_heart', name: 'Heart Glasses', nameTh: 'แว่นหัวใจ', type: 'glasses', icon: '💖', price: 60, description: 'แว่นตากรอบหัวใจสีชมพูหวานแหวว (+3 INT)', statBonus: { intStat: 3 } },
  { id: 'gl_vintage', name: 'Vintage Round', nameTh: 'แว่นกลมวินเทจ', type: 'glasses', icon: '👓', price: 55, description: 'แว่นตากลมกรอบทองสไตล์คลาสสิก (+2 INT)', statBonus: { intStat: 2 } },
  { id: 'gl_square', name: 'Square Glasses', nameTh: 'แว่นสี่เหลี่ยม', type: 'glasses', icon: '🕶️', price: 50, description: 'แว่นเหลี่ยมสีเขียวลุคนักวิชาการ (+2 AGI)', statBonus: { agi: 2 } },
  { id: 'gl_color_rim', name: 'Color Rim Glasses', nameTh: 'แว่นกลมกรอบสี', type: 'glasses', icon: '👓', price: 55, description: 'แว่นตากลมกรอบสีสันสดใส (+2 POWER)', statBonus: { power: 2 } },
  { id: 'gl_oversize', name: 'Oversized Glasses', nameTh: 'แว่นโอเวอร์ไซส์', type: 'glasses', icon: '🕶️', price: 70, description: 'แว่นตาดำอันใหญ่ทรงแฟชั่น (+3 STR)', statBonus: { str: 3 } },
  { id: 'gl_pineapple', name: 'Pineapple Glasses', nameTh: 'แว่นสับปะรด', type: 'glasses', icon: '🍍', price: 75, description: 'แว่นแฟนซีลายสับปะรดรับหน้าร้อน (+3 AGI)', statBonus: { agi: 3 } },
  { id: 'gl_shutter', name: 'Shutter Shades', nameTh: 'แว่นชัตเตอร์', type: 'glasses', icon: '🕶️', price: 85, description: 'แว่นตารางซี่ลายปาร์ตี้สุดชิค (+4 POWER)', statBonus: { power: 4 } },
  { id: 'gl_black_heart', name: 'Black Heart Shades', nameTh: 'แว่นหัวใจดำ', type: 'glasses', icon: '🖤', price: 70, description: 'แว่นกันแดดหัวใจสีดำขอบขาว (+3 STR)', statBonus: { str: 3 } },
  { id: 'gl_sport', name: 'Sport Sunglasses', nameTh: 'แว่นสปอร์ต', type: 'glasses', icon: '🕶️', price: 65, description: 'แว่นทรงสปอร์ตพร้อมลุยทุกกิจกรรม (+3 AGI)', statBonus: { agi: 3 } },
  { id: 'gl_monocle', name: 'Gentleman Monocle', nameTh: 'แว่นโมโนเคิล', type: 'glasses', icon: '🧐', price: 90, description: 'แว่นตาข้างเดียวพร้อมสายโซ่ทองหรูหรา (+4 INT)', statBonus: { intStat: 4 } },
  { id: 'gl_pink_tint', name: 'Pink Tint Glasses', nameTh: 'แว่นสีชมพูใส', type: 'glasses', icon: '🌸', price: 60, description: 'แว่นตาเลนส์สีชมพูอ่อนละมุนตา (+2 INT)', statBonus: { intStat: 2 } },
  { id: 'gl_cateye', name: 'Cat-Eye Glasses', nameTh: 'แว่นแคทอาย', type: 'glasses', icon: '🕶️', price: 65, description: 'แว่นทรงตาแมวเฉี่ยวคมดูมีเสน่ห์ (+3 AGI)', statBonus: { agi: 3 } },
  { id: 'gl_swirl', name: 'Swirl Glasses', nameTh: 'แว่นลายก้นหอย', type: 'glasses', icon: '🌀', price: 75, description: 'แว่นลายก้นหอยลานตา ชวนมึนงง (+3 POWER)', statBonus: { power: 3 } },
  { id: 'gl_aviator', name: 'Aviator Glasses', nameTh: 'แว่นนักบิน', type: 'glasses', icon: '✈️', price: 80, description: 'แว่นเรย์แบนทรงนักบินสุดเท่กรอบทอง (+4 STR)', statBonus: { str: 4 } },
  { id: 'gl_steampunk', name: 'Steampunk Goggles', nameTh: 'แว่นสตีมพังก์', type: 'glasses', icon: '⚙️', price: 95, description: 'แว่นตากลไกฟันเฟืองทองเหลืองสุดคูล (+4 INT)', statBonus: { intStat: 4 } },
  { id: 'gl_lemon', name: 'Lemon Glasses', nameTh: 'แว่นเลมอน', type: 'glasses', icon: '🍋', price: 70, description: 'แว่นเลนส์เสี้ยวเลมอนสีส้มสดใส (+3 AGI)', statBonus: { agi: 3 } },
];

export const FASHION_OUTFITS: ShopItem[] = [
  { id: 'cl_hoodie', name: 'Comfy Hoodie', nameTh: 'ชุดฮู้ดดี้', type: 'outfit', icon: '🧥', price: 80, description: 'เสื้อกันหนาวฮู้ดดี้สีเขียวอุ่นสบาย (+4 STR)', statBonus: { str: 4 } },
  { id: 'cl_student', name: 'School Uniform', nameTh: 'ชุดนักเรียน', type: 'outfit', icon: '👔', price: 90, description: 'ชุดนักเรียนกะลาสีญี่ปุ่นพร้อมหมวก (+4 INT)', statBonus: { intStat: 4 } },
  { id: 'cl_dino', name: 'Dino Kigurumi', nameTh: 'ชุดไดโนเสาร์', type: 'outfit', icon: '🦖', price: 120, description: 'ชุดมาสคอตไดโนเสาร์สีเขียวอ่อนมีหนาม (+5 STR)', statBonus: { str: 5 } },
  { id: 'cl_vampire', name: 'Vampire Cape', nameTh: 'ชุดแวมไพร์', type: 'outfit', icon: '🧛', price: 130, description: 'ผ้าคลุมท่านเคานต์แวมไพร์สีดำแดง (+5 POWER)', statBonus: { power: 5 } },
  { id: 'cl_dress', name: 'Floral Dress', nameTh: 'ชุดเดรส', type: 'outfit', icon: '👗', price: 85, description: 'ชุดกระโปรงเดรสหวานแหววสีชมพู (+4 AGI)', statBonus: { agi: 4 } },
  { id: 'cl_sweater', name: 'Knitted Sweater', nameTh: 'ชุดไหมพรม', type: 'outfit', icon: '🧶', price: 75, description: 'เสื้อสเวตเตอร์ถักไหมพรมอบอุ่น (+4 INT)', statBonus: { intStat: 4 } },
  { id: 'cl_athlete', name: 'Athlete Jersey', nameTh: 'ชุดนักกีฬา', type: 'outfit', icon: '🎽', price: 85, description: 'เสื้อกีฬาเบอร์ 7 วิ่งไวคล่องตัว (+5 AGI)', statBonus: { agi: 5 } },
  { id: 'cl_wizard', name: 'Wizard Robe', nameTh: 'ชุดพ่อมด', type: 'outfit', icon: '🧙', price: 140, description: 'เสื้อคลุมจอมเวทสีน้ำเงินพร้อมหมวกดาว (+6 INT)', statBonus: { intStat: 6 } },
  { id: 'cl_rocker', name: 'Rocker Leather', nameTh: 'ชุดร็อคเกอร์', type: 'outfit', icon: '🎸', price: 110, description: 'แจ็กเก็ตหนังไบเกอร์สายร็อคพร้อมหมุด (+5 STR)', statBonus: { str: 5 } },
  { id: 'cl_hawaii', name: 'Hawaiian Shirt', nameTh: 'ชุดฮาวาย', type: 'outfit', icon: '🌺', price: 75, description: 'เสื้อเชิ้ตลายดอกไม้ไปเที่ยวทะเล (+4 AGI)', statBonus: { agi: 4 } },
  { id: 'cl_detective', name: 'Detective Coat', nameTh: 'ชุดนักสืบ', type: 'outfit', icon: '🕵️', price: 120, description: 'เสื้อโค้ทเชอร์ล็อกโฮล์มส์พร้อมหมวกและแว่นขยาย (+5 INT)', statBonus: { intStat: 5 } },
  { id: 'cl_doctor', name: 'Doctor Coat', nameTh: 'ชุดคุณหมอ', type: 'outfit', icon: '🩺', price: 115, description: 'เสื้อกาวน์คุณหมอพร้อมหูฟังตรวจชีพจร (+5 INT)', statBonus: { intStat: 5 } },
  { id: 'cl_chef', name: 'Chef Uniform', nameTh: 'ชุดเชฟ', type: 'outfit', icon: '👨‍🍳', price: 100, description: 'ชุดพ่อครัวกระทะเหล็กพร้อมหมวกทรงสูง (+4 STR)', statBonus: { str: 4 } },
  { id: 'cl_astronaut', name: 'Astronaut Suit', nameTh: 'ชุดนักบินอวกาศ', type: 'outfit', icon: '🧑‍🚀', price: 160, description: 'ชุดอวกาศไฮเทคป้องกันแรงโน้มถ่วง (+6 POWER)', statBonus: { power: 6 } },
  { id: 'cl_kimono', name: 'Kimono Dress', nameTh: 'ชุดกิโมโน', type: 'outfit', icon: '👘', price: 110, description: 'ชุดยูกาตะกิโมโนญี่ปุ่นลายดอกซากุระ (+4 AGI)', statBonus: { agi: 4 } },
  { id: 'cl_bee', name: 'Bumblebee Suit', nameTh: 'ชุดผึ้งน้อย', type: 'outfit', icon: '🐝', price: 95, description: 'ชุดผึ้งลายทางเหลืองดำมีปีกดุ๊กดิ๊ก (+4 AGI)', statBonus: { agi: 4 } },
  { id: 'cl_farmer', name: 'Farmer Overalls', nameTh: 'ชุดชาวไร่', type: 'outfit', icon: '🌾', price: 80, description: 'ชุดเอี๊ยมยีนส์ทำสวนพร้อมหมวกฟาง (+4 STR)', statBonus: { str: 4 } },
  { id: 'cl_tuxedo', name: 'Tuxedo Suit', nameTh: 'ชุดทักซิโด้', type: 'outfit', icon: '🤵', price: 130, description: 'สูททักซิโด้สุภาพบุรุษสุดหรูพร้อมหมวกทรงสูง (+5 INT)', statBonus: { intStat: 5 } },
  { id: 'cl_ninja', name: 'Ninja Suit', nameTh: 'ชุดนินจา', type: 'outfit', icon: '🥷', price: 140, description: 'ชุดนินจาดำลอบเร้นพร้อมผ้าคาดหน้าผาก (+6 AGI)', statBonus: { agi: 6 } },
  { id: 'cl_santa', name: 'Santa Suit', nameTh: 'ชุดซานต้า', type: 'outfit', icon: '🎅', price: 125, description: 'ชุดซานตาคลอสสีแดงสดใสส่งความสุข (+5 POWER)', statBonus: { power: 5 } },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'apple',
    name: 'Crispy Apple',
    nameTh: 'แอปเปิลกรอบ',
    type: 'food',
    icon: '🍎',
    price: 20,
    hungerRestore: 25,
    happinessGain: 10,
    expGain: 15,
    description: 'Fresh organic apple that restores 25 hunger and boosts happiness.',
  },
  {
    id: 'fish',
    name: 'Golden Salmon',
    nameTh: 'แซลมอนสีทอง',
    type: 'food',
    icon: '🐟',
    price: 45,
    hungerRestore: 50,
    happinessGain: 25,
    expGain: 35,
    description: 'Delicious fish loved by pets. Restores 50 hunger.',
  },
  {
    id: 'steak',
    name: 'Prime Ribeye',
    nameTh: 'สเต๊กเนื้อพรีเมียม',
    type: 'food',
    icon: '🥩',
    price: 80,
    hungerRestore: 85,
    happinessGain: 40,
    expGain: 60,
    description: 'Juicy steak that fuels huge strength and restores 85 hunger.',
  },
  {
    id: 'berry',
    name: 'Cosmic Berry',
    nameTh: 'เบอร์รี่จักรวาล',
    type: 'food',
    icon: '🫐',
    price: 120,
    hungerRestore: 100,
    happinessGain: 60,
    expGain: 120,
    description: 'Mystical fruit that completely fills hunger and gives huge EXP!',
  },
  {
    id: 'potion_exp',
    name: 'Super EXP Potion',
    nameTh: 'ยาน้ำยาเพิ่ม EXP',
    type: 'potion',
    icon: '🧪',
    price: 150,
    hungerRestore: 0,
    happinessGain: 20,
    expGain: 250,
    description: 'Instantly grants 250 Pet EXP for rapid leveling up.',
  },
  {
    id: 'potion_energy',
    name: 'Hyper Elixir',
    nameTh: 'ยาฟื้นพลังกาย',
    type: 'potion',
    icon: '⚡',
    price: 100,
    hungerRestore: 100,
    happinessGain: 100,
    expGain: 80,
    description: 'Fully maxes out both Hunger and Happiness immediately.',
  },
  ...FASHION_GLASSES,
  ...FASHION_OUTFITS,
];

export const BOSS_STAGES: BossStage[] = [
  {
    id: 1,
    stageNumber: 1,
    name: 'Goblin Grunt',
    title: 'ป่าพงไพรแห่งการเริ่มต้น (Whispering Forest)',
    icon: '👺',
    avatarBg: 'from-emerald-500 to-green-600',
    maxHp: 300,
    atk: 25,
    rewardCoins: 150,
    rewardExp: 100,
    isUnlocked: true,
    bgClass: 'from-green-900/40 via-emerald-950/60 to-slate-950',
  },
  {
    id: 2,
    stageNumber: 2,
    name: 'Frost Yeti',
    title: 'ยอดเขาหิมะเยือกแข็ง (Glacial Peak)',
    icon: '❄️',
    avatarBg: 'from-cyan-500 to-blue-600',
    maxHp: 650,
    atk: 45,
    rewardCoins: 300,
    rewardExp: 220,
    isUnlocked: false,
    bgClass: 'from-cyan-950/50 via-blue-950/60 to-slate-950',
  },
  {
    id: 3,
    stageNumber: 3,
    name: 'Magma Golem',
    title: 'ภูเขาไฟลาวาเดือด (Molten Core)',
    icon: '🌋',
    avatarBg: 'from-amber-600 to-red-600',
    maxHp: 1100,
    atk: 75,
    rewardCoins: 500,
    rewardExp: 400,
    isUnlocked: false,
    bgClass: 'from-orange-950/50 via-red-950/60 to-slate-950',
  },
  {
    id: 4,
    stageNumber: 4,
    name: 'Shadow Wyrm',
    title: 'ปราสาทรัตติกาล (Shadow Citadel)',
    icon: '🐉',
    avatarBg: 'from-purple-600 to-indigo-800',
    maxHp: 1800,
    atk: 110,
    rewardCoins: 800,
    rewardExp: 700,
    isUnlocked: false,
    bgClass: 'from-purple-950/50 via-indigo-950/60 to-slate-950',
  },
  {
    id: 5,
    stageNumber: 5,
    name: 'Void Overlord',
    title: 'บัลลังก์มิติมืดสูงสุด (Void Throne)',
    icon: '👑',
    avatarBg: 'from-fuchsia-600 to-rose-700',
    maxHp: 2800,
    atk: 160,
    rewardCoins: 1500,
    rewardExp: 1500,
    isUnlocked: false,
    bgClass: 'from-rose-950/50 via-slate-950 to-black',
  },
];

export const DEFAULT_PETS: Record<PetType, PetData> = {
  moji: {
    id: 'pet-moji',
    name: 'Moji',
    nameTh: 'โมจิ',
    personality: 'อ่อนโยน ขี้อาย',
    type: 'moji',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 85,
    happiness: 90,
    str: 22,
    agi: 24,
    intStat: 32,
    power: 26,
  },
  bubble: {
    id: 'pet-bubble',
    name: 'Bubble',
    nameTh: 'บับเบิ้ล',
    personality: 'สดใส ร่าเริง',
    type: 'bubble',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 80,
    happiness: 95,
    str: 24,
    agi: 30,
    intStat: 26,
    power: 28,
  },
  puipui: {
    id: 'pet-puipui',
    name: 'Pui Pui',
    nameTh: 'ปุยปุย',
    personality: 'ร่าเริง ขี้เล่น',
    type: 'puipui',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 85,
    happiness: 90,
    str: 28,
    agi: 28,
    intStat: 22,
    power: 30,
  },
  luno: {
    id: 'pet-luno',
    name: 'Luno',
    nameTh: 'ลูโน่',
    personality: 'ลึกลับ เท่ๆ',
    type: 'luno',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 75,
    happiness: 85,
    str: 36,
    agi: 26,
    intStat: 24,
    power: 34,
  },
  milly: {
    id: 'pet-milly',
    name: 'Milly',
    nameTh: 'มิลลี่',
    personality: 'น่ารัก อ่อนหวาน',
    type: 'milly',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 90,
    happiness: 95,
    str: 20,
    agi: 32,
    intStat: 30,
    power: 26,
  },
  creamy: {
    id: 'pet-creamy',
    name: 'Creamy',
    nameTh: 'ครีมมี่',
    personality: 'ใจดี อบอุ่น',
    type: 'creamy',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 90,
    happiness: 90,
    str: 25,
    agi: 22,
    intStat: 34,
    power: 28,
  },
  gonga: {
    id: 'pet-gonga',
    name: 'Gonga',
    nameTh: 'กองก้า',
    personality: 'ซุกซน แข็งแรง',
    type: 'gonga',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 75,
    happiness: 85,
    str: 38,
    agi: 20,
    intStat: 20,
    power: 32,
  },
  wingy: {
    id: 'pet-wingy',
    name: 'Wingy',
    nameTh: 'วิงกี้',
    personality: 'ขี้สงสัย ช่างฝัน',
    type: 'wingy',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 80,
    happiness: 90,
    str: 22,
    agi: 36,
    intStat: 30,
    power: 28,
  },
  shadow: {
    id: 'pet-shadow',
    name: 'Shadow',
    nameTh: 'ชาโดว์',
    personality: 'สุขุม นิ่งๆ',
    type: 'shadow',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 80,
    happiness: 85,
    str: 28,
    agi: 28,
    intStat: 36,
    power: 32,
  },
  citra: {
    id: 'pet-citra',
    name: 'Citra',
    nameTh: 'ซิตร้า',
    personality: 'สดใส มองโลกในแง่บวก',
    type: 'citra',
    level: 1,
    exp: 0,
    maxExp: 100,
    hunger: 90,
    happiness: 95,
    str: 26,
    agi: 26,
    intStat: 26,
    power: 28,
  },
};

const DEFAULT_MISSIONS: DailyMission[] = [
  {
    id: 'mission_flashcards',
    title: 'Flashcard Workout',
    description: 'Review 10 flashcards in study mode',
    target: 10,
    progress: 0,
    rewardCoins: 50,
    rewardExp: 40,
    isCompleted: false,
    isClaimed: false,
    icon: '🎴',
  },
  {
    id: 'mission_quiz',
    title: 'Quiz Enthusiast',
    description: 'Score 5 correct answers in Multiple Choice or Matching',
    target: 5,
    progress: 0,
    rewardCoins: 75,
    rewardExp: 60,
    isCompleted: false,
    isClaimed: false,
    icon: '🎯',
  },
  {
    id: 'mission_spelling',
    title: 'Spell Master',
    description: 'Complete 1 full Spelling Quiz session',
    target: 1,
    progress: 0,
    rewardCoins: 80,
    rewardExp: 70,
    isCompleted: false,
    isClaimed: false,
    icon: '🎧',
  },
  {
    id: 'mission_feed_pet',
    title: 'Caring Companion',
    description: 'Feed your virtual pet at least 1 delicious meal',
    target: 1,
    progress: 0,
    rewardCoins: 40,
    rewardExp: 30,
    isCompleted: false,
    isClaimed: false,
    icon: '🍖',
  },
];

class GamificationManager {
  private coinsKey = 'wb_user_coins';
  private petKey = 'wb_user_pet';
  private inventoryKey = 'wb_user_inventory';
  private missionsKey = 'wb_daily_missions';
  private bossStageKey = 'wb_unlocked_boss_stages';

  getCoins(): number {
    const raw = localStorage.getItem(this.coinsKey);
    return raw ? parseInt(raw, 10) : 250; // default starting coins 250
  }

  addCoins(amount: number) {
    const current = this.getCoins();
    const updated = Math.max(0, current + amount);
    localStorage.setItem(this.coinsKey, updated.toString());
    window.dispatchEvent(new CustomEvent('wb:coins_updated', { detail: { coins: updated } }));
    return updated;
  }

  getActivePet(): PetData {
    const raw = localStorage.getItem(this.petKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && DEFAULT_PETS[parsed.type as PetType]) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    const defaultPet = DEFAULT_PETS.moji;
    this.savePet(defaultPet);
    return defaultPet;
  }

  savePet(pet: PetData) {
    localStorage.setItem(this.petKey, JSON.stringify(pet));
    window.dispatchEvent(new CustomEvent('wb:pet_updated', { detail: { pet } }));
  }

  switchPet(type: PetType): PetData {
    const newPet = DEFAULT_PETS[type] || DEFAULT_PETS.moji;
    this.savePet(newPet);
    return newPet;
  }

  addPetExp(amount: number): { pet: PetData; leveledUp: boolean } {
    const pet = this.getActivePet();
    pet.exp += amount;
    let leveledUp = false;

    while (pet.exp >= pet.maxExp) {
      pet.exp -= pet.maxExp;
      pet.level += 1;
      pet.maxExp = Math.round(pet.maxExp * 1.35);
      pet.str += 4;
      pet.agi += 3;
      pet.intStat += 4;
      pet.power += 5;
      leveledUp = true;
    }

    this.savePet(pet);
    return { pet, leveledUp };
  }

  feedPet(itemId: string): { success: boolean; message: string; pet?: PetData } {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };

    const inventory = this.getInventory();
    if (!inventory[itemId] || inventory[itemId] <= 0) {
      return { success: false, message: 'You do not own this item!' };
    }

    // Deduct 1 from inventory
    inventory[itemId] -= 1;
    if (inventory[itemId] <= 0) delete inventory[itemId];
    this.saveInventory(inventory);

    // Apply stats to pet
    const pet = this.getActivePet();
    pet.hunger = Math.min(100, pet.hunger + (item.hungerRestore || 0));
    pet.happiness = Math.min(100, pet.happiness + (item.happinessGain || 0));
    
    // Add exp
    const expToAdd = item.expGain || 0;
    if (expToAdd > 0) {
      pet.exp += expToAdd;
      while (pet.exp >= pet.maxExp) {
        pet.exp -= pet.maxExp;
        pet.level += 1;
        pet.maxExp = Math.round(pet.maxExp * 1.35);
        pet.str += 3;
        pet.agi += 3;
        pet.intStat += 3;
        pet.power += 4;
      }
    }

    this.savePet(pet);
    this.incrementMissionProgress('mission_feed_pet', 1);

    return { success: true, message: `Fed ${item.name} to ${pet.name}!`, pet };
  }

  trainPet(type: 'int' | 'str', points: number): PetData {
    const pet = this.getActivePet();
    if (type === 'int') {
      pet.intStat += points;
      pet.power += Math.ceil(points / 2);
    } else {
      pet.str += points;
      pet.agi += Math.ceil(points / 2);
    }
    pet.happiness = Math.min(100, pet.happiness + 10);
    this.addPetExp(points * 15);
    return this.getActivePet();
  }

  equipAccessory(category: 'glasses' | 'outfit', itemId: string): { success: boolean; message: string; pet?: PetData } {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };

    const pet = this.getActivePet();
    if (!pet.equippedAccessories) pet.equippedAccessories = {};

    if (category === 'glasses') {
      pet.equippedAccessories.glasses = itemId;
    } else if (category === 'outfit') {
      pet.equippedAccessories.clothes = itemId;
    }

    this.savePet(pet);
    return { success: true, message: `Equipped ${item.nameTh} (${item.name})! ✨`, pet };
  }

  unequipAccessory(category: 'glasses' | 'outfit'): { success: boolean; pet: PetData } {
    const pet = this.getActivePet();
    if (pet.equippedAccessories) {
      if (category === 'glasses') delete pet.equippedAccessories.glasses;
      if (category === 'outfit') delete pet.equippedAccessories.clothes;
    }
    this.savePet(pet);
    return { success: true, pet };
  }

  getInventory(): Record<string, number> {
    const raw = localStorage.getItem(this.inventoryKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // Default starter inventory
    const starter: Record<string, number> = { apple: 3, fish: 1 };
    this.saveInventory(starter);
    return starter;
  }

  saveInventory(inventory: Record<string, number>) {
    localStorage.setItem(this.inventoryKey, JSON.stringify(inventory));
    window.dispatchEvent(new CustomEvent('wb:inventory_updated', { detail: { inventory } }));
  }

  buyItem(itemId: string): { success: boolean; message: string } {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found' };

    const coins = this.getCoins();
    if (coins < item.price) {
      return { success: false, message: `Not enough coins! You need ${item.price} 🪙` };
    }

    this.addCoins(-item.price);
    const inventory = this.getInventory();
    inventory[itemId] = (inventory[itemId] || 0) + 1;
    this.saveInventory(inventory);

    return { success: true, message: `Successfully bought ${item.name}! 🛍️` };
  }

  getDailyMissions(): DailyMission[] {
    const raw = localStorage.getItem(this.missionsKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    this.saveMissions(DEFAULT_MISSIONS);
    return DEFAULT_MISSIONS;
  }

  saveMissions(missions: DailyMission[]) {
    localStorage.setItem(this.missionsKey, JSON.stringify(missions));
    window.dispatchEvent(new CustomEvent('wb:missions_updated', { detail: { missions } }));
  }

  incrementMissionProgress(missionId: string, amount: number = 1) {
    const missions = this.getDailyMissions();
    const targetMission = missions.find((m) => m.id === missionId);
    if (targetMission && !targetMission.isCompleted) {
      targetMission.progress = Math.min(targetMission.target, targetMission.progress + amount);
      if (targetMission.progress >= targetMission.target) {
        targetMission.isCompleted = true;
      }
      this.saveMissions(missions);
    }
  }

  claimMissionReward(missionId: string): { success: boolean; coins: number; exp: number } {
    const missions = this.getDailyMissions();
    const m = missions.find((item) => item.id === missionId);
    if (!m || !m.isCompleted || m.isClaimed) {
      return { success: false, coins: 0, exp: 0 };
    }

    m.isClaimed = true;
    this.saveMissions(missions);
    this.addCoins(m.rewardCoins);
    this.addPetExp(m.rewardExp);

    return { success: true, coins: m.rewardCoins, exp: m.rewardExp };
  }

  getUnlockedStages(): number[] {
    const raw = localStorage.getItem(this.bossStageKey);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const starter = [1];
    localStorage.setItem(this.bossStageKey, JSON.stringify(starter));
    return starter;
  }

  unlockNextStage(currentStage: number) {
    const current = this.getUnlockedStages();
    const next = currentStage + 1;
    if (!current.includes(next) && next <= BOSS_STAGES.length) {
      current.push(next);
      localStorage.setItem(this.bossStageKey, JSON.stringify(current));
    }
  }
}

export const gamificationService = new GamificationManager();
