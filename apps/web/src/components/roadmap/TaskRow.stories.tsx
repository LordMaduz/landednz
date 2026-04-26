import type { Meta, StoryObj } from '@storybook/react'
import { TaskRow } from './TaskRow'
import type { TaskListItem } from '@/types/web'

const meta: Meta<typeof TaskRow> = {
  title: 'Components/Roadmap/TaskRow',
  component: TaskRow,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof TaskRow>

const baseTask: TaskListItem = {
  taskId: 'T01',
  taskName: 'Set up your IRD number',
  consequenceLine: 'Without this, you cannot work legally in New Zealand, apply for benefits, or file tax returns.',
  estimatedDuration: '2-3 weeks',
  phase: 1,
  cardState: 'not_started',
  isPremium: false,
  difficulty: 'Medium',
}

export const NotStarted: Story = {
  args: {
    task: baseTask,
    onClick: () => {},
  },
}

export const InProgress: Story = {
  args: {
    task: {
      ...baseTask,
      cardState: 'in_progress',
    },
    onClick: () => {},
  },
}

export const Complete: Story = {
  args: {
    task: {
      ...baseTask,
      cardState: 'complete',
      completedAt: 'Mar 15',
    },
    onClick: () => {},
  },
}

export const Blocked: Story = {
  args: {
    task: {
      ...baseTask,
      cardState: 'blocked',
      blockedBy: {
        taskId: 'T02',
        taskName: 'Gather identity documents',
      },
    },
    onClick: () => {},
  },
}

export const PremiumLocked: Story = {
  args: {
    task: {
      ...baseTask,
      taskId: 'T18',
      taskName: 'Optimize your tax position',
      consequenceLine: 'Strategic tax planning can save thousands annually. Our experts guide you through NZ-specific optimizations.',
      cardState: 'premium_locked',
      isPremium: true,
      phase: 3,
    },
    onClick: () => {},
  },
}

export const Loading: Story = {
  args: {
    task: {
      ...baseTask,
      cardState: 'loading',
    },
    onClick: () => {},
  },
}

export const Error: Story = {
  args: {
    task: {
      ...baseTask,
      cardState: 'error',
    },
    onClick: () => {},
  },
}

export const PriorityCard: Story = {
  args: {
    task: baseTask,
    priority: true,
    onClick: () => {},
  },
}

export const JustCompleted: Story = {
  args: {
    task: {
      ...baseTask,
      cardState: 'complete',
      completedAt: 'Mar 15',
    },
    justCompleted: true,
    onClick: () => {},
  },
}

export const IsNextHighlighted: Story = {
  args: {
    task: baseTask,
    isNextHighlighted: true,
    onClick: () => {},
  },
}