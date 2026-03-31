import type { Meta, StoryObj } from '@storybook/react'
import { Building, Building2, Mountain } from 'lucide-react'
import { QuestionView } from './QuestionView'

const CITY_OPTIONS = [
  { value: 'AUCKLAND', label: 'Auckland', desc: 'Largest city, most job opportunities', icon: Building2 },
  { value: 'WELLINGTON', label: 'Wellington', desc: 'Capital city, public sector hub', icon: Building },
  { value: 'CHRISTCHURCH', label: 'Christchurch', desc: 'South Island, lower cost of living', icon: Mountain },
]

const meta: Meta<typeof QuestionView> = {
  title: 'Onboarding/QuestionView',
  component: QuestionView,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'cream', values: [{ name: 'cream', value: '#F8F6F3' }] },
  },
}
export default meta
type Story = StoryObj<typeof QuestionView>

export const Stable: Story = {
  args: {
    question: 'Which city are you settling in?',
    subtitle: 'We\'ll prioritise tasks relevant to your location',
    options: CITY_OPTIONS,
    animState: 'stable',
    onSelect: () => {},
  },
}

export const WithSelection: Story = {
  args: {
    question: 'Which city are you settling in?',
    subtitle: 'We\'ll prioritise tasks relevant to your location',
    options: CITY_OPTIONS,
    selectedValue: 'AUCKLAND',
    animState: 'stable',
    onSelect: () => {},
  },
}

export const Entering: Story = {
  args: {
    question: 'Which city are you settling in?',
    subtitle: 'We\'ll prioritise tasks relevant to your location',
    options: CITY_OPTIONS,
    animState: 'entering',
    onSelect: () => {},
  },
}