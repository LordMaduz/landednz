import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'hover', 'selected', 'error'],
    },
    padding: {
      control: 'select',
      options: ['compact', 'default', 'spacious'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Card>

const SampleContent = () => (
  <>
    <h3 className="text-h3 text-text-primary mb-1">Card Title</h3>
    <p className="text-body text-text-secondary">Card body text with some supporting content.</p>
  </>
)

export const Default: Story = {
  args: {
    state: 'default',
    padding: 'default',
    children: <SampleContent />,
  },
}

export const Hover: Story = {
  args: {
    state: 'hover',
    padding: 'default',
    children: <SampleContent />,
  },
}

export const Selected: Story = {
  args: {
    state: 'selected',
    padding: 'default',
    children: <SampleContent />,
  },
}

export const Error: Story = {
  args: {
    state: 'error',
    padding: 'default',
    children: <SampleContent />,
  },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      {(['default', 'hover', 'selected', 'error'] as const).map((state) => (
        <Card key={state} state={state}>
          <p className="text-caption text-text-tertiary uppercase tracking-wide mb-1">{state}</p>
          <SampleContent />
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
          <p className="text-caption text-text-tertiary uppercase tracking-wide mb-1">
            padding: {padding}
          </p>
          <SampleContent />
        </Card>
      ))}
    </div>
  ),
}
