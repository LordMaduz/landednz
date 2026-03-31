import type { Meta, StoryObj } from '@storybook/react'
import { LandingFinalCTA } from './LandingFinalCTA'

const meta: Meta<typeof LandingFinalCTA> = {
  title: 'Marketing/LandingFinalCTA',
  component: LandingFinalCTA,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'teal', values: [{ name: 'teal', value: '#1B6B6D' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingFinalCTA>

export const Default: Story = {}