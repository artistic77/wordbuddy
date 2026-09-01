# Issue 03: Audit Spelling and Fill-in-Blank Virtual Keyboard Behavior on iPad Portrait

Type: research
Status: resolved

## Question

How do `SpellingGamePage` and `FillBlankGamePage` behave when text inputs or letter slots receive focus on iPad portrait? Does the virtual keyboard push or obscure the question/hints/submit buttons, and what responsive viewport/scrolling optimizations are needed?

## Answer

### 1. SpellingGamePage Audit Findings
* **Virtual Keyboard Clipping under `justify-center`**:
  * Outer wrapper uses `min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center`.
  * Total page content height is ~580px (GameHeader + 96px Speaker Button + Thai Hints Box + Input + Submit Button).
  * When the iPad portrait keyboard opens (~350px tall), the vertical centering causes the top of the card (Header and Speaker icon) to be shoved partially off-screen, requiring user scroll.
* **Input Attributes & Auto-Capitalization**:
  * `autoCapitalize="none"` is missing. iPad Safari defaults to capitalizing the first character of text inputs, which can confuse users typing lowercase vocabulary words.
  * Missing `enterKeyHint="send"` / `enterKeyHint="done"`, which would customize the virtual keyboard's blue action key to trigger submission directly.
* **Speaker Icon Sizing**:
  * The speaker button is `w-24 h-24` (96px). On iPad portrait with an active keyboard, reducing to `w-20 h-20` (80px) saves valuable vertical space without losing touch ergonomics.

### 2. FillBlankGamePage Audit Findings
* **Masked Sentence Card Height & Keyboard Overlap**:
  * The question card contains Hint badges, a masked sentence box (`p-6`), Thai translation toggle, input field, and a 56px Submit button.
  * Total combined height is ~560px. On iPad portrait with a 350px virtual keyboard, the "Check Answer" button sits close to the bottom keyboard edge.
* **Form Submission Ergonomics**:
  * Adding `enterKeyHint="go"` or `enterKeyHint="send"` enables one-touch submission from the iPad on-screen keyboard without requiring the user to reach up and tap the on-screen "Check Answer" button.
  * Input is already wrapped in a `<form onSubmit={handleSubmit}>`, which supports native keyboard return events cleanly.

### 3. Recommended Remediation
1. **Container Alignment**: Switch study game wrappers from rigid `justify-center` to `justify-start sm:justify-center pt-2 sm:pt-4` with smooth scroll behavior so the card stays pinned in view when the keyboard opens.
2. **Keyboard Optimization Attributes**: Add `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck="false"`, and `enterKeyHint="send"` on all text inputs in `SpellingGamePage` and `FillBlankGamePage`.
3. **Compact Vertical Rhythm**:
   * In `SpellingGamePage`: Tune speaker button to `w-20 h-20 sm:w-24 sm:h-24` and reduce vertical margins (`space-y-4 sm:space-y-6`).
   * In `FillBlankGamePage`: Tighten padding on masked sentence container to `p-4 sm:p-5` so the sentence and submit button remain visible simultaneously above the iPad keyboard.
