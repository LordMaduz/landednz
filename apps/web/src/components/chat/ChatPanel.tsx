'use client'

import { useState, useEffect, useRef } from 'react'
import type { ChatEntryPoint } from '@landednz/types'
import type { ChatResponse } from '@/types/chat'
import { ChatMessage } from './ChatMessage'
import { ThinkingIndicator } from './ThinkingIndicator'

interface UserMessage {
  id: string
  variant: 'user'
  content: string
  timestamp: string
}

interface AIMessage {
  id: string
  variant: 'ai'
  content: ChatResponse
  timestamp: string
}

type Message = UserMessage | AIMessage

// Mock structured responses for premium UX demonstration
function getMockResponse(question: string): ChatResponse {
  const q = question.toLowerCase()

  if (q.includes('emergency tax') || q.includes('employer') || q.includes('deducted')) {
    return {
      type: 'steps',
      header: 'Based on official NZ sources',
      intro: 'If your employer has already deducted tax at the emergency rate (45%), you can get the difference refunded. Here\'s how:',
      steps: [
        {
          text: 'Get your IRD number (you\'re already working on this)',
          sources: ['ird.govt.nz — Emergency tax']
        },
        {
          text: 'Give your IRD number to your employer as soon as it arrives',
          note: 'Your employer needs this to calculate your correct tax rate'
        },
        {
          text: 'Submit a Tax code declaration form (IR330) — this sets your correct rate',
          sources: ['ird.govt.nz — Tax code declaration IR330']
        },
        { text: 'Your employer adjusts future deductions immediately' },
        {
          text: 'The overpaid tax is refunded in your end-of-year tax assessment, or you can request an early refund through myIR',
          sources: ['ird.govt.nz — Request early refund']
        }
      ],
      callout: {
        type: 'warning',
        title: 'Typical refund',
        text: 'If you earned $1,200/week for 2 weeks at 45% vs your actual rate of 17.5%, that\'s roughly $660 overpaid — you\'ll get that back.'
      },
      sources: ['ird.govt.nz — Emergency tax', 'ird.govt.nz — Tax code declaration IR330', 'ird.govt.nz — Request early refund']
    }
  }

  if (q.includes('bank') || q.includes('account')) {
    return {
      type: 'checklist',
      header: 'Based on official bank requirements',
      intro: 'To open a NZ bank account, you\'ll need these documents. Most banks require the same core items:',
      items: [
        { text: 'Passport (original)', required: true, sources: ['anz.co.nz', 'bnz.co.nz'] },
        { text: 'NZ visa (e-visa printout or passport label)', required: true, sources: ['anz.co.nz'] },
        { text: 'Proof of NZ address (rental agreement, utility bill)', required: true },
        { text: 'Employment letter or job offer', required: false },
        { text: 'Character reference from overseas bank', required: false },
        { text: 'Minimum opening deposit ($100-$1000)', required: true, sources: ['consumer.govt.nz'] }
      ],
      note: 'Some banks allow online applications before you arrive, which can speed up the process.',
      sources: ['anz.co.nz — Account opening', 'bnz.co.nz — Requirements', 'consumer.govt.nz — Banking guide']
    }
  }

  if (q.includes('deadline') || q.includes('urgent') || q.includes('late')) {
    return {
      type: 'alert',
      severity: 'warning',
      title: 'Important Deadline Alert',
      message: 'Your work visa expires in 30 days. You must apply for your next visa before it expires to maintain legal status.',
      action: 'Apply for visa extension immediately through Immigration Online',
      deadline: '30 days from today',
      sources: ['immigration.govt.nz — Visa extensions']
    }
  }

  // Default plain text response
  return {
    type: 'plain',
    header: 'Based on official NZ sources',
    text: 'I can help with settlement questions about IRD numbers, bank accounts, visas, and more. What would you like to know?',
    sources: ['landednz.com']
  }
}

interface ChatPanelProps {
  onClose: () => void
  entryContext?: ChatEntryPoint
}

export function ChatPanel({ onClose, entryContext }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingStatus, setThinkingStatus] = useState('')
  const [step, setStep] = useState(0)
  const [suggestVisible, setSuggestVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Opening message - immediate on mount
  useEffect(() => {
    let openingContent = "Hi! I'm here to help with your New Zealand settlement journey. What would you like to know?"

    if (entryContext === 'TASK_CARD') {
      openingContent = "I see you're looking at getting an IRD number. What would you like to know about this step?"
    } else if (entryContext === 'ROADMAP') {
      openingContent = "I can help with any of your settlement tasks. What's your question?"
    }

    const openingMessage: Message = {
      id: '1',
      variant: 'ai',
      content: {
        type: 'plain',
        header: 'Based on official NZ sources',
        text: openingContent
      },
      timestamp: 'Just now'
    }

    setMessages([openingMessage])
    setStep(1)
  }, [entryContext])

  // Progressive disclosure - show suggested question after 1500ms
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        setSuggestVisible(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Thinking simulation when step === 2
  useEffect(() => {
    if (step === 2) {
      setIsThinking(true)
      setThinkingStatus("Checking IRD emergency tax rules...")

      const timer1 = setTimeout(() => {
        setThinkingStatus("Looking up refund process for overpaid PAYE...")
      }, 1200)

      const timer2 = setTimeout(() => {
        setIsThinking(false)
        setThinkingStatus("")

        // Generate intelligent structured response based on the last user message
        const lastUserMessage = messages[messages.length - 1]
        const userQuestion = typeof lastUserMessage.content === 'string'
          ? lastUserMessage.content
          : 'general question'

        const aiResponse: Message = {
          id: Date.now().toString(),
          variant: 'ai',
          content: getMockResponse(userQuestion),
          timestamp: 'Just now'
        }

        setMessages(prev => [...prev, aiResponse])
        setStep(3)
      }, 2500)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [step])


  // Auto-scroll to bottom only when user is already at bottom
  useEffect(() => {
    const messagesContainer = messagesEndRef.current?.parentElement
    if (!messagesContainer) return

    // Check if user is already scrolled to bottom (within 50px tolerance)
    const isAtBottom = messagesContainer.scrollTop >=
      messagesContainer.scrollHeight - messagesContainer.clientHeight - 50

    // Only auto-scroll if user hasn't manually scrolled up
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isThinking]) // Only when message COUNT changes or thinking state changes

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      variant: 'user',
      content: input.trim(),
      timestamp: 'Just now'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    if (step === 1) {
      setStep(2)
    }
  }

  const handleSuggestedQuestion = () => {
    const suggestedQ = "What happens if my employer already deducted emergency tax?"
    const userMessage: Message = {
      id: Date.now().toString(),
      variant: 'user',
      content: suggestedQ,
      timestamp: 'Just now'
    }

    setMessages(prev => [...prev, userMessage])
    setSuggestVisible(false)
    setStep(2)
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
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            {...msg}
          />
        ))}

        {isThinking && <ThinkingIndicator status={thinkingStatus} />}

        {/* Suggested question */}
        {step === 1 && suggestVisible && !isThinking && (
          <div className="px-1 py-2">
            <p className="text-caption text-text-tertiary uppercase tracking-wide font-medium mb-1.5">
              Try asking
            </p>
            <button
              onClick={handleSuggestedQuestion}
              className="border border-border rounded-button text-small text-text-secondary hover:border-primary hover:text-primary transition-colors px-3.5 py-2.5 text-left leading-body"
            >
              What happens if my employer already deducted emergency tax?
            </button>
          </div>
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
            placeholder="Ask about this task..."
            rows={1}
            className="flex-1 text-small leading-body bg-transparent resize-none outline-none max-h-[72px]"
            style={{ minHeight: '24px' }}
            disabled={isThinking}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
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