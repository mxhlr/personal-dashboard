# Mobile Navigation Skill

## Description
Converts desktop horizontal navigation to responsive mobile navigation using shadcn/ui Drawer component with hamburger menu pattern.

## When to Use
- Desktop navigation bar has too many items for mobile
- Horizontal tabs overflow on small screens
- Need to implement hamburger menu pattern
- Converting Header navigation to mobile-friendly drawer

## Prerequisites
- shadcn/ui Drawer component installed
- Lucide React icons (Menu, X)
- Existing navigation structure

## Implementation Steps

### 1. Install Dependencies (if needed)
```bash
npx shadcn-ui@latest add drawer
```

### 2. Create Mobile Navigation Hook
Create `/hooks/use-mobile.tsx`:
```tsx
import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

### 3. Refactor Header Component
Pattern to follow:
```tsx
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Menu } from "lucide-react"

export function Header() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  // Navigation items array
  const navItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Daily Log", href: "/daily-log", icon: Calendar },
    // ... more items
  ]

  if (isMobile) {
    return (
      <header>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <nav className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </DrawerContent>
        </Drawer>
      </header>
    )
  }

  return (
    <header className="hidden md:flex">
      {/* Desktop navigation */}
    </header>
  )
}
```

### 4. Responsive Header Layout
```tsx
<header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
  <div className="container flex h-16 items-center justify-between px-4">
    {/* Logo - always visible */}
    <div className="flex items-center gap-2">
      <Logo />
    </div>

    {/* Desktop nav - hidden on mobile */}
    <nav className="hidden md:flex items-center gap-4">
      {/* Navigation items */}
    </nav>

    {/* Mobile menu button - visible on mobile */}
    <div className="md:hidden">
      <Drawer>
        {/* Mobile drawer content */}
      </Drawer>
    </div>

    {/* Right side actions - always visible */}
    <div className="flex items-center gap-2">
      <SettingsButton />
    </div>
  </div>
</header>
```

## Best Practices
- Keep mobile drawer at bottom for thumb-friendly access
- Close drawer automatically after navigation
- Use icons + labels in drawer for clarity
- Ensure drawer has proper z-index (z-50+)
- Test on real mobile devices
- Add loading state during navigation

## Touch Target Requirements
- Menu button: minimum 44x44px
- Drawer nav items: minimum 44px height
- Spacing between items: minimum 8px

## Accessibility
- Add `aria-label="Main navigation"` to nav
- Ensure drawer is keyboard navigable
- Use semantic HTML (nav, button elements)
- Announce drawer state to screen readers

## MCP Integration
Use Playwright MCP to test mobile navigation:
```bash
# Test mobile viewport
mcp__playwright__browser_resize width=375 height=667
mcp__playwright__browser_snapshot
mcp__playwright__browser_click ref="menu-button"
```

## Expected Outcome
- Mobile (< 768px): Hamburger menu with drawer navigation
- Tablet/Desktop (≥ 768px): Horizontal tab navigation
- Smooth transitions between layouts
- No horizontal scrolling on mobile
- All navigation items accessible
