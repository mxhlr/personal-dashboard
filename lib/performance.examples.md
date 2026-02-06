# Performance Utilities - Usage Examples

This document provides examples of how to use the `debounce` and `throttle` utilities from `/lib/performance.ts`.

## Debounce

Debouncing delays the execution of a function until after a certain amount of time has passed since it was last called. This is useful for expensive operations that shouldn't run on every keystroke or event.

### Example 1: Search Input

```tsx
import { useCallback } from 'react';
import { debounce } from '@/lib/performance';
import { Input } from '@/components/ui/input';

function SearchComponent() {
  const performSearch = async (query: string) => {
    // API call to search
    const results = await fetch(`/api/search?q=${query}`);
    // Update results...
  };

  // Create a debounced search function that waits 500ms after user stops typing
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      performSearch(query);
    }, 500),
    []
  );

  return (
    <Input
      type="search"
      placeholder="Search..."
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  );
}
```

### Example 2: XP Value Input (from HabitItem.tsx)

```tsx
import { useCallback } from 'react';
import { debounce } from '@/lib/performance';

export function HabitItem() {
  const performXPUpdate = async (value: string) => {
    const newXP = parseInt(value, 10);
    // Validate and update...
    await updateTemplate({ xpValue: newXP });
  };

  // Debounced XP update - waits 500ms after user stops typing
  const debouncedXPUpdate = useCallback(
    debounce((value: string) => {
      performXPUpdate(value);
    }, 500),
    [xp, id]
  );

  const handleXPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setXpValue(newValue); // Update UI immediately
    debouncedXPUpdate(newValue); // Debounced save
  };

  return <Input onChange={handleXPChange} />;
}
```

### Example 3: Auto-save Text Area

```tsx
import { useCallback } from 'react';
import { debounce } from '@/lib/performance';
import { Textarea } from '@/components/ui/textarea';

function NotesEditor() {
  const saveNote = async (content: string) => {
    await fetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  };

  // Auto-save after 1 second of inactivity
  const debouncedSave = useCallback(
    debounce((content: string) => {
      saveNote(content);
    }, 1000),
    []
  );

  return (
    <Textarea
      onChange={(e) => debouncedSave(e.target.value)}
      placeholder="Your notes..."
    />
  );
}
```

## Throttle

Throttling limits the execution of a function to at most once per specified time period. This is useful for scroll, resize, and other high-frequency events.

### Example 1: Scroll Handler

```tsx
import { useCallback, useEffect } from 'react';
import { throttle } from '@/lib/performance';

function InfiniteScrollList() {
  const handleScroll = useCallback(
    throttle(() => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if user scrolled near bottom
      if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreItems();
      }
    }, 200), // Run at most once every 200ms
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return <div>{/* Your list items */}</div>;
}
```

### Example 2: Window Resize Handler (from use-mobile.ts)

```tsx
import { useEffect, useState } from 'react';
import { throttle } from '@/lib/performance';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: 767px)`);

    // Throttle the change handler to prevent excessive re-renders
    const onChange = throttle(() => {
      setIsMobile(window.innerWidth < 768);
    }, 100);

    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < 768);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
```

### Example 3: Mouse Movement Tracker

```tsx
import { useCallback, useEffect } from 'react';
import { throttle } from '@/lib/performance';

function MouseTracker() {
  const handleMouseMove = useCallback(
    throttle((event: MouseEvent) => {
      console.log('Mouse position:', event.clientX, event.clientY);
      // Update cursor position indicator, trigger animations, etc.
    }, 50), // Update at most once every 50ms (20fps)
    []
  );

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return <div>{/* Your content */}</div>;
}
```

## Best Practices

### 1. Use with useCallback

Always wrap debounced/throttled functions with `useCallback` to ensure stable function references:

```tsx
// ✅ Good - stable reference
const debouncedFn = useCallback(
  debounce((value) => {
    // ...
  }, 500),
  []
);

// ❌ Bad - creates new function on every render
const debouncedFn = debounce((value) => {
  // ...
}, 500);
```

### 2. Choose the Right Delay

- **Search inputs**: 300-500ms debounce
- **Auto-save**: 1000-2000ms debounce
- **Scroll events**: 100-200ms throttle
- **Resize events**: 100-200ms throttle
- **Mouse move**: 16-50ms throttle (60fps to 20fps)

### 3. Cleanup Event Listeners

Always remove event listeners in the cleanup function:

```tsx
useEffect(() => {
  const handler = throttle(() => {
    // ...
  }, 100);

  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
}, []);
```

### 4. Immediate UI Updates

For inputs, update the UI immediately and debounce only the expensive operations:

```tsx
const handleChange = (e) => {
  const value = e.target.value;
  setValue(value); // Immediate UI update
  debouncedSave(value); // Debounced API call
};
```

## When to Use Which

| Use Case | Utility | Reason |
|----------|---------|--------|
| Search input | Debounce | Wait for user to stop typing |
| Auto-save | Debounce | Save only after user pauses |
| Form validation | Debounce | Validate after user stops typing |
| Scroll to load more | Throttle | Check position periodically while scrolling |
| Window resize | Throttle | Recalculate layout periodically while resizing |
| Mouse move effects | Throttle | Update position at consistent intervals |

## Performance Impact

These utilities help reduce:
- **API calls**: Fewer requests = lower costs and better UX
- **Re-renders**: Fewer state updates = smoother UI
- **CPU usage**: Fewer function executions = better battery life
- **Network traffic**: Consolidated requests = faster load times
