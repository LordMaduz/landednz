import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Settings/Toggle',
  component: Toggle,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof Toggle>

export const On: Story = {
  args: {
    checked: true,
    label: 'Email reminders',
    id: 'email-reminders',
    description: 'Weekly settlement task nudges',
    onChange: () => {},
  },
}

export const Off: Story = {
  args: {
    checked: false,
    label: 'Email reminders',
    id: 'email-reminders',
    description: 'Weekly settlement task nudges',
    onChange: () => {},
  },
}

export const WithoutDescription: Story = {
  args: {
    checked: true,
    label: 'Notifications',
    id: 'notifications',
    onChange: () => {},
  },
}