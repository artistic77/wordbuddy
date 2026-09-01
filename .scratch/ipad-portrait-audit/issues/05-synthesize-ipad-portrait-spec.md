# Issue 05: Synthesize iPad Portrait Diagnostic & Fix Specification

Type: task
Status: resolved
Blocked by: 01, 02, 03, 04

## Question

Synthesize the audit findings from tickets 01–04 into a unified Diagnostic & Fix Specification document (`docs/specs/ipad-portrait-audit-spec.md`) with prioritized action items, CSS fixes, and component improvements ready for engineering execution.

## Answer

The unified specification has been synthesized and published to:
📄 [docs/specs/ipad-portrait-audit-spec.md](file:///c:/Users/aanant02/Sandbox/Projects/word-buddy/docs/specs/ipad-portrait-audit-spec.md)

### Key Content in Specification:
1. **Executive Summary & Scope**: Analysis across 5 Study Games, Study Results, Set Detail, and Vocab Import Modals on 768px–834px iPad portrait viewports.
2. **Detailed Screen-by-Screen Remediation**: Exact code diffs covering Flashcard height, Multiple Choice 2-column grid, Matching word-break rules, Spelling/Fill-in-blank keyboard scroll padding & auto-capitalization flags, Results review container expansion, Set Detail grid symmetry, and Modal `dvh` units.
3. **Prioritized Action Plan**: P0 (Keyboard & Input fixes), P1 (Layout & Grid alignments), P2 (Typography & Modal heights).
4. **QA Verification Checklist**: iPad Safari-specific acceptance test cases.
