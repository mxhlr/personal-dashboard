/**
 * Tests for review validation schemas
 */

import {
  weeklyReviewResponsesSchema,
  weeklyGoalSchema,
  monthlyReviewResponsesSchema,
  quarterlyReviewResponsesSchema,
  annualReviewResponsesSchema,
} from '@/lib/validations/reviewSchemas'

describe('reviewSchemas', () => {
  describe('weeklyReviewResponsesSchema', () => {
    it('should validate complete weekly review', () => {
      const valid = {
        biggestSuccess: 'Completed major feature',
        mostFrustrating: 'Debugging took longer than expected',
        differentlyNextTime: 'Start with better testing strategy',
        learned: 'Importance of early testing',
        nextWeekFocus: 'Ship v2.0',
      }

      const result = weeklyReviewResponsesSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject empty responses', () => {
      const invalid = {
        biggestSuccess: '',
        mostFrustrating: 'Something',
        differentlyNextTime: 'Something',
        learned: 'Something',
        nextWeekFocus: 'Something',
      }

      const result = weeklyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject responses over 2000 characters', () => {
      const invalid = {
        biggestSuccess: 'a'.repeat(2001),
        mostFrustrating: 'Something',
        differentlyNextTime: 'Something',
        learned: 'Something',
        nextWeekFocus: 'Something',
      }

      const result = weeklyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should require all fields', () => {
      const invalid = {
        biggestSuccess: 'Success',
        mostFrustrating: 'Frustration',
        // Missing other fields
      }

      const result = weeklyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('weeklyGoalSchema', () => {
    it('should validate valid goal', () => {
      const valid = {
        goal: 'Complete project milestone',
        category: 'Wealth',
      }

      const result = weeklyGoalSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    const validCategories = ['Wealth', 'Health', 'Love', 'Happiness']
    validCategories.forEach((category) => {
      it(`should accept category "${category}"`, () => {
        const valid = {
          goal: 'Test goal',
          category,
        }

        const result = weeklyGoalSchema.safeParse(valid)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid category', () => {
      const invalid = {
        goal: 'Test goal',
        category: 'Career',
      }

      const result = weeklyGoalSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject empty goal', () => {
      const invalid = {
        goal: '',
        category: 'Health',
      }

      const result = weeklyGoalSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject goal over 500 characters', () => {
      const invalid = {
        goal: 'a'.repeat(501),
        category: 'Wealth',
      }

      const result = weeklyGoalSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('monthlyReviewResponsesSchema', () => {
    it('should validate complete monthly review', () => {
      const valid = {
        achievements: 'Launched product successfully',
        challenges: 'Resource constraints',
        lessons: 'Better planning needed',
        nextMonthFocus: 'Marketing and growth',
        habitsReflection: 'Maintained good consistency',
      }

      const result = monthlyReviewResponsesSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject empty responses', () => {
      const invalid = {
        achievements: '',
        challenges: 'Something',
        lessons: 'Something',
        nextMonthFocus: 'Something',
        habitsReflection: 'Something',
      }

      const result = monthlyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject responses over 3000 characters', () => {
      const invalid = {
        achievements: 'a'.repeat(3001),
        challenges: 'Something',
        lessons: 'Something',
        nextMonthFocus: 'Something',
        habitsReflection: 'Something',
      }

      const result = monthlyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('quarterlyReviewResponsesSchema', () => {
    it('should validate complete quarterly review', () => {
      const valid = {
        majorWins: 'Reached revenue milestone',
        significantChallenges: 'Market competition',
        keyLearnings: 'Customer feedback is crucial',
        nextQuarterGoals: 'Double customer base',
        areasForImprovement: 'Product quality and support',
      }

      const result = quarterlyReviewResponsesSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject empty responses', () => {
      const invalid = {
        majorWins: '',
        significantChallenges: 'Something',
        keyLearnings: 'Something',
        nextQuarterGoals: 'Something',
        areasForImprovement: 'Something',
      }

      const result = quarterlyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject responses over 5000 characters', () => {
      const invalid = {
        majorWins: 'a'.repeat(5001),
        significantChallenges: 'Something',
        keyLearnings: 'Something',
        nextQuarterGoals: 'Something',
        areasForImprovement: 'Something',
      }

      const result = quarterlyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should require all fields', () => {
      const invalid = {
        majorWins: 'Wins',
        significantChallenges: 'Challenges',
        // Missing other fields
      }

      const result = quarterlyReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('annualReviewResponsesSchema', () => {
    it('should validate complete annual review', () => {
      const valid = {
        yearOverview: 'A year of significant growth',
        biggestAchievements: 'Built and scaled the business',
        lessonsLearned: 'Persistence pays off',
        nextYearVision: 'Expand to new markets',
        gratitude: 'Grateful for team and supporters',
      }

      const result = annualReviewResponsesSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject empty responses', () => {
      const invalid = {
        yearOverview: '',
        biggestAchievements: 'Something',
        lessonsLearned: 'Something',
        nextYearVision: 'Something',
        gratitude: 'Something',
      }

      const result = annualReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject responses over 10000 characters', () => {
      const invalid = {
        yearOverview: 'a'.repeat(10001),
        biggestAchievements: 'Something',
        lessonsLearned: 'Something',
        nextYearVision: 'Something',
        gratitude: 'Something',
      }

      const result = annualReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should require all fields', () => {
      const invalid = {
        yearOverview: 'Overview',
        biggestAchievements: 'Achievements',
        // Missing other fields
      }

      const result = annualReviewResponsesSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
