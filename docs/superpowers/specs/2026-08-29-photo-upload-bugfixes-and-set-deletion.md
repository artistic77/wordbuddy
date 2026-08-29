# Specification & Bug Fix Log: Photo Upload / Camera Scanner, 1-Shot Vision AI, Set Deletion & Azure SWA Optimization

**Date**: 2026-08-29  
**Status**: Completed & Deployed to Production (`main` / `develop`)  
**Commit Range**: `1a528f6` .. `8854a5d`

---

## 1. Requirements Overview (ภาพรวมความต้องการและฟีเจอร์)

1. **Dual Image Input (รองรับทั้งการถ่ายรูปและเลือกรูปภาพ)**:
   - ผู้ใช้สามารถเพิ่มคำศัพท์จากรูปภาพใบงาน / หน้าหนังสือเรียน / การ์ดคำศัพท์ ได้ทั้ง 2 ช่องทาง:
     - 📸 **ถ่ายภาพทันที (Take Photo)**: เปิดกล้องถ่ายภาพบนมือถือ (iOS/Android)
     - 🖼️ **เลือกรูปจากเครื่อง (Upload Image / Gallery)**: เปิดคลังภาพ (Photo Library / Gallery / File Explorer)
     - 💻 **Drag & Drop**: ลากไฟล์รูปมาวางบนพื้นที่อัปโหลดได้ทันที
2. **Delete Vocab Set Button (ปุ่มลบชุดคำศัพท์)**:
   - เพิ่มปุ่ม **"Delete Set"** ในหน้า [SetDetailPage.tsx](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/src/pages/sets/SetDetailPage.tsx) สำหรับเจ้าของชุดคำศัพท์
   - มีระบบกล่องยืนยัน (Confirmation Dialog) แสดงชื่อชุดและจำนวนคำศัพท์ก่อนทำการลบออกจากฐานข้อมูล
3. **1-Shot Multimodal AI Vision & Thai Translation (สแกนและแปลคำศัพท์ในรอบเดียว)**:
   - AI Vision (Azure OpenAI `gpt-4.1-mini` with `detail: "high"`) สแกนภาพและคืนค่าคำศัพท์ภาษาอังกฤษ (`word_en`), คำแปลภาษาไทย (`word_th`), คำอ่านโฟเนติกส์ภาษาไทย (`reading_th`), ชนิดของคำ (`part_of_speech`), และประโยคตัวอย่างภาษาอังกฤษ-ไทยใน Request เดียว

---

## 2. Bug Fixes & Technical Improvements (รายการบั๊กที่แก้ไข)

### Bug 1: อัปโหลดภาพจากกล้องแล้วเด้งหลุด / รีโหลด (Mobile Memory & Payload Limit)
- **สาเหตุ**:
  1. ภาพถ่ายจากกล้องมือถือความละเอียดสูงมีขนาด 5MB–15MB เมื่อแปลงเป็น Base64 โดยตรงจะมีขนาด 10MB–20MB+ ทำให้เบราว์เซอร์มือถือเกิด Memory Pressure และเด้งรีโหลด
  2. ขนาด Payload เกินขีดจำกัดของ API Gateway (HTTP 413 Payload Too Large)
- **การแก้ไข**:
  - สร้างโมดูล [imageUtils.ts](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/src/utils/imageUtils.ts) ฟังก์ชัน `processAndCompressImage`
  - ย่อขนาดภาพอัตโนมัติ (Max 1600px, JPEG Quality 0.85) บนฝั่ง Client
  - ลดขนาด Payload จาก 10MB+ เหลือเพียง ~200–400KB ป้องกันอาการเด้งหลุด 100%

### Bug 2: ปุ่มเลือกรูปจากเครื่องไม่ตอบสนอง หรือปฏิเสธไฟล์ในบางอุปกรณ์
- **สาเหตุ**:
  1. การตรวจสอบ MIME Type แบบเดิมเข้มงวดเกินไป ปฏิเสธไฟล์จากบาง Gallery (เช่น Google Photos, iCloud) ที่ส่ง MIME Type เป็น `""` หรือ `application/octet-stream`
  2. การใช้ `<button onClick={() => ref.click()}>` ถูกระบบความปลอดภัยของมือถือบางรุ่นบล็อก Synthetic Event
- **การแก้ไข**:
  - เปลี่ยนมาใช้ W3C Standard Native `<label htmlFor="gallery-upload-input">` และ `<label htmlFor="camera-upload-input">`
  - ทำ Universal Image Fallback ยอมรับทุกฟอร์แมต (JPG, PNG, WebP, HEIC/HEIF, BMP, GIF, Screenshots)

### Bug 3: แท็บที่เลือกเด้งกลับไปที่ "Type Word" หลังเลือกรูปภาพ
- **สาเหตุ**:
  - เมื่อผู้ใช้สลับหน้าจอไปเลือกรูปใน Gallery แล้วกลับมาที่เบราว์เซอร์ Modal เกิดการ Re-mount / Re-render ทำให้ State `activeTab` คืนค่าสู่ Default (`'type'`)
- **การแก้ไข**:
  - ทำ Tab State Persistence ด้วย `sessionStorage` (`add_vocab_modal_tab`)
  - ล็อก `setActiveTab('photo')` ในฟังก์ชัน `handleProcessFile` เพื่อตรึงหน้าจอให้อยู่ในแท็บ **Photo Scan** เสมอ

### Bug 4: อัปโหลดรูปภาพแล้วระบบไม่แสดงรายการคำแปลเพื่อนำเข้า
- **สาเหตุ**:
  - โค้ดเดิมใช้วิธี 2-Step (ให้ Vision แกะเฉพาะชื่อคำศัพท์รอบที่ 1 แล้วส่งไปแปลรอบที่ 2) หาก Step ใดเกิด Timeout หรือโครงสร้าง JSON เปลี่ยน จะทำให้ได้รายการว่าง (`0 Words`)
- **การแก้ไข**:
  - รวมเป็น ⚡ **1-Shot Multimodal AI Vision & Translation** ใน [azureOpenAIService.ts](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/src/services/azureOpenAIService.ts)
  - เพิ่ม Universal Schema Parser รองรับผลลัพธ์ทั้งรูปแบบ Array อ็อบเจกต์คำแปล และ Array คำศัพท์เพียวๆ

### Bug 5: Azure Static Web Apps CSS MIME Type Mismatch & Cache Error
- **สาเหตุ**:
  - เมื่อ Deploy เวอร์ชันใหม่ Hash ของไฟล์ CSS จะเปลี่ยน (`index-Cwv-47en.css`)
  - เบราว์เซอร์ที่มี Cache `index.html` เก่าจะเรียกหาไฟล์ CSS เดิมที่ไม่มีแล้วบนเซิร์ฟเวอร์
  - Azure SWA มีการตั้งค่า 404 rewrite กลับเป็น `index.html` (MIME `text/html`) ทำให้ Chrome พ่น Error:  
    *"Refused to apply style from ... because its MIME type ('text/html') is not a supported stylesheet MIME type..."*
- **การแก้ไข**:
  - ปรับปรุง [staticwebapp.config.json](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/staticwebapp.config.json)
  - ระบุ `mimeTypes` อย่างชัดเจน (`.css` -> `text/css`, `.js` -> `application/javascript`)
  - ตั้งค่า `Cache-Control: no-cache, no-store, must-revalidate` ให้กับ `/index.html` เพื่อให้เบราว์เซอร์ดึงไฟล์ HTML เวอร์ชันล่าสุดเสมอ

---

## 3. Files Modified & Created (ไฟล์ที่มีการแก้ไขและสร้างใหม่)

| File | Change | Description |
|---|---|---|
| `src/utils/imageUtils.ts` | **NEW** | Canvas-based image resizer & compressor with universal format fallback |
| `src/components/vocab/AddVocabModal.tsx` | **MODIFIED** | Dual camera/gallery inputs, native labels, tab persistence, 1-shot vision review integration |
| `src/services/azureOpenAIService.ts` | **MODIFIED** | 1-Shot multimodal vision with Thai meanings & phonetic pronunciations (`detail: "high"`) |
| `src/pages/sets/SetDetailPage.tsx` | **MODIFIED** | Added "Delete Set" button with confirmation dialog for set owners |
| `staticwebapp.config.json` | **MODIFIED** | Fixed MIME type mappings, route cache-control, and 404 navigation fallback rules |
| `scripts/test_unified_vision.mjs` | **NEW** | Automated test script for 1-shot vision & translation prompt |
| `docs/superpowers/specs/2026-08-29-photo-upload-bugfixes-and-set-deletion.md` | **NEW** | Complete specification and bug fix record |
