import type { Meta, StoryObj } from '@storybook/react'
import { PremiumBanner } from './PremiumBanner'

const meta: Meta<typeof PremiumBanner> = {
  title: 'Roadmap/PremiumBanner',
  component: PremiumBanner,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof PremiumBanner>

export const Default: Story = {
  args: {
    onUpgrade: () => {},
    onDismiss: () => {},
  },
}