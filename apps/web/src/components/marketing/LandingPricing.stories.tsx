import type { Meta, StoryObj } from '@storybook/react'
import { LandingPricing } from './LandingPricing'

const meta: Meta<typeof LandingPricing> = {
  title: 'Marketing/LandingPricing',
  component: LandingPricing,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingPricing>

export const Default: Story = {}