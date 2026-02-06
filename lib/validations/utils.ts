import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Runtime prop validation utility
 *
 * Validates component props at runtime in development mode.
 * In production, validation is skipped for performance.
 *
 * @param schema - Zod schema to validate against
 * @param props - Props object to validate
 * @param componentName - Name of the component for error messages
 * @returns True if valid, false if invalid
 *
 * @example
 * ```ts
 * export function MyComponent(props: MyComponentProps) {
 *   if (process.env.NODE_ENV === 'development') {
 *     validateProps(myComponentPropsSchema, props, 'MyComponent');
 *   }
 *   // Component logic...
 * }
 * ```
 */
export function validateProps<T extends z.ZodType>(
  schema: T,
  props: unknown,
  componentName: string
): props is z.infer<T> {
  // Skip validation in production for performance
  if (process.env.NODE_ENV === "production") {
    return true;
  }

  const result = schema.safeParse(props);

  if (!result.success) {
    logger.error(`[${componentName}] Invalid props:`, {
      errors: result.error.issues,
      props,
    });

    // Log formatted error messages for easier debugging
    result.error.issues.forEach((error) => {
      const path = error.path.join(".");
      logger.error(`  - ${path}: ${error.message}`);
    });

    return false;
  }

  return true;
}

/**
 * Validation with user-friendly feedback
 *
 * Validates data and returns both the validation result and
 * user-friendly error messages for display in UI.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success status, data (if valid), and errors
 *
 * @example
 * ```ts
 * const result = validateWithFeedback(habitTemplateSchema, formData);
 * if (result.success) {
 *   await submitHabit(result.data);
 * } else {
 *   toast.error(result.errors[0]);
 * }
 * ```
 */
export function validateWithFeedback<T extends z.ZodType>(
  schema: T,
  data: unknown
): {
  success: boolean;
  data?: z.infer<T>;
  errors: string[];
  fieldErrors?: Record<string, string[]>;
} {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((error) => {
      const path = error.path.join(".");
      return path ? `${path}: ${error.message}` : error.message;
    });

    // Group errors by field for form validation
    const fieldErrors: Record<string, string[]> = {};
    result.error.issues.forEach((error) => {
      const field = error.path.join(".");
      if (field) {
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
      }
    });

    return {
      success: false,
      errors,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  return {
    success: true,
    data: result.data,
    errors: [],
  };
}

/**
 * Form field error extractor
 *
 * Extracts error message for a specific form field from Zod validation errors.
 * Useful for displaying field-specific errors in forms.
 *
 * @param error - Zod error object
 * @param fieldName - Name of the field to get errors for
 * @returns First error message for the field, or undefined if no errors
 *
 * @example
 * ```ts
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   const nameError = getFieldError(result.error, 'name');
 *   setErrors({ name: nameError });
 * }
 * ```
 */
export function getFieldError(
  error: z.ZodError,
  fieldName: string
): string | undefined {
  const fieldError = error.issues.find((err) => {
    const path = err.path.join(".");
    return path === fieldName;
  });

  return fieldError?.message;
}

/**
 * Convert Zod errors to field error object
 *
 * Converts Zod validation errors to a flat object mapping field names to error messages.
 * Perfect for integration with form libraries.
 *
 * @param error - Zod error object
 * @returns Object mapping field names to error messages
 *
 * @example
 * ```ts
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   const errors = zodErrorsToFieldErrors(result.error);
 *   // { name: 'Name is required', email: 'Invalid email' }
 * }
 * ```
 */
export function zodErrorsToFieldErrors(
  error: z.ZodError
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const field = err.path.join(".");
    if (field && !fieldErrors[field]) {
      // Only take the first error for each field
      fieldErrors[field] = err.message;
    }
  });

  return fieldErrors;
}

/**
 * Safely parse with default value
 *
 * Attempts to parse data with schema. If parsing fails, returns the default value.
 * Useful for parsing data from external sources with fallback.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to parse
 * @param defaultValue - Value to return if parsing fails
 * @returns Parsed data if valid, otherwise default value
 *
 * @example
 * ```ts
 * const config = safeParseWithDefault(
 *   configSchema,
 *   localStorage.getItem('config'),
 *   { theme: 'dark', language: 'en' }
 * );
 * ```
 */
export function safeParseWithDefault<T extends z.ZodType>(
  schema: T,
  data: unknown,
  defaultValue: z.infer<T>
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    logger.warn("Failed to parse data, using default value:", {
      errors: result.error.issues,
      defaultValue,
    });
    return defaultValue;
  }

  return result.data;
}

/**
 * Assert valid data
 *
 * Parses data and throws an error if invalid.
 * Use when you expect data to always be valid and want to fail fast.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param errorMessage - Custom error message prefix
 * @returns Parsed and validated data
 * @throws Error if data is invalid
 *
 * @example
 * ```ts
 * try {
 *   const validHabit = assertValid(habitSchema, habitData, 'Invalid habit');
 *   await saveHabit(validHabit);
 * } catch (error) {
 *   logger.error('Validation failed:', error);
 * }
 * ```
 */
export function assertValid<T extends z.ZodType>(
  schema: T,
  data: unknown,
  errorMessage = "Validation failed"
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((err) => {
        const path = err.path.join(".");
        return path ? `${path}: ${err.message}` : err.message;
      });

      throw new Error(`${errorMessage}: ${messages.join(", ")}`);
    }
    throw error;
  }
}

/**
 * Create a validated mutation helper
 *
 * Wraps a mutation function with automatic validation.
 * Returns a function that validates input before calling the mutation.
 *
 * @param schema - Zod schema to validate input against
 * @param mutationFn - The mutation function to wrap
 * @returns Validated mutation function
 *
 * @example
 * ```ts
 * const createHabit = createValidatedMutation(
 *   habitTemplateSchema,
 *   async (data) => {
 *     await api.habits.create(data);
 *   }
 * );
 *
 * // Usage - automatically validates before executing
 * await createHabit(formData);
 * ```
 */
export function createValidatedMutation<T extends z.ZodType, R>(
  schema: T,
  mutationFn: (data: z.infer<T>) => Promise<R>
): (data: unknown) => Promise<R> {
  return async (data: unknown) => {
    const validData = assertValid(schema, data, "Mutation validation failed");
    return mutationFn(validData);
  };
}
