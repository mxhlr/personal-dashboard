import { toast as sonnerToast } from "sonner";

/**
 * Simple toast hook that wraps sonner (which is already installed)
 * Compatible with shadcn/ui toast API
 */

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, duration = 3000, variant = "default" } = options;

    const message = title && description
      ? `${title}\n${description}`
      : title || description || "";

    if (variant === "destructive") {
      sonnerToast.error(message, { duration });
    } else {
      sonnerToast.success(message, { duration });
    }
  };

  return { toast };
}
