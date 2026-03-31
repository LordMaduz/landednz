import type { Meta, StoryObj } from '@storybook/react'
import { RadioOption } from './RadioOption'

const meta: Meta<typeof RadioOption> = {
  title: 'Settings/RadioOption',
  component: RadioOption,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof RadioOption>

export const Selected: Story = {
  args: {
    value: 'weekly',
    label: 'Weekly digest',
    description: 'One email per week with your top tasks',
    checked: true,
    onChange: () => {},
  },
}

export const Unselected: Story = {
  args: {
    value: 'daily',
    label: 'Daily nudge',
    description: 'A short reminder every morning',
    checked: false,
    onChange: () => {},
  },
}