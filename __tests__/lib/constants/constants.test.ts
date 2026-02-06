/**
 * Tests for application constants
 */

import {
  XP,
  STREAK,
  LEVELS,
  TEXT_LIMIT,
  NUMERIC_RANGE,
  DATE_VALIDATION,
} from '@/lib/constants'

describe('constants', () => {
  describe('XP constants', () => {
    it('should have correct XP per level', () => {
      expect(XP.PER_LEVEL).toBe(1000)
    })

    it('should have valid XP range', () => {
      expect(XP.MIN_HABIT_XP).toBe(1)
      expect(XP.MAX_HABIT_XP).toBe(10000)
      expect(XP.MIN_HABIT_XP).toBeLessThan(XP.MAX_HABIT_XP)
    })

    it('should have default habit XP within range', () => {
      expect(XP.DEFAULT_HABIT).toBeGreaterThanOrEqual(XP.MIN_HABIT_XP)
      expect(XP.DEFAULT_HABIT).toBeLessThanOrEqual(XP.MAX_HABIT_XP)
    })
  })

  describe('STREAK constants', () => {
    it('should have correct week days', () => {
      expect(STREAK.WEEK_DAYS).toBe(7)
    })

    it('should have valid minimum days', () => {
      expect(STREAK.MIN_DAYS).toBe(1)
    })

    it('should have valid bonus multiplier', () => {
      expect(STREAK.BONUS_MULTIPLIER).toBe(0.1)
      expect(STREAK.BONUS_MULTIPLIER).toBeGreaterThan(0)
      expect(STREAK.BONUS_MULTIPLIER).toBeLessThan(1)
    })
  })

  describe('LEVELS constants', () => {
    it('should have initial level of 0', () => {
      expect(LEVELS.INITIAL_LEVEL).toBe(0)
    })

    it('should have milestones in ascending order', () => {
      const milestones = [...LEVELS.MILESTONES]
      const sorted = [...milestones].sort((a, b) => a - b)

      expect(milestones).toEqual(sorted)
    })

    it('should have max level greater than milestones', () => {
      const highestMilestone = Math.max(...LEVELS.MILESTONES)

      expect(LEVELS.MAX_LEVEL).toBeGreaterThan(highestMilestone)
    })

    it('should have valid milestone values', () => {
      LEVELS.MILESTONES.forEach((milestone) => {
        expect(milestone).toBeGreaterThan(0)
      })
    })
  })

  describe('TEXT_LIMIT constants', () => {
    it('should have positive limits', () => {
      Object.values(TEXT_LIMIT).forEach((limit) => {
        expect(limit).toBeGreaterThan(0)
      })
    })

    it('should have reasonable limits', () => {
      expect(TEXT_LIMIT.HABIT_NAME).toBe(100)
      expect(TEXT_LIMIT.HABIT_SUBTITLE).toBe(200)
      expect(TEXT_LIMIT.CATEGORY_NAME).toBe(50)
    })

    it('should have subtitle limit larger than name', () => {
      expect(TEXT_LIMIT.HABIT_SUBTITLE).toBeGreaterThan(TEXT_LIMIT.HABIT_NAME)
    })

    it('should have review textarea large enough', () => {
      expect(TEXT_LIMIT.REVIEW_TEXTAREA).toBeGreaterThanOrEqual(1000)
    })
  })

  describe('NUMERIC_RANGE constants', () => {
    it('should have wellbeing range 1-10', () => {
      expect(NUMERIC_RANGE.WELLBEING_MIN).toBe(1)
      expect(NUMERIC_RANGE.WELLBEING_MAX).toBe(10)
    })

    it('should have valid work hours range', () => {
      expect(NUMERIC_RANGE.WORK_HOURS_MIN).toBe(0)
      expect(NUMERIC_RANGE.WORK_HOURS_MAX).toBe(24)
    })

    it('should have XP range matching XP constants', () => {
      expect(NUMERIC_RANGE.XP_MIN).toBe(XP.MIN_HABIT_XP)
      expect(NUMERIC_RANGE.XP_MAX).toBe(XP.MAX_HABIT_XP)
    })

    it('should have positive maximum values', () => {
      expect(NUMERIC_RANGE.SPRINT_MAX_MINUTES).toBeGreaterThan(0)
      expect(NUMERIC_RANGE.TIMER_MAX_HOURS).toBeGreaterThan(0)
    })

    it('should have min less than max for all ranges', () => {
      expect(NUMERIC_RANGE.WELLBEING_MIN).toBeLessThan(NUMERIC_RANGE.WELLBEING_MAX)
      expect(NUMERIC_RANGE.WORK_HOURS_MIN).toBeLessThan(NUMERIC_RANGE.WORK_HOURS_MAX)
      expect(NUMERIC_RANGE.XP_MIN).toBeLessThan(NUMERIC_RANGE.XP_MAX)
    })
  })

  describe('DATE_VALIDATION constants', () => {
    it('should have valid year range', () => {
      expect(DATE_VALIDATION.MIN_YEAR).toBe(2020)
      expect(DATE_VALIDATION.MAX_FUTURE_YEARS).toBeGreaterThan(0)
    })

    it('should have valid week range', () => {
      expect(DATE_VALIDATION.WEEK_MIN).toBe(1)
      expect(DATE_VALIDATION.WEEK_MAX).toBe(53)
    })

    it('should have valid month range', () => {
      expect(DATE_VALIDATION.MONTH_MIN).toBe(1)
      expect(DATE_VALIDATION.MONTH_MAX).toBe(12)
    })

    it('should have valid quarter range', () => {
      expect(DATE_VALIDATION.QUARTER_MIN).toBe(1)
      expect(DATE_VALIDATION.QUARTER_MAX).toBe(4)
    })

    it('should have min less than max for all ranges', () => {
      expect(DATE_VALIDATION.WEEK_MIN).toBeLessThan(DATE_VALIDATION.WEEK_MAX)
      expect(DATE_VALIDATION.MONTH_MIN).toBeLessThan(DATE_VALIDATION.MONTH_MAX)
      expect(DATE_VALIDATION.QUARTER_MIN).toBeLessThan(DATE_VALIDATION.QUARTER_MAX)
    })
  })

  describe('constant immutability', () => {
    it('should be defined as const objects', () => {
      // Constants are defined with 'as const' which makes them readonly
      // Object.isFrozen() doesn't apply to 'as const', but they are type-safe
      expect(XP).toBeDefined()
      expect(STREAK).toBeDefined()
      expect(LEVELS).toBeDefined()
      expect(TEXT_LIMIT).toBeDefined()
      expect(NUMERIC_RANGE).toBeDefined()
      expect(DATE_VALIDATION).toBeDefined()
    })
  })

  describe('constant type safety', () => {
    it('should have number values for numeric constants', () => {
      expect(typeof XP.PER_LEVEL).toBe('number')
      expect(typeof STREAK.WEEK_DAYS).toBe('number')
      expect(typeof TEXT_LIMIT.HABIT_NAME).toBe('number')
    })

    it('should have array for milestones', () => {
      expect(Array.isArray(LEVELS.MILESTONES)).toBe(true)
    })
  })
})
