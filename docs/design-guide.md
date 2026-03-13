# FLEETVAN Design System Guide

## Overview
FLEETVAN is a premium delivery fleet management app with Uber-inspired design patterns. The design system supports both light and dark modes with a sophisticated green accent color (#06C167) derived from Uber Eats delivery branding.

---

## Foundation

### Color System

#### Dark Mode (Default)
- **Background**: Pure black (#000000)
- **Surface**: Near-black (#0a0a0a)
- **Card**: Dark gray (#141414)
- **Text Primary**: White (#FFFFFF)
- **Text Secondary**: Light gray (#ABABAB)
- **Muted**: Medium gray (#3d3d3d)
- **Accent**: Uber Green (#06C167)
- **Border**: Subtle white (#262626)

#### Light Mode
- **Background**: Pure white (#FFFFFF)
- **Surface**: Off-white (#F8F8F8)
- **Card**: White (#FFFFFF)
- **Text Primary**: Dark gray (#000000)
- **Text Secondary**: Medium gray (#666666)
- **Muted**: Light gray (#E8E8E8)
- **Accent**: Uber Green (#06C167)
- **Border**: Light gray (#D0D0D0)

### Typography

#### Typefaces
- **Sans Serif**: Inter (default), Plus Jakarta Sans (alternative)
- **Mono**: Geist Mono

#### Scale
- **Display Large**: 38px / 1.08 line-height (Hero titles)
- **Display**: 24px / 1.2 line-height (Section headers)
- **Title**: 20px / 1.3 line-height (Page titles)
- **Subtitle**: 17px / 1.4 line-height (Secondary headers)
- **Body**: 14px / 1.5 line-height (Default text)
- **Label**: 13px / 1.4 line-height (Form labels)
- **Caption**: 11px / 1.4 line-height (Helper text, timestamps)
- **Overline**: 10px / 1.4 line-height (Section dividers)

#### Weights
- **Black**: 900 (Headlines, CTAs)
- **Bold**: 700 (Emphasis, labels)
- **Semibold**: 600 (Secondary headers)
- **Medium**: 500 (Slightly emphasized)
- **Regular**: 400 (Body text)

### Spacing (8px Grid)
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

### Border Radius
- **None**: 0px
- **Small**: 8px (input focus states, small controls)
- **Medium**: 12px (component borders)
- **Large**: 16px (cards, modals)
- **XL**: 20px (buttons, elevated cards)
- **Full**: 9999px (pills, circular elements)

---

## Components

### Button Variants

#### Primary (Filled)
- Background: Accent color (#06C167)
- Text: Black (#000000)
- State: Active scale(0.97), brightness(0.9)

#### Secondary (Outline)
- Background: Transparent
- Border: 1px border color
- State: Active bg-muted, scale(0.97)

#### Ghost
- Background: Transparent
- Text: Foreground
- State: Active bg-muted/80

#### Sizes
- **Small**: 32px height, 12px padding
- **Medium**: 44px height, 16px padding
- **Large**: 56px height, 24px padding

### Input Fields
- Background: Input surface color
- Border: 1px subtle border
- Focus: 2px accent border
- Padding: 12px 16px
- Border radius: 12px
- Placeholder: Muted foreground

### Cards
- Background: Card color
- Border: 1px subtle border (optional)
- Border radius: 16px
- Padding: 16px
- Shadow: None (flat design) or subtle elevation

### Badges & Status Indicators
- **Online**: Green (#06C167) with pulse animation
- **In Route**: Blue (#3B82F6)
- **On Break**: Amber (#F59F00)
- **Offline**: Gray (#6B7280)
- **Issue**: Red (#E03131)
- Size: 8px diameter (with optional label)

---

## Layout Patterns

### Screen Structure
All screens follow this hierarchy:
1. **Header** (Fixed, z-20)
   - Back button (optional)
   - Title + subtitle
   - Action icon (optional)
   - Spacing: 12px top, 16px sides, 4px bottom

2. **Content** (Scrollable)
   - Primary content area
   - Sections separated by 24px
   - Padding: 16px sides

3. **Bottom Sheet** (Fixed, z-20)
   - Handle indicator (8px height)
   - Secondary CTA buttons
   - Bottom padding: 16px (safe area)

### Card Layouts

#### Data Row
- Icon (24px) → Label → Value
- Height: 48px
- Padding: 12px 16px
- Hover: Subtle bg highlight

#### Stat Card
- Label (overline) → Value (display) → Subtitle
- Padding: 16px
- Border radius: 20px
- Optional icon in corner

#### List Item
- Avatar/Icon → Title → Subtitle → Action
- Height: 56px
- Padding: 12px 16px
- Divider between items

---

## Interaction Patterns

### Motion
- **Enter**: Quintic EaseOut, 500ms (drilling forward)
- **Exit**: Quintic EaseIn, 400ms (drilling back)
- **Dismiss**: Quadratic EaseIn, 200ms (closing modal)
- **Fade**: Linear, 200ms (color/opacity changes)

### Feedback

#### Visual
- Button press: scale(0.97)
- Loading: Spinning icon or skeleton placeholder
- Success: Green badge with checkmark
- Error: Red border/badge

#### Haptics
- **Light**: Subtle feedback (navigation)
- **Tick**: Brief pulse (form input)
- **Medium**: Moderate feedback (action confirmed)
- **Heavy**: Strong feedback (critical action)

#### Validation
- Real-time on blur
- Error message below field
- Red error color (#E03131)
- Helper text max-width: 300px

---

## Content Guidelines

### Capitalization
- **Headings**: Title Case for main headers, Sentence case for secondary
- **Labels**: Sentence case
- **Buttons**: UPPERCASE (for primary actions), Sentence case (for secondary)
- **Error messages**: Sentence case

### Writing Tone
- **Voice**: Confident, helpful, human
- **Avoid**: Jargon, passive voice
- **Prefer**: Active voice, clear instructions
- **Examples**:
  - ✅ "Go online to start accepting deliveries"
  - ❌ "Driver status can be changed by going online"

### Common Terms
- "Go Online" (not "Start" or "Enable")
- "Stop" (for delivery stop, not "location" or "address")
- "Van" (never "vehicle" or "truck")
- "Delivery" (not "order" or "shipment")
- "Rating" (not "review" or "score")

---

## Accessibility

### WCAG AA Compliance
- Minimum contrast ratio: 4.5:1 for text, 3:1 for graphics
- Focus indicators: Always visible
- Touch targets: Minimum 44x44px
- Text sizing: Support up to 200% zoom
- Color alone shouldn't convey information

### Semantic HTML
- Use proper heading hierarchy (H1, H2, H3)
- `<button>` for actions, `<a>` for navigation
- `<label>` for form inputs
- ARIA attributes for dynamic content

### Screen Readers
- Alt text for all images (decorative = alt="")
- Form labels associated with inputs
- Live regions for notifications
- Announce loading/success states

---

## Dark/Light Mode Implementation

### CSS Variables
All colors use CSS custom properties that switch based on theme:
```css
:root {
  --background: #000000;
  --foreground: #ffffff;
  --accent: #06c167;
}

.light {
  --background: #ffffff;
  --foreground: #000000;
  --accent: #06c167;
}
```

### Tailwind Classes
- Use `dark:` prefix for dark-mode-specific styles
- Prefer semantic tokens over hardcoded colors
- Example: `bg-background` instead of `bg-black`

### Theme Transition
- Smooth 300ms transition on theme switch
- No flash/flicker on page load
- Respects system preference (prefers-color-scheme)

---

## Component Specifications

### Status Indicator
- **Sizes**: Small (8px), Medium (12px), Large (16px)
- **States**: Online, Offline, In Route, On Break, Issue, Pending
- **Animation**: Pulse for active states
- **Usage**: Driver status, van status, stop status, order status

### Stat Card
- **Variants**: Default, Success, Warning, Error, Info
- **Layout**: Label (overline) → Value (large) → Subtitle (optional)
- **Max width**: 280px (3 per row on 360px width)
- **Icon**: Optional, top-right corner

### Action Button
- **Variants**: Filled, Outline, Ghost
- **Sizes**: Small (32px), Medium (44px), Large (56px)
- **Loading state**: Spinner icon
- **Disabled**: Opacity 50%, cursor-not-allowed

### Data Row
- **Height**: 48px minimum
- **Divider**: Subtle border (optional)
- **Icon**: 24px, left-aligned
- **Value**: Bold, right-aligned
- **Action**: Icon button, 44px touch target

---

## Map-Specific Components

### Vehicle Markers
- Icon: Delivery van with direction indicator
- Status color: Green (active), Gray (idle), Red (issue)
- Size: 32px × 32px
- Animation: Smooth following motion

### Route Line
- Color: Accent green (#06C167)
- Weight: 3px on map, 2px on minimap
- Opacity: 0.8
- Animation: Animated dash pattern (optional)

### POI Markers
- Shape: Pin (35px height)
- Colors: Green (destination), Blue (waypoint), Red (issue)
- Label: Stop number or icon
- Shadow: Subtle drop shadow

### Access Points
- Shape: Circular badge
- Icon: Person or door icon
- Size: 28px diameter
- Color: Muted until active, then accent

### Ring Wipe Animation
- Origin: Vehicle location
- Color: Accent green with opacity fade
- Duration: 2s, repeating
- Size: Expands to ~100px radius

---

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px (primary target)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Mobile-First Approach
- Base styles for mobile
- `sm:`, `md:`, `lg:` for larger screens
- Full-width buttons and inputs on mobile
- Stack layouts vertically

---

## Quality Checklist

Before launching any screen:
- [ ] Dark/light mode works smoothly
- [ ] All text meets WCAG AA contrast
- [ ] Touch targets are 44×44px minimum
- [ ] No hardcoded colors (use tokens)
- [ ] Loading and error states designed
- [ ] Haptic feedback appropriate
- [ ] Animation smooth (60fps)
- [ ] Copy is consistent with guidelines
- [ ] Spacing follows 8px grid
- [ ] Icons are 24px or 28px (never odd sizes)
