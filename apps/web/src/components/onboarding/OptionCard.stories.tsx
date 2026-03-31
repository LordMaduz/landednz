import type { Meta, StoryObj } from '@storybook/react'
import { Building2 } from 'lucide-react'
import { OptionCard } from './OptionCard'

const meta: Meta<typeof OptionCard> = {
  title: 'Onboarding/OptionCard',
  component: OptionCard,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof OptionCard>

export const Unselected: Story = {
  args: {
    value: 'AUCKLAND',
    label: 'Auckland',
    description: 'New Zealand\'s largest city',
    icon: Building2,
    isSelected: false,
    onClick: () => {},
  },
}

export const Selected: Story = {
  args: {
    value: 'AUCKLAND',
    label: 'Auckland',
    description: 'New Zealand\'s largest city',
    icon: Building2,
    isSelected: true,
    onClick: () => {},
  },
}

export const Compact: Story = {
  args: {
    value: 'AUCKLAND',
    label: 'Auckland',
    icon: Building2,
    isSelected: false,
    isCompact: true,
    onClick: () => {},
  },
}

export const CompactSelected: Story = {
  args: {
    value: 'AUCKLAND',
    label: 'Auckland',
    icon: Building2,
    isSelected: true,
    isCompact: true,
    onClick: () => {},
  },
}