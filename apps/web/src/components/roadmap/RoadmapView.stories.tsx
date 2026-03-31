import type { Meta, StoryObj } from '@storybook/react'
import { RoadmapView } from './RoadmapView'

const meta: Meta<typeof RoadmapView> = {
  title: 'Roadmap/RoadmapView',
  component: RoadmapView,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof RoadmapView>

export const Default: Story = {}