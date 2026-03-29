import type { Meta, StoryObj } from '@storybook/react'
import { HeroCard } from './HeroCard'
import type { TaskListItem } from '@/types/web'

const meta: Meta<typeof HeroCard> = {
  title: 'Roadmap/HeroCard',
  component: HeroCard,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'light' },
  },
}

export default meta
type Story = StoryObj<typeof HeroCard>

const makeTask = (
  id: string,
  state: TaskListItem['cardState']
): TaskListItem => ({
  taskId: id,
  taskName: `Task ${id}`,
  consequenceLine: 'Consequence line',
  estimatedDuration: '30 min',
  phase: 1,
  cardState: state,
  isPremium: false,
})

export const Empty: Story = {
  args: {
    tasks: [
      makeTask('T01', 'not_started'),
      makeTask('T02', 'not_started'),
      makeTask('T03', 'not_started'),
    ],
    userName: 'Priya',
  },
}

export const InProgress: Story = {
  args: {
    tasks: [
      makeTask('T01', 'complete'),
      makeTask('T02', 'complete'),
      makeTask('T03', 'in_progress'),
      makeTask('T04', 'not_started'),
      makeTask('T05', 'not_started'),
      makeTask('T06', 'not_started'),
    ],
    userName: 'Priya',
  },
}

export const MostlyDone: Story = {
  args: {
    tasks: [
      makeTask('T01', 'complete'),
      makeTask('T02', 'complete'),
      makeTask('T03', 'complete'),
      makeTask('T04', 'complete'),
      makeTask('T05', 'complete'),
      makeTask('T06', 'in_progress'),
      makeTask('T07', 'not_started'),
      makeTask('T08', 'not_started'),
      makeTask('T09', 'not_started'),
    ],
    userName: 'Priya',
  },
}

export const Complete: Story = {
  args: {
    tasks: [
      makeTask('T01', 'complete'),
      makeTask('T02', 'complete'),
      makeTask('T03', 'complete'),
    ],
    userName: 'Alex',
  },
}
