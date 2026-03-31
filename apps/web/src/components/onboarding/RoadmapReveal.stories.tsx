import type { Meta, StoryObj } from '@storybook/react'
import { RoadmapReveal } from './RoadmapReveal'

const meta: Meta<typeof RoadmapReveal> = {
  title: 'Onboarding/RoadmapReveal',
  component: RoadmapReveal,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof RoadmapReveal>

export const Default: Story = {
  args: {
    answers: {
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'SOLO',
    },
  },
}

export const WithFamily: Story = {
  args: {
    answers: {
      visaType: 'GREEN_LIST_WORK',
      city: 'WELLINGTON',
      familySituation: 'FAMILY_WITH_CHILDREN',
    },
  },
}