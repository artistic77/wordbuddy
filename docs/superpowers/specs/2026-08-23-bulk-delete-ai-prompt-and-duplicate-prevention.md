# Bulk Delete, AI Prompt Generator & Duplicate Prevention Spec (2026-08-23)

## 📌 Executive Summary
เอกสารบันทึกการพัฒนาฟีเจอร์ระบบจัดการชุดคำศัพท์ (Vocabulary Management) ประจำวันที่ 23 สิงหาคม 2026 ครอบคลุม:
1. **ระบบลบคำศัพท์ทีละหลายคำ (Bulk/Batch Delete)** และการเลือกทั้งหมด (Select All / Deselect All)
2. **ระบบสร้างคำศัพท์ด้วย AI Prompt (AI Prompt Generator)** จำกัดสูงสุด 50 คำต่อรอบ พร้อมระบบ Guardrails ป้องกันการออกนอกเรื่อง
3. **ระบบป้องกันคำซ้ำ (Duplicate Word Prevention)** ทั้งในการพิมพ์คำเดี่ยว, การ Generate ด้วย AI และการสแกนใบงาน
4. **การปรับปรุงการแสดงผล UI บนมือถือ (Mobile Responsive Optimization)** และขนาดตัวอักษรที่อ่านง่าย สบายตา

---

## 1. Bulk Delete & Multi-Select System
- **Components Modified**: `src/pages/sets/SetDetailPage.tsx`
- **Features**:
  - Checkbox ประจำการ์ดคำศัพท์แต่ละใบ ขนาดแตะง่ายสำหรับ Touchscreen
  - ปุ่ม **Select All / Deselect All** เพื่อเลือกคำศัพท์ทั้งหมดในชุดได้ในคลิกเดียว
  - **Sticky Action Bar** เมื่อมีการเลือกคำศัพท์ แสดงจำนวนคำที่เลือก ปุ่มยกเลิกการเลือก และปุ่ม **Delete Selected (N)** สีแดงเด่นชัด
  - ยืนยันก่อนลบ (Confirmation Dialog) และส่งคำสั่งลบแบบ Batch Delete ไปยัง Supabase ผ่าน `.delete().in('id', selectedIds)`

---

## 2. AI Prompt Generator with Strict Guardrails (Max 50 Words)
- **Services & Components**: `src/services/azureOpenAIService.ts`, `src/services/aiService.ts`, `src/components/vocab/AddVocabModal.tsx`
- **Features**:
  - แท็บ **"AI Prompt"** ในโมดอล Add Vocab พร้อมช่องใส่หัวข้อ/คำอธิบาย
  - **Word Count Limiter**: กำหนดจำนวนคำที่ต้องการได้ตั้งแต่ 1 ถึง 50 คำ (ค่าเริ่มต้น 10 คำ) พร้อมปุ่มเลือกจำนวนด่วน (5, 10, 15, 20, 30, 50)
  - **Quick Topic Chips**: หัวข้อแนะนำ เช่น ✈️ การท่องเที่ยวสนามบิน, 💼 การประชุมธุรกิจ, 🌿 สัตว์ป่าและสิ่งแวดล้อม, 🍳 ร้านอาหารและอาหาร, 🏥 การแพทย์และสุขภาพ
  - **Strict Scope & Guardrails**: บังคับให้ AI ส่งกลับเฉพาะโครงสร้าง JSON ของรายการคำศัพท์ภาษาอังกฤษ-ไทย ไม่ตอบคำถามนอกเรื่อง ไม่เขียนบทความ และบังคับแยก `word_th` (ความหมาย) กับ `reading_th` (คำอ่านไทย) ตามมาตรฐานสัทศาสตร์
  - **Interactive Draft Review**: หน้าจอตรวจทานผลลัพธ์ ติ๊กเลือก/ไม่เลือก แก้ไขคำ inline หรือดูตัวอย่างประโยคก่อนกด Import เข้า Set

---

## 3. Duplicate Word Prevention System
- **Single Word Add**: ตรวจสอบคำภาษาอังกฤษแบบ Real-time หากมีอยู่ใน Set แล้ว จะแสดงแถบแจ้งเตือน `⚠️ คำว่า "..." มีอยู่ในชุดคำศัพท์นี้แล้ว` และปิดการกดบันทึก
- **AI Prompt & Photo Scan**:
  - ส่งรายการคำศัพท์ที่มีอยู่เดิมให้ AI รับรู้เพื่อหลีกเลี่ยงการสร้างคำซ้ำ
  - เมื่อได้รับผลลัพธ์ จะตรวจสอบซ้ำอีกชั้นและแสดง Badge `⚠️ มีแล้วในชุดนี้` พร้อม Uncheck คำซ้ำให้อัตโนมัติ
- **Data Layer Validation**: ตรวจสอบซ้ำก่อน `insert` ลง Supabase ใน `handleAddWord` และ `handleBatchAddWords`

---

## 4. Mobile Responsive & Typography Polish
- ปรับขนาดฟอนต์บนหน้าจอมือถือ: คำศัพท์ภาษาอังกฤษ (`text-base sm:text-lg md:text-xl`), คำอ่านไทย (`text-[11px] sm:text-xs`), ความหมายภาษาไทย (`text-sm sm:text-base`), ตัวอย่างประโยค (`text-xs`)
- จัดการ Padding, Gap, และ Flex-wrap ป้องกันปัญหาข้อความล้นขอบจอขนาดเล็ก
- รองรับปุ่ม Add Word แบบ Floating บนมือถือ

---

## 5. Production Deployment & Live Verification
- **Environment**: Azure Static Web Apps (Production)
- **Live URL**: `https://brave-river-0a45ec400.7.azurestaticapps.net`
- **Git Commits**:
  - `0d83bd3`: `feat(vocab): add bulk delete, AI prompt generation (max 50 words), duplicate word prevention, and mobile UI enhancements`
  - `b7ae954`: `docs: record 2026-08-23 spec (Bulk Delete, AI Prompt Generator, Duplicate Prevention, Mobile UI)`
- **Branches**: `develop` และ `main` ซิงค์เท่ากัน 100%

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

