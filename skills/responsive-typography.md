# Responsive Typography Skill

## Description
Implements fluid, responsive typography that scales smoothly across all screen sizes using modern CSS techniques and Tailwind CSS utilities.

## When to Use
- Headings are too large on mobile (e.g., text-5xl on small screens)
- Text doesn't scale properly across devices
- Need consistent typography hierarchy
- Poor readability on mobile or desktop

## Typography Scale Strategy

### Mobile-First Responsive Classes
Replace fixed text sizes with responsive variants:

| Element | Mobile | Tablet | Desktop | Tailwind Classes |
|---------|--------|--------|---------|------------------|
| H1 (Hero) | 32px | 40px | 48px | `text-3xl md:text-4xl lg:text-5xl` |
| H2 (Section) | 24px | 28px | 36px | `text-2xl md:text-3xl lg:text-4xl` |
| H3 (Subsection) | 20px | 24px | 30px | `text-xl md:text-2xl lg:text-3xl` |
| H4 (Card Title) | 18px | 20px | 24px | `text-lg md:text-xl lg:text-2xl` |
| Body Large | 16px | 18px | 20px | `text-base md:text-lg lg:text-xl` |
| Body | 14px | 16px | 16px | `text-sm md:text-base` |
| Small | 12px | 14px | 14px | `text-xs md:text-sm` |

### Fluid Typography with CSS Clamp
For more granular control, use custom CSS:

```css
/* Add to globals.css */
.text-fluid-xl {
  font-size: clamp(1.5rem, 4vw + 0.5rem, 3rem);
  /* Min: 24px, scales with viewport, Max: 48px */
}

.text-fluid-lg {
  font-size: clamp(1.25rem, 3vw + 0.5rem, 2.25rem);
  /* Min: 20px, scales with viewport, Max: 36px */
}

.text-fluid-base {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem);
  /* Min: 16px, scales with viewport, Max: 24px */
}
```

Usage:
```tsx
<h1 className="text-fluid-xl font-bold">Responsive Heading</h1>
```

## Implementation Pattern

### Before (Desktop-First):
```tsx
<div className="p-8">
  <h1 className="text-5xl font-bold mb-6">
    Dashboard
  </h1>
  <p className="text-xl text-muted-foreground">
    Welcome back!
  </p>
</div>
```

### After (Mobile-First):
```tsx
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
    Dashboard
  </h1>
  <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
    Welcome back!
  </p>
</div>
```

## Line Height Adjustments
Adjust line heights for readability:

```tsx
// Headings - tighter line height
<h1 className="text-3xl md:text-5xl leading-tight md:leading-tight">
  Title
</h1>

// Body text - comfortable reading
<p className="text-sm md:text-base leading-relaxed">
  Body content with good readability
</p>
```

## Responsive Font Weights
Consider adjusting font weights on mobile:

```tsx
// Lighter weight on mobile for better rendering
<h1 className="font-semibold md:font-bold">
  Heading
</h1>
```

## Special Cases

### Time/Date Displays
```tsx
// Large time display
<div className="text-4xl md:text-5xl lg:text-6xl font-bold tabular-nums">
  {time}
</div>
```

### Stats/Numbers
```tsx
// Numeric displays
<div className="text-2xl md:text-3xl lg:text-4xl font-bold tabular-nums">
  {stat}
</div>
```

### Buttons
```tsx
// Button text sizing
<Button className="text-sm md:text-base">
  Click Me
</Button>
```

## Typography Component Pattern
Create reusable typography components:

```tsx
// components/ui/typography.tsx
export function TypographyH1({ children, className }: Props) {
  return (
    <h1 className={cn(
      "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
      className
    )}>
      {children}
    </h1>
  )
}

export function TypographyH2({ children, className }: Props) {
  return (
    <h2 className={cn(
      "text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight",
      className
    )}>
      {children}
    </h2>
  )
}

// Usage
<TypographyH1>My Heading</TypographyH1>
```

## Best Practices
- Start with mobile sizes, scale up for larger screens
- Use `clamp()` for smooth scaling between breakpoints
- Maintain consistent hierarchy across screen sizes
- Test readability on real devices
- Use `tabular-nums` for numeric displays
- Adjust letter-spacing for very large text

## Accessibility
- Maintain 4.5:1 contrast ratio for body text
- Ensure minimum 16px font size for body text
- Use relative units (rem, em) over pixels when possible
- Don't rely solely on size to convey hierarchy

## Testing Checklist
- [ ] Text is readable on 375px width (iPhone SE)
- [ ] No text overflow or wrapping issues
- [ ] Consistent hierarchy on all screen sizes
- [ ] Comfortable reading on tablets (768px)
- [ ] Appropriate sizing on large screens (1920px+)
- [ ] Numbers align properly with `tabular-nums`

## MCP Integration
Use Playwright MCP to test typography:
```bash
# Test on mobile viewport
mcp__playwright__browser_resize width=375 height=667
mcp__playwright__browser_snapshot

# Test on tablet
mcp__playwright__browser_resize width=768 height=1024
mcp__playwright__browser_snapshot

# Test on desktop
mcp__playwright__browser_resize width=1920 height=1080
mcp__playwright__browser_snapshot
```

Use Context7 MCP to fetch latest Tailwind CSS typography docs:
```bash
mcp__context7__resolve-library-id libraryName="tailwindcss" query="responsive typography"
mcp__context7__query-docs libraryId="/tailwindlabs/tailwindcss" query="responsive font sizes"
```

## Expected Outcome
- Smooth font size transitions across devices
- No text too large or too small on any screen
- Consistent visual hierarchy
- Improved readability across all breakpoints
- Better user experience on mobile devices
