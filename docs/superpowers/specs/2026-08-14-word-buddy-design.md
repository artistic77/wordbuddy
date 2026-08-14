# Word Buddy — Design Specification

**Date:** 2026-08-14  
**Status:** Draft  
**Authors:** AI-assisted brainstorming session

---

## Overview

Word Buddy is a web-based vocabulary learning application targeting Thai primary and secondary school students (ages 10–17) studying English. Students collect English vocabulary, get instant AI-powered Thai translations and grammatical metadata, organize words into sets, and reinforce learning through structured training and mini-games.

The application supports bidirectional Thai↔English context but defaults to an English → Thai learning direction (students encounter the English word, recall or learn the Thai meaning). An admin panel gives platform administrators full visibility and control over all user accounts and vocabulary data.

---

## Goals & Success Criteria

- A student can add a new English word (typed or photographed), receive an AI-generated Thai translation, part-of-speech tag, and example sentence in under 5 seconds.
- A student can complete a full flashcard or spelling session with a 20-word set in under 10 minutes.
- An admin can view, edit, or remove any user vocabulary and manage account status without direct database access.
- The AI provider can be swapped (e.g., Gemini → OpenAI) by changing a single environment variable and updating one gateway file.
- The system operates entirely within Supabase free tier for an initial user base of up to ~500 students.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Fast DX, strong ecosystem, user preference |
| Styling | TailwindCSS v3 | Utility-first, easy to achieve playful colorful design |
| Routing | React Router v6 | Standard SPA routing |
| State | TanStack Query + Zustand | Server state + lightweight client state |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Database | Supabase Postgres | Relational, RLS policies, free tier |
| Backend logic | Supabase Edge Functions (Deno) | AI gateway, keeps API keys server-side |
| AI (translation, OCR) | Provider-abstracted gateway (default: Gemini 1.5 Flash) | Swappable via env var |
| Text-to-speech | Web Speech API (SpeechSynthesis) | Free, no backend, works in modern browsers |
| Hosting | Vercel (frontend) + Supabase (backend) | Both have generous free tiers |

---

## Architecture

```
+-----------------------------------------+
|              React + Vite SPA           |
|  (Vercel CDN)                           |
|                                         |
|  Pages: Home, Sets, Study, Games,       |
|         Admin, Profile, Auth            |
+----------------+------------------------+
                 | HTTPS
                 v
+-----------------------------------------+
|          Supabase Platform              |
|                                         |
|  +----------+  +-------------------+   |
|  |  Auth    |  |  Edge Functions   |   |
|  |(JWT/RLS) |  |  /functions/ai    |   |
|  +----------+  |  (AI Gateway)     |   |
|                +--------+----------+   |
|  +-----------------+    |              |
|  |  Postgres DB    |    |              |
|  |  (RLS policies) |    |              |
|  +-----------------+    |              |
+-----------------------------------------+
                          | HTTPS
                          v
                +------------------+
                |   AI Provider    |
                | (Gemini / GPT)   |
                +------------------+
```

The frontend never calls the AI provider directly. All AI calls route through the `/functions/ai` Edge Function, which holds the API key and enforces auth before forwarding.

---

## Database Schema

### `profiles`
Extends Supabase Auth `auth.users`. Created automatically via trigger on signup.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | References auth.users.id |
| `display_name` | text | Student name |
| `avatar_url` | text | Optional |
| `role` | text | user (default) or admin |
| `is_suspended` | boolean | Default false |
| `created_at` | timestamptz | |

### `vocab_sets`
Groups of vocabulary created by a user.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `owner_id` | uuid | FK profiles.id |
| `title` | text | e.g. "Unit 3 — Animals" |
| `description` | text | Optional |
| `is_public` | boolean | Default false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `vocab_entries`
Individual vocabulary items within a set.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `set_id` | uuid | FK vocab_sets.id |
| `owner_id` | uuid | FK profiles.id (denormalized for RLS) |
| `word_en` | text | English word |
| `word_th` | text | Thai translation |
| `part_of_speech` | text | noun, verb, adj, adv, gerund, past_participle |
| `example_sentence_en` | text | AI-generated example |
| `example_sentence_th` | text | AI-generated Thai example |
| `image_url` | text | Optional — source image from OCR |
| `audio_url` | text | Reserved for future recorded audio |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `study_sessions`
Records of training/game sessions for progress tracking.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | FK profiles.id |
| `set_id` | uuid | FK vocab_sets.id |
| `game_mode` | text | flashcard, spelling, multiple_choice, matching, fill_blank |
| `score` | integer | Correct answers |
| `total` | integer | Total questions |
| `duration_seconds` | integer | Session length |
| `completed_at` | timestamptz | |

### Row Level Security (RLS) Policies

- **profiles**: Users read/update their own row. Admins read/update all rows.
- **vocab_sets**: Users CRUD their own sets; read public sets. Admins CRUD all.
- **vocab_entries**: Users CRUD entries in their own sets. Admins CRUD all.
- **study_sessions**: Users insert/read their own. Admins read all.

Admin role is checked via:
`(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`

---

## AI Gateway — Edge Function (/functions/ai)

### Provider Abstraction Interface

```typescript
interface AIProvider {
  translate(word: string, fromLang: 'en' | 'th', toLang: 'en' | 'th'): Promise<TranslationResult>
  extractTextFromImage(base64Image: string, mimeType: string): Promise<string>
  generateExample(word: string, partOfSpeech: string): Promise<ExampleResult>
}
```

Active provider selected by `AI_PROVIDER` env var (gemini | openai). Adding a new provider means implementing the interface and registering it — no changes to calling code.

### Endpoints (all require valid Supabase JWT)

| Method | Path | Description |
|---|---|---|
| POST | /functions/ai/translate | Translate word, return Thai + POS + example |
| POST | /functions/ai/ocr | Extract text from base64 image |
| POST | /functions/ai/example | Generate example sentences for a word |

### Translation Response Shape

```json
{
  "word_en": "resilience",
  "word_th": "ความยืดหยุ่น",
  "part_of_speech": "noun",
  "example_sentence_en": "Her resilience helped her overcome every obstacle.",
  "example_sentence_th": "ความยืดหยุ่นของเธอช่วยให้เธอเอาชนะอุปสรรคทุกอย่างได้"
}
```

---

## Frontend Pages & Components

### Pages

| Route | Page | Access |
|---|---|---|
| / | Home / Dashboard | Authenticated |
| /auth/login | Login | Public |
| /auth/register | Register | Public |
| /sets | My Vocab Sets list | Authenticated |
| /sets/:id | Set detail — vocab list | Authenticated |
| /sets/:id/study | Study mode selector | Authenticated |
| /sets/:id/study/:mode | Active training session | Authenticated |
| /explore | Browse public sets | Authenticated |
| /profile | Account settings | Authenticated |
| /admin | Admin dashboard | Admin only |
| /admin/users | User list | Admin only |
| /admin/users/:id | User detail + their vocab | Admin only |

### Key Components

- **VocabCard** — displays word EN, word TH, POS badge, example toggle
- **SetCard** — set title, word count, last studied, quick-play button
- **AddVocabModal** — tabs: "Type word" / "Take photo" / "Upload image"
- **OCRCapture** — wraps input[type=file capture=environment] + drag-drop zone
- **GameEngine** — shared wrapper: manages question queue, timer, score, progress bar
- **FlashcardGame** — flippable card, EN front / TH back, self-rate buttons
- **SpellingGame** — TTS plays word, student types spelling, validates on submit
- **MultipleChoiceGame** — 4 options, highlight correct/wrong, auto-advance
- **MatchingGame** — drag EN words to TH targets, snap on correct match
- **FillBlankGame** — sentence with blank, student types missing word
- **AdminUserTable** — paginated user list, search, suspend/promote actions
- **AdminVocabEditor** — inline edit vocab entries for any user's set

---

## Feature Details

### Add Vocabulary

1. User opens AddVocabModal from a set.
2. **Tab A — Type word:** User types English word → clicks "Translate" → Edge Function returns translation + POS + example → fields auto-fill → user reviews/edits → saves.
3. **Tab B — Camera/Upload:** User takes photo or uploads image → base64 sent to /functions/ai/ocr → English word extracted → same translation flow as Tab A.
4. Entry is saved to vocab_entries.

### Study Modes

All study modes are powered by GameEngine, which:
- Shuffles entries from the selected set
- Tracks correct/incorrect per entry
- Records a study_sessions row on completion
- Shows a results screen with score, "Play Again" / "Back to Set"

**Flashcard:** Show EN word → student thinks → tap to flip → reveal TH → student self-rates (Got it / Almost / Missed). Cards rated "Missed" are re-queued.

**Spelling:** TTS reads the English word aloud → student types what they heard → validated case-insensitively. Replay audio button available.

**Multiple Choice:** Show English word → 4 Thai options (1 correct + 3 random from same set or global pool) → tap to answer.

**Word Matching:** 4–6 EN words on left, shuffled TH translations on right → drag EN to its TH match.

**Fill in the Blank:** Example sentence shown with the EN word blanked → student types the missing word.

### Text-to-Speech

Uses window.speechSynthesis with lang: 'en-US'. No backend required. Degrades gracefully if browser does not support it (button hidden, feature disabled with tooltip).

### Photo / OCR Flow

```
User selects image (camera or file)
  → Frontend: resize to max 1024px, convert to base64
  → POST /functions/ai/ocr { image: base64, mimeType }
  → Edge Function: send to Gemini Vision with prompt:
    "Extract the English or Thai vocabulary word from this image.
     Return only the word, no punctuation."
  → Response: extracted word string
  → Frontend: populate word field, trigger translation
```

### Public Sets & Explore

- Sets marked is_public = true appear in /explore.
- Any user can "Copy to my collection" — creates a new set owned by them with all entries duplicated.
- Original set owner is credited (display name shown on card).

### Admin Panel

Accessible only to users with role = 'admin'. RLS enforces at the data layer too.

**Admin Dashboard:**
- Total users, active in last 7 days
- Total vocab sets (public / private breakdown)
- Total vocab entries
- Total study sessions this week

**User List (/admin/users):**
- Paginated table: display name, email, role, sets count, joined date, status
- Actions: Suspend, Promote to Admin, View

**User Detail (/admin/users/:id):**
- Shows all vocab sets for that user
- Can expand any set to see all entries
- Inline edit: word_en, word_th, part_of_speech, example sentences
- Delete individual entries or entire sets
- Add a new entry to any of their sets

---

## Implementation Phases

### Phase 1 — Core + Admin (MVP)

- Project scaffold (Vite + React + TS + Tailwind)
- Supabase project setup (schema, RLS policies, auth)
- Auth flows (login, register, Google OAuth, protected routes)
- Profile page (display name, avatar)
- Vocab sets CRUD
- Manual vocab entry + AI translation (Edge Function + Gemini)
- Flashcard study mode
- Admin panel (user list, user detail, vocab edit/delete/add)

### Phase 2 — Rich Input & Training

- OCR via photo capture + file upload
- Spelling game (TTS integration)
- Multiple choice game
- AI-generated example sentences in vocab detail view
- Part-of-speech badge + vocab detail panel

### Phase 3 — Social & Games

- Public sets + Explore page + Copy to collection
- Word matching drag-and-drop game
- Fill-in-the-blank game
- Study session history + progress stats per set

---

## Security Considerations

- API keys exist only in Edge Function environment variables — never in frontend bundles.
- All Edge Function endpoints validate the Supabase JWT before processing.
- RLS is the authoritative access control layer — frontend role checks are UX only.
- Image uploads are resized client-side before transmission.
- Admin actions (suspend, promote, delete) are logged to a future audit_log table (Phase 3+).

---

## Out of Scope (for now)

- Native mobile app (iOS/Android)
- Offline mode / PWA
- Paid/subscription tiers
- Push notifications
- Third-party LMS integration (Google Classroom, etc.)
- Thai → English as primary study direction
