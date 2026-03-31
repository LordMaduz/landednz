import type { Meta, StoryObj } from '@storybook/react'
import { LandingProblemStatement } from './LandingProblemStatement'

const meta: Meta<typeof LandingProblemStatement> = {
  title: 'Marketing/LandingProblemStatement',
  component: LandingProblemStatement,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingProblemStatement>

export const Default: Story = {}