import type { Meta, StoryObj } from '@storybook/react'
import { AuthCard } from './AuthCard'

const meta: Meta<typeof AuthCard> = {
  title: 'Auth/AuthCard',
  component: AuthCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'cream',
      values: [{ name: 'cream', value: '#F8F6F3' }],
    },
  },
}

export default meta
type Story = StoryObj<typeof AuthCard>

export const Default: Story = {
  name: 'Main (default)',
  args: {
    initialMode: 'main',
  },
}

export const EmailExpanded: Story = {
  name: 'Email Expanded',
  args: {
    initialMode: 'email',
  },
}

export const GoogleLoading: Story = {
  name: 'Google Loading',
  args: {
    initialMode: 'google_loading',
  },
}

export const MagicLinkSent: Story = {
  name: 'Magic Link Sent',
  args: {
    initialMode: 'magic_sent',
    initialEmail: 'alex.chen@example.com',
  },
}
