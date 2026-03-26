import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    children: 'Default card content',
  },
}

export const Hover: Story = {
  args: {
    state: 'hover',
    children: 'Hover card content',
  },
}

export const Selected: Story = {
  args: {
    state: 'selected',
    children: 'Selected card content',
  },
}

export const Error: Story = {
  args: {
    state: 'error',
    children: 'Error card content',
  },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      {(['default', 'hover', 'selected', 'error'] as const).map((state) => (
        <Card key={state} state={state}>
          {state} state
        </Card>
      ))}
    </div>
  ),
}

export const AllPaddingVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      {(['compact', 'default', 'spacious'] as const).map((padding) => (
        <Card key={padding} padding={padding}>
          {padding} padding
        </Card>
      ))}
    </div>
  ),
}