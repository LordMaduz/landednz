import type { Meta, StoryObj } from '@storybook/react'
import { SettingsView } from './SettingsView'

const meta: Meta<typeof SettingsView> = {
  title: 'Settings/SettingsView',
  component: SettingsView,
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof SettingsView>

export const Default: Story = {}

export const NotificationsOff: Story = {
  args: {
    initialEmailRemindersOn: false,
  },
}

export const DeleteModalOpen: Story = {
  args: {
    initialDeleteModalOpen: true,
  },
}