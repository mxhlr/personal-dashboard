/**
 * Tests for utility functions
 */

import { cn } from '@/lib/utils'

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')

      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'excluded')

      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('excluded')
    })

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')

      expect(result).toBe('class1 class2')
    })

    it('should merge Tailwind conflicting classes correctly', () => {
      // twMerge should handle Tailwind class conflicts
      const result = cn('p-4', 'p-8')

      // twMerge should keep only the last padding class
      expect(result).toBe('p-8')
      expect(result).not.toContain('p-4')
    })

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'])

      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should handle object with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      })

      expect(result).toContain('class1')
      expect(result).not.toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle complex Tailwind class merging', () => {
      const result = cn(
        'bg-red-500 hover:bg-red-600',
        'bg-blue-500 hover:bg-blue-600'
      )

      // Should keep only the last background classes
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-blue-600')
      expect(result).not.toContain('bg-red-500')
      expect(result).not.toContain('hover:bg-red-600')
    })

    it('should handle empty input', () => {
      const result = cn()

      expect(result).toBe('')
    })

    it('should handle only falsy values', () => {
      const result = cn(false, null, undefined, '')

      expect(result).toBe('')
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'base',
        ['array-class'],
        { 'obj-class': true },
        true && 'conditional'
      )

      expect(result).toContain('base')
      expect(result).toContain('array-class')
      expect(result).toContain('obj-class')
      expect(result).toContain('conditional')
    })

    it('should handle duplicate classes', () => {
      const result = cn('class1', 'class1', 'class2')

      // twMerge handles duplicates by keeping the class
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('should preserve non-conflicting Tailwind classes', () => {
      const result = cn('p-4 m-4', 'border-2 rounded')

      expect(result).toContain('p-4')
      expect(result).toContain('m-4')
      expect(result).toContain('border-2')
      expect(result).toContain('rounded')
    })

    it('should handle responsive Tailwind classes', () => {
      const result = cn('text-sm md:text-base lg:text-lg')

      expect(result).toContain('text-sm')
      expect(result).toContain('md:text-base')
      expect(result).toContain('lg:text-lg')
    })

    it('should handle dark mode classes', () => {
      const result = cn('bg-white dark:bg-black')

      expect(result).toContain('bg-white')
      expect(result).toContain('dark:bg-black')
    })

    it('should merge conflicting responsive classes', () => {
      const result = cn('text-sm md:text-base', 'text-lg md:text-xl')

      // Should keep the last text-sm equivalent and md variant
      expect(result).toContain('text-lg')
      expect(result).toContain('md:text-xl')
    })
  })
})
