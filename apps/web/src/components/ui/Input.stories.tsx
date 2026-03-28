import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj<typeof Input>

export const Text: Story = {
  args: {
    variant: 'text',
    label: 'Full name',
    placeholder: 'Enter your full name',
  },
}

export const Textarea: Story = {
  args: {
    variant: 'textarea',
    label: 'Message',
    placeholder: 'Ask me anything about settling in New Zealand...',
    rows: 3,
  },
}

export const WithError: Story = {
  args: {
    variant: 'text',
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
    value: 'not-an-email',
    error: 'Please enter a valid email address',
    onChange: () => {},
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Input
        variant="text"
        label="Full name (disabled)"
        placeholder="Enter your full name"
        value="Jane Smith"
        disabled
        onChange={() => {}}
      />
      <Input
        variant="textarea"
        label="Message (disabled)"
        placeholder="Ask me anything..."
        value="This field is disabled."
        disabled
        rows={3}
        onChange={() => {}}
      />
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 max-w-sm">
      <div>
        <p className="text-caption text-text-tertiary mb-2">Default</p>
        <Input
          variant="text"
          label="Email"
          placeholder="you@example.com"
          type="email"
        />
      </div>
      <div>
        <p className="text-caption text-text-tertiary mb-2">With value</p>
        <Input
          variant="text"
          label="Email"
          value="jane@example.com"
          type="email"
          onChange={() => {}}
        />
      </div>
      <div>
        <p className="text-caption text-text-tertiary mb-2">Error state</p>
        <Input
          variant="text"
          label="Email"
          value="not-an-email"
          type="email"
          error="Please enter a valid email address"
          onChange={() => {}}
        />
      </div>
      <div>
        <p className="text-caption text-text-tertiary mb-2">Disabled</p>
        <Input
          variant="text"
          label="Email"
          value="jane@example.com"
          type="email"
          disabled
          onChange={() => {}}
        />
      </div>
      <div>
        <p className="text-caption text-text-tertiary mb-2">No label</p>
        <Input
          variant="text"
          placeholder="Search..."
        />
      </div>
    </div>
  ),
}

export const AutoExpanding: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setV] = React.useState('')
    return (
      <div className="max-w-sm">
        <Input
          variant="textarea"
          label="Auto-expanding message"
          placeholder="Start typing — textarea expands up to 72px..."
          autoExpand
          value={value}
          onChange={(e) => setV(e.target.value)}
        />
        <p className="text-caption text-text-tertiary mt-2">
          Height range: 24px – 72px
        </p>
      </div>
    )
  },
}

export const EmailType: Story = {
  args: {
    variant: 'text',
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email',
    autoComplete: 'email',
  },
}

export const PasswordType: Story = {
  args: {
    variant: 'text',
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    autoComplete: 'current-password',
  },
}
