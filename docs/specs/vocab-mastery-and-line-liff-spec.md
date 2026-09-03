# Requirements & Specification: Vocab Set Mastery & LINE Login / LIFF Integration

**Date**: September 3, 2026  
**Status**: Implemented & Deployed to Production (`develop`, `main`)

---

## 1. Requirement 1: Vocab Set Mastery Flag & Filtering

### 1.1 วัตถุประสงค์
1. **Flag สถานะคำศัพท์**: ผู้ใช้สามารถกำหนดสถานะของคำศัพท์แต่ละคำใน Vocab Set ได้ว่า "เข้าใจดีแล้ว / จำได้แล้ว" (Mastered) หรือ "ยังจำไม่ได้" (Unmastered) เพื่อไม่ต้องการฝึกคำเดิมซ้ำๆ หรือเน้นเฉพาะคำที่ยังจำไม่ได้
2. **ระบบตัวกรอง (Filter)**: สามารถฟิลเตอร์ดูเฉพาะคำที่จำได้แล้ว หรือยังจำไม่ได้ ภายในชุดคำศัพท์นั้นๆ
3. **สรุปสถิติจำนวน**: แสดงจำนวนรวมว่าในแต่ละ Vocab Set จำได้แล้วกี่คำ และยังจำไม่ได้อีกกี่คำ ทั้งในหน้า Set Detail และหน้ารวมชุดคำศัพท์ (Sets List)
4. **Study Mode Integration**: มีตัวเลือกก่อนเริ่มเข้าฝึกคำศัพท์ (Study Mode) ว่าต้องการ "ฝึกเฉพาะคำที่ยังจำไม่ได้" หรือ "ฝึกทุกคำ"

### 1.2 การออกแบบและการทำงาน (Implementation)
- **Database (`public.vocab_entries`)**:
  - เพิ่มคอลัมน์ `is_mastered BOOLEAN NOT NULL DEFAULT FALSE`
  - สร้าง index `idx_vocab_entries_is_mastered` บน `(set_id, is_mastered)`
- **หน้าชุดคำศัพท์ (`SetDetailPage.tsx`)**:
  - เพิ่มแถบ **Vocab Mastery Progress Banner** พร้อมเปอร์เซ็นต์และแถบพลังความจำ
  - เพิ่ม Stat Cards 3 รูปแบบ (จำได้แล้ว, ยังจำไม่ได้, ทั้งหมด) กดเพื่อกรองข้อมูลได้ทันที
  - เพิ่มปุ่มสลับสถานะความจำ (Quick-Toggle Button) บนการ์ดคำศัพท์แต่ละคำ
  - เพิ่มปุ่มปรับสถานะแบบกลุ่ม (Batch Actions: "จำได้แล้ว (X)", "ยังจำไม่ได้ (X)") ใน Bulk Action Bar
  - เพิ่มตัวเลือก **Study Scope Selector** ("ฝึกเฉพาะคำที่ยังจำไม่ได้" vs "ฝึกทั้งหมด")
- **โหมดการเรียนรู้ (Study Games)**:
  - รองรับพารามิเตอร์ `?scope=unmastered` ในทั้ง 5 โหมดเกม:
    1. Flashcards (`FlashcardGamePage.tsx`)
    2. Spelling Game (`SpellingGamePage.tsx`)
    3. Multiple Choice Game (`MultipleChoiceGamePage.tsx`)
    4. Matching Game (`MatchingGamePage.tsx`)
    5. Fill in the Blank Game (`FillBlankGamePage.tsx`)
- **หน้ารวมชุดคำศัพท์ (`SetsListPage.tsx`)**:
  - แสดงจำนวนความก้าวหน้าและ Mini Progress Bar `จำได้แล้ว X/Y คำ (Z%)` บนการ์ดชุดคำศัพท์แต่ละใบ

---

## 2. Requirement 2: LINE Login & LIFF Integration

### 2.1 วัตถุประสงค์
1. **สมัครสมาชิกและเข้าสู่ระบบด้วย LINE**: เพิ่มช่องทางเข้าใช้งานผ่าน LINE Login
2. **รองรับ LINE LIFF (LINE Front-end Framework)**: สามารถนำเว็บแอปไปเปิดเป็น LIFF ภายใน LINE Application ได้อย่างไร้รอยต่อ
3. **Auto-Login ใน LINE App**: เมื่อเปิดผ่าน LINE LIFF ระบบจะทำการเข้าสู่ระบบให้อัตโนมัติทันที
4. **ดึงข้อมูลโปรไฟล์**: ดึง Display Name และรูปภาพโปรไฟล์ (Avatar) มาตั้งต้นบัญชีผู้ใช้
5. **จัดเก็บ LINE UID**: บันทึกข้อมูล LINE User ID (`line_user_id`) ลงในฐานข้อมูล เพื่อรองรับการส่งข้อความ Broadcast หรือ Push Message ไปหากลุ่มผู้ใช้งานในอนาคต

### 2.2 การออกแบบและการทำงาน (Implementation)
- **Database (`public.profiles`)**:
  - เพิ่มคอลัมน์:
    - `line_user_id TEXT UNIQUE` (เก็บ LINE UID เช่น `U1234567890abcdef...`)
    - `line_display_name TEXT`
    - `line_picture_url TEXT`
  - สร้าง index `idx_profiles_line_user_id`
- **LIFF SDK Service (`src/services/liffService.ts`)**:
  - ติดตั้งแพ็กเกจ `@line/liff`
  - ตรวจจับสภาพแวดล้อม In-App Client (`liff.isInClient()`)
  - จัดการขั้นตอน Authentication และดึง Profile (`userId`, `displayName`, `pictureUrl`)
  - มี Mock Profile Mode สำหรับ Local Development เมื่อยังไม่ได้ระบุ `VITE_LIFF_ID`
- **Auth Context (`src/context/AuthContext.tsx`)**:
  - เพิ่มฟังก์ชัน `signInWithLine(profile)` สำหรับเชื่อมโยงบัญชีและ upsert ลงตาราง `profiles`
  - ฟังก์ชันตรวจจับ Auto-Login อัตโนมัติเมื่อเปิดผ่าน LIFF URL
- **UI Components**:
  - หน้า Login (`LoginPage.tsx`) และหน้า Register (`RegisterPage.tsx`): เพิ่มปุ่มสีเขียวทางการของ LINE `"Continue with LINE"` (`#06C755`) พร้อมสถานะ Loading
- **Configuration & Documentation**:
  - เพิ่มตัวแปร `VITE_LIFF_ID=` ใน `.env.example`
  - เอกสารขั้นตอนการสร้างและตั้งค่า Channel/LIFF ใน LINE Developers Console ที่ `docs/line-liff-setup.md`
