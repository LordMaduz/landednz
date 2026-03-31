import type { Meta, StoryObj } from '@storybook/react'
import { DeleteModal } from './DeleteModal'

const meta: Meta<typeof DeleteModal> = {
  title: 'Settings/DeleteModal',
  component: DeleteModal,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof DeleteModal>

export const Open: Story = {
  args: {
    open: true,
    onClose: () => {},
    onConfirm: () => {},
  },
}