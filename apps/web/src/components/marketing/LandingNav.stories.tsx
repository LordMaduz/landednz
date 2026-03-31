import type { Meta, StoryObj } from '@storybook/react'
import { LandingNav } from './LandingNav'

const meta: Meta<typeof LandingNav> = {
  title: 'Marketing/LandingNav',
  component: LandingNav,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'teal', values: [{ name: 'teal', value: '#1B6B6D' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingNav>

export const Default: Story = {}