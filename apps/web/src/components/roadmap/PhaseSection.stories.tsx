import type { Meta, StoryObj } from '@storybook/react'
import { PhaseSection } from './PhaseSection'
import { MOCK_PHASES } from '@/mocks/roadmap'

const meta: Meta<typeof PhaseSection> = {
  title: 'Roadmap/PhaseSection',
  component: PhaseSection,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof PhaseSection>

export const Expanded: Story = {
  args: {
    phase: MOCK_PHASES[0],
    filter: 'all',
    defaultExpanded: true,
    onTaskClick: () => {},
  },
}

export const Collapsed: Story = {
  args: {
    phase: MOCK_PHASES[0],
    filter: 'all',
    defaultExpanded: false,
    onTaskClick: () => {},
  },
}

export const FilteredInProgress: Story = {
  args: {
    phase: MOCK_PHASES[0],
    filter: 'progress',
    defaultExpanded: true,
    onTaskClick: () => {},
  },
}