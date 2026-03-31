import type { Meta, StoryObj } from '@storybook/react'
import { OnboardingProgressBar } from './OnboardingProgressBar'

const meta: Meta<typeof OnboardingProgressBar> = {
  title: 'Onboarding/OnboardingProgressBar',
  component: OnboardingProgressBar,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof OnboardingProgressBar>

export const Step1of5: Story = {
  args: { current: 0, total: 5 },
}

export const Step3of5: Story = {
  args: { current: 2, total: 5 },
}

export const Complete: Story = {
  args: { current: 4, total: 5 },
}