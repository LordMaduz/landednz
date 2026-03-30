import { SourcePill } from './SourcePill'
import { StepsRenderer, ChecklistRenderer, AlertRenderer, PlainTextRenderer } from './ResponseRenderers'
import type { ChatResponse } from '@/types/chat'


// Dynamic response renderer based on response type
function ResponseRenderer({ data, fallbackSources }: { data: ChatResponse; fallbackSources?: string[] }) {
  switch (data.type) {
    case 'steps':
      return <StepsRenderer data={data} />
    case 'checklist':
      return <ChecklistRenderer data={data} />
    case 'alert':
      return <AlertRenderer data={data} />
    case 'plain':
      return <PlainTextRenderer data={data} />
    default:
      return <PlainTextRenderer data={{ type: 'plain', text: 'Response format not supported' }} />
  }
}

interface UserMessageProps {
  variant: 'user'
  content: string
  sources?: string[]
  timestamp?: string
}

interface AIMessageProps {
  variant: 'ai'
  content: ChatResponse
  sources?: string[]
  timestamp?: string
}

type ChatMessageProps = UserMessageProps | AIMessageProps

export function ChatMessage(props: ChatMessageProps) {
  if (props.variant === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-primary-light border border-primary/15 text-small leading-body text-text-primary px-3.5 py-2.5 rounded-tl-button rounded-br-button rounded-bl-button max-w-[80%]">
          {props.content}
        </div>
      </div>
    )
  }

  const { content, sources, timestamp } = props

  return (
    <div className="flex gap-2.5 items-start mb-4">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0 max-w-[88%]">
        {/* Message bubble */}
        <div className="bg-bg-card border border-border text-small leading-body px-4 py-3.5 rounded-tr-button rounded-br-button rounded-bl-button">
          <ResponseRenderer data={content} fallbackSources={sources} />

          {/* Source footer */}
          {sources && sources.length > 0 && (
            <div className="border-t border-border mt-3 pt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-caption font-medium text-text-tertiary">
                Sources:
              </span>
              {sources.map((source, i) => (
                <SourcePill key={i} name={source} />
              ))}
            </div>
          )}
        </div>

        {/* Attribution */}
        <div className="mt-1.5">
          <span className="text-caption text-text-tertiary">
            LandedNZ · AI Advisor · {timestamp || 'Just now'}
          </span>
        </div>
      </div>
    </div>
  )
}