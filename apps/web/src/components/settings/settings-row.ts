// One settings row: label, value, chevron; the chevron control's ::after covers the row, so the whole row is the target
export const ROW =
  "relative flex min-h-settings-row items-center gap-3 border-t border-border-subtle px-5 py-2 state state-base-surface max-narrow:px-4"
export const ROW_ON = "bg-surface-selected shadow-chosen"
export const ROW_LABEL = "w-26 flex-none text-ui text-fg-muted max-narrow:hidden"
export const ROW_VALUE = "flex min-w-0 flex-1 flex-col leading-snug"
export const ROW_PHONE_LABEL = "hidden text-small text-fg-muted max-narrow:block"
export const ROW_GO =
  "static inline-flex min-h-target items-center text-fg-subtle no-underline outline-none after:absolute after:inset-0 hover:text-fg-muted hover:no-underline active:text-fg-muted focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
export const ROW_TAG = "text-small font-medium text-fg-accent max-narrow:hidden"
