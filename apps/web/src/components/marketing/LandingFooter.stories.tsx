import type { Meta, StoryObj } from '@storybook/react'
import { LandingFooter } from './LandingFooter'

const meta: Meta<typeof LandingFooter> = {
  title: 'Marketing/LandingFooter',
  component: LandingFooter,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingFooter>

export const Default: Story = {}