import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj<typeof Skeleton>

export const TextLine: Story = {
  args: {
    variant: 'text-line',
  },
}

export const Card: Story = {
  args: {
    variant: 'card',
  },
}

export const Circle: Story = {
  args: {
    variant: 'circle',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4 w-80">
      <div>
        <p className="text-secondary mb-2">Text line</p>
        <Skeleton variant="text-line" />
      </div>
      <div>
        <p className="text-secondary mb-2">Card</p>
        <Skeleton variant="card" />
      </div>
      <div>
        <p className="text-secondary mb-2">Circle</p>
        <Skeleton variant="circle" />
      </div>
    </div>
  ),
}

export const ReducedMotion: Story = {
  parameters: {
    chromatic: { prefersReducedMotion: 'reduce' },
  },
  render: () => (
    <div className="flex flex-col gap-6 p-4 w-80">
      <p className="text-secondary text-caption">
        Pulse disabled with prefers-reduced-motion
      </p>
      <div>
        <p className="text-secondary mb-2">Text line (static)</p>
        <Skeleton variant="text-line" />
      </div>
      <div>
        <p className="text-secondary mb-2">Card (static)</p>
        <Skeleton variant="card" />
      </div>
      <div>
        <p className="text-secondary mb-2">Circle (static)</p>
        <Skeleton variant="circle" />
      </div>
    </div>
  ),
}

export const ComposedExample: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4 w-80">
      <p className="text-secondary mb-2">Task card loading placeholder</p>
      <div className="flex items-start gap-3">
        <Skeleton variant="circle" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton variant="text-line" height="h-4" />
          <Skeleton variant="text-line" width="w-3/4" height="h-3" />
          <Skeleton variant="text-line" width="w-1/2" height="h-3" />
        </div>
      </div>
    </div>
  ),
}
