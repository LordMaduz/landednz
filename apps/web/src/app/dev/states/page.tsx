import { notFound } from "next/navigation"

// State-layer fixtures for e2e/design-states.spec.ts; never served in production
const fixture = "min-h-target rounded-control px-4"

export default function StatesPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <main className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap gap-4 bg-surface p-4">
        <button data-testid="state-surface" className={`${fixture} border border-border bg-surface state state-base-surface`}>On surface</button>
        <button data-testid="state-transparent" className={`${fixture} state`}>Transparent</button>
        <button data-testid="state-disabled" disabled className={`${fixture} border border-border bg-surface state state-base-surface`}>Disabled</button>
      </div>
      <div className="flex flex-wrap gap-4 bg-surface-sunken p-4">
        <button data-testid="state-sunken" className={`${fixture} bg-surface-sunken state state-base-surface-sunken`}>On sunken</button>
      </div>
      <div className="flex flex-wrap gap-4 bg-surface p-4">
        <button data-testid="inverse-action" className={`${fixture} bg-action text-fg-on-action state-inverse state-base-action`}>Action</button>
      </div>
      <div className="flex flex-wrap gap-4 bg-surface-inverse p-4">
        <button data-testid="inverse-surface" className={`${fixture} bg-surface-inverse text-fg-on-inverse state-inverse state-base-surface-inverse`}>On inverse</button>
      </div>
    </main>
  )
}
