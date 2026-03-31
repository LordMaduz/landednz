import type { Meta, StoryObj } from '@storybook/react'
import { LandingSocialProof } from './LandingSocialProof'

const meta: Meta<typeof LandingSocialProof> = {
  title: 'Marketing/LandingSocialProof',
  component: LandingSocialProof,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof LandingSocialProof>

export const Default: Story = {}