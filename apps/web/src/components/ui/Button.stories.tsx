import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'text', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: { variant: 'primary', children: 'Mark as done' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Save progress' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Cancel' },
}

export const Text: Story = {
  args: { variant: 'text', children: 'Delete account' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete my account' },
}

export const SizeSm: Story = {
  args: { size: 'sm', children: 'Small' },
}

export const SizeLg: Story = {
  args: { size: 'lg', children: 'Build my plan — free' },
}

export const Loading: Story = {
  args: { loading: true, children: 'Saving...' },
}

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
}

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Full width CTA' },
  parameters: { layout: 'padded' },
}

// Gallery — shows all 5 variants × 3 sizes for visual reference
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6 bg-bg">
      {(['primary', 'secondary', 'outline', 'text', 'destructive'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} variant={variant} size={size}>
              {variant} {size}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { layout: 'fullscreen' },
}