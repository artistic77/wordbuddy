# Word Buddy — iPad Portrait UI Diagnostic & Fix Specification

**Specification ID**: `SPEC-UI-IPAD-PORTRAIT-001`  
**Date**: September 2026  
**Status**: Ready for Engineering Execution  
**Target Viewport**: Standard iPad Portrait (`768px × 1024px` to `834px × 1194px`)  
**Scope**: 5 Study Game Modes + Results, Set Detail Study Grid, and Vocab Import & Management Modals.

---

## 1. Executive Summary

An in-depth UI/UX audit was conducted across Word Buddy's core vocabulary learning and set management screens on iPad portrait viewports. The audit identified five primary improvement areas:
1. **Container Column Alignment**: Discrepancies between `GameHeader` (`max-w-2xl` / 672px) and question/card containers (`max-w-md` / 448px or `max-w-lg` / 512px).
2. **Virtual Keyboard Displacement**: Fixed `justify-center` vertical centering in `SpellingGamePage` and `FillBlankGamePage` pushing card headers and speaker icons off-screen when the ~350px iPad software keyboard opens.
3. **Input Field Attributes**: Missing `autoCapitalize="none"` and `enterKeyHint="send"` causing unwanted sentence-case capitalization and requiring unnecessary taps away from the keyboard.
4. **Study Mode Launcher Grid Symmetry**: An uneven 2-column layout on iPad (`sm:grid-cols-2`) leaving the 5th study mode stranded on an empty half-row.
5. **Modal Viewport Adaptation**: Modal max-height using `94vh` instead of dynamic viewport height `calc(100dvh - 2.5rem)` on iPad Safari.

---

## 2. Screen-by-Screen Audit & Remediation

### 2.1 Flashcard Game (`src/pages/study/FlashcardGamePage.tsx`)

#### Issues
- **Header vs Card Width Mismatch**: `GameHeader` uses `max-w-2xl` (672px), while Flashcard container uses `max-w-md` (448px). On a 768px iPad, the progress bar and exit button extend ~112px wider on each side than the card itself.
- **Card Back Height**: Card height is locked at `h-80 sm:h-96` (384px). When vocabulary cards have multi-line Thai phonetic readings and extended English/Thai example sentences, text presses tightly against card borders.
- **Audio Touch Target**: Speaker icon button uses `p-2` (~36px), falling short of Apple's 44x44px touch target guidelines.

#### Remediation
```diff
- <div className="w-full max-w-md h-80 sm:h-96 perspective-1000 cursor-pointer" onClick={handleFlip}>
+ <div className="w-full max-w-xl sm:h-[420px] min-h-[360px] perspective-1000 cursor-pointer" onClick={handleFlip}>

- <button className="p-2 rounded-full text-primary hover:bg-primary-light transition-colors" ...>
+ <button className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-primary hover:bg-primary-light transition-colors" ...>

- <div className="w-full max-w-md mt-6">
+ <div className="w-full max-w-xl mt-6">
```

---

### 2.2 Multiple Choice Game (`src/pages/study/MultipleChoiceGamePage.tsx`)

#### Issues
- **Width Alignment**: Question card container uses `max-w-lg` (512px) vs `GameHeader` (`max-w-2xl` / 672px).
- **Single-Column Answer Stacking**: 4 choice buttons stretch across 512px in a single column (`space-y-3`). On a 768px tablet held in two hands, this requires excessive thumb travel.
- **Touch Targets**: Speaker button is `p-2` (~36px).

#### Remediation
```diff
- <div className="w-full max-w-lg space-y-6">
+ <div className="w-full max-w-xl space-y-6">

- <div className="space-y-3">
+ <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
```

---

### 2.3 Word Matching Game (`src/pages/study/MatchingGamePage.tsx`)

#### Issues
- **Long Word Wrapping**: While the 4-column layout (`sm:grid-cols-4`) provides optimal ~172x120px tile dimensions on iPad, English vocabulary words over 10 characters (e.g. *enthusiastic, responsibility*) can collide with tile borders without word-break rules.

#### Remediation
```diff
- <span className={`font-bold ${tile.type === 'en' ? 'font-outfit text-base sm:text-lg text-primary' : 'font-sarabun text-sm sm:text-base text-text-primary'}`}>
+ <span className={`font-bold break-words hyphens-auto px-1 ${tile.type === 'en' ? 'font-outfit text-sm sm:text-base md:text-lg text-primary' : 'font-sarabun text-xs sm:text-sm md:text-base text-text-primary'}`}>
```

---

### 2.4 Spelling Game (`src/pages/study/SpellingGamePage.tsx`)

#### Issues
- **Keyboard Viewport Shoving**: Fixed `justify-center` on `min-h-[calc(100vh-4rem)]` forces top card elements off-screen when the iPad on-screen keyboard (~350px) appears.
- **First-Letter Auto-Capitalization**: Missing `autoCapitalize="none"`, causing iPad Safari to capitalize the first letter (e.g. "Apple" instead of "apple").
- **Return Key Action**: Missing `enterKeyHint="send"` to enable keyboard-driven submission.
- **Speaker Button Sizing**: Large `w-24 h-24` (96px) speaker button consumes excessive vertical space when the keyboard is open.

#### Remediation
```diff
- <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-6 ...">
+ <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 pt-4 sm:pt-8 overflow-y-auto ...">

- <div className="w-24 h-24 rounded-full bg-primary ...">
+ <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary ...">

  <input
    type="text"
+   autoCapitalize="none"
+   autoCorrect="off"
+   spellCheck="false"
+   enterKeyHint="send"
    ...
  />
```

---

### 2.5 Fill-in-the-Blank Game (`src/pages/study/FillBlankGamePage.tsx`)

#### Issues
- **Vertical Spacing with Keyboard**: Sentence card padding (`p-6 sm:p-10`) combined with hints and submit button causes the submit button to touch the top edge of the virtual keyboard.
- **Virtual Keyboard Action Key**: Missing `enterKeyHint="send"` / `autoCapitalize="none"`.

#### Remediation
```diff
- <Card className="p-6 sm:p-10 space-y-8 shadow-card border-primary/20">
+ <Card className="p-5 sm:p-8 space-y-6 shadow-card border-primary/20">

  <input
    type="text"
+   autoCapitalize="none"
+   autoCorrect="off"
+   spellCheck="false"
+   enterKeyHint="send"
    ...
  />
```

---

### 2.6 Study Results Page (`src/pages/study/StudyResultsPage.tsx`)

#### Issues
- **Review List Headroom**: The missed words review box is capped at `max-h-36` (144px). On an iPad portrait screen with >250px unused vertical space, this triggers unnecessary scrolling when reviewing 4+ words.

#### Remediation
```diff
- <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-surface rounded-xl border border-border">
+ <div className="max-h-36 sm:max-h-60 overflow-y-auto space-y-1.5 p-2.5 bg-surface rounded-xl border border-border">
```

---

### 2.7 Set Detail Study Modes Bar (`src/pages/sets/SetDetailPage.tsx`)

#### Issues
- **Asymmetrical 5-Item Grid**: On iPad portrait (768px = `sm:` breakpoint), the 5 game mode buttons render in `grid-cols-2`. This leaves 2 buttons in Row 1, 2 buttons in Row 2, and 1 lonely button in Row 3.

#### Remediation
```diff
- <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3">
+ <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
```
*(With `md:grid-cols-3` or `sm:last:col-span-2 md:last:col-span-1`, the grid balances symmetrically across 768px tablet viewports).*

---

### 2.8 Vocab Import & Management Modals (`AddVocabModal.tsx`, `EditVocabModal.tsx`)

#### Issues
- **Dynamic Viewport Height**: Modals use `max-h-[94vh]`. On iPad Safari, floating toolbars can clip modal footers.
- **Draft List Touch Targets**: Checkboxes and delete buttons on AI/OCR draft rows use `p-1.5` (~32px).

#### Remediation
```diff
- <div className="w-full max-w-2xl my-auto max-h-[94vh] flex flex-col">
-   <Card className="p-4 sm:p-6 ... max-h-[94vh] ...">
+ <div className="w-full max-w-2xl my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col">
+   <Card className="p-4 sm:p-6 ... max-h-[calc(100dvh-2.5rem)] ...">

- <button className="p-1.5 rounded-lg text-text-muted hover:text-secondary ...">
+ <button className="p-2.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-text-muted hover:text-secondary ...">
```

---

## 3. Prioritized Implementation Plan

| Priority | Component / File | Changes | Risk / Impact |
| :--- | :--- | :--- | :--- |
| **P0** | `SpellingGamePage.tsx`<br>`FillBlankGamePage.tsx` | Add `autoCapitalize="none"`, `enterKeyHint="send"`, adjust vertical padding and container `justify-start sm:justify-center`. | Prevents keyboard clipping & eliminates auto-casing errors on iPad. |
| **P1** | `FlashcardGamePage.tsx`<br>`MultipleChoiceGamePage.tsx` | Unify container max-width to `max-w-xl`, expand flashcard height to `sm:h-[420px]`, 2-column multiple-choice option grid. | Fixes visual column misalignment & prevents text clipping. |
| **P1** | `SetDetailPage.tsx` | Update Study Modes grid with `md:grid-cols-3` / `sm:last:col-span-2`. | Symmetrical tablet dashboard layout. |
| **P2** | `MatchingGamePage.tsx`<br>`StudyResultsPage.tsx` | Add `break-words` on tiles; increase missed words box to `sm:max-h-60`. | Improves long-word typography & touch review. |
| **P2** | `AddVocabModal.tsx`<br>`EditVocabModal.tsx` | Adopt `calc(100dvh-2.5rem)` max-height & enlarge draft item tap areas. | Prevents iPad Safari toolbar footer overlap. |

---

## 4. Verification & QA Checklist

- [ ] **Flashcards**: Open on iPad portrait (768x1024px); confirm header progress bar and card width are aligned at `max-w-xl`. Verify 3D flip has no flicker.
- [ ] **Multiple Choice**: Confirm choices render in a 2x2 grid on iPad; check speaker icon tap target is >= 44x44px.
- [ ] **Spelling Game**: Focus text input; confirm iPad virtual keyboard does not push speaker button off-screen. Verify typing starts in lowercase and tapping Return submits answer.
- [ ] **Fill in the Blank**: Type missing word; verify Return key submits answer without clipping the sentence card.
- [ ] **Matching Game**: Play with long vocabulary words; verify no text overflows tile bounds.
- [ ] **Study Results**: Complete a quiz with 5+ missed words; verify review box displays comfortably without excessive scrolling.
- [ ] **Add Vocab Modal**: Open AI prompt and photo OCR tabs; verify modal footer buttons are visible above Safari toolbar.
- [ ] **Set Detail Page**: Confirm 5 study modes grid arranges symmetrically on 768px tablet viewport.
