import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'padded',
  },
  args: {
    content: 'This is a helpful tooltip',
  },
}

export default meta

type Story = StoryObj<typeof Tooltip>

export const Top: Story = {
  args: {
    position: 'top',
    content: 'Tooltip appears above',
    children: (
      <button className="px-4 py-2 bg-primary text-text-inverse rounded-button">
        Hover me (Top)
      </button>
    ),
  },
}

export const Bottom: Story = {
  args: {
    position: 'bottom',
    content: 'Tooltip appears below',
    children: (
      <button className="px-4 py-2 bg-primary text-text-inverse rounded-button">
        Hover me (Bottom)
      </button>
    ),
  },
}

export const Left: Story = {
  args: {
    position: 'left',
    content: 'Tooltip appears on the left',
    children: (
      <button className="px-4 py-2 bg-primary text-text-inverse rounded-button">
        Hover me (Left)
      </button>
    ),
  },
}

export const Right: Story = {
  args: {
    position: 'right',
    content: 'Tooltip appears on the right',
    children: (
      <button className="px-4 py-2 bg-primary text-text-inverse rounded-button">
        Hover me (Right)
      </button>
    ),
  },
}

export const AllPositions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8 place-items-center">
      <Tooltip content="Top position" position="top">
        <button className="px-4 py-2 bg-secondary text-text-primary rounded-button">
          Top
        </button>
      </Tooltip>
      <Tooltip content="Bottom position" position="bottom">
        <button className="px-4 py-2 bg-secondary text-text-primary rounded-button">
          Bottom
        </button>
      </Tooltip>
      <Tooltip content="Left position" position="left">
        <button className="px-4 py-2 bg-secondary text-text-primary rounded-button">
          Left
        </button>
      </Tooltip>
      <Tooltip content="Right position" position="right">
        <button className="px-4 py-2 bg-secondary text-text-primary rounded-button">
          Right
        </button>
      </Tooltip>
    </div>
  ),
}

export const WithControls: Story = {
  args: {
    position: 'top',
    content: 'Interactive tooltip content',
    children: (
      <button className="px-4 py-2 bg-primary text-text-inverse rounded-button">
        Hover me
      </button>
    ),
  },
  argTypes: {
    position: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
    },
    content: {
      control: { type: 'text' },
    },
  },
}

export const LongContent: Story = {
  args: {
    position: 'top',
    content: 'This is a longer tooltip with multiple words to demonstrate wrapping behavior',
    children: (
      <button className="px-4 py-2 bg-success text-text-inverse rounded-button">
        Long tooltip
      </button>
    ),
  },
}