import type { Meta, StoryObj } from '@storybook/react'
import type { FilterValue } from '@/types/web'
import { FilterTabs } from './FilterTabs'

const meta: Meta<typeof FilterTabs> = {
  title: 'Roadmap/FilterTabs',
  component: FilterTabs,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof FilterTabs>

export const AllActive: Story = {
  args: { active: 'all' as FilterValue, onChange: () => {} },
}

export const TodoActive: Story = {
  args: { active: 'todo' as FilterValue, onChange: () => {} },
}

export const InProgressActive: Story = {
  args: { active: 'progress' as FilterValue, onChange: () => {} },
}

export const DoneActive: Story = {
  args: { active: 'done' as FilterValue, onChange: () => {} },
}