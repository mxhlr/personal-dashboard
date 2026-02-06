/**
 * Tests for custom error types
 */

import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  NetworkError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
  ConfigurationError,
  TimeoutError,
  isAppError,
  isOperationalError,
} from '@/lib/errors/errorTypes'

describe('errorTypes', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError(
        'Test error',
        'TEST_CODE',
        500,
        true,
        { userId: '123' }
      )

      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(true)
      expect(error.context).toEqual({ userId: '123' })
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('should maintain proper prototype chain', () => {
      const error = new AppError('Test', 'CODE')

      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(Error)
    })

    it('should serialize to JSON correctly', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400)
      const json = error.toJSON()

      expect(json.name).toBe('AppError')
      expect(json.message).toBe('Test error')
      expect(json.code).toBe('TEST_CODE')
      expect(json.statusCode).toBe(400)
      expect(json.timestamp).toBeDefined()
    })

    it('should capture stack trace', () => {
      const error = new AppError('Test', 'CODE')

      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('AppError')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with correct defaults', () => {
      const error = new ValidationError('Invalid input')

      expect(error.message).toBe('Invalid input')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.isOperational).toBe(true)
    })

    it('should accept context', () => {
      const error = new ValidationError('Invalid', { field: 'email' })

      expect(error.context).toEqual({ field: 'email' })
    })
  })

  describe('AuthenticationError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthenticationError()

      expect(error.message).toBe('Authentication required')
      expect(error.code).toBe('AUTHENTICATION_ERROR')
      expect(error.statusCode).toBe(401)
    })

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token')

      expect(error.message).toBe('Invalid token')
    })
  })

  describe('AuthorizationError', () => {
    it('should create authorization error with default message', () => {
      const error = new AuthorizationError()

      expect(error.message).toBe('Permission denied')
      expect(error.code).toBe('AUTHORIZATION_ERROR')
      expect(error.statusCode).toBe(403)
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('Resource not found')

      expect(error.message).toBe('Resource not found')
      expect(error.code).toBe('NOT_FOUND_ERROR')
      expect(error.statusCode).toBe(404)
    })
  })

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Duplicate entry')

      expect(error.message).toBe('Duplicate entry')
      expect(error.code).toBe('CONFLICT_ERROR')
      expect(error.statusCode).toBe(409)
    })
  })

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Connection failed')

      expect(error.message).toBe('Connection failed')
      expect(error.code).toBe('NETWORK_ERROR')
      expect(error.statusCode).toBe(503)
    })

    it('should store original error', () => {
      const originalError = new Error('Fetch failed')
      const error = new NetworkError('Network issue', undefined, originalError)

      expect(error.originalError).toBe(originalError)
    })
  })

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError('Query failed')

      expect(error.message).toBe('Query failed')
      expect(error.code).toBe('DATABASE_ERROR')
      expect(error.statusCode).toBe(500)
    })

    it('should store original error', () => {
      const originalError = new Error('Connection lost')
      const error = new DatabaseError('DB error', undefined, originalError)

      expect(error.originalError).toBe(originalError)
    })
  })

  describe('ExternalServiceError', () => {
    it('should create external service error', () => {
      const error = new ExternalServiceError('API failed', 'Stripe')

      expect(error.message).toBe('API failed')
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR')
      expect(error.statusCode).toBe(502)
      expect(error.service).toBe('Stripe')
    })

    it('should store original error', () => {
      const originalError = new Error('API timeout')
      const error = new ExternalServiceError(
        'Service error',
        'PayPal',
        undefined,
        originalError
      )

      expect(error.originalError).toBe(originalError)
    })
  })

  describe('RateLimitError', () => {
    it('should create rate limit error with default message', () => {
      const error = new RateLimitError()

      expect(error.message).toBe('Rate limit exceeded')
      expect(error.code).toBe('RATE_LIMIT_ERROR')
      expect(error.statusCode).toBe(429)
    })

    it('should store retry after value', () => {
      const error = new RateLimitError('Too many requests', 60)

      expect(error.retryAfter).toBe(60)
    })
  })

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Missing API key')

      expect(error.message).toBe('Missing API key')
      expect(error.code).toBe('CONFIGURATION_ERROR')
      expect(error.statusCode).toBe(500)
      expect(error.isOperational).toBe(false)
    })
  })

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('Request timeout', 5000)

      expect(error.message).toBe('Request timeout')
      expect(error.code).toBe('TIMEOUT_ERROR')
      expect(error.statusCode).toBe(408)
      expect(error.timeoutMs).toBe(5000)
    })
  })

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError('Test', 'CODE')

      expect(isAppError(error)).toBe(true)
    })

    it('should return true for AppError subclasses', () => {
      const errors = [
        new ValidationError('Test'),
        new AuthenticationError('Test'),
        new NotFoundError('Test'),
      ]

      errors.forEach((error) => {
        expect(isAppError(error)).toBe(true)
      })
    })

    it('should return false for regular errors', () => {
      const error = new Error('Regular error')

      expect(isAppError(error)).toBe(false)
    })

    it('should return false for non-error values', () => {
      expect(isAppError('string')).toBe(false)
      expect(isAppError(null)).toBe(false)
      expect(isAppError(undefined)).toBe(false)
      expect(isAppError({})).toBe(false)
    })
  })

  describe('isOperationalError', () => {
    it('should return true for operational errors', () => {
      const error = new ValidationError('Test')

      expect(isOperationalError(error)).toBe(true)
    })

    it('should return false for non-operational errors', () => {
      const error = new ConfigurationError('Test')

      expect(isOperationalError(error)).toBe(false)
    })

    it('should return false for non-AppError instances', () => {
      const error = new Error('Regular error')

      expect(isOperationalError(error)).toBe(false)
    })
  })
})
