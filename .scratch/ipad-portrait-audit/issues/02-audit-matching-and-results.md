# Issue 02: Audit Matching and Results Page on iPad Portrait

Type: research
Status: resolved

## Question

How do `MatchingGamePage` (grid of matching cards) and `StudyResultsPage` render on iPad portrait (768px)? Are the grid column layouts, card sizes, and result summary cards well-proportioned or do cards get crushed/clipped?

## Answer

### 1. MatchingGamePage Audit Findings
* **Grid Layout Performance on iPad (768px)**:
  * Uses `grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4` for 16 tiles (8 pairs).
  * On a 768px portrait tablet, 4 columns yield ~172px width and `min-h-[120px]` per tile.
  * Total board height is ~666px, which fits inside the 960px usable iPad portrait viewport without causing whole-page vertical scroll.
* **Typography & Long Word Wrapping**:
  * English words use `font-outfit text-base sm:text-lg`. For long vocabulary words (>10 characters e.g. "enthusiastic", "responsibility"), the text can tightly press tile padding if `break-words` or dynamic text scaling isn't explicitly set.
* **Touch Responsiveness**:
  * 172x120px tile dimensions provide generous touch targets well above the 44x44px threshold.
  * Rapid tap feedback (`active:scale-95`, `transition-all`, vibration/color cues) works smoothly on iPad touch screens.

### 2. StudyResultsPage Audit Findings
* **Vertical Fit & Layout**:
  * Outer card is constrained to `max-w-xl` (576px), centered on the 768px screen with balanced ~96px left/right margins.
  * The Score Circle (144px diameter) and 3-column metric cards (`Got it`, `Almost`, `Missed`) display cleanly in one cohesive block.
* **Review List Scrolling**:
  * The missed word review container is constrained to `max-h-36` (144px). On iPad portrait where there is generous vertical headroom (>250px unused), `max-h-36` causes unnecessary inner scrolling when reviewing 5+ missed words.
* **Confetti Animation**:
  * Canvas confetti triggers at `origin: { x: 0 }` and `{ x: 1 }` with 1.5s duration; renders smoothly on Mobile Safari WebKit.

### 3. Recommended Remediation
1. **Long Word Protection on Matching Tiles**: Add `break-words hyphens-auto` and fine-tune font sizing to `text-sm sm:text-base md:text-lg` so long English and Thai terms never clip tile borders.
2. **Expand Review Box on Results Page**: Increase missed words review container to `max-h-48 sm:max-h-64` on tablet viewports to leverage available vertical space and reduce touch scrolling.
3. **Preserve 4-Column Matching Grid**: Confirm `sm:grid-cols-4` as the optimal tablet layout (avoid 2-column on iPad which stretches tiles excessively).
