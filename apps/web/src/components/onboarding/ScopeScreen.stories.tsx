import type { Meta, StoryObj } from '@storybook/react'
import { ScopeScreen } from './ScopeScreen'

const meta: Meta<typeof ScopeScreen> = {
  title: 'Onboarding/ScopeScreen',
  component: ScopeScreen,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof ScopeScreen>

export const Default: Story = {
  args: { onStart: () => {} },
}