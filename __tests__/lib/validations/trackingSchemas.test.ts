/**
 * Tests for tracking validation schemas
 */

import {
  wellbeingSchema,
  customToggleSchema,
  customTextSchema,
  trackingDataSchema,
  trackingFieldSchema,
  dateRangeSchema,
  dayOfWeekSchema,
} from '@/lib/validations/trackingSchemas'

describe('trackingSchemas', () => {
  describe('wellbeingSchema', () => {
    it('should validate valid wellbeing metrics', () => {
      const valid = {
        energy: 7,
        satisfaction: 8,
        stress: 4,
      }

      const result = wellbeingSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept minimum values (1)', () => {
      const valid = {
        energy: 1,
        satisfaction: 1,
        stress: 1,
      }

      const result = wellbeingSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept maximum values (10)', () => {
      const valid = {
        energy: 10,
        satisfaction: 10,
        stress: 10,
      }

      const result = wellbeingSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject values below 1', () => {
      const invalid = {
        energy: 0,
        satisfaction: 5,
        stress: 5,
      }

      const result = wellbeingSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject values above 10', () => {
      const invalid = {
        energy: 5,
        satisfaction: 11,
        stress: 5,
      }

      const result = wellbeingSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer values', () => {
      const invalid = {
        energy: 7.5,
        satisfaction: 8,
        stress: 4,
      }

      const result = wellbeingSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('customToggleSchema', () => {
    it('should validate valid toggle', () => {
      const valid = {
        fieldId: 'field-1',
        value: true,
      }

      const result = customToggleSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept false value', () => {
      const valid = {
        fieldId: 'field-2',
        value: false,
      }

      const result = customToggleSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject empty field ID', () => {
      const invalid = {
        fieldId: '',
        value: true,
      }

      const result = customToggleSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('customTextSchema', () => {
    it('should validate valid text field', () => {
      const valid = {
        fieldId: 'field-1',
        value: 'Some text content',
      }

      const result = customTextSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept empty string value', () => {
      const valid = {
        fieldId: 'field-2',
        value: '',
      }

      const result = customTextSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject text over 1000 characters', () => {
      const invalid = {
        fieldId: 'field-3',
        value: 'a'.repeat(1001),
      }

      const result = customTextSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('trackingDataSchema', () => {
    it('should validate complete tracking data', () => {
      const valid = {
        movement: 'Ran 5km',
        phoneJail: true,
        phoneJailNotes: 'Focused work session',
        vibes: 'Feeling productive',
        breakfast: 'Oatmeal and fruits',
        lunch: 'Salad',
        dinner: 'Chicken and vegetables',
        workHours: 8,
        workNotes: 'Completed feature X',
      }

      const result = trackingDataSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept all optional fields', () => {
      const valid = {}

      const result = trackingDataSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should validate partial data', () => {
      const valid = {
        movement: 'Walked',
        breakfast: 'Toast',
      }

      const result = trackingDataSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject work hours above 24', () => {
      const invalid = {
        workHours: 25,
      }

      const result = trackingDataSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject negative work hours', () => {
      const invalid = {
        workHours: -1,
      }

      const result = trackingDataSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject movement notes over 500 characters', () => {
      const invalid = {
        movement: 'a'.repeat(501),
      }

      const result = trackingDataSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('trackingFieldSchema', () => {
    it('should validate valid tracking field', () => {
      const valid = {
        userId: 'user-1',
        name: 'Meditation',
        type: 'toggle',
        hasStreak: true,
        isDefault: false,
        isActive: true,
        order: 0,
        currentStreak: 5,
        longestStreak: 10,
        weeklyTarget: 7,
        createdAt: new Date().toISOString(),
      }

      const result = trackingFieldSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should accept all field types', () => {
      const types = ['text', 'toggle', 'meals', 'work']

      types.forEach((type) => {
        const valid = {
          userId: 'user-1',
          name: 'Test Field',
          type,
          isDefault: false,
          isActive: true,
          order: 0,
          createdAt: new Date().toISOString(),
        }

        const result = trackingFieldSchema.safeParse(valid)
        expect(result.success).toBe(true)
      })
    })

    it('should default hasStreak to false', () => {
      const valid = {
        userId: 'user-1',
        name: 'Test',
        type: 'text',
        isDefault: false,
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
      }

      const result = trackingFieldSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.hasStreak).toBe(false)
      }
    })

    it('should reject invalid field type', () => {
      const invalid = {
        userId: 'user-1',
        name: 'Test',
        type: 'invalid',
        isDefault: false,
        isActive: true,
        order: 0,
        createdAt: new Date().toISOString(),
      }

      const result = trackingFieldSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject weekly target above 7', () => {
      const invalid = {
        userId: 'user-1',
        name: 'Test',
        type: 'toggle',
        isDefault: false,
        isActive: true,
        order: 0,
        weeklyTarget: 8,
        createdAt: new Date().toISOString(),
      }

      const result = trackingFieldSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('dateRangeSchema', () => {
    it('should validate valid date range', () => {
      const valid = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      }

      const result = dateRangeSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const invalid = {
        startDate: '01-01-2024',
        endDate: '2024-01-31',
      }

      const result = dateRangeSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject incomplete date', () => {
      const invalid = {
        startDate: '2024-01',
        endDate: '2024-01-31',
      }

      const result = dateRangeSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('dayOfWeekSchema', () => {
    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]

    validDays.forEach((day) => {
      it(`should accept "${day}"`, () => {
        const result = dayOfWeekSchema.safeParse(day)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid day', () => {
      const result = dayOfWeekSchema.safeParse('Mon')
      expect(result.success).toBe(false)
    })

    it('should reject lowercase day', () => {
      const result = dayOfWeekSchema.safeParse('monday')
      expect(result.success).toBe(false)
    })
  })
})
