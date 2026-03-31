import type { Meta, StoryObj } from '@storybook/react'
import { MobileNav } from './MobileNav'

const meta: Meta<typeof MobileNav> = {
  title: 'Layout/MobileNav',
  component: MobileNav,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'app', values: [{ name: 'app', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof MobileNav>

export const Default: Story = {}