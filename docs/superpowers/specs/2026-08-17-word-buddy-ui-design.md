# Word Buddy — UI Design Specification

**Date:** 2026-08-17  
**Status:** Draft  
**Purpose:** Screen-by-screen design guide + Google Stitch prompts

---

## Design System

### Brand Identity

| Token | Value | Usage |
|---|---|---|
| Brand name | Word Buddy | — |
| Tagline | "Learn words. Level up." | Hero / onboarding |
| Mascot concept | A friendly owl holding a book | Logo, empty states |
| Tone | Playful, encouraging, vibrant | All copy & UI |

---

### Color Palette

| Name | Hex | Usage |
|---|---|---|
| **Primary** | `#6C63FF` | Buttons, active nav, highlights |
| **Primary Light** | `#EEF0FF` | Card backgrounds, badges |
| **Secondary** | `#FF6B6B` | Destructive actions, missed answers |
| **Accent Yellow** | `#FFD166` | Streak, stars, "Almost" rating |
| **Accent Green** | `#06D6A0` | Correct answers, "Got it" rating |
| **Surface** | `#F8F9FF` | Page background |
| **Card** | `#FFFFFF` | Card / modal background |
| **Text Primary** | `#1A1A2E` | Headings, body copy |
| **Text Secondary** | `#6B7280` | Labels, placeholders, subtitles |
| **Border** | `#E5E7EB` | Input borders, dividers |

> Dark mode is **out of scope** for Phase 1 — use the light palette above.

---

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Heading H1 | Outfit | 32px | 700 |
| Heading H2 | Outfit | 24px | 600 |
| Heading H3 | Outfit | 18px | 600 |
| Body | Inter | 16px | 400 |
| Label / Caption | Inter | 13px | 500 |
| Game Card EN | Outfit | 40px | 700 |
| Game Card TH | Sarabun | 28px | 500 |

> Load fonts from Google Fonts: `Outfit`, `Inter`, `Sarabun` (for Thai text).

---

### Spacing & Shape

| Token | Value |
|---|---|
| Border radius — card | `16px` |
| Border radius — button | `12px` |
| Border radius — input | `10px` |
| Border radius — badge | `999px` (pill) |
| Shadow — card | `0 4px 20px rgba(108,99,255,0.08)` |
| Shadow — modal | `0 8px 40px rgba(0,0,0,0.16)` |
| Page padding | `24px` (mobile), `48px` (desktop) |
| Card gap | `16px` |

---

### Component Tokens

#### Buttons

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary | `#6C63FF` | White | — |
| Secondary | `#EEF0FF` | `#6C63FF` | — |
| Danger | `#FF6B6B` | White | — |
| Ghost | Transparent | `#6C63FF` | `#6C63FF` 1px |

All buttons: `height: 48px`, `border-radius: 12px`, `font-weight: 600`, `font-size: 15px`.

#### Badges / Pills

| Variant | Background | Text |
|---|---|---|
| POS — noun | `#EEF0FF` | `#6C63FF` |
| POS — verb | `#FFF3E0` | `#F59E0B` |
| POS — adj | `#E8FFF3` | `#06D6A0` |
| POS — adv | `#FFF0F0` | `#FF6B6B` |
| Role — admin | `#FFE9E9` | `#DC2626` |
| Role — user | `#F0F0FF` | `#6C63FF` |
| Status — active | `#E8FFF3` | `#059669` |
| Status — suspended | `#FFF0F0` | `#DC2626` |

---

## Screens

---

### 1. Login Page (`/auth/login`)

**Layout:** Centered card on a soft gradient background (`#F8F9FF` → `#EEF0FF`).

**Elements (top → bottom):**
1. Owl mascot illustration (120px, centered)
2. App name "Word Buddy" — H1, Primary color
3. Tagline "Learn words. Level up." — Body, Text Secondary
4. Divider line
5. Email input (label: "Email address")
6. Password input (label: "Password") + show/hide toggle
7. "Forgot password?" link — right-aligned, small, Primary color
8. Primary button — "Sign In"
9. Divider "or"
10. Google OAuth button — white background, Google icon, "Continue with Google"
11. Footer link — "Don't have an account? **Register**"

**Google Stitch Prompt:**
```
Design a login page for a vocabulary learning app called "Word Buddy" for Thai 
students learning English. Centered card layout on a soft purple-tinted white 
gradient background. Top: a friendly owl mascot icon, then "Word Buddy" title 
in bold purple (#6C63FF), tagline "Learn words. Level up." in gray. 
Form: email input, password input with show/hide toggle, "Forgot password?" link.
Primary "Sign In" button in purple, an "or" divider, then a white Google 
sign-in button. Footer: "Don't have an account? Register" link.
Rounded corners (16px cards, 12px buttons), Inter + Outfit fonts, 
playful but clean design.
```

---

### 2. Register Page (`/auth/register`)

**Elements:**
1. Owl mascot (same as login)
2. "Create your account" — H1
3. Display name input
4. Email input
5. Password input + confirm password input
6. Primary button — "Create Account"
7. Google OAuth button
8. Footer — "Already have an account? **Sign In**"

**Google Stitch Prompt:**
```
Design a registration page for Word Buddy, a vocabulary learning app. Same style 
as the login page — centered card, purple brand color (#6C63FF), owl mascot at top.
Form fields: Display Name, Email, Password, Confirm Password. 
"Create Account" primary button. Google OAuth option below. 
Link at bottom: "Already have an account? Sign In".
Playful, colorful, rounded design for school students.
```

---

### 3. Home / Dashboard (`/`)

**Layout:** Top nav + main content area with cards.

**Top Navigation:**
- Left: Word Buddy logo + owl icon
- Center: nav links — Home, My Sets, Explore (desktop only)
- Right: notification bell + user avatar (dropdown)

**Main Content (2-column on desktop, 1 on mobile):**

**Left / Top:**
- Greeting card: "Good morning, [Name]! 🌟" with a motivational line
- Quick stats row (3 mini cards):
  - Words learned: `142`
  - Day streak: `🔥 7`
  - Sets created: `5`

**Right / Below:**
- Section: "Continue Studying" — last 2 studied sets as horizontal cards
- Section: "My Sets" — grid of SetCards (max 4, "View all →" link)
- Section: "Explore" — 2 featured public sets

**Google Stitch Prompt:**
```
Design a home dashboard for Word Buddy, a vocab learning app for Thai school students.
Top navigation: owl logo + "Word Buddy" on left, nav links in center, user avatar on right.
Main content: Large greeting card "Good morning, Nida! 🌟" with subtitle.
Row of 3 stat cards: "Words Learned 142", "🔥 Streak 7 days", "Sets 5".
Below: "Continue Studying" horizontal scroll section with vocab set cards showing 
title, word count, last studied date, and a purple "Study" button.
Below: "My Sets" grid (2x2) of cards with + New Set card.
Purple (#6C63FF) primary color, white cards, soft shadow, rounded corners, 
Inter + Outfit fonts, colorful badge on each card showing word count.
```

---

### 4. My Vocab Sets (`/sets`)

**Layout:** Page header + filter/search bar + card grid.

**Elements:**
1. Page title "My Vocab Sets" + word count badge
2. Search input + sort dropdown (Newest / A–Z / Most words)
3. "+ New Set" button (primary, top right)
4. Grid of **SetCards** (2 col mobile, 3 col desktop):
   - Set title (H3)
   - Word count badge (pill, Primary Light)
   - Last studied: "3 days ago"
   - Public/Private badge
   - Action row: "Study ▶" button + "⋮" overflow menu (Edit, Delete, Share)
5. Empty state: owl illustration + "No sets yet — create your first one!"

**Google Stitch Prompt:**
```
Design a "My Vocab Sets" page for Word Buddy. Page header with title and 
"+ New Set" purple button on the right. Search bar and sort dropdown below header.
Card grid (3 columns on desktop): each card shows set title in bold, 
a purple pill badge showing word count (e.g. "24 words"), 
"Last studied 3 days ago" in gray, a Public/Private toggle badge.
Card footer: "Study ▶" primary button and a "⋮" menu icon.
One card in the grid is an "+ Add New Set" dashed-border card for quick creation.
Empty state illustration with owl and message "No sets yet!".
White cards, purple brand color, rounded 16px corners, subtle card shadows.
```

---

### 5. Set Detail (`/sets/:id`)

**Layout:** Set header + vocab list.

**Set Header:**
- Set title (editable inline on click)
- Description (optional, italic, gray)
- Badges: word count, public/private toggle
- Action buttons: "Study →", "Add Word", "⋮ More"

**Vocab List (table-like on desktop, cards on mobile):**

| # | EN Word | TH Word | POS | Example | Actions |
|---|---|---|---|---|---|
| 1 | resilience | ความยืดหยุ่น | noun | "Her resilience..." | Edit / Delete |

Each row expandable to show full example sentences (EN + TH).

**Floating "+ Add Word" button** (bottom right, mobile).

**Google Stitch Prompt:**
```
Design a vocab set detail page for Word Buddy. Header section: large set title 
"Unit 3 — Animals", word count badge "18 words", description text, 
"Study Now" primary button and "Add Word" secondary button.
Below: a list of vocabulary cards, each showing:
- English word (large, bold, purple)
- Thai translation (medium, gray, Sarabun font)  
- Part-of-speech badge (colored pill: noun=purple, verb=orange, adj=green)
- Collapsed example sentence (expand on tap)
- Edit pencil icon + Delete trash icon on hover
Floating purple "+" button bottom right.
Clean, airy layout with dividers between entries. Mobile-friendly.
```

---

### 6. Add Vocabulary Modal

**Layout:** Centered modal, 600px wide, 2 tabs.

**Tab A — "✏️ Type Word":**
1. Input: "English word" (large, prominent)
2. "✨ Translate" button (primary)
3. Loading skeleton while AI fetches
4. Auto-filled result section:
   - Thai translation (read-only, copyable)
   - POS badge selector (chips: noun / verb / adj / adv / other)
   - Example EN (editable textarea)
   - Example TH (editable textarea)
5. "Save Word" button

**Tab B — "📷 Photo / Upload":**
1. Drag-drop zone with camera icon + "Drag image here or click to upload"
2. Camera button (mobile — `capture=environment`)
3. Preview thumbnail once image selected
4. "Extract Text →" button
5. → Extracted word appears, then flows into Tab A result section

**Google Stitch Prompt:**
```
Design an "Add Vocabulary" modal dialog for Word Buddy. 600px wide centered modal 
with dark overlay. Modal header: "Add New Word" title + X close button.
Two tabs: "✏️ Type Word" and "📷 Photo / Upload".

Tab 1 (Type Word): Large English word text input with placeholder "e.g. resilience".
Purple "✨ Translate" button. Result section below (appears after translate):
Thai translation field (read-only with copy icon), 
POS selector chips (noun/verb/adj/adv — colored pills, clickable),
editable example sentence EN textarea,
editable example sentence TH textarea.
"Save Word" primary button + "Cancel" ghost button.

Tab 2 (Photo): Dashed-border drag-drop zone with camera icon and upload text.
Camera capture button for mobile. "Extract Text" button.
Same result section flows in after extraction.

Rounded modal, purple brand, clean form design.
```

---

### 7. Flashcard Game (`/sets/:id/study/flashcard`)

**Layout:** Full-screen game view.

**Top Bar:**
- Back arrow + set name
- Progress bar (e.g. 8 / 20 words)
- Timer (optional display)

**Card Area (center):**
- Large white card with shadow, 3D flip animation hint
- **Front:** English word (Outfit 40px bold) + speaker icon (TTS)
- **Back:** Thai translation (Sarabun 28px) + example sentence (small, gray)
- "Tap to flip" hint text (fades after first flip)

**Rating Buttons (appear after flip):**
- ✓ Got it — Accent Green
- ≈ Almost — Accent Yellow
- ✗ Missed — Secondary Red

**Google Stitch Prompt:**
```
Design a flashcard study screen for Word Buddy. Full viewport layout.
Top bar: back arrow, set title "Unit 3 — Animals", progress bar "8 / 20", 
progress text showing percentage.
Center: Large white card (400px wide, 260px tall) with soft purple shadow.
Front of card: English word "Resilience" in bold Outfit 40px font, 
speaker/audio icon button top right.
"Tap to flip →" hint text in small gray below card.
After flip animation, card back shows: Thai word in large Sarabun font,
small example sentence in gray below.
Three rating buttons below card in a row:
"✓ Got it" (green background), "≈ Almost" (yellow), "✗ Missed" (red).
Soft purple gradient background. Fun, game-like feel.
```

---

### 8. Spelling Game (`/sets/:id/study/spelling`)

**Layout:** Full-screen game view.

**Elements:**
1. Top bar: progress + set name
2. Instruction: "Listen and type the word you hear 🎧"
3. Large speaker button (primary, centered)
4. Text input: "Type the word..." (large, centered)
5. "Replay 🔁" small button below speaker
6. "Submit" primary button
7. Result feedback: ✅ correct animation / ❌ + correct word shown

**Google Stitch Prompt:**
```
Design a spelling game screen for Word Buddy. Full viewport.
Top bar with progress indicator.
Center content: "Listen and type the word you hear 🎧" instruction in H2.
Large purple circular speaker button (80px) centered on screen.
"Replay" small ghost button below it.
Large centered text input field for typing the word.
"Submit" primary purple button below input.
Result state: show green checkmark animation for correct,
red X with "The word was: [word]" for incorrect.
Clean, focused, game-like design with soft background.
```

---

### 9. Multiple Choice Game (`/sets/:id/study/multiple_choice`)

**Layout:** Full-screen game view.

**Elements:**
1. Top bar: progress
2. Question card: "What is the Thai meaning of...?" + English word (large, bold)
3. 4 option buttons (full-width, stacked):
   - Default: white with border
   - Correct (after tap): green background + checkmark
   - Wrong (after tap): red background + X
4. Auto-advance after 1.5s

**Google Stitch Prompt:**
```
Design a multiple choice game screen for Word Buddy. Full viewport.
Top: progress bar and "Question 5 of 20" text.
Center: white question card showing "What is the Thai meaning of:" label 
and large English word "Resilience" in bold Outfit font.
Below: 4 answer option buttons, full width, stacked vertically.
Default state: white background with gray border, Thai word text.
Selected correct state: green (#06D6A0) background + white checkmark icon.
Selected wrong state: red (#FF6B6B) background + X icon + correct answer highlighted green.
Rounded button corners, clear tap targets (56px height each).
Soft purple-tinted background.
```

---

### 10. Word Matching Game (`/sets/:id/study/matching`)

**Layout:** Two-column drag-and-drop.

**Elements:**
1. Top bar: progress + set name
2. Left column: English words (draggable cards, purple outline)
3. Right column: Thai translations (drop targets, dashed outline)
4. On correct match: both cards turn green and lock in place
5. On wrong drop: shake animation, cards return

**Google Stitch Prompt:**
```
Design a word matching game screen for Word Buddy. Two-column layout.
Left column: 5 English word cards (draggable), white background, purple border, 
English word in bold. Right column: 5 Thai translation cards (drop zones), 
dashed purple border, Thai word in Sarabun font.
Matched pairs: both cards turn solid green (#06D6A0) with a checkmark, locked.
Unmatched: normal state with subtle drag shadow when dragging.
Top: progress "3 / 5 matched". 
Fun, colorful, clear visual distinction between draggable and drop-target cards.
```

---

### 11. Fill in the Blank Game (`/sets/:id/study/fill_blank`)

**Layout:** Full-screen game view.

**Elements:**
1. Top bar: progress
2. Example sentence with blank: "Her _______ helped her overcome every obstacle."
3. Hint: POS tag shown (e.g. "noun")
4. Text input (centered, prominent)
5. "Check Answer" button
6. Result: correct / incorrect feedback with full word revealed

**Google Stitch Prompt:**
```
Design a fill-in-the-blank game screen for Word Buddy. Full viewport.
Top progress bar. Center: large sentence card showing an English sentence 
with a blank underline: "Her _______ helped her overcome every obstacle."
Small POS hint badge below: "Hint: noun" in purple pill.
Below: wide text input "Type the missing word..." centered.
"Check Answer" primary purple button below input.
Result feedback area: green box with checkmark "Correct! resilience" 
or red box with X "The word was: resilience". 
Clean focused layout, soft gradient background.
```

---

### 12. Study Results Screen

**Layout:** Celebration/summary screen after a game.

**Elements:**
1. Animated emoji or stars at top (🎉 or ⭐⭐⭐)
2. Score: "16 / 20 Correct!" (H1, bold)
3. Percentage ring / donut chart
4. Breakdown: Correct ✓ 16, Almost ≈ 2, Missed ✗ 2
5. Missed words list (collapsible)
6. Buttons: "Play Again" (primary), "Back to Set" (secondary)

**Google Stitch Prompt:**
```
Design a study session results screen for Word Buddy. Celebration layout.
Top: confetti animation hint + "Great Job!" text with party emoji.
Large score display "16 / 20 Correct!" in H1 bold purple.
Circular progress ring showing 80% in green.
3 stat pills in a row: "16 Correct" (green), "2 Almost" (yellow), "2 Missed" (red).
Collapsible section "Words to Review" showing missed vocabulary cards.
Two bottom buttons: "Play Again" (purple primary) and "Back to Set" (ghost).
Fun, rewarding, colorful design with soft confetti background.
```

---

### 13. Admin Dashboard (`/admin`)

**Layout:** Sidebar nav + main content.

**Sidebar (desktop):**
- Word Buddy logo
- Nav links: Dashboard, Users, Vocab Sets, Sessions
- Admin badge on user avatar at bottom

**Main Content — Stat Cards Row (4 cards):**

| Icon | Label | Value |
|---|---|---|
| 👥 | Total Users | 342 |
| ✅ | Active (7 days) | 89 |
| 📚 | Vocab Sets | 1,204 |
| 🎮 | Sessions This Week | 587 |

Below stats: recent activity table / latest user signups.

**Google Stitch Prompt:**
```
Design an admin dashboard for Word Buddy. Left sidebar navigation: 
Word Buddy logo at top, nav items: Dashboard (active), Users, Vocab Sets, Study Sessions.
User avatar with "Admin" badge at bottom of sidebar.
Main content: Page title "Admin Dashboard". 
Row of 4 stat cards: "Total Users 342", "Active This Week 89",
"Vocab Sets 1,204", "Sessions This Week 587".
Each card: white background, colored icon, large number in bold, label in gray.
Below stats: data table "Recent Users" with columns: Name, Email, Role badge, 
Sets count, Joined date, Status badge, Actions (View / Suspend buttons).
Professional, clean design with purple brand accent. Admin-grade UI.
```

---

### 14. Admin User List (`/admin/users`)

**Elements:**
1. Page title "Users" + search bar + filter by role dropdown
2. Paginated table:
   - Avatar + Display name
   - Email
   - Role badge (user / admin)
   - Sets count
   - Joined date
   - Status badge (active / suspended)
   - Actions: "View →", "Suspend", "Promote"
3. Pagination controls at bottom

**Google Stitch Prompt:**
```
Design an admin user management page for Word Buddy. Page header "All Users" 
with search input and "Filter by role" dropdown on the right.
Full-width data table with columns: checkbox, user avatar+name, email, 
role badge (purple "user" or red "admin" pill), sets count, joined date,
status badge (green "active" or gray "suspended"), 
action buttons "View" and "Suspend/Unsuspend".
Pagination controls at bottom: Previous / 1 2 3 ... 12 / Next.
Striped or hover-highlight rows. Professional table design with purple accents.
```

---

### 15. Admin User Detail (`/admin/users/:id`)

**Layout:** User profile header + vocab sets accordion.

**User Header Card:**
- Avatar, Display name, Email, Role badge, Status badge
- Action buttons: Suspend Account / Promote to Admin

**Vocab Sets Section:**
- Each set as an accordion row:
  - Set title + word count badge + expand arrow
  - Expanded: vocab table (word EN | word TH | POS | Example | Edit / Delete)
  - "+ Add Word" button inside expanded set
  - "Delete Set" danger button

**Google Stitch Prompt:**
```
Design an admin user detail page for Word Buddy. Top section: user profile card 
with avatar, display name "Nida Jitprasong", email, "user" role badge, 
"Active" status badge. Action buttons: "Suspend Account" (red outline) 
and "Promote to Admin" (gray outline).
Below: "Vocabulary Sets" section as accordion list.
Each accordion row: set title + word count badge + expand chevron.
Expanded state shows a data table with columns: English word, Thai word, 
POS badge, example sentence (truncated), Edit icon, Delete icon.
Inside expanded set: "Add Word +" and "Delete Set" danger button.
Professional admin layout with purple brand accent.
```

---

## Interaction Notes

| Interaction | Behavior |
|---|---|
| Card flip (Flashcard) | CSS `rotateY(180deg)` transform, 0.5s ease |
| Drag-drop (Matching) | HTML5 drag API or react-dnd, green snap on correct |
| Correct answer feedback | Green flash + checkmark icon + subtle bounce animation |
| Wrong answer feedback | Red flash + shake animation (CSS `@keyframes shake`) |
| Modal open/close | Fade + scale from 0.95 → 1.0 |
| Page transitions | Fade slide (100ms) |
| TTS button | Pulse animation while audio playing |
| Loading (AI translate) | Skeleton shimmer on result fields |
| Toast notifications | Slide in from top-right, auto-dismiss 3s |

---

## Mobile Considerations

| Screen | Mobile Adaptation |
|---|---|
| Nav | Bottom tab bar (Home, Sets, Explore, Profile) |
| Sets grid | Single column |
| Admin table | Horizontal scroll + condensed columns |
| Add Word modal | Full-screen sheet (slides up from bottom) |
| Matching game | Stack columns vertically (tap to select, tap to match) |

---

## Screen Flow Diagram

```
[Login] ──────────────────────────► [Home Dashboard]
[Register] ──────────────────────►      │
                                         ├──► [My Sets] ──► [Set Detail] ──► [Add Word Modal]
                                         │                       │
                                         │               [Study Mode Picker]
                                         │                       │
                                         │        ┌──────────────┼──────────────┐
                                         │        ▼              ▼              ▼
                                         │   [Flashcard]   [Spelling]   [Multiple Choice]
                                         │        │              │              │
                                         │        └──────────────┼──────────────┘
                                         │                       ▼
                                         │               [Results Screen]
                                         │
                                         ├──► [Explore] ──► [Public Set Detail] ──► [Copy to My Sets]
                                         ├──► [Profile]
                                         └──► [Admin] ──► [User List] ──► [User Detail]
```

---

## Next Steps

1. **Use the Stitch prompts above** at [labs.google/stitch](https://labs.google/stitch) to generate mockups for each screen.
2. **Iterate in Stitch** — adjust colors, layout, and components via chat.
3. **Export the designs** — save screenshots or exported code per screen.
4. **Return here** — I'll convert the designs into React + TypeScript + TailwindCSS components and wire up Supabase.
