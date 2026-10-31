"use client"

import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { create } from "zustand"
import type { GuideMemoryDto } from "@landednz/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { deleteMemory, listMemories, updateMemory } from "@/lib/api"
import { shortDayNZ } from "@/lib/nz-date"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { ROW, ROW_GO, ROW_LABEL, ROW_ON, ROW_PHONE_LABEL, ROW_TAG, ROW_VALUE } from "./settings-row"

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

// The Memory row in the Guide card
export function MemoryRow({ open }: { open: boolean }) {
  const { list } = useLoaded()
  return (
    <div className={cn(ROW, open && ROW_ON)}>
      <span className={ROW_LABEL}>Memory</span>
      <span className={ROW_VALUE}>
        <span className={ROW_PHONE_LABEL}>Memory</span>
        {list ? `${list.length} ${list.length === 1 ? "thing" : "things"} the guide remembers` : "\u00a0"}
      </span>
      {open && <span className={ROW_TAG}>Open</span>}
      <Link href="/settings?edit=memory" className={cn(ROW_GO, open && "narrow:hidden")}>
        <ChevronRight aria-hidden className="size-5" />
        <span className="sr-only">Manage memory</span>
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
    <li className="flex items-start gap-4 border-t border-border-subtle py-4 first:border-t-0 max-narrow:flex-col max-narrow:gap-2">
      {draft === null ? (
        <>
          <div className="flex flex-1 flex-col gap-0.5">
            <span>{memory.text}</span>
            <small className="text-small text-fg-muted">From the guide, {shortDayNZ(memory.createdAt)}</small>
          </div>
          <span className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-fg-accent" onClick={() => setDraft(memory.text)}>Edit</Button>
            <Button variant="ghost" size="sm" className="text-danger hover:text-danger" onClick={remove}>Delete</Button>
          </span>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor={fieldId} className="sr-only">Memory</label>
            <textarea
              id={fieldId}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-control border border-border px-3 py-2 field-sizing-content"
            />
            <small className="text-small text-fg-muted">Edited facts are used from your next question.</small>
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
    <Card aria-labelledby={titleId} className="gap-2 p-10 px-16 max-split:px-8 max-narrow:p-4">
      <h2 id={titleId} className="text-section">What the guide remembers</h2>
      <p className="m-0 max-w-lede text-fg-muted">Only things you told it. It uses them in answers. Delete one and it&apos;s gone for good.</p>
      {error && <p role="alert" className="text-fg">{error}</p>}
      {failed && !list && <p role="alert" className="text-fg">Couldn&apos;t load what the guide remembers. Try again later.</p>}
      {list?.length === 0 && <p className="mt-4 text-fg-muted">The guide hasn&apos;t remembered anything yet.</p>}
      {list && list.length > 0 && (
        <>
          <ul className="m-0 mt-2 list-none p-0">
            {list.map(m => <MemoryItem key={m.id} memory={m} onError={setError} />)}
          </ul>
          <p className="text-small text-fg-muted">
            {list.length} of {MAX_KEPT} kept. Health and immigration problems are only kept if you ask.
          </p>
        </>
      )}
    </Card>
  )
}
