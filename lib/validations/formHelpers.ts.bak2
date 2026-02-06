import { zodResolver } from "@hookform/resolvers/zod";
import { UseFormProps, useForm as useReactHookForm, FieldValues } from "react-hook-form";
import { z } from "zod";

/**
 * Typed form hook with Zod validation
 *
 * Wraps react-hook-form's useForm with Zod schema validation.
 * Provides full type safety and automatic validation.
 *
 * @param schema - Zod schema for form validation
 * @param options - Additional react-hook-form options
 * @returns Form instance with full type safety
 *
 * @example
 * ```tsx
 * function HabitForm() {
 *   const form = useForm(habitTemplateSchema, {
 *     defaultValues: {
 *       name: '',
 *       categoryId: '',
 *       xpValue: 10,
 *       isExtra: false,
 *     }
 *   });
 *
 *   const onSubmit = form.handleSubmit(async (data) => {
 *     await createHabit(data);
 *   });
 *
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <input {...form.register('name')} />
 *       {form.formState.errors.name && (
 *         <span>{form.formState.errors.name.message}</span>
 *       )}
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<TFieldValues, any, any>,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">
) {
  return useReactHookForm<TFieldValues>({
    ...options,
    resolver: zodResolver(schema),
  });
}

/**
 * Form field error helper
 *
 * Extracts error message for a form field in a type-safe way.
 *
 * @param errors - Form errors object from react-hook-form
 * @param fieldName - Name of the field
 * @returns Error message or undefined
 *
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm(schema);
 * const nameError = getFormError(errors, 'name');
 * ```
 */
export function getFormError<T extends Record<string, unknown>>(
  errors: T,
  fieldName: keyof T
): string | undefined {
  const error = errors[fieldName] as { message?: string } | undefined;
  return error?.message;
}

/**
 * Check if form has any errors
 *
 * @param errors - Form errors object from react-hook-form
 * @returns True if any errors exist
 *
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm(schema);
 * const canSubmit = !hasFormErrors(errors);
 * ```
 */
export function hasFormErrors<T extends Record<string, unknown>>(
  errors: T
): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get all form error messages as array
 *
 * @param errors - Form errors object from react-hook-form
 * @returns Array of error messages
 *
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm(schema);
 * const errorMessages = getFormErrorMessages(errors);
 * errorMessages.forEach(msg => toast.error(msg));
 * ```
 */
export function getFormErrorMessages<T extends Record<string, unknown>>(
  errors: T
): string[] {
  return Object.values(errors)
    .map((error: unknown) => (error as { message?: string })?.message)
    .filter(Boolean) as string[];
}

/**
 * Create a form field config for easier form setup
 *
 * @param name - Field name
 * @param label - Field label for UI
 * @param placeholder - Placeholder text
 * @param required - Whether field is required
 * @returns Field configuration object
 *
 * @example
 * ```tsx
 * const fields = {
 *   name: createFieldConfig('name', 'Habit Name', 'Enter habit name', true),
 *   xpValue: createFieldConfig('xpValue', 'XP Value', '10', true),
 * };
 * ```
 */
export function createFieldConfig<T extends string>(
  name: T,
  label: string,
  placeholder?: string,
  required = false
) {
  return {
    name,
    label,
    placeholder,
    required,
  };
}

/**
 * Submit handler with error handling
 *
 * Wraps a form submit handler with automatic error handling and loading state.
 *
 * @param handler - The submit handler function
 * @param onError - Optional error handler
 * @returns Wrapped submit handler
 *
 * @example
 * ```tsx
 * const form = useForm(schema);
 * const onSubmit = createSubmitHandler(
 *   async (data) => {
 *     await api.create(data);
 *     toast.success('Created!');
 *   },
 *   (error) => {
 *     toast.error(error.message);
 *   }
 * );
 * ```
 */
export function createSubmitHandler<T>(
  handler: (data: T) => Promise<void>,
  onError?: (error: Error) => void
) {
  return async (data: T) => {
    try {
      await handler(data);
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        console.error("Form submission error:", error);
      }
    }
  };
}

