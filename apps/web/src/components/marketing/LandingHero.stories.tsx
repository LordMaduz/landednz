import type { Meta, StoryObj } from '@storybook/react'
import { LandingHero } from './LandingHero'

const meta: Meta<typeof LandingHero> = {
  title: 'Marketing/LandingHero',
  component: LandingHero,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'teal', values: [{ name: 'teal', value: '#1B6B6D' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingHero>

export const Default: Story = {}