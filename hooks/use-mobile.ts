import * as React from "react"
import { throttle } from "@/lib/performance"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Throttle the change handler to prevent excessive re-renders
    // MediaQueryList change events are already fairly infrequent, but throttling
    // provides an extra safety layer for rapid window resizing
    const onChange = throttle(() => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, 100)

    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
