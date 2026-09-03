# คู่มือการตั้งค่า LINE Login & LIFF (LINE Front-end Framework)

ระบบ Word Buddy รองรับการเข้าสู่ระบบและสมัครสมาชิกด้วย **LINE Login** ทั้งบนเว็บเบราว์เซอร์ปกติ และเปิดใช้งานผ่าน **LINE LIFF** ภายใน LINE Application โดยระบบจะดึง Display Name, Avatar และเก็บข้อมูล **LINE User ID (UID)** ไว้ในฐานข้อมูล `profiles.line_user_id` เพื่อรองรับการบรอดแคสต์ข้อความในอนาคต

---

## 1. การสร้าง LINE Login Channel & LIFF App

### ขั้นตอนที่ 1: เข้าสู่ LINE Developers Console
1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เข้าสู่ระบบด้วยบัญชี LINE ของคุณ
3. สร้าง **Provider** (เช่น `Word Buddy`) หากยังไม่มี

### ขั้นตอนที่ 2: สร้าง LINE Login Channel
1. กด **Create a new channel**
2. เลือก Channel type: **LINE Login**
3. กรอกข้อมูล:
   - **Channel name**: `Word Buddy`
   - **Channel description**: `English-Thai vocabulary learning companion`
   - **App type**: เลือกทั้ง **Web app** และ **Mobile app**
4. กด **Create**

### ขั้นตอนที่ 3: สร้าง LIFF App ใน Channel
1. ใน Channel LINE Login ที่เพิ่งสร้าง ไปที่แท็บ **LIFF**
2. กด **Add** เพื่อสร้าง LIFF app ใหม่
3. กำหนดค่าต่างๆ ดังนี้:
   - **LIFF app name**: `Word Buddy App`
   - **Size**: เลือก `Full` (เต็มหน้าจอ) หรือ `Tall`
   - **Endpoint URL**:
     - ขณะพัฒนา Local: `http://localhost:5173/` (หรือ URL ngrok/tunnel ของคุณ)
     - ขณะขึ้น Production: URL โดเมนของแอปคุณ เช่น `https://your-domain.azurewebsites.net/`
   - **Scopes**: ติ๊ก `profile`, `openid` (และ `email` หากขอสิทธิ์เพิ่มเติม)
   - **Bot link feature**: Normal หรือ On (ตามต้องการ)
4. กด **Add**
5. คัดลอก **LIFF ID** (เช่น `1234567890-AbCdEfGh`)

---

## 2. การตั้งค่าในโปรเจกต์ Word Buddy

1. เปิดไฟล์ `.env` ในเครื่องของคุณ
2. เพิ่มตัวแปร `VITE_LIFF_ID`:
   ```env
   VITE_LIFF_ID=your-liff-id-here
   ```
3. บันทึกและรีสตาร์ต Dev Server ด้วย `npm run dev`

---

## 3. การทดสอบการใช้งาน

### 1) ใช้งานบนเว็บเบราว์เซอร์ปกติ
- ไปที่หน้า `/auth/login` หรือ `/auth/register`
- คลิกปุ่มสีเขียว **"Continue with LINE"**
- ระบบจะเปิดหน้ายืนยันสิทธิ์ของ LINE และล็อกอินเข้าใช้งานทันที

### 2) ใช้งานผ่าน LINE Application (LIFF)
- ส่งลิงก์ LIFF URL (เช่น `https://liff.line.me/your-liff-id`) ให้เพื่อนหรือแชตบอทใน LINE
- เมื่อผู้ใช้กดเปิดลิงก์ใน LINE App:
  - ระบบจะตรวจจับสภาพแวดล้อม LIFF และทำการ **Auto-Login** ให้ทันทีอัตโนมัติ
  - ผู้ใช้ไม่ต้องกรอกรหัสผ่านหรือพิมพ์อีเมลใดๆ

### 3) โหมดจำลอง (Mock Mode) ใน Development
- หากยังไม่ได้ระบุ `VITE_LIFF_ID` ในไฟล์ `.env`:
  - ปุ่ม "Continue with LINE" จะจำลองการล็อกอินด้วย Mock LINE Profile ให้อัตโนมัติ เพื่อให้ทดสอบโฟลว์ของระบบได้ทันทีโดยไม่ต้องรอสร้าง App บน LINE Console

---

## 4. โครงสร้างข้อมูลใน Supabase

ตาราง `public.profiles` ได้รับการเพิ่มคอลัมน์ดังนี้:
- `line_user_id`: เก็บ LINE UID (เช่น `U1234567890abcdef...`) สำหรับใช้เชื่อมต่อ LINE Messaging API หรือ LINE Broadcast ในอนาคต
- `line_display_name`: ชื่อโปรไฟล์ใน LINE
- `line_picture_url`: รูปโปรไฟล์ใน LINE
