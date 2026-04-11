'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChatPanel } from './ChatPanel'

interface ChatWidgetProps {
  token: string | null
}

export function ChatWidget({ token }: ChatWidgetProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      {chatOpen ? (
        <ChatPanel
          onClose={() => setChatOpen(false)}
          entryContext="ROADMAP"
          token={token}
        />
      ) : (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary shadow-fab hover:shadow-fab-hover hover:scale-105 transition-all duration-200 z-[1000] flex items-center justify-center"
          aria-label="Open settlement advisor"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>,
    document.body
  )
}
