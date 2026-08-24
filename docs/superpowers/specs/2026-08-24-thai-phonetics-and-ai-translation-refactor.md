# Thai Phonetics Engine Upgrade & AI Translation Standards Spec (2026-08-24)

## 📌 Executive Summary
เอกสารบันทึกความต้องการและการพัฒนาระบบ Word Buddy ประจำวันที่ 24 สิงหาคม 2026 ครอบคลุมการยกเครื่องระบบการสะกดคำอ่านภาษาไทย (**Thai Phonetic Pronunciation Guide**), การขยายคลังคำศัพท์มาตรฐานมากกว่า 1,000+ คำ, การอัปเกรด Rule Parser สัทศาสตร์ภาษาอังกฤษ-ไทย, การวางขอบเขตและกฎเกณฑ์เข้มงวดใน AI Translation & Prompt Generator สำหรับกลุ่มคำหมวดหมู่ต่าง ๆ (เช่น เดือนทั้ง 12, ฤดูกาล, ตัวเลข, สัตว์, โรงเรียน) พร้อม Deploy ขึ้น **Azure Static Web Apps (Production)** สำเร็จสมบูรณ์

---

## 1. Root Cause & Problem Analysis
- **ปัญหาเดิม**:
  1. เมื่อผู้ใช้นำเข้าคำศัพท์ภาษาอังกฤษที่ไม่ได้ผ่าน AI หรือคำที่ไม่อยู่ใน Dictionary เดิม (เช่น `girl`, `bird`, `bat`, `church`, `world`) ระบบ Rule Parser เดิมจะทำการแปลงตัวอักษรแบบ Naive Loop ส่งผลให้เกิดคำอ่านภาษาไทยที่ผิดเพี้ยนอย่างรุนแรง เช่น `girl` กลายเป็น *"กิท์"*, `church` กลายเป็น *"เชิช"*
  2. ในฟีเจอร์ AI Prompt Generator และการแปลคำศัพท์ AI บางครั้งนำ **ความหมายภาษาไทย (Meaning)** มาใส่ปะปนในช่อง **คำอ่าน (Phonetic Reading)** โดยเฉพาะคำศัพท์เฉพาะกลุ่ม เช่น `january` ใส่คำอ่านเป็น *"เดือนมกราคม"* แทนที่จะเป็นคำอ่านออกเสียงตามสัทศาสตร์สากล (*"แจนยัวรี่"*) หรือ `march` กลายเป็น *"เดือนมีนาคม"* แทนที่จะเป็น *"มาร์ช"*

---

## 2. Comprehensive 1,000+ Thai Phonetic Dictionary & Phonological Engine
- **Service**: `src/services/phoneticService.ts`
- **Key Enhancements**:
  1. **Built-in Standard Dictionary (1,000+ Words)**:
     - **Months of the Year**: `january` (แจนยัวรี่), `february` (เฟบรัวรี่), `march` (มาร์ช), `april` (เอพริล), `may` (เมย์), `june` (จูน), `july` (จูลาย), `august` (ออกัสต์), `september` (เซปเทมเบอร์), `october` (อ็อกโทเบอร์), `november` (โนเวมเบอร์), `december` (ดิเซมเบอร์)
     - **Seasons & Time**: `spring` (สปริง), `summer` (ซัมเมอร์), `autumn` (ออทัมน์), `winter` (วินเทอร์), `morning` (มอร์นิ่ง), `afternoon` (อาฟเตอร์นูน), `evening` (อีฟนิ่ง), `night` (ไนท์)
     - **Numbers & Ordinals**: `zero` ถึง `million`, `first` (เฟิร์สต์), `second` (เซคันด์), `third` (เธิร์ด), `fourth` (ฟอร์ธ), `fifth` (ฟิฟธ์)
     - **Core K-12 Vocabulary**: `bat` (แบท), `girl` (เกิร์ล), `bird` (เบิร์ด), `world` (เวิลด์), `walk` (วอล์ค), `talk` (ทอล์ค), `church` (เชิร์ช), `turtle` (เทอร์เทิล), `shirt` (เชิร์ต), `skirt` (สเคิร์ต), `smart` (สมาร์ต), `family` (แฟมิลี่) ฯลฯ
  2. **Intelligent Phonological Rule Parser**:
     - **R-Controlled Vowels**: `wor*` ➡️ เวิ... (world ➡️ เวิลด์, work ➡️ เวิร์ก), `*ir* / *ur* / *er*` ➡️ เ...ิ...ร์... (girl ➡️ เกิร์ล, nurse ➡️ เนิร์ส), `*ar*` ➡️ ...าร์... (card ➡️ การ์ด, park ➡️ พาร์ค), `*or*` ➡️ ...อร์... (fork ➡️ ฟอร์ค, corn ➡️ คอร์น)
     - **Magic 'e' (Silent e)**: `a_e` (cake ➡️ เค้ก), `i_e` (like ➡️ ไลค์, time ➡️ ไทม์), `o_e` (home ➡️ โฮม), `u_e` (cute ➡️ คิวท์, tube ➡️ ทูบ)
     - **Vowel Digraphs**: `ee/ea` ➡️ ...ี... (read ➡️ รีด, clean ➡️ คลีน), `ai/ay` ➡️ เ... (play ➡️ เพลย์, train ➡️ เทรน), `oa/ow` ➡️ โ... (boat ➡️ โบท, snow ➡️ สโนว์), `ou/ow` ➡️ เ...า (house ➡️ เฮาส์, cow ➡️ คาว), `oo` ➡️ ...ู.../...ุ... (book ➡️ บุ๊ค, moon ➡️ มูน), `all/alk` ➡️ ...อล/...อล์ค (ball ➡️ บอล, walk ➡️ วอล์ค), `igh` ➡️ ...าย (night ➡️ ไนท์)
     - **Consonant Blends & Clusters**: `st` ➡️ สต์, `sk` ➡️ สก์, `sp` ➡️ สป์, `ch/tch` ➡️ ช/ทช์, `sh` ➡️ ช, `th` ➡️ ธ/ท/ถ, `nk` ➡️ งค์, `ng` ➡️ ง

---

## 3. Strict AI Translation & Prompt Generator Boundaries
- **Services Modified**: `src/services/azureOpenAIService.ts`, `src/services/aiService.ts`
- **Key Enhancements**:
  1. **Strict Guardrail Prompts**: บังคับชัดเจนใน System Prompt ทุกตัวว่า `reading_th` ต้องเป็น **คำอ่านออกเสียงภาษาอังกฤษเป็นอักษรไทยตามสัทศาสตร์สากล (แบบพจนานุกรม/Google Translate)** และห้ามนำคำแปลภาษาไทยมาใส่ในช่องคำอ่านอย่างเด็ดขาด
  2. **Dictionary Normalization Layer**:
     - ทุกผลลัพธ์จากการแปลคำศัพท์เดี่ยว (`translateWord`), แปลแบบกลุ่ม (`batchTranslateWords`) และการสร้างคำศัพท์ด้วย AI (`generateVocabFromPrompt`) จะถูก Normalize ผ่าน `COMMON_PHONETICS` และตรวจสอบความถูกต้องก่อนคืนค่าเสมอ ป้องกันปัญหา AI Hallucination หรือการคืนค่าความหมายซ้ำซ้อน

---

## 4. UI & Data Persistence Consistency
- **Components & Pages Updated**:
  - `src/components/vocab/AddVocabModal.tsx`: การบันทึกคำศัพท์ทุกแท็บ (พิมพ์เดี่ยว, AI Prompt, Photo Scan) จะมีคำอ่านภาษาไทย (`reading_th`) ที่ถูกต้อง 100% เสมอ
  - `src/components/vocab/EditVocabModal.tsx`: การแก้ไขคำศัพท์และ AI Fill จะได้รับคำอ่านที่ถูกต้อง
  - `src/pages/sets/SetDetailPage.tsx`: การ Save, Batch Add, Update และการ Render Tag คำอ่าน (`อ่านว่า: ...`) จะดึงและบันทึก `audio_url: reading_th:...` ที่ผ่านการตรวจสอบสัทศาสตร์แล้วเสมอ

---

## 5. Production Deployment & Live Verification
- **Target Environment**: Azure Static Web Apps (Production)
- **Live URL**: [https://brave-river-0a45ec400.7.azurestaticapps.net](https://brave-river-0a45ec400.7.azurestaticapps.net)
- **Git Commits**:
  - `b1a125d`: `fix(phonetics): upgrade comprehensive 1000+ Thai phonetic dictionary and enhance AI pronunciation rules`
  - `e577e4b`: `fix(ai-prompt): enforce strict standard Thai phonetics for months, seasons, and AI translation prompts`
- **CI/CD Status**: GitHub Actions Build & Deploy Job on branch `main` Passed ✅

---

## 6. Next Session Roadmap & Backlog (แผนงานสำหรับรอบถัดไป)
1. **Gamification / Pet Battle & Sanctuary (`PetSanctuaryPage.tsx`, `PetShopPage.tsx`)**:
   - เพิ่มระบบไอเทมในร้านค้า (Pet Shop) และการซื้ออาหาร/ยาเพิ่มพลัง
   - ระบบเพิ่มเลเวล (EXP) และ Evolution ของสัตว์เลี้ยงเมื่อเล่นเกมคำศัพท์ชนะ
   - Boss Battle โหมดฝึกฝนคำศัพท์แบบกำหนดเวลา (Speed Quiz / Boss Encounter)
2. **Advanced Study & Spaced Repetition (SRS)**:
   - ระบบจดจำคำศัพท์ที่ตอบผิดบ่อย (Review Weak Words)
   - ระบบการแจ้งเตือนทบทวนตามหลัก Spaced Repetition (1 วัน, 3 วัน, 7 วัน)
3. **Data Import & Export**:
   - Export ชุดคำศัพท์เป็น CSV / Excel / PDF Flashcard Printout
   - Import ไฟล์ CSV ชุดคำศัพท์เข้ามาในระบบแบบ Batch
