import type { Meta, StoryObj } from '@storybook/react'
import { TaskDetail } from './TaskDetail'
import type { TaskListItem } from '@/types/web'

const meta: Meta<typeof TaskDetail> = {
  title: 'Roadmap/TaskDetail',
  component: TaskDetail,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TaskDetail>

const taskWithAllSections: TaskListItem = {
  taskId: 'T02',
  taskName: 'Get an IRD number',
  consequenceLine: 'Without this you pay emergency tax rate (45%) on all income',
  estimatedDuration: '30 min',
  phase: 1,
  cardState: 'in_progress',
  isPremium: false,
  difficulty: 'Easy',
  detail: {
    whyNow:
      "Without an IRD number your employer must deduct tax at the highest rate — 45% instead of your actual rate (likely 17.5% or 30%). That's $300–400 lost per paycheck until it's sorted.",
    steps: [
      { text: "Go to the IRD website and select 'Apply for an IRD number'" },
      { text: "Choose 'Individual' and confirm you have a valid NZ visa" },
      { text: 'Enter your passport details and NZ address' },
      { text: 'Provide your NZ bank account number' },
      { text: 'Submit — your IRD number arrives by post in 8–10 working days' },
    ],
    documents: [
      { name: 'Passport', required: true },
      { name: 'NZ visa (e-visa or label)', required: true },
      { name: 'NZ bank account number', required: true },
      { name: 'NZ address (rental or temporary)', required: true },
      { name: 'Overseas tax ID', required: false },
    ],
    source: {
      agency: 'Inland Revenue (IRD)',
      page: 'Apply for an IRD number',
      url: 'ird.govt.nz',
    },
    tips: [
      "Apply online — it's faster than the paper form.",
      "You can start work before getting your IRD number, but tell your employer as soon as it arrives.",
      "If you're on a Partner visa, you still need your own IRD number.",
    ],
  },
}

const minimalTask: TaskListItem = {
  taskId: 'T04',
  taskName: 'Get a SIM card and NZ number',
  consequenceLine: 'Most services require NZ phone number for verification',
  estimatedDuration: '30 min',
  phase: 1,
  cardState: 'not_started',
  isPremium: false,
  difficulty: 'Easy',
}

export const WithAllSections: Story = {
  args: {
    task: taskWithAllSections,
    onBack: () => alert('Back clicked'),
  },
}

export const MinimalNoOptionals: Story = {
  args: {
    task: minimalTask,
    onBack: () => alert('Back clicked'),
  },
}
