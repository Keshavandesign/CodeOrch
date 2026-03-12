# CodeOrch Design System v1.0

## Overview
A modern, dark-themed design system built for task management and agent orchestration. Purpose-built for planning and building products in the AI era.

---

## 1. Color Palette

### Core Colors

#### Neutrals (Grays)
```
Neutral-0   (Background Primary)     #0A0E27  - Deepest black background
Neutral-1   (Background Secondary)   #1A1F3A  - Card/container backgrounds
Neutral-2   (Surface Tertiary)       #262D47  - Hover states, subtle surfaces
Neutral-3   (Border)                 #3A414F  - Borders, dividers
Neutral-4   (Text Secondary)         #8B92A9  - Secondary text, disabled
Neutral-5   (Text Primary)           #E4E6EB  - Primary text
Neutral-6   (Text Inverse)           #FFFFFF  - High contrast text
```

#### Primary Brand Colors
```
Primary-50   (Lightest)  #E8EFFE
Primary-100  #D1DDFD
Primary-200  #A3BBFB
Primary-300  #7599F9
Primary-400  #4677F7
Primary-500  #1F55FF  - PRIMARY BLUE
Primary-600  #1843CC
Primary-700  #123199
Primary-800  #0C2066
Primary-900  #061033
```

#### Semantic Colors
```
Success      #10B981  - Green (Completed, Positive actions)
Warning      #F59E0B  - Amber (In Progress, Caution)
Error        #EF4444  - Red (Blocked, Errors, Destructive)
Info         #3B82F6  - Light Blue (Information, Secondary action)
Critical     #DC2626  - Dark Red (Critical alerts)
```

#### Status Colors (Task Management Specific)
```
Status-Todo        #6366F1  - Indigo
Status-InProgress  #F59E0B  - Amber
Status-Completed   #10B981  - Emerald
Status-Blocked     #EF4444  - Red
Status-OnHold      #8B92A9  - Gray
```

#### Accent Colors (Agent-specific)
```
Agent-Active      #8B5CF6  - Purple (Active agents)
Agent-Idle        #6B7280  - Gray (Idle agents)
Agent-Error       #DC2626  - Red (Agent errors)
Task-Hot          #F97316  - Orange (Urgent tasks)
```

---

## 2. Typography

### Font Family
```
Primary Font:    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Monospace Font:  "SF Mono", "Monaco", "Menlo", monospace
```

### Font Weights
```
Light:     300
Regular:   400
Medium:    500
Semibold:  600
Bold:      700
```

### Type Scale

#### Display / Hero
```
Display XL
  Font Size:    48px / 3rem
  Line Height:  60px / 1.25
  Letter Spacing: -0.02em
  Weight:       700 (Bold)
  Usage:        Page titles, major headings
```

#### Heading Sizes
```
H1 (Heading 1)
  Font Size:    32px / 2rem
  Line Height:  40px / 1.25
  Weight:       700
  Letter Spacing: -0.01em

H2 (Heading 2)
  Font Size:    24px / 1.5rem
  Line Height:  32px / 1.33
  Weight:       700

H3 (Heading 3)
  Font Size:    20px / 1.25rem
  Line Height:  28px / 1.4
  Weight:       700

H4 (Heading 4)
  Font Size:    16px / 1rem
  Line Height:  24px / 1.5
  Weight:       600
```

#### Body Text
```
Body Large
  Font Size:    16px / 1rem
  Line Height:  24px / 1.5
  Weight:       400
  Usage:        Primary body text, descriptions

Body Regular
  Font Size:    14px / 0.875rem
  Line Height:  20px / 1.43
  Weight:       400
  Usage:        Secondary text, UI labels

Body Small
  Font Size:    12px / 0.75rem
  Line Height:  16px / 1.33
  Weight:       400
  Usage:        Helper text, timestamps, annotations
```

#### Caption
```
Caption
  Font Size:    11px / 0.6875rem
  Line Height:  14px / 1.27
  Weight:       500
  Usage:        Badge text, small labels
```

#### Code
```
Code Inline
  Font Size:    13px
  Font Family:  Monospace
  Weight:       400
  Letter Spacing: 0.5px

Code Block
  Font Size:    12px
  Font Family:  Monospace
  Weight:       400
  Line Height:  18px / 1.5
```

---

## 3. Spacing System

### Base Unit: 4px

### Spacing Scale
```
Spacing-0    0px      (Remove space)
Spacing-1    4px      (Minimal, tight)
Spacing-2    8px      (Tight spacing)
Spacing-3    12px     (Comfortable)
Spacing-4    16px     (Standard)
Spacing-5    20px     (Relaxed)
Spacing-6    24px     (Loose)
Spacing-7    28px     (Extra loose)
Spacing-8    32px     (Large)
Spacing-10   40px     (XL spacing)
Spacing-12   48px     (2XL spacing)
Spacing-16   64px     (3XL spacing)
```

### Common Spacing Patterns
```
Padding-Compact:     12px 16px      (Button padding)
Padding-Standard:    16px 20px      (Card padding)
Padding-Relaxed:     20px 24px      (Section padding)

Margin-Heading:      0 0 16px 0     (Heading bottom margin)
Margin-Paragraph:    0 0 12px 0     (Paragraph bottom margin)
Margin-Section:      0 0 32px 0     (Section bottom margin)

Gap-Tight:           8px            (Component gap)
Gap-Standard:        12px           (Default gap)
Gap-Relaxed:         16px           (Loose gap)
Gap-XL:              24px           (Extra loose gap)
```

---

## 4. Elevation & Shadows

### Shadow System (Depth-based)

#### Elevation-0 (No elevation, flat)
```
box-shadow: none
```

#### Elevation-1 (Subtle, on-hover)
```
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
```

#### Elevation-2 (Default card elevation)
```
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06)
```

#### Elevation-3 (Medium modal/dropdown)
```
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05)
```

#### Elevation-4 (Modal, prominent overlay)
```
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

#### Elevation-5 (Floating action, popover)
```
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Shadow Usage
```
Cards:              Elevation-2
Modals:             Elevation-4
Dropdowns:          Elevation-3
Tooltips:           Elevation-3
Floating buttons:   Elevation-3
Hover states:       Elevation-1 (increase from base)
```

---

## 5. Border System

### Border Radius

#### Sharp
```
Radius-0     0px     (No radius)
Radius-1     2px     (Slight radius, badges)
Radius-2     4px     (Inputs, buttons)
Radius-3     6px     (Cards, containers)
Radius-4     8px     (Modal, popover)
Radius-5     12px    (Large containers)
Radius-full  9999px  (Circles, pills)
```

### Border Width
```
Border-0     0px     (No border)
Border-1     1px     (Hairline)
Border-2     2px     (Standard)
Border-3     3px     (Thick)
```

### Border Styles
```
Default Border:       1px solid #3A414F (Neutral-3)
Focus Border:         2px solid #1F55FF (Primary-500)
Error Border:         2px solid #EF4444 (Error)
Success Border:       2px solid #10B981 (Success)
```

---

## 6. Component-Specific Tokens

### Buttons

#### Button Sizes
```
Size-Small
  Padding:     8px 12px
  Font Size:   12px / 0.75rem
  Height:      32px
  Border Radius: 4px

Size-Medium (Default)
  Padding:     10px 16px
  Font Size:   14px / 0.875rem
  Height:      40px
  Border Radius: 6px

Size-Large
  Padding:     12px 20px
  Font Size:   16px / 1rem
  Height:      48px
  Border Radius: 6px
```

#### Button States
```
Default:       Background: #1F55FF, Text: White
Hover:         Background: #1843CC, Shadow: Elevation-2
Active:        Background: #123199
Disabled:      Background: #3A414F, Text: #8B92A9, Cursor: not-allowed
Loading:       Background: #1F55FF, Opacity: 0.8, Spinner: visible
```

### Input Fields

#### Input Sizes
```
Height:        40px (default)
Padding:       10px 12px
Border:        1px solid #3A414F
Border Radius: 6px
Font Size:     14px
```

#### Input States
```
Default:       Border: #3A414F, Background: #1A1F3A
Hover:         Border: #5A6170, Background: #262D47
Focus:         Border: #1F55FF (2px), Background: #262D47, Shadow: 0 0 0 3px rgba(31, 85, 255, 0.1)
Filled:        Background: #262D47
Disabled:      Background: #0A0E27, Border: #2A3140, Text: #8B92A9
Error:         Border: #EF4444 (2px), Background: #1A1F3A
```

### Cards

#### Card Styles
```
Default Card
  Background:    #1A1F3A
  Border:        1px solid #3A414F
  Border Radius: 8px
  Padding:       16px 20px
  Shadow:        Elevation-2

Interactive Card (Hover)
  Shadow:        Elevation-3
  Border:        1px solid #5A6170
  Transform:     translateY(-2px)
  Transition:    all 200ms ease-out
```

### Status Badges

#### Badge Sizes
```
Small:   Font: 11px, Padding: 4px 8px, Height: 20px
Medium:  Font: 12px, Padding: 6px 12px, Height: 24px
Large:   Font: 14px, Padding: 8px 16px, Height: 32px
```

#### Badge Variants
```
Filled:     Background: Color, Text: White
Outline:    Border: 1px solid Color, Text: Color, Background: Transparent
Subtle:     Background: Color (20% opacity), Text: Color
Dot:        Just a 8px colored circle
```

---

## 7. Motion & Animation

### Transition Timing Functions
```
ease-out:       cubic-bezier(0.4, 0, 0.2, 1)     (Default, recommended)
ease-in-out:    cubic-bezier(0.4, 0, 0.6, 1)
ease-in:        cubic-bezier(0.4, 0, 1, 1)
```

### Duration Scale
```
Duration-75      75ms   (Micro interactions)
Duration-100     100ms  (Subtle animations)
Duration-150     150ms  (Default)
Duration-200     200ms  (Standard)
Duration-300     300ms  (Slower animations)
Duration-500     500ms  (Slow, deliberate)
```

### Common Animations
```
Fade In:         Opacity: 0 → 1, Duration: 150ms
Slide In (Up):   Transform: translateY(4px) → 0, Opacity: 0 → 1, Duration: 200ms
Scale In:        Transform: scale(0.95) → 1, Opacity: 0 → 1, Duration: 150ms
Bounce:          Transform: scale with overshoot, Duration: 300ms
Spin:            Transform: rotate(360deg), Duration: 1s, Infinite

Button Hover:    Shadow increase, 100ms ease-out
Focus Ring:      Outline: 2px solid Primary-500, Offset: 2px
```

---

## 8. Responsive Breakpoints

```
Mobile-Small   320px   (xs)
Mobile-Large   375px   (sm)
Tablet         768px   (md)
Desktop        1024px  (lg)
Desktop-XL     1440px  (xl)
Desktop-2XL    1920px  (2xl)
```

### Scaling Rules
```
xs (< 640px):      Single column, full width components, larger touch targets
sm (640px):        Single column, adjusted spacing
md (768px):        2-column layouts, grid adjustments
lg (1024px):       Multi-column, sidebar navigation
xl (1440px):       Full multi-column, wider max-widths
```

---

## 9. Accessibility

### Focus Indicators
```
Focus Ring:        2px solid #1F55FF (Primary-500)
Focus Ring Offset: 2px
Focus Ring Style:  Rounded, visible on all interactive elements
```

### Color Contrast Ratios (WCAG AA minimum)
```
Text on Background:     4.5:1 (AAA: 7:1)
Large Text:            3:1 (AAA: 4.5:1)
UI Components:         3:1 (borders, icons)
```

### Disabled States
```
Opacity:       60%
Cursor:        not-allowed
Pointer Events: none
Color:         Neutral-4 (#8B92A9)
```

### Motion
```
prefers-reduced-motion:  Disable animations, use instant transitions
Media Query:             @media (prefers-reduced-motion: reduce)
```

---

## 10. Component States

### Universal Component States
```
Normal:          Default, uninteracted state
Hover:           Mouse over, interactive feedback
Focus:           Keyboard/screen reader focus
Active:          Being clicked/selected
Disabled:        Cannot interact, visual indication
Loading:         Async operation in progress
Error:           Validation or system error
Success:         Successful operation
Warning:         Caution, attention needed
Info:            Informational state
```

### Task-Specific States
```
Assigned-to-Me:     Border: Primary-500, Highlight
Assigned-to-Other:  Border: Neutral-3, Normal
Overdue:            Background tint: Error (10%), Text: Error
In-Progress:        Border: Warning color, Glow
Blocked:            Strikethrough text, Opacity: 0.6, Icon: Block
Completed:          Strikethrough, Opacity: 0.5, Checkmark: Success
```

---

## 11. CSS Custom Properties (Variables)

### Usage in CSS
```css
:root {
  /* Colors */
  --color-primary: #1F55FF;
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;

  /* Neutrals */
  --color-neutral-900: #0A0E27;
  --color-neutral-800: #1A1F3A;
  --color-text-primary: #E4E6EB;
  --color-text-secondary: #8B92A9;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-4: 16px;
  --spacing-6: 24px;

  /* Typography */
  --font-family-base: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-family-mono: "SF Mono", "Monaco", "Menlo", monospace;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Transitions */
  --transition-base: all 150ms ease-out;
  --transition-fast: all 100ms ease-out;
}
```

---

## 12. Design System Files Structure

```
design-system/
├── tokens/
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   ├── shadows.json
│   └── animations.json
├── components/
│   ├── buttons/
│   │   ├── button.css
│   │   └── button-variants.css
│   ├── inputs/
│   ├── cards/
│   ├── badges/
│   ├── modals/
│   └── navigation/
├── styles/
│   ├── variables.css
│   ├── base.css
│   └── utilities.css
└── documentation/
    └── component-guidelines.md
```

---

## 13. Usage Guidelines

### When to Use Which Colors
```
Primary (#1F55FF):    Main CTA, active states, important elements
Success (#10B981):    Completed tasks, confirmations, positive actions
Warning (#F59E0B):    In-progress, cautions, pending actions
Error (#EF4444):      Blocked tasks, errors, destructive actions
Neutral (#3A414F):    Borders, dividers, disabled states
```

### Spacing Rules
- Default spacing between elements: `spacing-4` (16px)
- Heading/section spacing: `spacing-6` (24px)
- Tight components: `spacing-2` (8px)
- Card internal padding: `spacing-4` (16px)
- Page padding: `spacing-6` to `spacing-8` (24-32px)

### Shadow Usage
- Cards: `shadow-md`
- On-hover cards: `shadow-lg`
- Modals: `shadow-lg`
- Dropdowns: `shadow-md`
- Floating buttons: `shadow-lg`

### Typography Usage
- Page titles: Display XL, Bold
- Sections: H2, Bold
- Subsections: H3, Bold
- Labels: Body Small, Medium
- Help text: Body Small, secondary color
- Body copy: Body Regular

---

## 14. Implementation Checklist

- [ ] Create CSS custom properties file with all tokens
- [ ] Define reusable component classes (.btn, .card, .input, etc.)
- [ ] Create utility classes for spacing, colors, typography
- [ ] Set up responsive breakpoint system
- [ ] Define focus states for accessibility
- [ ] Create button component library
- [ ] Create form component library
- [ ] Create modal/dialog component library
- [ ] Document all component variants
- [ ] Create Figma design file matching tokens
- [ ] Update frontend with design system classes
- [ ] Create style guide documentation

---

## 15. Version History

### v1.0 (2026-03-12)
- Initial design system definition
- Complete color palette
- Typography scale
- Spacing system
- Component tokens
- Animation guidelines
- Accessibility standards

---

## Notes for Implementation
1. All colors should be defined as CSS variables for easy theming
2. Use spacing scale consistently across all components
3. Always include focus states for accessibility
4. Test color contrast with WCAG guidelines
5. Use motion sparingly and respect `prefers-reduced-motion`
6. Build components in isolation, test on multiple screen sizes
