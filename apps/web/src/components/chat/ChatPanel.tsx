'use client'

import { useState, useEffect, useRef } from 'react'
import type { ChatEntryPoint } from '@landednz/types'
import type { ChatResponse } from '@/types/chat'
import { ChatMessage } from './ChatMessage'
import { ThinkingIndicator } from './ThinkingIndicator'
import { createChatSession, streamChat } from '@/lib/api'
import { parseResponse, cleanStreamingText } from '@/lib/chat-parser'

interface UserMessage {
  id: string
  variant: 'user'
  content: string
  timestamp: string
}

interface AIMessage {
  id: string
  variant: 'ai'
  content: ChatResponse        // full union, not just plain
  sources?: string[]           // top-level — ChatMessage reads this for source footer
  timestamp: string
}

type Message = UserMessage | AIMessage

interface ChatPanelProps {
  onClose: () => void
  entryContext?: ChatEntryPoint
  token: string | null
}

export function ChatPanel({ onClose, entryContext, token }: ChatPanelProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [sessionError, setSessionError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialise chat session on mount — get sessionId + personalised opening message from API
  useEffect(() => {
    async function initSession() {
      if (!token) {
        setSessionError('Authentication required. Please sign in again.')
        return
      }

      try {
        const result = await createChatSession(entryContext ?? 'ROADMAP', token)
        setSessionId(result.sessionId)
        setMessages([{
          id: '1',
          variant: 'ai',
          content: { type: 'plain', text: result.openingMessage },
          timestamp: 'Just now',
        }])
      } catch (error: unknown) {
        const status = (error as { status?: number }).status
        if (status === 403) {
          setSessionError('Chat requires a premium subscription. Upgrade to access the AI advisor.')
        } else {
          setSessionError('Failed to start chat session. Please try again.')
        }
      }
    }

    initSession()
  }, [entryContext, token])

  // Auto-scroll when messages or streaming text changes
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement
    if (!container) return
    const isAtBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 50
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, streamingText, isStreaming])

  // Accumulate streaming text in a ref so onDone closure sees the final value
  const streamingTextRef = useRef('')

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isStreaming || !token) return

    const userMessage: Message = {
      id: Date.now().toString(),
      variant: 'user',
      content: input.trim(),
      timestamp: 'Just now',
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    setStreamingText('')
    streamingTextRef.current = ''

    // Create message ID that we'll use for both initial and structured response
    const aiMessageId = `ai-${Date.now()}`

    await streamChat(
      sessionId,
      userMessage.content,
      token,
      (text: string) => {
        streamingTextRef.current += text
        setStreamingText(streamingTextRef.current)
      },
      () => {
        // Initial response - use fallback parsing for immediate display
        const { content, sources } = parseResponse(streamingTextRef.current)
        setMessages(prev => [...prev, {
          id: aiMessageId,
          variant: 'ai',
          content,
          sources: sources.length > 0 ? sources : undefined,
          timestamp: 'Just now',
        }])
        setIsStreaming(false)
        setStreamingText('')
        streamingTextRef.current = ''
      },
      (errorMessage: string) => {
        setMessages(prev => [...prev, {
          id: aiMessageId,
          variant: 'ai',
          content: { type: 'plain', text: `Sorry, something went wrong: ${errorMessage}` },
          timestamp: 'Just now',
        }])
        setIsStreaming(false)
        setStreamingText('')
        streamingTextRef.current = ''
      },
      (structuredJson: string) => {
        // Structured response arrived - replace the message with clean structure
        try {
          const { content, sources } = parseResponse(structuredJson)
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content,
                  sources: sources.length > 0 ? sources : undefined,
                }
              : msg
          ))
        } catch (error) {
          console.warn('Failed to parse structured response:', error)
          // Keep the original fallback response
        }
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-0 right-0 w-full h-chat-panel-mobile md:bottom-6 md:right-6 md:w-chat-panel md:h-chat-panel bg-bg-card rounded-t-chat-panel md:rounded-chat-panel border border-border shadow-chat-panel flex flex-col z-[1000] chat-panel-enter">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        <div className="flex-1">
          <div className="text-small font-semibold text-text-primary">LandedNZ Advisor</div>
          <div className="text-caption text-text-tertiary">AI-powered · Based on official NZ sources</div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg border border-border bg-transparent flex items-center justify-center hover:bg-bg transition-colors"
          aria-label="Close chat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              className="text-text-tertiary"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0" style={{ height: 0 }}>
        {sessionError ? (
          <div className="p-4">
            <div className="bg-error-light border border-error rounded-button px-4 py-3">
              <p className="text-small text-text-primary">{sessionError}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <ChatMessage key={msg.id} {...msg} />
            ))}

            {/* Streaming message — shows tokens as they arrive */}
            {isStreaming && streamingText && (
              <ChatMessage
                variant="ai"
                content={{ type: 'plain', text: cleanStreamingText(streamingText) }}
                timestamp="Just now"
              />
            )}

            {/* Thinking indicator — shows while waiting for first token */}
            {isStreaming && !streamingText && (
              <ThinkingIndicator status="Checking NZ settlement guidance..." />
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border px-3.5 py-3 flex-shrink-0">
        <div className="flex items-end gap-2 bg-bg rounded-xl px-3.5 py-2.5 border border-border focus-within:border-border-focus transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your settlement..."
            rows={1}
            className="flex-1 text-small leading-body bg-transparent resize-none outline-none max-h-[72px]"
            style={{ minHeight: '24px' }}
            disabled={isStreaming || !!sessionError}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || !sessionId || !!sessionError}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-primary-hover transition-colors"
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="text-caption text-text-tertiary text-center mt-2">
          Responses are AI-generated. Always verify with official sources.
        </p>
      </div>
    </div>
  )
}
