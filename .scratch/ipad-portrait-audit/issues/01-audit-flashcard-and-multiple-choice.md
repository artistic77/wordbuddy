# Issue 01: Audit Flashcard and Multiple Choice on iPad Portrait

Type: research
Status: resolved

## Question

How do `FlashcardGamePage` and `MultipleChoiceGamePage` render on a 768px-wide iPad portrait viewport? Identify any layout height overflows, fixed margins, card height clipping, or sub-optimal touch targets, and determine the exact responsive fixes needed.

## Answer

### 1. FlashcardGamePage Audit Findings
* **Width Alignment Mismatch**: `GameHeader` is set to `max-w-2xl` (672px), while the Flashcard and Rating Buttons are restricted to `max-w-md` (448px). On a 768px iPad screen, the progress bar and exit header extend noticeably beyond the card, creating an uneven vertical column layout.
* **Card Height & Example Sentence Clipping**: The card height is locked at `h-80 sm:h-96` (320px - 384px). When cards contain longer English/Thai example sentences (`example_sentence_en` + `example_sentence_th`), the content gets cramped inside the card back on 768px tablet portrait.
* **Touch Target Sizing**:
  * Audio pronunciation button (`p-2` with `w-5 h-5`) measures ~36x36px, below Apple's 44x44px recommended touch target for tablets.
  * Rating buttons in 3-column grid (`Missed`, `Almost`, `Got it`) have `h-14` (56px), which is well-sized for tablet thumbs.
* **3D Flip Safari Compatibility**: Card styles use `-webkit-backface-visibility: hidden` in `index.css`, but adding `-webkit-perspective: 1000px` and `-webkit-transform-style: preserve-3d` ensures zero texture flicker during orientation transitions on Mobile Safari.

### 2. MultipleChoiceGamePage Audit Findings
* **Column Width Discrepancy**: Similar to Flashcards, `GameHeader` (`max-w-2xl` / 672px) is wider than the question container (`max-w-lg` / 512px).
* **Single Column vs 2-Column Option Grid**: The 4 Thai answer choices are stacked in a 1-column list (`space-y-3`). On a 768px iPad held with two hands, stretching short Thai words across 512px width makes thumbs travel further than needed. A 2x2 grid option or tighter `max-w-xl` centering provides better ergonomics.
* **Audio Pronunciation Button**: Speaker icon is `p-2` (~36px), should be bumped to minimum 44px touch area.
* **Vertical Fit**: Entire component height with question card and 4 choices is ~660px, easily fitting the iPad portrait 960px usable height (`calc(100vh - 4rem)`) without triggering window scroll.

### 3. Recommended Remediation
1. **Unify Max-Width**: Align both `GameHeader` and Game Card containers to `max-w-xl` (576px) or `max-w-2xl` (672px) for consistent edge alignment on tablets (`w-full max-w-xl mx-auto`).
2. **Dynamic Flashcard Height**: Use `min-h-[360px] sm:min-h-[400px] h-auto` or `sm:h-[420px]` on tablet viewports to provide breathing room for Thai phonetic subtitles and multi-line example sentences.
3. **Enlarge Touch Targets**: Update speaker button padding to `p-3` or `min-w-[44px] min-h-[44px] flex items-center justify-center`.
4. **Ergonomic Choice Layout**: Keep option buttons at `min-h-[60px]` with `font-sarabun text-lg` and consider `sm:grid sm:grid-cols-2 sm:gap-3.5` on iPad portrait for rapid two-thumb answering.
