import type { Meta, StoryObj } from '@storybook/react'
import { BetaAccessCard } from './BetaAccessCard'

const meta: Meta<typeof BetaAccessCard> = {
  title: 'Components/Roadmap/BetaAccessCard',
  component: BetaAccessCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Beta access card displayed in Phase 3 to inform users about beta status and free access to all premium features.',
      },
    },
  },
  argTypes: {
    onDismiss: { action: 'dismissed' },
  },
}

export default meta
type Story = StoryObj<typeof BetaAccessCard>

export const Default: Story = {
  render: () => (
    <div className="max-w-lg mx-auto bg-bg-sidebar p-6">
      <BetaAccessCard onDismiss={() => {}} />
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    onDismiss: () => console.log('Beta card dismissed'),
  },
  render: (args) => (
    <div className="max-w-lg mx-auto bg-bg-sidebar p-6">
      <BetaAccessCard {...args} />
    </div>
  ),
}