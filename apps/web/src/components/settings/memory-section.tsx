"use client"

import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { create } from "zustand"
import type { GuideMemoryDto } from "@landednz/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { deleteMemory, listMemories, updateMemory } from "@/lib/api"
import { shortDayNZ } from "@/lib/nz-date"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const MAX_KEPT = 50 // spec §8 remember rules

const token = async () => (await createClient().auth.getSession()).data.session?.access_token ?? ""

// Shared by the answers-card row (count) and the editor (list), so a delete updates both
const useMemories = create<{ list: GuideMemoryDto[] | null; failed: boolean; load: () => Promise<void> }>(set => ({
  list: null,
  failed: false,
  load: async () => {
    try {
      set({ list: await listMemories(await token()), failed: false })
    } catch {
      set({ failed: true })
    }
  },
}))

function useLoaded() {
  const { list, failed, load } = useMemories()
  useEffect(() => {
    load()
  }, [load])
  return { list, failed }
}

// The Memory row in the answers card (board "Memory")
export function MemoryRow({ open }: { open: boolean }) {
  const { list } = useLoaded()
  return (
    <div className="flex min-h-14 items-center gap-3 border-t border-white/15 py-3 max-narrow:py-1">
      <span className="flex flex-1 flex-col leading-snug">
        <span className={cn("text-small font-medium", open ? "text-toast-action" : "text-rail-label")}>
          Memory{open && <span className="max-narrow:hidden"> · open</span>}
        </span>
        {list && <span>{list.length} {list.length === 1 ? "thing" : "things"} the guide remembers</span>}
      </span>
      <Link href="/settings?edit=memory" className={cn("flex min-h-11 items-center text-small font-medium text-toast-action no-underline hover:text-white", open && "narrow:hidden")}>
        Manage<span className="sr-only"> memory</span>
      </Link>
    </div>
  )
}

function MemoryItem({ memory, onError }: { memory: GuideMemoryDto; onError: (message: string | null) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fieldId = useId()

  async function save() {
    if (busy || !draft?.trim()) return
    setBusy(true)
    onError(null)
    try {
      const saved = await updateMemory(memory.id, draft.trim(), await token())
      useMemories.setState(s => ({ list: s.list?.map(m => (m.id === saved.id ? saved : m)) ?? null }))
      setDraft(null)
    } catch {
      onError("Couldn't save your changes. Try again.")
    } finally {
      setBusy(false)
    }
  }

  // Hard delete, no undo (D27)
  async function remove() {
    if (busy) return
    setBusy(true)
    onError(null)
    try {
      await deleteMemory(memory.id, await token())
      useMemories.setState(s => ({ list: s.list?.filter(m => m.id !== memory.id) ?? null }))
    } catch {
      onError("Couldn't delete that. Try again.")
      setBusy(false)
    }
  }

  return (
    <li className="flex items-start gap-4 border-t border-hairline py-4 first:border-t-0 max-narrow:flex-col max-narrow:gap-2">
      {draft === null ? (
        <>
          <div className="flex flex-1 flex-col gap-0.5">
            <span>{memory.text}</span>
            <small className="text-small text-muted">From the guide, {shortDayNZ(memory.createdAt)}</small>
          </div>
          <span className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-teal-text" onClick={() => setDraft(memory.text)}>Edit</Button>
            <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={remove}>Delete</Button>
          </span>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor={fieldId} className="sr-only">Memory</label>
            <textarea
              id={fieldId}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-control border border-border px-3 py-2 field-sizing-content"
            />
            <small className="text-small text-muted">Edited facts are used from your next question.</small>
          </div>
          <span className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={!draft.trim()} aria-busy={busy}>Save</Button>
          </span>
        </>
      )}
    </li>
  )
}

// Settings → Memory editor (board "Memory"); on phones it is its own view, like the answer editors
export function MemorySection() {
  const { list, failed } = useLoaded()
  const [error, setError] = useState<string | null>(null)
  const titleId = useId()
  return (
    <Card aria-labelledby={titleId} className="gap-2 p-10 px-14 max-split:px-8 max-narrow:p-4">
      <h2 id={titleId} className="text-section">What the guide remembers</h2>
      <p className="m-0 max-w-lede text-muted">Only things you told it. It uses them in answers. Delete one and it&apos;s gone for good.</p>
      {error && <p role="alert" className="text-ink">{error}</p>}
      {failed && !list && <p role="alert" className="text-ink">Couldn&apos;t load what the guide remembers. Try again later.</p>}
      {list?.length === 0 && <p className="mt-4 text-muted">The guide hasn&apos;t remembered anything yet.</p>}
      {list && list.length > 0 && (
        <>
          <ul className="m-0 mt-2 list-none p-0">
            {list.map(m => <MemoryItem key={m.id} memory={m} onError={setError} />)}
          </ul>
          <p className="text-small text-muted">
            {list.length} of {MAX_KEPT} kept. Health and immigration problems are only kept if you ask.
          </p>
        </>
      )}
    </Card>
  )
}
