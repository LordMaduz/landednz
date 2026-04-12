import { SourcePill } from './SourcePill'
import { StepsRenderer, ChecklistRenderer, AlertRenderer, PlainTextRenderer } from './ResponseRenderers'
import ReactMarkdown from 'react-markdown'
import type { ChatResponse } from '@/types/chat'


// Markdown renderer with excellent typography for skimmability
function MarkdownRenderer({ text }: { text: string }) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        components={{
          // Headers with proper hierarchy
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-3 mt-0 text-slate-900 leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-2 mt-4 text-slate-800 leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-2 mt-3 text-slate-700 leading-tight">
              {children}
            </h3>
          ),

          // Paragraphs with optimal spacing for mobile reading
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-slate-700 text-sm">
              {children}
            </p>
          ),

          // Lists with proper spacing and visual hierarchy
          ul: ({ children }) => (
            <ul className="mb-4 space-y-1.5 ml-4 list-disc marker:text-slate-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 space-y-1.5 ml-4 list-decimal marker:text-slate-500 marker:font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed text-slate-700 pl-1">
              {children}
            </li>
          ),

          // Emphasis and strong text
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="font-medium text-slate-800">{children}</em>
          ),

          // Tables with clean styling
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-slate-200 rounded-md">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 border-b border-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-slate-700 border-b border-slate-100">
              {children}
            </td>
          ),

          // Blockquotes for important information
          blockquote: ({ children }) => (
            <div className="border-l-3 border-amber-400 bg-amber-50 px-4 py-3 mb-4 rounded-r-md">
              <div className="text-sm text-amber-800">{children}</div>
            </div>
          ),

          // Code for technical terms
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-xs font-mono">
              {children}
            </code>
          ),

          // Horizontal rules for section breaks
          hr: () => (
            <hr className="border-0 border-t border-slate-200 my-6" />
          ),

          // Links with clear styling
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary hover:text-primary-hover underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

// Dynamic response renderer based on response type
function ResponseRenderer({ data, fallbackSources }: { data: ChatResponse | { type: 'markdown'; text: string }; fallbackSources?: string[] }) {
  switch (data.type) {
    case 'markdown':
      return <MarkdownRenderer text={data.text} />
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
  content: ChatResponse | { type: 'markdown'; text: string }
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