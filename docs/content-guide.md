# FLEETVAN Content Writing Guide

## Product Voice & Tone

**Who We Are**: Confident, helpful, and human. We speak like a trusted colleague who gets the job done.

**Key Principles**:
- **Clear**: Simple words, short sentences
- **Confident**: We know what we're doing, and we show it
- **Helpful**: Always guiding, never condescending
- **Human**: Conversational, not corporate
- **Empowering**: Make drivers feel in control

### Tone Examples

| Situation | Right | Wrong |
|-----------|-------|-------|
| Instructing driver | "Go online when ready" | "The driver must go online" |
| Success | "Great work! Next stop →" | "Task completed successfully" |
| Error | "We need fuel first" | "Low fuel error 0x4001" |
| Encouragement | "You've delivered 5 today—nice!" | "Completion rate: 5/10" |

---

## Capitalization Rules

### Headings
- **Title Case**: Page titles, section headers
  - "New Delivery Waiting"
  - "Fleet Settings"
- **Sentence case**: Subtitles, descriptions
  - "Your daily earnings summary"
  - "Manage drivers and vans"

### Buttons & Actions (UPPERCASE for Primary)
- **Primary CTA**: All caps
  - "GO ONLINE" ✅
  - "LOOKS GOOD — LET'S GO" ✅
- **Secondary/Tertiary**: Sentence case
  - "Skip this" ✅
  - "Learn more" ✅

### Labels & UI Text
- **Sentence case** for most UI
  - "Distance to next stop"
  - "Total earnings today"
  - "Driver performance"
- **Overline text**: ALL CAPS for section dividers
  - "TODAY'S SUMMARY"
  - "VEHICLE STATUS"

### Common Terms (Always consistent)
- "Go Online" (not "Start" or "Go Live")
- "Stop" (for delivery location)
- "Van" (never "Vehicle" or "Truck")
- "Delivery" (not "Order" or "Shipment")
- "Route" (not "Trip" unless specifically referring to a journey)
- "Rating" (not "Review" or "Score")
- "Accept" (not "Confirm" for deliveries)
- "Earnings" (not "Income" or "Payout")

---

## Common Abbreviations & Acronyms

### Always spell out first use, then abbreviate
- "Real-time location services (RLS)" → later use "RLS"
- "Global Compliance Center (GCC)" → later use "GCC"

### Standard abbreviations
- km = kilometers (not "kms" or "K")
- SAR = Saudi Riyal (no punctuation)
- η = loading/unloading time (technical only)
- ETA = Estimated time of arrival
- GPS = Global Positioning System

### Van abbreviations (license plates)
- Show exactly as displayed: "1234 KSA"
- Never alter format

---

## Error Messages

### Pattern: [What's wrong] + [Why] + [How to fix]

**Good Examples**:
- "We need fuel first — you're at 15%. Fill up to continue." ✅
- "You're offline. Go online to accept deliveries." ✅
- "Stop doesn't exist. Check your delivery list." ✅

**Bad Examples**:
- "Error" ❌ (vague, technical)
- "Cannot process" ❌ (corporate)
- "Low fuel detected in vehicle unit" ❌ (jargon)

### Tone for Errors
- No blame ("You did something wrong")
- No technical codes
- Always actionable
- Briefly sympathetic if appropriate: "Oops! Try again in a moment."

---

## Success & Affirmation Language

### Short wins (after actions)
- "Submitted!" (checkmark, green)
- "Got it!" (confirmation)
- "Nice!" (celebration)

### Larger accomplishments
- "Great work! You've delivered 10 stops today."
- "Perfect — that's 5-star service!"
- "Amazing performance today. See you tomorrow!"

### Patterns
- Use exclamation marks sparingly (1-2 per screen)
- Lead with the positive: "You're doing great" before "but improve X"
- Celebrate milestones: "50 deliveries this month!"

---

## Loading States & Transitions

### During loading
- "Loading your route..."
- "Updating location..."
- "Syncing data..."
- NOT "Please wait" or "Processing..."

### Empty states
- "No deliveries yet — check back soon"
- "Your earnings will appear here after your first delivery"
- "All vehicles are idle" (neutral, not sad)

### Waiting for user action
- "Ready when you are" (empowering)
- "Next →" (action-oriented)
- "Continue →" (continuation)

---

## Microcopy Examples

### Driver Home Screen
- **Greeting**: "Ready when you are" (offline) / "You're on the road" (online)
- **Status badge**: "Online" / "In Route" / "On Break"
- **CTA**: "GO ONLINE" / "CONTINUE ROUTE"
- **Stats**: "Rating", "Acceptance", "Trips" (not "Review Score", "Accept Rate", "Completed")

### Pre-Trip Check
- **Section title**: "Before you go" (friendly, not "Vehicle Inspection")
- **Check items**: "Tyres", "Engine", "Load space" (specific, not "General inspection")
- **Instructions**: "Tick all checks to enable departure"
- **Success**: "LOOKS GOOD — LET'S GO"

### Stop Action
- **Title**: "Complete this stop" (not "Stop #5")
- **Options**: 
  - "Delivered ✓"
  - "Couldn't find address"
  - "Customer not home"
- **Confirmation**: "Stop marked complete"

### Company Dashboard
- **Main heading**: "Your fleet, in real time" (aspirational)
- **Live indicator**: "2 live" / "All idle"
- **Fleet board**: "Fleet board" (not "Vehicle Management System")
- **New delivery**: "New delivery note" (simple call-to-action)

---

## Accessibility & Inclusive Language

### Pronouns & Perspective
- Use "you" for addressing users
- Use "we" for the company sparingly
- Avoid gendered language: "driver" not "he/she"

### Clarity for Non-Native English Speakers
- Use simple words: "use" not "utilize"
- Short sentences: Max 12 words per thought
- Active voice: "You earned 50 SAR" not "50 SAR was earned by you"
- Define technical terms once

### Avoiding Jargon
- ❌ "Van utilization rate"
- ✅ "Deliveries per van"
- ❌ "Customer acquisition cost"
- ✅ "Cost per delivery"
- ❌ "KPI dashboard"
- ✅ "Performance dashboard"

---

## Currency & Numbers

### Money (Saudi Riyal)
- Format: "50 SAR" (no comma for thousands)
- Not "50 SR" or "৳50"
- Singular/plural: Always "SAR" (no "SARS")
- In buttons: "Earnings" not "1,250 SAR" (too cluttered)

### Large numbers
- 1,250 SAR ✅
- 1250 SAR ❌ (hard to read)
- 1.2K ✅ (for stats: "2K deliveries")
- "1 million" ✅ (spell out above 999K)

### Percentages & Ratings
- "4.8★" (star format for ratings)
- "98%" (for acceptance rate)
- "5/10 stops" (for progress)

### Time & Dates
- "Today" / "This week" / "This month" (never specific dates in UI)
- "2m ago" / "5h ago" (relative time)
- "9:30 AM" (time format, 12-hour + AM/PM)
- "Monday, Feb 28" (full date when needed)

---

## Map Annotations & Route Guidance

### Stop labels
- **Destination**: Green pin labeled "Stop 1" or "Final"
- **Current location**: Blue dot (no label)
- **Completed stops**: Gray pins with checkmark

### Directions
- "Turn right in 500 m"
- "Continue straight for 1.2 km"
- "You've arrived" (at destination)

### POI markers
- "Fuel station ahead"
- "Traffic on your route"
- "Speed camera in 800 m"

---

## Haptic Feedback Copy

When vibrations accompany actions, add brief labels:

- **Light tap**: "Navigation" (button presses)
- **Double tap**: "Success" (form submission, successful action)
- **Strong pulse**: "Alert" (critical action, high importance)
- **Warning buzz**: "Issue detected" (error, warning)

Example: "You just earned 50 SAR! [double haptic pulse]"

---

## Company-Side Language

### Fleet Managers
- More formal than driver side
- Still human and supportive
- Focus on data and insight

### Examples
- "2 vans in route" (instead of "fleet status: en route")
- "Issues: 1 vehicle" (clear and actionable)
- "Driver performance: 4.8 average rating"

### Common phrases
- "Live map" (not "real-time vehicle tracking")
- "Fleet board" (not "vehicle management system")
- "Alerts" (not "notifications" or "warnings")
- "Add driver" / "Add van" (simple, clear verbs)

---

## Quality Checklist

Before shipping any copy:

- [ ] Is it in active voice?
- [ ] Are all technical terms explained?
- [ ] Is the tone helpful, not corporate?
- [ ] Are instructions under 12 words?
- [ ] Are numbers formatted consistently?
- [ ] Does it follow capitalization rules?
- [ ] Is it short enough to fit on mobile?
- [ ] Would a non-native English speaker understand?
- [ ] Does it align with FLEETVAN voice?
- [ ] Have you removed all jargon?

---

## Examples of Good Copy

**Bad → Good Transitions**

| Before | After | Why |
|--------|-------|-----|
| "Operational status modified" | "You're online" | Direct, human |
| "Unable to process delivery note" | "We couldn't save your note. Check your connection." | Explanation + action |
| "Geolocation disabled" | "Turn on location to see your route" | Clear benefit |
| "Performance metrics" | "Your rating & acceptance" | Specific, understandable |
| "Pre-shift vehicle audit" | "Before you go" | Shorter, friendlier |

---

## Links & References

- [FLEETVAN Design System](./design-guide.md)
- [Screen-specific copy](../app/page.tsx)
- [Component library](../components/ui/)
