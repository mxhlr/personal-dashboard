/**
 * UI Constants
 *
 * Animation durations, timeouts, breakpoints, and other UI-related constants
 * used across components for consistent user experience.
 */

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  /** Very fast animations (e.g., checkbox state change) */
  INSTANT: 100,

  /** Fast animations (e.g., button hover, dropdown open) */
  FAST: 200,

  /** Standard animations (e.g., modal slide-in, panel transitions) */
  NORMAL: 300,

  /** Checkbox pulse animation after completion */
  CHECKBOX_PULSE: 600,

  /** Row highlight animation after habit completion */
  ROW_HIGHLIGHT: 800,

  /** XP float animation when earning points */
  XP_FLOAT: 1000,

  /** Habit completion celebration animation */
  CELEBRATION: 1000,
} as const;

/**
 * Timeouts and Delays (in milliseconds)
 */
export const TIMEOUT = {
  /** Debounce delay for input fields (e.g., XP value editing) */
  INPUT_DEBOUNCE: 500,

  /** Throttle interval for scroll handlers */
  SCROLL_THROTTLE: 100,

  /** Timer update interval (e.g., sprint timer) */
  TIMER_UPDATE: 1000,

  /** Toast notification auto-dismiss duration */
  TOAST: 3000,

  /** Focus delay when opening dialogs/panels */
  FOCUS_DELAY: 100,
} as const;

/**
 * Breakpoints (in pixels)
 * Mobile-first responsive design breakpoints
 */
export const BREAKPOINT = {
  /** Small mobile devices */
  SM: 640,

  /** Medium devices (tablets) */
  MD: 768,

  /** Large devices (desktops) */
  LG: 1024,

  /** Extra large devices */
  XL: 1280,

  /** 2XL devices */
  XXL: 1536,
} as const;

/**
 * Panel and Modal Widths (in pixels)
 */
export const PANEL_WIDTH = {
  /** Mobile panel width (full screen) */
  MOBILE: '100%',

  /** Desktop panel width (e.g., Coach panel) */
  DESKTOP: 500,

  /** Standard modal width */
  MODAL: 600,

  /** Wide modal width */
  MODAL_WIDE: 800,
} as const;

/**
 * Z-Index Layers
 * Ensures proper stacking of UI elements
 */
export const Z_INDEX = {
  /** Base content layer */
  BASE: 0,

  /** Header and navigation */
  HEADER: 10,

  /** Dropdown menus */
  DROPDOWN: 20,

  /** Tooltips */
  TOOLTIP: 30,

  /** Backdrop overlay */
  BACKDROP: 40,

  /** Modal and panel content */
  MODAL: 50,
} as const;

/**
 * Scroll and Scrollbar Widths
 */
export const SCROLL = {
  /** Custom scrollbar width */
  SCROLLBAR_WIDTH: 'thin' as const,

  /** Smooth scroll behavior */
  BEHAVIOR: 'smooth' as const,
} as const;

/**
 * Icon and Avatar Sizes (in pixels)
 */
export const SIZE = {
  /** Small icon size */
  ICON_SM: 16,

  /** Medium icon size */
  ICON_MD: 20,

  /** Large icon size */
  ICON_LG: 24,

  /** Avatar size */
  AVATAR: 32,

  /** Checkbox size */
  CHECKBOX: 24,

  /** Progress ring size */
  PROGRESS_RING: 120,
} as const;

/**
 * Opacity Values
 * Consistent opacity levels for hover states and backgrounds
 */
export const OPACITY = {
  /** Disabled state */
  DISABLED: 0.5,

  /** Hover state (light) */
  HOVER_LIGHT: 0.02,

  /** Hover state (medium) */
  HOVER_MEDIUM: 0.05,

  /** Hover state (strong) */
  HOVER_STRONG: 0.1,

  /** Background overlay (light) */
  OVERLAY_LIGHT: 0.03,

  /** Background overlay (medium) */
  OVERLAY_MEDIUM: 0.08,

  /** Background overlay (strong) */
  OVERLAY_STRONG: 0.15,

  /** Backdrop */
  BACKDROP: 0.5,
} as const;
