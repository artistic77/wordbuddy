# Issue 04: Audit Vocab Import and Set Modals on iPad Portrait

Type: research
Status: resolved

## Question

How do `AddVocabModal` (AI Import, Batch Text, CSV, OCR tabs), `CreateSetModal`, `EditVocabModal`, and `SetDetailPage` render on iPad portrait (768px)? Are modal heights, tabs, tables, and action buttons clipped or scrolling properly without overlapping the header/footer?

## Answer

### 1. AddVocabModal Audit Findings
* **Modal Viewport & Sizing**:
  * Outer modal uses `max-w-2xl` (672px) with `max-h-[94vh]`. On a 768px iPad, the modal covers ~88% of screen width with balanced gutters.
  * Uses fixed header + scrollable body (`flex-1 overflow-y-auto`) + sticky action footer, ensuring the `Save Vocabulary Word` or `Add X Words to Set` button never scrolls out of reach.
* **Mobile Safari Dynamic Viewport (`dvh`) Compatibility**:
  * `max-h-[94vh]` does not account for Safari's dynamic URL bar on iPad. Switching to `max-h-[calc(100dvh-2rem)]` prevents the bottom action buttons from being partially obscured behind Safari's bottom toolbar.
* **Tab 2 (AI Prompt) & Tab 3 (Photo OCR) Draft Cards**:
  * Draft cards are scrollable and responsive.
  * Individual entry select checkboxes and delete buttons are `p-1.5` (~32px). Enlarging touch padding to `p-2.5` improves tablet tap accuracy.

### 2. CreateSetModal & EditVocabModal Audit Findings
* **CreateSetModal**:
  * Uses `max-w-lg` (512px) with `p-6 sm:p-8`. Compact form height (~450px) centers cleanly on 768px iPad without requiring scrolling.
  * Public/Private toggle switch has generous touch targets (`h-6 w-11`).
* **EditVocabModal**:
  * Uses `max-w-xl` (576px) with `overflow-y-auto`. All inputs (English, Thai, Phonetic, POS dropdown, Examples) fit comfortably on iPad portrait.

### 3. SetDetailPage Study Modes Bar Audit Findings
* **Asymmetrical 5-Item Grid on iPad (768px)**:
  * Uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`.
  * On iPad portrait (768px width = Tailwind `sm:` breakpoint), 5 study modes render in 2 columns:
    * Row 1: `[1. Flashcards] [2. Quiz Choices]`
    * Row 2: `[3. Matching] [4. Spelling]`
    * Row 3: `[5. Fill in the Blank] [Empty gap]`
  * The 5th item leaves an unbalanced empty half-row on iPad screens.

### 4. Recommended Remediation
1. **Balance Study Modes Grid on Tablets**: Update grid classes on `SetDetailPage` to `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5` or add `last:col-span-full sm:last:col-span-2 md:last:col-span-1` so the 5th button spans neatly across the row on 2-column tablet layouts.
2. **Use Dynamic Viewport Units for Modals**: Update modal max-height from `max-h-[94vh]` to `max-h-[calc(100dvh-2.5rem)]` to ensure compatibility with iPad Safari floating toolbars.
3. **Enhance Draft Row Touch Targets**: Increase touch padding on draft checkboxes, expand/collapse arrows, and delete icons in `AddVocabModal` to a minimum of 40px (`p-2.5`).
