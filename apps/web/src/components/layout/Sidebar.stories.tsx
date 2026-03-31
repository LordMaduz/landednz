import type { Meta, StoryObj } from '@storybook/react'
import { Sidebar } from './Sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'app', values: [{ name: 'app', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {}