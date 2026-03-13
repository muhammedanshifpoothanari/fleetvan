# Quick Start Guide

## Installation

```bash
# Clone repository
git clone <repo-url>
cd fleet-van-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Key Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build
npm start               # Run production server

# Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run type-check      # TypeScript type checking
npm test                # Run tests

# Analytics
npm run analyze         # Bundle analysis
npm run audit           # Lighthouse audit
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── screens/           # 25 application screens
│   ├── ui/               # 60+ shadcn/ui components
│   └── theme-*           # Theme provider & toggle
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and context
└── docs/                 # Documentation
```

## Dark/Light Mode

The app supports both dark and light themes:
- Theme toggle button in header
- Preference persists across sessions
- CSS variables handle all theming
- Use `dark:` prefix in Tailwind for dark-only styles

## Key Design System Values

### Colors
- **Primary**: Black (#000000)
- **Accent**: Green (#06c167)
- **Neutral**: Gray scale (#f0f0f0 - #1a1a1a)
- **Status**: Red/Amber/Blue variants

### Typography
- **Headings**: Plus Jakarta Sans (font-semibold to font-black)
- **Body**: Inter (400-500 weight)
- **Code**: Monospace

### Spacing
Base unit: 8px
- `p-4` = 16px padding
- `gap-4` = 16px gap
- `mt-6` = 24px margin top

## Component Basics

### Button
```tsx
<button className="bg-ugreen text-black px-4 py-2 rounded-lg">
  Click me
</button>
```

### Card
```tsx
<div className="bg-card dark:bg-u300 rounded-2xl p-5 border border-border dark:border-white/[0.07]">
  Content here
</div>
```

### Form Input
```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  className="border border-border rounded-lg px-3 py-2 w-full"
/>
```

### Icon
```tsx
<Illicon name="back" size={24} color="text-foreground" />
```

## Common Patterns

### Dark/Light Mode
```tsx
// Dark background, light text
<div className="bg-background dark:bg-black text-foreground dark:text-white">
  Content
</div>
```

### Status Badge
```tsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 rounded-full bg-ugreen" />
  <span className="text-sm font-semibold">Online</span>
</div>
```

### Empty State
```tsx
<div className="text-center py-12">
  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
  <p className="font-black text-lg">Nothing here</p>
  <p className="text-muted-foreground text-sm mt-1">Create something new</p>
</div>
```

## Accessibility Checklist

When adding features:
- [ ] Add `aria-label` to icon-only buttons
- [ ] Associate labels with form inputs (`htmlFor`)
- [ ] Use semantic HTML (`<button>` not `<div onClick>`)
- [ ] Include `alt` text on images
- [ ] Test with keyboard navigation
- [ ] Verify 4.5:1 color contrast

## Common Issues

### Colors not applying
Make sure you use:
- `bg-background` / `dark:bg-black` (not `bg-white`)
- `text-foreground` / `dark:text-white` (not `text-black`)
- CSS variables defined in `globals.css`

### Theme not switching
- Ensure `ThemeProvider` wraps app
- Check browser DevTools for CSS variables
- Clear localStorage and reload

### Component not responsive
- Use Tailwind responsive prefixes: `md:`, `lg:`, `xl:`
- Test on mobile (< 640px), tablet (640-1024px), desktop (> 1024px)

## Next Steps

1. **Explore Components**: Check `/components/ui/` for all available components
2. **Read Design Guide**: `/docs/design-guide.md` for design system details
3. **Check Examples**: Look at existing screens in `/components/screens/`
4. **Deploy**: Follow `/docs/deployment-guide.md` when ready

## Documentation

- **Design System**: [design-guide.md](./design-guide.md)
- **Content Standards**: [content-guide.md](./content-guide.md)
- **Accessibility**: [accessibility-audit.md](./accessibility-audit.md)
- **QA & Testing**: [qa-checklist.md](./qa-checklist.md)
- **Deployment**: [deployment-guide.md](./deployment-guide.md)
- **Project Overview**: [PROJECT-SUMMARY.md](./PROJECT-SUMMARY.md)

## Support

For issues or questions:
1. Check relevant documentation
2. Review existing components for patterns
3. Check component stories in Storybook
4. Create issue with minimal reproduction
