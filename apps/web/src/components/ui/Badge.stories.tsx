import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
}

export default meta

type Story = StoryObj<typeof Badge>

export const Phase: Story = {
  args: {
    variant: 'phase',
    children: 'Phase 1',
  },
}

export const DifficultyEasy: Story = {
  args: {
    variant: 'difficulty-easy',
    children: 'Easy',
  },
}

export const DifficultyMedium: Story = {
  args: {
    variant: 'difficulty-medium',
    children: 'Medium',
  },
}

export const DifficultyHard: Story = {
  args: {
    variant: 'difficulty-hard',
    children: 'Hard',
  },
}

export const Premium: Story = {
  args: {
    variant: 'premium',
    children: 'Premium',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Badge variant="phase">Phase 1</Badge>
      <Badge variant="difficulty-easy">Easy</Badge>
      <Badge variant="difficulty-medium">Medium</Badge>
      <Badge variant="difficulty-hard">Hard</Badge>
      <Badge variant="premium">Premium</Badge>
    </div>
  ),
}
