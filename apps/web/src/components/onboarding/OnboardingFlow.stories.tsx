import type { Meta, StoryObj } from '@storybook/react'
import { OnboardingFlow } from './OnboardingFlow'

const meta: Meta<typeof OnboardingFlow> = {
  title: 'Onboarding/OnboardingFlow',
  component: OnboardingFlow,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof OnboardingFlow>

export const Default: Story = {}