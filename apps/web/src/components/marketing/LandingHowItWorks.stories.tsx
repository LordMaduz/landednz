import type { Meta, StoryObj } from '@storybook/react'
import { LandingHowItWorks } from './LandingHowItWorks'

const meta: Meta<typeof LandingHowItWorks> = {
  title: 'Marketing/LandingHowItWorks',
  component: LandingHowItWorks,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingHowItWorks>

export const Default: Story = {}