"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initializeErrorReporting, trackNavigation } from './errorReporting';

/**
 * Error provider component
 *
 * Initializes error reporting and tracks navigation.
 * Add this to your root layout.
 *
 * @example
 * import { ErrorProvider } from '@/lib/errors/ErrorProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ErrorProvider>
 *           {children}
 *         </ErrorProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Initialize error reporting once on mount
  useEffect(() => {
    initializeErrorReporting();
  }, []);

  // Track navigation changes
  useEffect(() => {
    if (pathname) {
      trackNavigation(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
