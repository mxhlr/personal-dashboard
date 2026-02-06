/**
 * Tests for habit validation schemas
 */

import {
  habitItemSchema,
  habitCategorySchema,
  habitTemplateSchema,
  habitCategoryFormSchema,
  xpUpdateSchema,
  skipReasonSchema,
  habitSkipSchema,
} from '@/lib/validations/habitSchemas'

describe('habitSchemas', () => {
  describe('habitItemSchema', () => {
    it('should validate a valid habit item', () => {
      const validHabit = {
        id: 'habit-1',
        name: 'Morning Meditation',
        subtitle: 'Start the day with mindfulness',
        xp: 10,
        completed: false,
      }

      const result = habitItemSchema.safeParse(validHabit)
      expect(result.success).toBe(true)
    })

    it('should accept optional fields', () => {
      const minimalHabit = {
        id: 'habit-2',
        name: 'Exercise',
        xp: 15,
        completed: true,
      }

      const result = habitItemSchema.safeParse(minimalHabit)
      expect(result.success).toBe(true)
    })

    it('should reject empty habit name', () => {
      const invalid = {
        id: 'habit-3',
        name: '',
        xp: 10,
        completed: false,
      }

      const result = habitItemSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Habit name is required')
      }
    })

    it('should reject habit name over 100 characters', () => {
      const invalid = {
        id: 'habit-4',
        name: 'a'.repeat(101),
        xp: 10,
        completed: false,
      }

      const result = habitItemSchema.safeParse(invalid)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 100 characters')
      }
    })

    it('should reject XP below minimum (1)', () => {
      const invalid = {
        id: 'habit-5',
        name: 'Test',
        xp: 0,
        completed: false,
      }

      const result = habitItemSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject XP above maximum (10000)', () => {
      const invalid = {
        id: 'habit-6',
        name: 'Test',
        xp: 10001,
        completed: false,
      }

      const result = habitItemSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer XP values', () => {
      const invalid = {
        id: 'habit-7',
        name: 'Test',
        xp: 10.5,
        completed: false,
      }

      const result = habitItemSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should accept valid completedAt datetime', () => {
      const valid = {
        id: 'habit-8',
        name: 'Test',
        xp: 10,
        completed: true,
        completedAt: new Date().toISOString(),
      }

      const result = habitItemSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })
  })

  describe('habitCategorySchema', () => {
    it('should validate a valid category', () => {
      const validCategory = {
        icon: '💪',
        name: 'Health',
        habits: [
          {
            id: 'h1',
            name: 'Exercise',
            xp: 10,
            completed: false,
          },
        ],
        categoryNumber: 1,
      }

      const result = habitCategorySchema.safeParse(validCategory)
      expect(result.success).toBe(true)
    })

    it('should accept hex color as icon', () => {
      const validCategory = {
        icon: '#FF5733',
        name: 'Work',
        habits: [],
        categoryNumber: 2,
      }

      const result = habitCategorySchema.safeParse(validCategory)
      expect(result.success).toBe(true)
    })

    it('should reject empty icon', () => {
      const invalid = {
        icon: '',
        name: 'Test',
        habits: [],
        categoryNumber: 1,
      }

      const result = habitCategorySchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject category name over 50 characters', () => {
      const invalid = {
        icon: '📚',
        name: 'a'.repeat(51),
        habits: [],
        categoryNumber: 1,
      }

      const result = habitCategorySchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should accept empty habits array', () => {
      const valid = {
        icon: '🎯',
        name: 'Goals',
        habits: [],
        categoryNumber: 3,
      }

      const result = habitCategorySchema.safeParse(valid)
      expect(result.success).toBe(true)
    })
  })

  describe('habitTemplateSchema', () => {
    it('should validate a valid habit template', () => {
      const valid = {
        name: 'Morning Run',
        subtitle: '5km jog',
        categoryId: 'cat-1',
        xpValue: 25,
        isExtra: false,
      }

      const result = habitTemplateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept empty string for subtitle', () => {
      const valid = {
        name: 'Reading',
        subtitle: '',
        categoryId: 'cat-2',
        xpValue: 15,
        isExtra: false,
      }

      const result = habitTemplateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should default isExtra to false', () => {
      const valid = {
        name: 'Meditation',
        categoryId: 'cat-3',
        xpValue: 10,
      }

      const result = habitTemplateSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isExtra).toBe(false)
      }
    })

    it('should reject empty category ID', () => {
      const invalid = {
        name: 'Test',
        categoryId: '',
        xpValue: 10,
      }

      const result = habitTemplateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('habitCategoryFormSchema', () => {
    it('should validate hex color code', () => {
      const valid = {
        name: 'Health',
        icon: '#FF5733',
        order: 0,
      }

      const result = habitCategoryFormSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should validate 3-digit hex color', () => {
      const valid = {
        name: 'Work',
        icon: '#F53',
        order: 1,
      }

      const result = habitCategoryFormSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept emoji as icon', () => {
      const valid = {
        name: 'Fitness',
        icon: '💪',
        order: 2,
      }

      const result = habitCategoryFormSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject invalid hex color', () => {
      const invalid = {
        name: 'Test',
        icon: '#GGGGGG',
        order: 0,
      }

      const result = habitCategoryFormSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should default order to 0', () => {
      const valid = {
        name: 'Learning',
        icon: '📚',
      }

      const result = habitCategoryFormSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.order).toBe(0)
      }
    })
  })

  describe('xpUpdateSchema', () => {
    it('should validate valid XP update', () => {
      const valid = {
        templateId: 'template-1',
        xpValue: 50,
      }

      const result = xpUpdateSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should enforce XP constraints', () => {
      const invalid = {
        templateId: 'template-2',
        xpValue: 0,
      }

      const result = xpUpdateSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('skipReasonSchema', () => {
    const validReasons = [
      'Not enough time',
      "Didn't feel like it",
      'Forgot',
      'Circumstances prevented it',
      'Chose something else',
    ]

    validReasons.forEach((reason) => {
      it(`should accept "${reason}"`, () => {
        const result = skipReasonSchema.safeParse(reason)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid reason', () => {
      const result = skipReasonSchema.safeParse('Invalid reason')
      expect(result.success).toBe(false)
    })
  })

  describe('habitSkipSchema', () => {
    it('should validate valid skip data', () => {
      const valid = {
        habitId: 'habit-1',
        reason: 'Not enough time',
        date: '2024-01-15',
      }

      const result = habitSkipSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const invalid = {
        habitId: 'habit-2',
        reason: 'Forgot',
        date: '15-01-2024',
      }

      const result = habitSkipSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid skip reason', () => {
      const invalid = {
        habitId: 'habit-3',
        reason: 'Custom reason',
        date: '2024-01-15',
      }

      const result = habitSkipSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
