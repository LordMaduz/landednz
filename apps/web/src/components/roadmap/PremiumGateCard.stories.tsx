import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PremiumGateCard } from './PremiumGateCard'
import { PremiumBanner } from './PremiumBanner'

const meta: Meta<typeof PremiumGateCard> = {
  title: 'Components/Roadmap/PremiumGateCard',
  component: PremiumGateCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof PremiumGateCard>

export const Full: Story = {
  args: {
    onUpgrade: () => {},
    onDefer: () => {},
    onDecline: () => {},
  },
}

// Interactive story showing full state-machine transitions
const InteractiveGate = () => {
  const [state, setState] = useState<'full' | 'banner' | 'dismissed'>('full')

  return (
    <div className="max-w-xl p-4 bg-bg rounded-xl">
      <p className="text-small text-text-secondary mb-4">
        Current state: <strong>{state}</strong>
      </p>
      {state === 'full' && (
        <PremiumGateCard
          onUpgrade={() => alert('→ Stripe Checkout')}
          onDefer={() => setState('banner')}
          onDecline={() => setState('banner')}
        />
      )}
      {state === 'banner' && (
        <PremiumBanner
          onUpgrade={() => alert('→ Stripe Checkout')}
          onDismiss={() => setState('dismissed')}
        />
      )}
      {state === 'dismissed' && (
        <p className="text-caption text-text-tertiary">
          Gate dismissed — no premium content shown.{' '}
          <button
            onClick={() => setState('full')}
            className="text-primary underline"
          >
            Reset
          </button>
        </p>
      )}
    </div>
  )
}

export const Interactive: Story = {
  render: () => <InteractiveGate />,
}

export const BannerState: Story = {
  render: () => (
    <div className="max-w-xl p-4">
      <PremiumBanner
        onUpgrade={() => {}}
        onDismiss={() => {}}
      />
    </div>
  ),
}

export const DismissedState: Story = {
  render: () => (
    <div className="max-w-xl p-4">
      <p className="text-caption text-text-tertiary">
        Dismissed state: no gate component rendered (returns null / no output).
      </p>
    </div>
  ),
}
