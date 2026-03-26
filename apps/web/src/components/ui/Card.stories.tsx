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

const CardContent = (
  <div>
    <h3 className="text-h3 text-text-primary mb-1">Card Title</h3>
    <p className="text-body text-text-secondary">Card body text with some supporting content to show the real UI/UX presentation.</p>
  </div>
)

export const Default: Story = {
  args: {
    children: CardContent,
  },
}

export const Hover: Story = {
  args: {
    state: 'hover',
    children: CardContent,
  },
}

export const Selected: Story = {
  args: {
    state: 'selected',
    children: CardContent,
  },
}

export const Error: Story = {
  args: {
    state: 'error',
    children: CardContent,
  },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      {(['default', 'hover', 'selected', 'error'] as const).map((state) => (
        <Card key={state} state={state}>
          <p className="text-caption text-text-tertiary uppercase tracking-wide mb-1">{state} state</p>
          <h3 className="text-h3 text-text-primary mb-1">Card Title</h3>
          <p className="text-body text-text-secondary">Sample content showing {state} styling.</p>
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
          <p className="text-caption text-text-tertiary uppercase tracking-wide mb-1">{padding} padding</p>
          <h3 className="text-h3 text-text-primary mb-1">Card Title</h3>
          <p className="text-body text-text-secondary">Content with {padding} padding variant.</p>
        </Card>
      ))}
    </div>
  ),
}