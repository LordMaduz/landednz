import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StatusIndicator } from './StatusIndicator'

const meta: Meta<typeof StatusIndicator> = {
  title: 'UI/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj<typeof StatusIndicator>

// Individual state stories
export const NotStarted: Story = {
  args: {
    state: 'not_started',
    size: 'md',
  },
}

export const InProgress: Story = {
  args: {
    state: 'in_progress',
    size: 'md',
  },
}

export const Complete: Story = {
  args: {
    state: 'complete',
    size: 'md',
  },
}

export const Blocked: Story = {
  args: {
    state: 'blocked',
    size: 'md',
  },
}

export const PremiumLocked: Story = {
  args: {
    state: 'premium_locked',
    size: 'md',
  },
}

export const Loading: Story = {
  args: {
    state: 'loading',
    size: 'md',
  },
}

export const Error: Story = {
  args: {
    state: 'error',
    size: 'md',
  },
}

// Grid of all states at md size with labels
export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-7 gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="not_started" />
        <p className="text-caption text-center">not_started</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="in_progress" />
        <p className="text-caption text-center">in_progress</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="complete" />
        <p className="text-caption text-center">complete</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="blocked" />
        <p className="text-caption text-center">blocked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="premium_locked" />
        <p className="text-caption text-center">premium_locked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="loading" />
        <p className="text-caption text-center">loading</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="error" />
        <p className="text-caption text-center">error</p>
      </div>
    </div>
  ),
}

// All states at sm size
export const SmallSize: Story = {
  render: () => (
    <div className="grid grid-cols-7 gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="not_started" size="sm" />
        <p className="text-caption text-center">not_started</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="in_progress" size="sm" />
        <p className="text-caption text-center">in_progress</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="complete" size="sm" />
        <p className="text-caption text-center">complete</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="blocked" size="sm" />
        <p className="text-caption text-center">blocked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="premium_locked" size="sm" />
        <p className="text-caption text-center">premium_locked</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="loading" size="sm" />
        <p className="text-caption text-center">loading</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusIndicator state="error" size="sm" />
        <p className="text-caption text-center">error</p>
      </div>
    </div>
  ),
}

// Side-by-side sm + md for all states
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {(['not_started', 'in_progress', 'complete', 'blocked', 'premium_locked', 'loading', 'error'] as const).map(state => (
        <div key={state} className="flex items-center gap-4">
          <div className="w-24 text-caption">{state.replace(/_/g, ' ')}</div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <StatusIndicator state={state} size="sm" />
              <span className="text-caption">sm</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <StatusIndicator state={state} size="md" />
              <span className="text-caption">md</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}