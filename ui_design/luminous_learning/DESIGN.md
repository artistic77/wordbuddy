---
name: Luminous Learning
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#464555'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4f44e2'
  primary: '#4d41df'
  on-primary: '#ffffff'
  primary-container: '#675df9'
  on-primary-container: '#fffbff'
  inverse-primary: '#c4c0ff'
  secondary: '#5b5e6a'
  on-secondary: '#ffffff'
  secondary-container: '#dddfee'
  on-secondary-container: '#5f626f'
  tertiary: '#914800'
  on-tertiary: '#ffffff'
  tertiary-container: '#b65c00'
  on-tertiary-container: '#fffbff'
  error: '#FF6B6B'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#3622ca'
  secondary-fixed: '#e0e2f0'
  secondary-fixed-dim: '#c3c6d4'
  on-secondary-fixed: '#181b26'
  on-secondary-fixed-variant: '#434652'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb785'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
  surface-base: '#FFFFFF'
  surface-subtle: '#F9FAFB'
  success: '#06D6A0'
  warning: '#FFD166'
  text-muted: '#6B7280'
  border-base: '#E5E7EB'
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  thai-display:
    fontFamily: Sarabun
    fontSize: 28px
    fontWeight: '500'
    lineHeight: '1.4'
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  page-margin-mb: 24px
  page-margin-dt: 48px
  gutter: 16px
  component-height: 48px
  max-width-modal: 600px
---

## Brand & Style

The design system embodies a **Modern Minimal** aesthetic tailored for an educational environment. It prioritizes extreme clarity, breathability, and a "professional yet friendly" vibe to reduce cognitive load during intensive study sessions. 

The visual narrative is built on the "Airy Learning" concept:
- **Minimalism:** Use of generous white space and a restricted color application to ensure the content (vocabulary) remains the focus.
- **Modernity:** A combination of geometric sans-serif typography and soft, purposeful roundedness.
- **Friendly Professionalism:** A balance between clinical cleanliness and warm, encouraging accents that guide the user through gamified milestones without being distracting.

## Colors

The palette is strictly governed by the **85/15 rule**: 85% of the interface remains neutral (White, Light Gray, and Deep Black) to ensure a clean, airy feel, while 15% utilizes vibrant brand colors for functional signaling and calls to action.

- **Primary Canvas:** `#FFFFFF` is the default surface for cards and modals, while `#F9FAFB` is used for page backgrounds to provide subtle contrast.
- **Typography:** `#111827` is used for all primary headings and body text to maximize legibility.
- **Accents:** The primary Purple (`#6C63FF`) is reserved for active states and primary buttons. Green, Yellow, and Red are strictly functional—used only for success feedback, streaks, and error states respectively.

## Typography

This design system uses a dual-font strategy to balance character with utility. 
- **Outfit** (Headings): Chosen for its geometric clarity and friendly, modern terminals. It is used for all "display" moments and titles.
- **Inter** (Body/UI): Used for all functional text, inputs, and long-form descriptions to ensure maximum readability across all screen sizes.
- **Sarabun**: Specifically integrated for Thai language content, ensuring that local translations maintain the same professional weight as the English counterparts.

Maintain a vertical rhythm by adhering to the defined line heights, ensuring no text feels cramped in the airy layout.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy that transitions into a centered **Fixed Grid** on larger viewports to maintain focus.

- **Desktop:** 12-column grid with a maximum content width. Use 48px margins for a spacious, high-end feel.
- **Mobile:** 4-column grid with 24px margins. Components should generally span the full width of the available safe area.
- **Rhythm:** Use an 8px base unit for all internal component spacing. The standard `component-height` of 48px ensures all interactive elements are touch-friendly and visually substantial.

## Elevation & Depth

To maintain a minimal and clean appearance, depth is conveyed through **Tonal Layers** and **Ambient Shadows** rather than heavy borders.

- **Level 1 (Cards):** Use a very soft, brand-tinted shadow: `0 4px 20px rgba(108, 99, 255, 0.08)`. This creates a subtle "lift" from the `#F9FAFB` background.
- **Level 2 (Modals/Overlays):** Use a high-depth neutral shadow: `0 8px 40px rgba(0, 0, 0, 0.12)`.
- **Interactions:** On hover, cards should slightly increase their elevation (y-offset) to provide tactile feedback without shifting the layout.

## Shapes

The shape language is defined by **Softly Rounded** corners, avoiding the austerity of sharp points.

- **Large Containers (Cards):** Fixed at 16px to create a friendly frame for content.
- **Interactive Elements (Buttons/Inputs):** Fixed at 12px to differentiate them from the primary container while maintaining the same aesthetic family.
- **Functional Bits (Badges/Chips):** Use a pill-shape (999px) to clearly distinguish metadata from interactive controls.

## Components

### Buttons
- **Primary:** Purple background, white text, 12px radius, 48px height. Subtle scale-up (1.02x) on hover.
- **Secondary:** Light Purple background (`#EEF0FF`), Purple text, no shadow.
- **Ghost:** Transparent background with a 1px Purple border for low-priority actions.

### Input Fields
- **Default:** 1px solid `#E5E7EB` border, 10px radius, 48px height.
- **Focus State:** 2px solid primary purple with a subtle glow (30% opacity purple shadow).

### Cards
- **Base:** White background, 16px radius, Level 1 shadow. 
- **Active/Selected:** Add a 2px solid primary purple border.

### Chips/Badges
- **Part of Speech:** Light background tinted with the functional color (e.g., light green for 'adj') with dark, high-contrast text.

### Interactions
- **Form Focus:** Smooth 150ms transition for border color changes.
- **Flashcards:** 500ms `ease-in-out` 3D Y-axis rotation.
- **Feedback:** Success elements should trigger a subtle 20px vertical bounce; errors should trigger a horizontal shake.