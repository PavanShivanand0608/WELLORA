export type ButtonVariant = 'dark' | 'accent' | 'sand' | 'light'

export const buttonBaseClasses =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-tile px-4 py-2 text-sm font-semibold leading-none transition-colors duration-150 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50'

export const focusVisibleClasses =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-screen'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  dark: 'bg-panel text-surface hover:bg-ink',
  accent: 'bg-accent text-ink hover:bg-accent-soft',
  sand: 'bg-sand text-ink hover:bg-line',
  light: 'border border-line bg-surface text-ink hover:bg-cream',
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
