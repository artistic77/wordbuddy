# AI Vision Extraction, Phonetics Standards, UI & Audio Refactoring Spec (2026-08-21)

## 📌 Executive Summary
เอกสารบันทึกความต้องการและการพัฒนาระบบ Word Buddy ประจำวันที่ 21 สิงหาคม 2026 ครอบคลุมการอัปเกรดระบบ AI Vision สำหรับการสแกนใบงาน/หนังสือเรียน, การปรับปรุงมาตรฐานการสร้างคำอ่านและคำแปลภาษาไทยของ AI, การแก้ไข UI Layout ในหน้าชุดคำศัพท์, การปรับนโยบายระบบเสียง (Audio Policy) โดยถอดปุ่มอ่านเสียงภาษาไทยออกทั้งหมดเพื่อเน้นการเรียนรู้ภาษาอังกฤษ, และการ Deploy ขึ้น **Azure Static Web Apps (Production)** สำเร็จสมบูรณ์

---

## 1. AI Vision Worksheet & Textbook Extraction (Azure OpenAI Multimodal)
- **Engine**: Azure OpenAI `gpt-4.1-mini` Multimodal Vision API
- **Key Capabilities**:
  - รองรับการรับภาพถ่ายใบงาน, ชีทเรียน, หรือหน้าหนังสือคำศัพท์ (Base64 JPEG/PNG)
  - วิเคราะห์โครงสร้างใบงานแบบชาญฉลาด สกัดคำศัพท์ภาษาอังกฤษ, Part of Speech, ความหมายภาษาไทยที่ถูกต้องตามบริบท, และคำอ่านภาษาไทย
  - ลดข้อจำกัดของ OCR ธรรมดา โดย AI สามารถเข้าใจตาราง, คอลัมน์, และข้อความลายมือ/ฟอนต์ใบงานได้แม่นยำสูง
  - มีระบบ Fallback ไปยัง OCR.Space Engine 2 อัตโนมัติหากเกิดปัญหาการเชื่อมต่อ

---

## 2. Strict Phonetics & Thai Meaning Separation
- **Standardized Prompts**:
  - บังคับใช้กฎการแยก **ความหมายภาษาไทย (`word_th`)** และ **คำอ่านภาษาไทย (`reading_th`)** ออกจากกันอย่างเด็ดขาดในทุก AI Prompt
  - ห้าม AI ใส่คำอ่าน เช่น *(แบท)*, *[รีด-ดิ่ง]* ปะปนในช่องความหมายภาษาไทย
  - กำหนดมาตรฐานการถอดเสียงคำอ่านตามหลักสัทศาสตร์ IPA และการสะกดเสียงไทยที่ตรงกับสำเนียงภาษาอังกฤษมาตรฐาน
  - จัดเก็บและซิงค์ `audio_url` ในฐานข้อมูล Supabase เพื่อรองรับการเรียกใช้เสียงอย่างมีประสิทธิภาพ

---

## 3. Audio & Pronunciation System Refactoring (Thai Speaker Removal)
- **Audio Policy**:
  - **English Only**: ระบบเสียง (Audio Playback / TTS) มุ่งเน้นการฝึกทักษะการฟังและออกเสียงภาษาอังกฤษที่ถูกต้อง (`en-US-JennyNeural` / Web Speech EN)
  - **Visual Reading Aid Only**: คำอ่านภาษาไทย (`อ่านว่า: ...`) มีไว้เพื่อเป็นตัวช่วยอ่านด้วยสายตาเท่านั้น จึงถอดปุ่มลำโพงสำหรับเล่นเสียงภาษาไทย (Thai TTS) ออกจากทุกมุมมองเพื่อไม่ให้ผู้เรียนสับสนกับสำเนียง
- **Components & Pages Updated**:
  1. `src/pages/sets/SetDetailPage.tsx`: แสดงเฉพาะป้ายคำอ่าน และคงปุ่มลำโพงออกเสียงภาษาอังกฤษ (EN)
  2. `src/components/vocab/AddVocabModal.tsx`: ถอดปุ่มลำโพงในช่องกรอกคำอ่านภาษาไทย
  3. `src/components/vocab/EditVocabModal.tsx`: ถอดปุ่มลำโพงในช่องกรอกคำอ่านภาษาไทย
  4. `src/pages/study/FlashcardGamePage.tsx`: ถอดปุ่มลำโพงเสียงไทยในการ์ด Flashcard
  5. `src/pages/study/FillBlankGamePage.tsx`: ถอดปุ่มลำโพงเสียงไทยใน Badge คำใบ้
  6. `src/pages/study/MatchingGamePage.tsx`: ยกเลิกการอ่านเสียงภาษาไทยเมื่อแตะการ์ดภาษาไทย
  7. `src/services/vocabPoolService.ts`: กำหนดให้โหมด Quiz ใน Pet Sanctuary และ Boss Battle เล่นเสียงภาษาอังกฤษเสมอ

---

## 4. UI/UX Enhancements
- **Set Detail Page (`SetDetailPage.tsx`)**:
  - แก้ไขปัญหา Layout ช่องแก้ไขชื่อชุดคำศัพท์ (Edit Set Title Input) ที่ล้นขอบจอเมื่อแสดงผลบนจอขนาดเล็ก
  - ปรับ Flex layout เป็นแบบ Wrap พร้อมปุ่ม Cancel และ Save ที่จัดวางกระชับและสวยงาม

---

## 5. Production Deployment & Verification
- **Target Environment**: Azure Static Web Apps (`https://brave-river-0a45ec400.7.azurestaticapps.net`)
- **Git Commits**:
  - `eda7b9e`: feat(ai): upgrade image scanning to Azure OpenAI Multimodal Vision
  - `7070987`: fix(phonetics): enforce strict standard IPA and Thai phonetic spelling rules
  - `9a7a728`: fix(translation): strictly separate Thai meaning and phonetic reading in AI prompts
  - `865e96d`: fix(ui): fix set title edit input layout overflow and add cancel button
  - `78c3892`: refactor(audio): remove Thai pronunciation speaker buttons across all views
- **CI/CD Status**: GitHub Actions Build & Deploy Job on branch `main` (`Run #32492267583`) **Success / Passed ✅**
