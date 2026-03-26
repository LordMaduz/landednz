import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  args: {
    value: 50,
    size: 'sm',
    label: 'Loading progress',
  },
}

export const Empty: Story = {
  args: {
    value: 0,
    label: 'No progress',
  },
}

export const Full: Story = {
  args: {
    value: 100,
    label: 'Complete',
  },
}

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    label: 'Loading...',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 w-80">
      <div>
        <p className="text-secondary mb-2">Small (4px)</p>
        <ProgressBar value={65} size="sm" label="Small progress bar" />
      </div>
      <div>
        <p className="text-secondary mb-2">Medium (8px)</p>
        <ProgressBar value={65} size="md" label="Medium progress bar" />
      </div>
    </div>
  ),
}

export const Interactive: Story = {
  args: {
    value: 40,
    size: 'sm',
    label: 'Interactive progress',
  },
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['sm', 'md'],
      },
    },
    indeterminate: {
      control: 'boolean',
    },
  },
}