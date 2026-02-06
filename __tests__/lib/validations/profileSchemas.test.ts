/**
 * Tests for profile validation schemas
 */

import {
  northStarsSchema,
  lifeAreaSchema,
  quarterlyMilestoneSchema,
  coachToneSchema,
  profileBasicsSchema,
  userRoleSchema,
  milestoneFormSchema,
} from '@/lib/validations/profileSchemas'

describe('profileSchemas', () => {
  describe('northStarsSchema', () => {
    it('should validate complete north stars', () => {
      const valid = {
        wealth: 'Build a successful business',
        health: 'Run a marathon',
        love: 'Strengthen relationships',
        happiness: 'Find inner peace',
      }

      const result = northStarsSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject missing fields', () => {
      const invalid = {
        wealth: 'Business goal',
        health: 'Health goal',
        love: 'Love goal',
        // Missing happiness
      }

      const result = northStarsSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject empty goal strings', () => {
      const invalid = {
        wealth: '',
        health: 'Health goal',
        love: 'Love goal',
        happiness: 'Happiness goal',
      }

      const result = northStarsSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject goals over 500 characters', () => {
      const invalid = {
        wealth: 'a'.repeat(501),
        health: 'Health goal',
        love: 'Love goal',
        happiness: 'Happiness goal',
      }

      const result = northStarsSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('lifeAreaSchema', () => {
    const validAreas = ['wealth', 'health', 'love', 'happiness']

    validAreas.forEach((area) => {
      it(`should accept "${area}"`, () => {
        const result = lifeAreaSchema.safeParse(area)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid life area', () => {
      const result = lifeAreaSchema.safeParse('career')
      expect(result.success).toBe(false)
    })
  })

  describe('quarterlyMilestoneSchema', () => {
    it('should validate valid milestone', () => {
      const valid = {
        quarter: 1,
        year: 2024,
        area: 'wealth',
        milestone: 'Launch product MVP',
        completed: false,
      }

      const result = quarterlyMilestoneSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should default completed to false', () => {
      const valid = {
        quarter: 2,
        year: 2024,
        area: 'health',
        milestone: 'Lose 10 pounds',
      }

      const result = quarterlyMilestoneSchema.safeParse(valid)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.completed).toBe(false)
      }
    })

    it('should reject quarter below 1', () => {
      const invalid = {
        quarter: 0,
        year: 2024,
        area: 'love',
        milestone: 'Test',
        completed: false,
      }

      const result = quarterlyMilestoneSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject quarter above 4', () => {
      const invalid = {
        quarter: 5,
        year: 2024,
        area: 'happiness',
        milestone: 'Test',
        completed: false,
      }

      const result = quarterlyMilestoneSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject year below 2020', () => {
      const invalid = {
        quarter: 1,
        year: 2019,
        area: 'wealth',
        milestone: 'Test',
        completed: false,
      }

      const result = quarterlyMilestoneSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject year above 2100', () => {
      const invalid = {
        quarter: 1,
        year: 2101,
        area: 'health',
        milestone: 'Test',
        completed: false,
      }

      const result = quarterlyMilestoneSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject milestone over 500 characters', () => {
      const invalid = {
        quarter: 1,
        year: 2024,
        area: 'love',
        milestone: 'a'.repeat(501),
        completed: false,
      }

      const result = quarterlyMilestoneSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('coachToneSchema', () => {
    const validTones = ['Motivierend', 'Sachlich', 'Empathisch', 'Direkt']

    validTones.forEach((tone) => {
      it(`should accept "${tone}"`, () => {
        const result = coachToneSchema.safeParse(tone)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid tone', () => {
      const result = coachToneSchema.safeParse('Friendly')
      expect(result.success).toBe(false)
    })
  })

  describe('profileBasicsSchema', () => {
    it('should validate valid profile basics', () => {
      const valid = {
        name: 'John Doe',
        role: 'Gründer',
        mainProject: 'Building a SaaS product',
      }

      const result = profileBasicsSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const invalid = {
        name: '',
        role: 'Executive',
        mainProject: 'Leading a team',
      }

      const result = profileBasicsSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject name over 100 characters', () => {
      const invalid = {
        name: 'a'.repeat(101),
        role: 'Freelancer',
        mainProject: 'Freelance work',
      }

      const result = profileBasicsSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject invalid role', () => {
      const invalid = {
        name: 'Jane Doe',
        role: 'CEO',
        mainProject: 'Running a company',
      }

      const result = profileBasicsSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject project over 200 characters', () => {
      const invalid = {
        name: 'Test User',
        role: 'Student',
        mainProject: 'a'.repeat(201),
      }

      const result = profileBasicsSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('userRoleSchema', () => {
    const validRoles = [
      'Gründer',
      'Executive',
      'Freelancer',
      'Student',
      'Angestellt',
      'Selbstständig',
      'Andere',
    ]

    validRoles.forEach((role) => {
      it(`should accept "${role}"`, () => {
        const result = userRoleSchema.safeParse(role)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid role', () => {
      const result = userRoleSchema.safeParse('Manager')
      expect(result.success).toBe(false)
    })
  })

  describe('milestoneFormSchema', () => {
    it('should validate valid milestone form', () => {
      const valid = {
        quarter: 3,
        year: 2024,
        area: 'wealth',
        milestone: 'Achieve $100k revenue',
      }

      const result = milestoneFormSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('should reject empty milestone text', () => {
      const invalid = {
        quarter: 1,
        year: 2024,
        area: 'health',
        milestone: '',
      }

      const result = milestoneFormSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should enforce quarter constraints', () => {
      const invalid = {
        quarter: 0,
        year: 2024,
        area: 'love',
        milestone: 'Test milestone',
      }

      const result = milestoneFormSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should enforce year constraints', () => {
      const invalid = {
        quarter: 1,
        year: 2019,
        area: 'happiness',
        milestone: 'Test milestone',
      }

      const result = milestoneFormSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
