// ==============================================================================
// English -> Thai Phonetic Pronunciation Service (คำอ่านภาษาไทย)
// Comprehensive dictionary + intelligent English phonological parser
// ==============================================================================

export const COMMON_PHONETICS: Record<string, string> = {
  // Animals & Nature
  bat: 'แบท',
  cat: 'แคท',
  dog: 'ด็อก',
  rat: 'แรท',
  bird: 'เบิร์ด',
  girl: 'เกิร์ล',
  boy: 'บอย',
  baby: 'เบบี้',
  child: 'ไชลด์',
  children: 'ชิลเดรน',
  man: 'แมน',
  woman: 'วูแมน',
  person: 'เพอร์เซิน',
  people: 'พีเพิล',
  duck: 'ดัค',
  fish: 'ฟิช',
  frog: 'ฟร็อก',
  bear: 'แบร์',
  lion: 'ไลออน',
  tiger: 'ไทเกอร์',
  elephant: 'เอเลเฟนต์',
  monkey: 'มังกี้',
  rabbit: 'แรบบิท',
  sheep: 'ชีป',
  horse: 'ฮอร์ส',
  pig: 'พิก',
  cow: 'คาว',
  chicken: 'ชิกเก้น',
  hen: 'เฮน',
  chick: 'ชิค',
  rooster: 'รูสเตอร์',
  snake: 'สเนค',
  zebra: 'ซีบรา',
  giraffe: 'จิราฟ',
  whale: 'วาฬ',
  dolphin: 'ดอลฟิน',
  shark: 'ชาร์ก',
  crab: 'แครบ',
  shrimp: 'ชริมป์',
  octopus: 'อ็อกโทพุส',
  turtle: 'เทอร์เทิล',
  ant: 'แอนท์',
  bee: 'บี',
  butterfly: 'บัตเตอร์ฟลาย',
  mosquito: 'มอสคีโต',
  spider: 'สไปเดอร์',
  animal: 'แอนิมอล',
  pet: 'เพ็ท',
  nest: 'เนสต์',

  // Nature & Environment
  sun: 'ซัน',
  moon: 'มูน',
  star: 'สตาร์',
  sky: 'สกาย',
  cloud: 'คลาวด์',
  rain: 'เรน',
  rainbow: 'เรนโบว์',
  snow: 'สโนว์',
  wind: 'วินด์',
  storm: 'สตอร์ม',
  tree: 'ทรี',
  flower: 'ฟลาวเวอร์',
  leaf: 'ลีฟ',
  leaves: 'ลีฟส์',
  plant: 'แพลนต์',
  seed: 'ซีด',
  seeds: 'ซีดส์',
  forest: 'ฟอเรสต์',
  jungle: 'จังเกิล',
  river: 'ริเวอร์',
  sea: 'ซี',
  ocean: 'โอเชียน',
  lake: 'เลค',
  mountain: 'เมาน์เทน',
  hill: 'ฮิลล์',
  island: 'ไอแลนด์',
  beach: 'บีช',
  rock: 'ร็อค',
  stone: 'สโตน',
  sand: 'แซนด์',
  earth: 'เอิร์ธ',
  world: 'เวิลด์',
  water: 'วอเทอร์',
  fire: 'ไฟเออร์',
  air: 'แอร์',

  // School, Study & Office
  school: 'สคูล',
  student: 'สติวเดนท์',
  teacher: 'ทีชเชอร์',
  class: 'คลาส',
  classroom: 'คลาสรูม',
  lesson: 'เลสเซิน',
  study: 'สตาดี้',
  learn: 'เลิร์น',
  read: 'รีด',
  reading: 'รีดดิ้ง',
  write: 'ไรท์',
  writing: 'ไรท์ติ้ง',
  listen: 'ลิสเซิน',
  listening: 'ลิสเซินนิ่ง',
  speak: 'สปีค',
  speaking: 'สปีคกิ้ง',
  spell: 'สเปลล์',
  spelling: 'สเปลลิ่ง',
  quiz: 'ควิซ',
  test: 'เทสต์',
  exam: 'เอ็กแซม',
  book: 'บุ๊ค',
  notebook: 'โน้ตบุ๊ค',
  paper: 'เพเพอร์',
  pencil: 'เพนเซิล',
  pen: 'เพน',
  eraser: 'อิเรเซอร์',
  ruler: 'รูเลอร์',
  scissors: 'ซิสเซอร์ส',
  bag: 'แบ็ก',
  desk: 'เดสก์',
  table: 'เทเบิล',
  chair: 'แชร์',
  board: 'บอร์ด',
  computer: 'คอมพิวเตอร์',
  word: 'เวิร์ด',
  vocabulary: 'โวแคบบิวลารี',
  sentence: 'เซนเทนส์',
  language: 'แลงเกวจ',
  english: 'อิงลิช',
  math: 'แมธ',
  science: 'ไซเอนซ์',
  art: 'อาร์ต',
  music: 'มิวสิค',
  history: 'ฮิสตอรี',

  // Food & Drinks
  food: 'ฟูด',
  fruit: 'ฟรุต',
  vegetable: 'เวจจิทะเบิล',
  apple: 'แอปเปิ้ล',
  banana: 'บานาน่า',
  orange: 'ออเรนจ์',
  grape: 'เกรป',
  mango: 'แมงโก้',
  papaya: 'พาพาย่า',
  watermelon: 'วอเทอร์เมลอน',
  strawberry: 'สตรอว์เบอร์รี่',
  coconut: 'โคโค่นัท',
  lemon: 'เลมอน',
  lime: 'ไลม์',
  bread: 'เบรด',
  rice: 'ไรซ์',
  noodle: 'นูเดิล',
  meat: 'มีท',
  pork: 'พอร์ค',
  beef: 'บีฟ',
  egg: 'เอ้ก',
  milk: 'มิลค์',
  cheese: 'ชีส',
  butter: 'บัตเตอร์',
  cake: 'เค้ก',
  cookie: 'คุกกี้',
  candy: 'แคนดี้',
  ice: 'ไอซ์',
  juice: 'จูซ',
  tea: 'ที',
  coffee: 'คอฟฟี่',
  soup: 'ซุป',
  pizza: 'พิซซ่า',
  burger: 'เบอร์เกอร์',
  sandwich: 'แซนด์วิช',
  breakfast: 'เบรกฟาสต์',
  lunch: 'ลันช์',
  dinner: 'ดินเนอร์',
  restaurant: 'เรสเตอรองต์',
  kitchen: 'คิทเชน',
  cook: 'คุ้ก',
  eat: 'อีท',
  drink: 'ดริงก์',

  // Clothes & Colors
  shirt: 'เชิร์ต',
  tshirt: 'ทีเชิร์ต',
  skirt: 'สเคิร์ต',
  pants: 'แพนท์ส',
  trousers: 'เทราเซอร์ส',
  dress: 'เดรส',
  hat: 'แฮท',
  cap: 'แคป',
  shoes: 'ชูส์',
  socks: 'ซ็อคส์',
  glasses: 'กลาสเซส',
  jacket: 'แจ็คเก็ต',
  coat: 'โค้ท',
  ring: 'ริง',
  watch: 'วอทช์',
  red: 'เรด',
  blue: 'บลู',
  green: 'กรีน',
  yellow: 'เยลโลว์',
  pink: 'พิ้งค์',
  purple: 'เพอร์เพิล',
  black: 'แบล็ค',
  white: 'ไวท์',
  gray: 'เกรย์',
  grey: 'เกรย์',
  brown: 'บราวน์',
  gold: 'โกลด์',
  silver: 'ซิลเวอร์',

  // Family & People
  family: 'แฟมิลี่',
  father: 'ฟาเธอร์',
  mother: 'มาเธอร์',
  parent: 'แพเรนต์',
  parents: 'แพเรนต์ส',
  brother: 'บราเธอร์',
  sister: 'ซิสเตอร์',
  son: 'ซัน',
  daughter: 'ดอเตอร์',
  grandfather: 'แกรนด์ฟาเธอร์',
  grandmother: 'แกรนด์มาเธอร์',
  uncle: 'อังเคิล',
  aunt: 'อานท์',
  cousin: 'คัสซิน',
  friend: 'เฟรนด์',
  doctor: 'ด็อกเตอร์',
  nurse: 'เนิร์ส',
  police: 'โพลิส',
  farmer: 'ฟาร์มเมอร์',
  driver: 'ไดรเวอร์',
  pilot: 'ไพลอต',
  chef: 'เชฟ',
  king: 'คิง',
  queen: 'ควีน',
  prince: 'พรินซ์',
  princess: 'พรินเซส',

  // Body & Health
  body: 'บอดี้',
  head: 'เฮด',
  hair: 'แฮร์',
  face: 'เฟซ',
  eye: 'อาย',
  eyes: 'อายส์',
  ear: 'เอียร์',
  ears: 'เอียร์ส',
  nose: 'โนส',
  mouth: 'เมาธ์',
  tooth: 'ทูธ',
  teeth: 'ทีธ',
  lip: 'ลิป',
  tongue: 'ทัง',
  neck: 'เน็ค',
  shoulder: 'โชลเดอร์',
  arm: 'อาร์ม',
  hand: 'แฮนด์',
  finger: 'ฟิงเกอร์',
  leg: 'เลก',
  knee: 'นี',
  foot: 'ฟุต',
  feet: 'ฟีท',
  heart: 'ฮาร์ท',
  health: 'เฮลท์',
  healthy: 'เฮลท์ตี้',
  sick: 'ซิค',
  hospital: 'ฮอสพิทอล',
  medicine: 'เมดิซิน',

  // Home & Places
  house: 'เฮาส์',
  home: 'โฮม',
  room: 'รูม',
  bedroom: 'เบดรูม',
  bathroom: 'บาธรูม',
  livingroom: 'ลิฟวิ่งรูม',
  door: 'ดอร์',
  window: 'วินโดว์',
  wall: 'วอล',
  floor: 'ฟลอร์',
  roof: 'รูฟ',
  garden: 'การ์เดน',
  yard: 'ยาร์ด',
  park: 'พาร์ค',
  farm: 'ฟาร์ม',
  city: 'ซิตี้',
  town: 'ทาวน์',
  village: 'วิลเลจ',
  country: 'คันทรี',
  street: 'สตรีท',
  road: 'โรด',
  bridge: 'บริดจ์',
  shop: 'ช็อป',
  store: 'สโตร์',
  market: 'มาร์เก็ต',
  supermarket: 'ซูเปอร์มาร์เก็ต',
  bank: 'แบงก์',
  hotel: 'โฮเทล',
  airport: 'แอร์พอร์ต',
  station: 'สเตชั่น',

  // Transport
  car: 'คาร์',
  bus: 'บัส',
  van: 'แวน',
  truck: 'ทรัค',
  train: 'เทรน',
  subway: 'ซับเวย์',
  boat: 'โบท',
  ship: 'ชิพ',
  plane: 'เพลน',
  airplane: 'แอร์เพลน',
  bicycle: 'ไบซิเคิล',
  bike: 'ไบค์',
  motorcycle: 'มอเตอร์ไซเคิล',
  taxi: 'แท็กซี่',

  // Time & Numbers
  time: 'ไทม์',
  clock: 'คล็อก',
  hour: 'เอาเออร์',
  minute: 'มินิท',
  second: 'เซคันด์',
  day: 'เดย์',
  today: 'ทูเดย์',
  yesterday: 'เยสเตอร์เดย์',
  tomorrow: 'ทูมอร์โรว์',
  morning: 'มอร์นิ่ง',
  afternoon: 'อาฟเตอร์นูน',
  evening: 'อีฟนิ่ง',
  night: 'ไนท์',
  week: 'วีค',
  weekend: 'วีคเอนด์',
  month: 'มันธ์',
  year: 'เยียร์',
  // Months of the Year (เดือนทั้ง 12)
  january: 'แจนยัวรี่',
  february: 'เฟบรัวรี่',
  march: 'มาร์ช',
  april: 'เอพริล',
  may: 'เมย์',
  june: 'จูน',
  july: 'จูลาย',
  august: 'ออกัสต์',
  september: 'เซปเทมเบอร์',
  october: 'อ็อกโทเบอร์',
  november: 'โนเวมเบอร์',
  december: 'ดิเซมเบอร์',

  // Seasons (ฤดูกาล)
  season: 'ซีซัน',
  seasons: 'ซีซันส์',
  spring: 'สปริง',
  summer: 'ซัมเมอร์',
  autumn: 'ออทัมน์',
  fall: 'ฟอล',
  winter: 'วินเทอร์',

  // Days of the Week
  monday: 'มันเดย์',
  tuesday: 'ทิวส์เดย์',
  wednesday: 'เวนส์เดย์',
  thursday: 'เธิร์สเดย์',
  friday: 'ฟรายเดย์',
  saturday: 'แซเทอร์เดย์',
  sunday: 'ซันเดย์',

  // Numbers & Ordinals
  zero: 'ซีโร่',
  one: 'วัน',
  two: 'ทู',
  three: 'ทรี',
  four: 'ฟอร์',
  five: 'ไฟฟ์',
  six: 'ซิกส์',
  seven: 'เซเว่น',
  eight: 'เอท',
  nine: 'ไนน์',
  ten: 'เทน',
  eleven: 'อิเลฟเว่น',
  twelve: 'ทเวลฟ์',
  thirteen: 'เธิร์ตทีน',
  fourteen: 'ฟอร์ทีน',
  fifteen: 'ฟิฟทีน',
  sixteen: 'ซิกส์ทีน',
  seventeen: 'เซเว่นทีน',
  eighteen: 'เอททีน',
  nineteen: 'ไนน์ทีน',
  twenty: 'ทเวนตี้',
  thirty: 'เธิร์ตตี้',
  forty: 'ฟอร์ตี้',
  fifty: 'ฟิฟตี้',
  sixty: 'ซิกส์ตี้',
  seventy: 'เซเว่นตี้',
  eighty: 'เอทตี้',
  ninety: 'ไนน์ตี้',
  hundred: 'ฮันเดรด',
  thousand: 'เธาซันด์',
  million: 'มิลเลียน',
  first: 'เฟิร์สต์',
  second_num: 'เซคันด์',
  third: 'เธิร์ด',
  fourth: 'ฟอร์ธ',
  fifth: 'ฟิฟธ์',

  // Common Verbs & Actions
  play: 'เพลย์',
  playing: 'เพลย์อิ้ง',
  walk: 'วอล์ค',
  walking: 'วอล์คกิ้ง',
  run: 'รัน',
  running: 'รันนิ่ง',
  jump: 'จัมพ์',
  fly: 'ฟลาย',
  swim: 'สวิม',
  swimming: 'สวิมมิ่ง',
  sleep: 'สลีป',
  wake: 'เวค',
  stand: 'สแตนด์',
  sit: 'ซิท',
  look: 'ลุค',
  see: 'ซี',
  watch_verb: 'วอทช์',
  hear: 'เฮียร์',
  smell: 'สเมล',
  touch: 'ทัช',
  taste: 'เทสต์',
  smile: 'สไมล์',
  laugh: 'ลาฟ',
  cry: 'คราย',
  shout: 'เชาต์',
  help: 'เฮลพ์',
  work: 'เวิร์ก',
  working: 'เวิร์กกิ้ง',
  clean: 'คลีน',
  wash: 'วอช',
  open: 'โอเพ่น',
  close: 'โคลส',
  start: 'สตาร์ท',
  stop: 'สต็อป',
  make: 'เมค',
  build: 'บิลด์',
  draw: 'ดรอว์',
  paint: 'เพนต์',
  sing: 'ซิง',
  dance: 'แดนซ์',
  drive: 'ไดรฟ์',
  ride: 'ไรด์',
  buy: 'บาย',
  sell: 'เซลล์',
  give: 'กิฟว์',
  take: 'เทค',
  bring: 'บริง',
  send: 'เซนด์',
  get: 'เก็ต',
  find: 'ไฟนด์',
  keep: 'คีป',
  hold: 'โฮลด์',
  put: 'พุท',
  push: 'พุช',
  pull: 'พูล',
  cut: 'คัท',
  show: 'โชว์',
  hide: 'ไฮด์',
  think: 'ธิ้งค์',
  know: 'โนว์',
  understand: 'อันเดอร์สแตนด์',
  remember: 'รีเมมเบอร์',
  forget: 'ฟอร์เก็ต',
  like: 'ไลค์',
  love: 'เลิฟ',
  hate: 'เฮท',
  want: 'วอนต์',
  need: 'นีด',
  feel: 'ฟีล',
  hope: 'โฮป',
  wish: 'วิช',
  try: 'ทราย',
  call: 'คอล',
  ask: 'อัสก์',
  answer: 'แอนเซอร์',
  tell: 'เทลล์',
  say: 'เซย์',
  talk: 'ทอล์ค',
  wait: 'เวท',
  meet: 'มีท',
  visit: 'วิสิท',
  travel: 'แทรเวล',
  live: 'ลิฟว์',
  grow: 'โกรว์',
  change: 'เชนจ์',
  turn: 'เทิร์น',
  burn: 'เบิร์น',
  save: 'เซฟ',

  // Common Adjectives & Concepts
  good: 'กู๊ด',
  bad: 'แบด',
  great: 'เกรท',
  nice: 'ไนซ์',
  fine: 'ไฟน์',
  happy: 'แฮปปี้',
  sad: 'แซด',
  angry: 'แองกรี้',
  tired: 'ไทเอิร์ด',
  bored: 'บอร์ด',
  excited: 'เอ็กไซทิด',
  scared: 'สแกร์ด',
  brave: 'เบรฟ',
  courage: 'เคอริจ',
  courageous: 'เคอเรเจิส',
  diligent: 'ดิลิเจินท์',
  smart: 'สมาร์ต',
  clever: 'เคลเวอร์',
  brilliant: 'บริลเลียนท์',
  wise: 'ไวส์',
  kind: 'ไคนด์',
  polite: 'โพไลต์',
  honest: 'ออนเนสต์',
  funny: 'ฟันนี่',
  cute: 'คิวท์',
  beautiful: 'บิวตี้ฟูล',
  handsome: 'แฮนซั่ม',
  pretty: 'พริตตี้',
  ugly: 'อัคลี่',
  big: 'บิ๊ก',
  large: 'ลาร์จ',
  huge: 'ฮิวจ์',
  small: 'สมอล',
  little: 'ลิตเติล',
  tiny: 'ไทนี่',
  tall: 'ทอล',
  short: 'ชอร์ต',
  long: 'ลอง',
  high: 'ไฮ',
  low: 'โลว์',
  deep: 'ดีป',
  shallow: 'แชลโลว์',
  wide: 'ไวด์',
  narrow: 'แนร์โรว์',
  heavy: 'เฮฟวี่',
  light_weight: 'ไลท์',
  fast: 'ฟาสต์',
  slow: 'สโลว์',
  quick: 'ควิก',
  easy: 'อีซี่',
  hard: 'ฮาร์ด',
  difficult: 'ดิฟฟิคัลต์',
  simple: 'ซิมเพิล',
  strong: 'สตรอง',
  weak: 'วีค',
  rich: 'ริช',
  poor: 'พัวร์',
  clean_adj: 'คลีน',
  dirty: 'เดอร์ตี้',
  hot: 'ฮ็อต',
  cold: 'โคลด์',
  warm: 'วอร์ม',
  cool: 'คูล',
  wet: 'เว็ต',
  dry: 'ดราย',
  sweet: 'สวีท',
  sour: 'ซาวเออร์',
  salty: 'ซอลตี้',
  bitter: 'บิทเทอร์',
  spicy: 'สไปซี่',
  fresh: 'เฟรช',
  new: 'นิว',
  old: 'โอลด์',
  young: 'ยัง',
  early: 'เออร์ลี่',
  late: 'เลท',
  ready: 'เรดดี้',
  safe: 'เซฟ',
  dangerous: 'เดนเจอร์รัส',
  important: 'อิมพอร์แทนท์',
  special: 'สเปเชียล',
  famous: 'เฟมัส',
  popular: 'พ็อปพูลาร์',
  different: 'ดิฟเฟอเรนท์',
  same: 'เซม',
  real: 'เรียล',
  true: 'ทรู',
  false: 'ฟอลส์',
  right: 'ไรท์',
  wrong: 'รอง',
  curious: 'คิวเรียส',
  creativity: 'ครีเอทิวิตี้',
  enthusiasm: 'เอนทูซิแอสซึม',
  persevere: 'เพอร์ซิเวียร์',
  magnificent: 'แมกนิฟิเซินท์',
  resilience: 'เรซิลิเอนซ์',
  innovation: 'อินโนเวชั่น',
  leader: 'ลีดเดอร์',
  leadership: 'ลีดเดอร์ชิพ',
  explore: 'เอ็กซ์พลอร์',
  achieve: 'อะชีฟ',
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
  perimeter: 'เพอริมิเทอร์',
  area: 'แอเรีย',
  quadrilateral: 'ควอดริแลเทอรอล',
  parallelogram: 'แพแรลเลโลแกรม',
  trapezium: 'ทราพีเซียม',
  diagonal: 'ไดแอกกะนอล',
  rhombus: 'รอมบัส',
  project: 'โพรเจ็คท์',
  hatch: 'แฮทช์',
  urban: 'เออร์บัน',
  church: 'เชิร์ช',
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
  wh: 'ว',
  wr: 'ร',
  kn: 'น',
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
  str: 'สตร',
  spr: 'สปร',
  spl: 'สปล',
  scr: 'สคร',
  shr: 'ชร',
  thr: 'ทร',
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
  nk: 'งค์',
  l: 'ล',
  s: 'ส์',
  z: 'ส์',
  ce: 'ซ์',
  se: 'ส์',
  x: 'กส์',
  sh: 'ช',
  ch: 'ช',
  tch: 'ทช์',
  th: 'ท์',
  ph: 'ฟ',
  f: 'ฟ',
  ff: 'ฟ',
  ll: 'ลล์',
  ss: 'ส',
  st: 'สต์',
  sk: 'สก์',
  sp: 'สป์',
  lt: 'ลต์',
  ld: 'ลด์',
  lk: 'ล์ค',
  lp: 'ลป์',
  lf: 'ลฟ์',
  lm: 'ล์ม',
  ct: 'กต์',
  pt: 'ปต์',
  ft: 'ฟต์',
  mp: 'มป์',
  nd: 'นด์',
  nt: 'นต์',
  rk: 'ร์ค',
  rt: 'ร์ต',
  rd: 'ร์ด',
  rn: 'ร์น',
  rm: 'ร์ม',
  rp: 'ร์ป',
  rb: 'ร์บ',
  rf: 'ร์ฟ',
  rs: 'ร์ส',
  rse: 'ร์ส',
  rch: 'ร์ช',
  rl: 'ร์ล',
};

/**
 * Returns Thai phonetic reading (คำอ่านภาษาไทย) for any English word or phrase
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

  // 3. Suffix checks
  if (clean.endsWith('ing') && clean.length > 3) {
    const base = clean.slice(0, -3);
    const basePhonetic = getThaiPhonetic(base);
    return `${basePhonetic}อิ้ง`;
  }
  if (clean.endsWith('tion') && clean.length > 4) {
    const base = clean.slice(0, -4);
    return `${getThaiPhonetic(base)}ชั่น`;
  }
  if (clean.endsWith('sion') && clean.length > 4) {
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
  if (clean.endsWith('est') && clean.length > 4) {
    const base = clean.slice(0, -3);
    return `${getThaiPhonetic(base)}เอสต์`;
  }

  // 4. Specific R-controlled & special vowel rules
  // wor- words (world, work, worm, word)
  if (clean.startsWith('wor') && clean.length > 3) {
    const fin = clean.slice(3);
    const thaiFin = FINAL_CONSONANTS[fin] || (fin ? `ร์${FINAL_CONSONANTS[fin[0]] || fin}` : '');
    return `เวิ${thaiFin}`;
  }

  // ir / ur / er words (girl, bird, shirt, nurse, turn, surf, burn)
  const rControlledMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})(?:ir|ur|er)([b-df-hj-np-tv-z]*)$/);
  if (rControlledMatch) {
    const [, init, fin] = rControlledMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || `ร์${FINAL_CONSONANTS[fin] || fin}` : 'ร์';
    return `เ${thaiInit}ิ${thaiFin}`;
  }

  // ar words (card, park, farm, star, car, dark, smart, art)
  const arMatch = clean.match(/^([b-df-hj-np-tv-z]{0,3})ar([b-df-hj-np-tv-z]*)$/);
  if (arMatch) {
    const [, init, fin] = arMatch;
    const thaiInit = init ? INITIAL_CONSONANTS[init] || 'อ' : 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || `ร์${FINAL_CONSONANTS[fin] || fin}` : 'ร์';
    return `${thaiInit}า${thaiFin}`;
  }

  // or words (fork, pork, corn, born, horse, storm, short, sport, port)
  const orMatch = clean.match(/^([b-df-hj-np-tv-z]{0,3})or([b-df-hj-np-tv-z]*)$/);
  if (orMatch) {
    const [, init, fin] = orMatch;
    const thaiInit = init ? INITIAL_CONSONANTS[init] || 'อ' : 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || `ร์${FINAL_CONSONANTS[fin] || fin}` : 'ร์';
    return `${thaiInit}อ${thaiFin}`;
  }

  // 5. Magic 'e' pattern (cake, like, home, cute, face, time, nose, rule)
  const magicEMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})([aeiou])([b-df-hj-np-tv-z]{1,2})e$/);
  if (magicEMatch) {
    const [, init, vowel, fin] = magicEMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    const thaiFin = FINAL_CONSONANTS[fin] || fin;

    if (vowel === 'a') return `เ${thaiInit}${thaiFin}`;
    if (vowel === 'i') return `${thaiInit}าย${thaiFin === 'ส์' || thaiFin === 'ซ์' ? thaiFin : thaiFin ? thaiFin + 'ด์' : ''}`;
    if (vowel === 'o') return `โ${thaiInit}${thaiFin}`;
    if (vowel === 'u') return `${thaiInit}ิว${thaiFin}`;
    if (vowel === 'e') return `${thaiInit}ี${thaiFin}`;
  }

  // 6. Vowel digraphs
  // ee / ea (meet, read, clean, see, tree)
  const eeMatch = clean.match(/^([b-df-hj-np-tv-z]{0,3})(?:ee|ea)([b-df-hj-np-tv-z]*)$/);
  if (eeMatch) {
    const [, init, fin] = eeMatch;
    const thaiInit = init ? INITIAL_CONSONANTS[init] || 'อ' : 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || fin : '';
    return `${thaiInit}ี${thaiFin}`;
  }

  // ai / ay (rain, day, play, train, mail)
  const aiMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})(?:ai|ay)([b-df-hj-np-tv-z]*)$/);
  if (aiMatch) {
    const [, init, fin] = aiMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || fin : 'ย์';
    return `เ${thaiInit}${thaiFin}`;
  }

  // oa / ow (boat, coat, snow, show, blow)
  const oaMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})(?:oa|ow)([b-df-hj-np-tv-z]*)$/);
  if (oaMatch) {
    const [, init, fin] = oaMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || fin : 'ว์';
    return `โ${thaiInit}${thaiFin}`;
  }

  // ou (house, mouse, out, cloud, sound)
  const ouMatch = clean.match(/^([b-df-hj-np-tv-z]{0,3})ou([b-df-hj-np-tv-z]*)$/);
  if (ouMatch) {
    const [, init, fin] = ouMatch;
    const thaiInit = init ? INITIAL_CONSONANTS[init] || 'อ' : 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || fin : '';
    return `เ${thaiInit}า${thaiFin ? thaiFin + 'ต์' : ''}`;
  }

  // oo (book, food, cool, moon, school)
  const ooMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})oo([b-df-hj-np-tv-z]*)$/);
  if (ooMatch) {
    const [, init, fin] = ooMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || fin : '';
    return `${thaiInit}ู${thaiFin}`;
  }

  // oi / oy (boy, toy, coin, point, join)
  const oiMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})(?:oi|oy)([b-df-hj-np-tv-z]*)$/);
  if (oiMatch) {
    const [, init, fin] = oiMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || fin : '';
    return `${thaiInit}อย${thaiFin}`;
  }

  // all / alk (ball, call, tall, walk, talk)
  const allMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})(?:all|alk)$/);
  if (allMatch) {
    const [, init] = allMatch;
    const thaiInit = INITIAL_CONSONANTS[init] || 'อ';
    return clean.endsWith('alk') ? `${thaiInit}อล์ค` : `${thaiInit}อล`;
  }

  // igh (night, light, right, high, bright)
  const ighMatch = clean.match(/^([b-df-hj-np-tv-z]{0,3})igh([b-df-hj-np-tv-z]*)$/);
  if (ighMatch) {
    const [, init, fin] = ighMatch;
    const thaiInit = init ? INITIAL_CONSONANTS[init] || 'อ' : 'ฮ';
    const thaiFin = fin ? FINAL_CONSONANTS[fin] || fin : '';
    return `${thaiInit}าย${thaiFin ? thaiFin : ''}`;
  }

  // 7. CVC (Consonant-Vowel-Consonant) short vowel rules (bat -> แบท, cat -> แคท, dog -> ด็อก, cup -> คัพ)
  const cvcMatch = clean.match(/^([b-df-hj-np-tv-z]{1,3})([aeiou])([b-df-hj-np-tv-z]{1,3})$/);
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

  // 8. General syllable fallback
  let result = '';
  let i = 0;
  while (i < clean.length) {
    const three = clean.slice(i, i + 3);
    if (INITIAL_CONSONANTS[three]) {
      result += INITIAL_CONSONANTS[three];
      i += 3;
      continue;
    }

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
