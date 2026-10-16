/**
 * Design System - Shared design tokens and utilities for consistent UI/UX.
 *
 * Provides:
 * - Color palette with semantic naming
 * - Typography scale
 * - Spacing system
 * - Shadow and border radius tokens
 * - Component variant classes
 * - Responsive breakpoint utilities
 */

// ---------------------------------------------------------------------------
// Color Palette (Semantic)
// ---------------------------------------------------------------------------

export const COLORS = {
  // Brand
  primary: 'blue-600',
  primaryHover: 'blue-700',
  primaryLight: 'blue-50',
  primaryBorder: 'blue-200',

  // Secondary
  secondary: 'slate-600',
  secondaryLight: 'slate-100',

  // Success
  success: 'emerald-500',
  successLight: 'emerald-50',
  successBorder: 'emerald-200',

  // Warning
  warning: 'amber-500',
  warningLight: 'amber-50',
  warningBorder: 'amber-200',

  // Error
  error: 'rose-500',
  errorLight: 'rose-50',
  errorBorder: 'rose-200',

  // Info
  info: 'indigo-500',
  infoLight: 'indigo-50',
  infoBorder: 'indigo-200',

  // Neutral
  surface: 'slate-50',
  surfaceBorder: 'slate-200',
  surfaceHover: 'slate-100',
  textPrimary: 'slate-900',
  textSecondary: 'slate-600',
  textMuted: 'slate-400',
  textInverse: 'white',
} as const;

// ---------------------------------------------------------------------------
// Typography Scale
// ---------------------------------------------------------------------------

export const TYPOGRAPHY = {
  h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1]',
  h2: 'text-2xl sm:text-3xl font-bold leading-snug',
  h3: 'text-xl sm:text-2xl font-bold leading-snug',
  h4: 'text-lg font-semibold leading-snug',
  body: 'text-base leading-relaxed',
  bodySm: 'text-sm leading-relaxed',
  bodyXs: 'text-xs leading-relaxed',
  caption: 'text-[11px] leading-tight',
  label: 'text-xs font-semibold uppercase tracking-wider',
} as const;

// ---------------------------------------------------------------------------
// Shadow System
// ---------------------------------------------------------------------------

export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-xs',
  lg: 'shadow-sm',
  xl: 'shadow-md',
  '2xl': 'shadow-lg',
  glow: 'shadow-blue-500/20',
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

export const RADIUS = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

// ---------------------------------------------------------------------------
// Component Variants
// ---------------------------------------------------------------------------

export const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
  outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-900',
  ghost: 'hover:bg-slate-100 text-slate-600',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
} as const;

export const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
} as const;

export const CARD_VARIANTS = {
  default: 'bg-white border border-slate-200 shadow-sm',
  elevated: 'bg-white border border-slate-200 shadow-md',
  filled: 'bg-slate-50 border border-slate-100',
  interactive: 'bg-white border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
} as const;

// ---------------------------------------------------------------------------
// Responsive Breakpoint Helpers
// ---------------------------------------------------------------------------

export const BREAKPOINTS = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
} as const;

/**
 * Creates responsive grid column classes.
 */
export function gridCols(sm = 1, md = 2, lg = 3, xl = 4): string {
  return `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl}`;
}

/**
 * Creates responsive padding classes.
 */
export function responsiveP(xs: string, sm: string, md: string): string {
  return `p-${xs} sm:p-${sm} md:p-${md}`;
}

/**
 * Creates responsive text size classes.
 */
export function responsiveText(xs: string, sm: string, md: string): string {
  return `text-${xs} sm:text-${sm} md:text-${md}`;
}

/**
 * Utility to conditionally merge class names.
 */
export function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
