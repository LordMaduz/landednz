import type { Meta, StoryObj } from '@storybook/react'
import { ChatPanel } from './ChatPanel'
import { ChatWidget } from './ChatWidget'

const meta: Meta<typeof ChatPanel> = {
  title: 'Chat/ChatPanel',
  component: ChatPanel,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F8F6F3' },
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof ChatPanel>

export const OpenWithConversation: Story = {
  args: {
    onClose: () => alert('Chat closed'),
    entryContext: 'TASK_CARD',
  },
}

export const ThinkingState: Story = {
  args: {
    onClose: () => alert('Chat closed'),
    entryContext: 'ROADMAP',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the thinking indicator state during AI processing.',
      },
    },
  },
}

// Story for the FAB button using ChatWidget
const ChatWidgetMeta: Meta<typeof ChatWidget> = {
  title: 'Chat/ChatWidget',
  component: ChatWidget,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F8F6F3' },
      ],
    },
  },
}

type ChatWidgetStory = StoryObj<typeof ChatWidget>

export const ClosedFAB: ChatWidgetStory = {
  parameters: {
    docs: {
      description: {
        story: 'Shows the floating action button when chat is closed.',
      },
    },
  },
}

// Export ChatWidget meta for the FAB story
export { ChatWidgetMeta }