# Map: iPad Portrait UI Diagnostic & Fix Spec

## Destination

Deliver a comprehensive Diagnostic & Fix Specification document covering all 5 Study Game modes (Flashcards, Multiple Choice, Matching, Spelling, Fill-in-the-Blank, plus Study Results) and Vocab Import / Set Management screens on standard iPad portrait orientation (768px - 834px viewport), identifying layout overflows, unneeded scrolling, modal clipping, touch target sizing, and virtual keyboard obstruction, complete with concrete CSS/Tailwind remediation recommendations.

## Notes

- **Target Viewport**: Standard iPad Portrait (~768x1024px to 834x1194px).
- **Target Screens**:
  1. Study Games: `FlashcardGamePage`, `MultipleChoiceGamePage`, `MatchingGamePage`, `SpellingGamePage`, `FillBlankGamePage`, `StudyResultsPage`
  2. Vocab Import & Management: `AddVocabModal` (all tabs), `CreateSetModal`, `EditVocabModal`, `SetDetailPage`
- **Key Inspection Criteria**:
  - Full-screen fit (avoiding unnecessary page scrolls on fixed-height game rounds)
  - Modal scrollability and header/footer clipping
  - Virtual keyboard handling on text input focus
  - Touch target accessibility (minimum 44x44px buttons/cards)

## Decisions so far

- [01-audit-flashcard-and-multiple-choice](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/.scratch/ipad-portrait-audit/issues/01-audit-flashcard-and-multiple-choice.md): Unify max-width (`max-w-xl`), increase flashcard height to `sm:h-[420px]`, enlarge audio touch targets to 44px, and offer 2-column option layout on tablet.
- [02-audit-matching-and-results](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/.scratch/ipad-portrait-audit/issues/02-audit-matching-and-results.md): Keep `sm:grid-cols-4` matching grid layout (~172x120px tiles), add `break-words` for long vocabulary strings, and expand results review box to `sm:max-h-64`.
- [03-audit-spelling-and-fill-blank-keyboard](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/.scratch/ipad-portrait-audit/issues/03-audit-spelling-and-fill-blank-keyboard.md): Add `autoCapitalize="none"`, `enterKeyHint="send"`, switch from rigid `justify-center` to `pt-4` scroll-padded layout, and optimize speaker button size to prevent iPad keyboard obstruction.
- [04-audit-vocab-import-and-set-modals](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/.scratch/ipad-portrait-audit/issues/04-audit-vocab-import-and-set-modals.md): Balance 5-mode study grid with `md:grid-cols-3` / `sm:last:col-span-2`, switch modal max-height to dynamic `dvh` units (`max-h-[calc(100dvh-2.5rem)]`), and enlarge draft action touch targets.
- [05-synthesize-ipad-portrait-spec](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/.scratch/ipad-portrait-audit/issues/05-synthesize-ipad-portrait-spec.md): Synthesized all audit findings into `docs/specs/ipad-portrait-audit-spec.md` with complete code diffs, priority matrix, and QA checklist.

## Not yet specified

- **Safari safe-area insets**: Handling iPad home indicator bar and browser toolbar dynamics.
- **Gesture conflicts**: Ensuring swipe / drag interactions on matching or flashcards do not conflict with iPad Safari gestures.

## Out of scope

- Boss Battle Arena (`BossBattlePage`) and Sports Arcade Suite (`SportsArcadeModal`) (deferred by user scoping decision).
- Landscape orientation UI optimizations (scope is portrait only).
- Direct code refactoring and committing fixes (scope is strictly diagnostic analysis and specification).
