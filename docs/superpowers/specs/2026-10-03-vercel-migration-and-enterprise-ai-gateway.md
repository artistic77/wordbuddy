# Vercel Migration & Enterprise AI Gateway Integration Spec (2026-10-03)

## 📌 Executive Summary
เอกสารบันทึกรายละเอียดการปรับเปลี่ยน Infrastructure และ Service Layer ประจำวันที่ 3 ตุลาคม 2026 ครอบคลุม:
1. การย้าย Hosting จาก **Azure Static Web Apps** มายัง **Vercel** (`vercel.com`)
2. การเชื่อมต่อ **Enterprise AI Gateway (OpenAI `gpt-5.5`)** แทน Azure OpenAI เดิม
3. การแก้ปัญหา **CORS บนเบราว์เซอร์** ด้วย **Vercel Edge Proxy (`api/ai-gateway.ts`)** และ Vite Local Dev Proxy
4. การปรับปรุงระบบ **AI Vision Scan** สำหรับสแกนภาพถ่าย/ใบงานคำศัพท์ภาษาอังกฤษ ให้แปลความหมายภาษาไทยและสะกดคำอ่านตามหลักสัทศาสตร์อย่างถูกต้อง 100%
5. แนวทางการตั้งค่า **LINE Login (LIFF)** และ **Supabase Authentication** บน Vercel

---

## 1. Infrastructure Migration: Azure Static Web Apps ➡️ Vercel

### 1.1 Vercel SPA Routing & Configuration (`vercel.json`)
- กำหนด SPA fallback เพื่อให้ React Router ทำงานบน Vercel ได้อย่างราบรื่น:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/ai-gateway/(.*)",
      "destination": "/api/ai-gateway?path=$1"
    },
    {
      "source": "/api/ai-gateway",
      "destination": "/api/ai-gateway"
    },
    {
      "source": "/((?!assets/|images/|api/|.*\\.[a-zA-Z0-9]+$).*)",
      "destination": "/index.html"
    }
  ]
}
```

### 1.2 Vercel Edge Serverless Function (`api/ai-gateway.ts`)
- ทำหน้าที่เป็น Reverse Proxy ฝั่ง Server บน Vercel Edge Network
- แก้ปัญหา Browser CORS Preflight (OPTIONS) เนื่องจาก Gateway ฝั่งองค์กรไม่มี CORS Headers สำหรับเบราว์เซอร์
- ส่งต่อ Headers อัตโนมัติ (`Ocp-Apim-Subscription-Key`, `x-service-line`, `x-brand`, `x-project`, `api-version`)

### 1.3 Local Dev Server Proxy (`vite.config.ts`)
- กำหนด `server.proxy` ใน Vite ให้ map `/api/ai-gateway` ไปที่ `https://ai-api-dev.dentsu.com` อัตโนมัติในเครื่อง Local

---

## 2. Enterprise AI Gateway (`gpt-5.5`) Integration

### 2.1 Gateway Specification
- **Endpoint**: `https://ai-api-dev.dentsu.com`
- **Deployment**: `gpt-5.5`
- **Query Parameter**: `?api-version=2024-10-21`
- **Required Headers**:
  - `Ocp-Apim-Subscription-Key`: Subscription Key
  - `x-service-line`: `cxm`
  - `x-brand`: `merkle`
  - `x-project`: `ChatBotEnglishTeacher`
  - `api-version`: `v15`
  - `Cache-Control`: `no-cache`

### 2.2 Model Specific Constraints Handled (`azureOpenAIService.ts`)
1. **Temperature Handling**: โมเดล `gpt-5.5` ไม่อนุญาตให้ใส่ค่า `temperature: 0.1` หรือ `0.3` (จะเกิด Error `400 Unsupported value`) ระบบได้ปรับให้ละเว้นพารามิเตอร์นี้เพื่อใช้ค่าเริ่มต้น (1) ของโมเดล
2. **Token Limit Parameter**: โมเดล `gpt-5.5` ไม่รองรับ `max_tokens` (จะเกิด Error `400 Unsupported parameter`) ระบบได้เปลี่ยนไปใช้ `max_completion_tokens` แทนอย่างถูกต้อง

---

## 3. Vision Worksheet Scanning & Thai Phonetics Engine Upgrade

### 3.1 ปัญหาเดิมที่พบ
1. รูปถ่ายคำศัพท์ภาษาอังกฤษที่ไม่มีคำแปลในภาพ AI Vision มักจะถอดความหมายออกมาเป็นภาษาอังกฤษ (English definitions) หรือคำภาษาอังกฤษเดิมในช่อง `word_th`
2. คำอ่านภาษาไทย (`reading_th`) บางคำสะกดผิดเพี้ยนเพราะไม่ได้ผ่านการตรวจสอบสัทศาสตร์มาตรฐาน

### 3.2 การแก้ไขและป้องกัน 3 ชั้น (Triple-Layer Protection)
1. **System Prompt Enforcement (`azureOpenAIService.ts`)**:
   - เพิ่มกฎเข้มงวดว่า `word_th` ต้องเป็นอักษรภาษาไทยเท่านั้น ห้ามมีคำอธิบายภาษาอังกฤษ
   - กำหนดกฎการสะกดสัทศาสตร์คำอ่านไทย (เช่น `-st` -> `สต์`, `-ch` -> `ทช์/ช์`, `-en` -> `เก้น`, `bird/world` -> `เบิร์ด/เวิลด์`)
2. **Authoritative Dictionary Sanitization**:
   - นำคำศัพท์ทุกคำเทียบกับ `COMMON_PHONETICS` และ Rule-based Parser ก่อนบันทึกเสมอ
3. **Auto Batch Translate Fallback (`aiService.ts`)**:
   - ตรวจสอบ Regex ภาษาไทย `[\u0E00-\u0E7F]` หากคำใดที่ภาพสกัดมาแล้วไม่มีความหมายภาษาไทย ระบบจะส่งคำนั้นเข้า `batchTranslateWords` อัตโนมัติ เพื่อให้ได้ความหมายและคำอ่านไทยที่สมบูรณ์ 100%

---

## 4. LINE Login & Supabase Configuration Checklist

### 4.1 LINE Developers Console
- **LIFF App ID**: `2011409143-n8oP9xkl`
- **Endpoint URL**: ต้องชี้ไปที่ Domain ของ Vercel (เช่น `https://wordbuddy-dusky.vercel.app/`) เพื่อไม่ให้ติดปัญหา Domain mismatch ขณะล็อกอิน

### 4.2 Supabase Authentication
1. **Confirm Email**: ต้องปรับเป็น **OFF** ใน *Authentication > Providers > Email* เพื่อไม่ให้บัญชีผู้ใช้ LINE (`line_xxxx@wordbuddy.line`) ติด `email rate limit exceeded`
2. **Redirect URLs**: เพิ่ม Domain ของ Vercel:
   - `https://wordbuddy-dusky.vercel.app/**`
   - `https://wordbuddy-pphp79ftx-ball24.vercel.app/**`

---

## 5. Verification & Test Scripts
- สคริปต์ทดสอบ CLI สำหรับเช็กการเชื่อมต่อ AI Gateway:
  ```bash
  node scripts/test_enterprise_ai.mjs
  ```
- ทดสอบ Build ระบบ:
  ```bash
  npm run build
  ```
  *(ผลการ Build สำเร็จ 0 Errors)*

---

## 6. Git Changes Reference
- **Branch**: `develop`
- **Latest Commit**: `ab51432` (`fix(ai): add vercel edge ai-gateway proxy, enhance vision thai translation & phonetics validation`)
- **Key Files**:
  - `api/ai-gateway.ts`
  - `vercel.json`
  - `src/services/azureOpenAIService.ts`
  - `src/services/aiService.ts`
  - `src/vite-env.d.ts`
  - `vite.config.ts`
  - `.env.example`
  - `scripts/test_enterprise_ai.mjs`
