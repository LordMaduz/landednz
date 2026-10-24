"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { createChatSession, streamChat, type TaskDetailApiResponse } from "@/lib/api"
import { suggestionsFor } from "@/lib/suggestions"
import { createClient } from "@/lib/supabase/client"
import { traceFor } from "@/lib/trace"
import { AiReply } from "./ai-reply"

type Message = { id: number; q: string; text: string; status: "streaming" | "done" | "stopped" | "failed" }

const CAP_MESSAGE = "You've reached today's question limit. You can ask again after midnight."
const FAILED_MESSAGE = "Couldn't get an answer. Check your connection, then ask again."

function traceOf(m: Message): string {
  if (m.status === "streaming") return "Checking sources"
  return m.status === "stopped" ? `${traceFor(m.text)}, stopped` : traceFor(m.text)
}

// "Ask about <topic>" in the task sheet: one chat session per open task, created on the first question
export function AskPanel({
  taskId,
  topic,
  detail,
  inputRef,
}: {
  taskId: string
  topic: string
  detail: TaskDetailApiResponse | null
  inputRef?: React.Ref<HTMLInputElement>
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [capped, setCapped] = useState(false)
  const [failed, setFailed] = useState(false)
  const session = useRef<string | null>(null)
  const running = useRef<{ id: number; abort: AbortController } | null>(null)
  const nextId = useRef(0)

  const streaming = messages.some(m => m.status === "streaming")
  const suggestions = detail ? suggestionsFor(detail).filter(q => !messages.some(m => m.q === q)) : []
  const update = (id: number, change: (m: Message) => Partial<Message>) =>
    setMessages(ms => ms.map(m => (m.id === id ? { ...m, ...change(m) } : m)))

  async function ask(question: string) {
    const q = question.trim()
    if (!q || streaming || capped) return
    const id = nextId.current++
    const abort = new AbortController()
    running.current = { id, abort }
    setFailed(false)
    setDraft("")
    setMessages(ms => [...ms, { id, q, text: "", status: "streaming" }])

    const fail = (code?: string) => {
      update(id, () => ({ status: "failed" }))
      if (code === "CHAT_DAILY_CAP_REACHED") setCapped(true)
      else setFailed(true)
    }
    try {
      const { data } = await createClient().auth.getSession()
      const token = data.session?.access_token ?? ""
      session.current ??= (await createChatSession("TASK_CARD", token, taskId)).sessionId
      await streamChat(
        session.current,
        q,
        token,
        text => update(id, m => ({ text: m.text + text })),
        () => update(id, () => ({ status: "done" })),
        error => fail(error.code),
        abort.signal,
      )
    } catch {
      fail()
    }
  }

  function stop() {
    if (!running.current) return
    running.current.abort.abort()
    update(running.current.id, () => ({ status: "stopped" }))
  }

  return (
    <section aria-labelledby="ask-title" className="flex flex-col gap-4 border-t border-hairline pt-6">
      <h3 id="ask-title" className="text-body font-semibold">
        Ask about {topic}
      </h3>
      {messages.map(m => (
        <div key={m.id} className="contents">
          <p className="ask-q">{m.q}</p>
          {(m.status !== "failed" || m.text) && (
            <AiReply text={m.text} trace={traceOf(m)} streaming={m.status === "streaming"} />
          )}
        </div>
      ))}
      {(capped || failed) && (
        <p role="alert" className="text-small">
          {capped ? CAP_MESSAGE : FAILED_MESSAGE}
        </p>
      )}
      {suggestions.length > 0 && !capped && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(q => (
            <Button key={q} variant="quiet" className="font-normal" disabled={streaming} onClick={() => ask(q)}>
              {q}
            </Button>
          ))}
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault()
          ask(draft)
        }}
      >
        <label htmlFor="sheet-ask" className="sr-only">
          Ask about {topic}
        </label>
        <Field
          id="sheet-ask"
          ref={inputRef}
          className="min-w-0 flex-1"
          placeholder="Ask a question"
          autoComplete="off"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          disabled={streaming || capped}
        />
        {streaming ? (
          <Button type="button" variant="quiet" onClick={stop}>
            Stop
          </Button>
        ) : (
          <Button type="submit" variant="quiet" disabled={capped}>
            Ask
          </Button>
        )}
      </form>
    </section>
  )
}
