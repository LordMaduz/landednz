"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, Check, CircleAlert, Copy, CornerUpLeft, Info, RotateCcw, ShieldCheck } from "lucide-react"
import type { ReplyPart } from "@landednz/types"
import { groupBlocks, provenance, textCount, type TextPart, type Turn } from "@/lib/guide-turns"
import { linkPhones } from "@/lib/tel-links"
import { TASK_COPY } from "@/lib/task-copy"
import type { GuideBanner } from "@/lib/stores/guideStore"
import { cn } from "@/lib/utils"
import { Citation, domainOf, type SourcePart } from "./citation"
import { CrisisCard } from "./crisis-card"

type BannerState = NonNullable<GuideBanner>

const CHECKING: Record<string, string> = { checking_guide: "Checking the guide", checking_official: "Checking official sites" }

const phones = (text: string): ReactNode =>
  linkPhones(text).map((p, i) =>
    typeof p === "string" ? (
      p
    ) : (
      <a key={i} href={`tel:${p.tel}`} className="whitespace-nowrap underline">
        {p.text}
      </a>
    ),
  )

// A quiet line with a rule after it ("This answer was cut short.")
const Cut = ({ children }: { children: ReactNode }) => (
  <p className="flex items-center gap-2 text-small text-muted after:h-px after:flex-1 after:bg-hairline">{children}</p>
)

// Icon + message, optionally with actions underneath (board "gnote")
function Note({ error, children, action }: { error?: boolean; children: ReactNode; action?: ReactNode }) {
  const Icon = error ? CircleAlert : Info
  return (
    <div className="flex gap-2.5 text-body">
      <Icon className={cn("mt-1 size-4 shrink-0", error ? "text-danger" : "text-muted")} aria-hidden />
      <div className="flex flex-col gap-2">
        <p>{children}</p>
        {action}
      </div>
    </div>
  )
}

const RetryButton = ({ onRetry }: { onRetry: () => void }) => (
  <button
    type="button"
    onClick={onRetry}
    className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 self-start rounded-control bg-ink px-3 text-small font-medium text-white hover:bg-ink-hover max-narrow:min-h-11"
  >
    <RotateCcw className="size-3.5" aria-hidden />
    Retry
  </button>
)

const FollowUp = ({ text, onFollowUp }: { text: string; onFollowUp: (text: string) => void }) => (
  <button
    type="button"
    onClick={() => onFollowUp(text)}
    className="flex min-h-11 cursor-pointer items-center gap-2.5 border-t border-hairline py-2.5 text-left text-ui text-ink"
  >
    <CornerUpLeft className="size-4 shrink-0 text-teal" aria-hidden />
    {text}
  </button>
)

export function Banner({ banner, dailyCap }: { banner: BannerState; dailyCap: number }) {
  return (
    <Note
      action={
        // O1 (owner 2026-10-30): a capped question gets no model call, so the crisis line is always here
        banner.kind === "cap" && (
          <p className="text-small text-muted">
            Need to talk? Free call or text{" "}
            <a href="tel:1737" className="underline">
              1737
            </a>
          </p>
        )
      }
    >
      {banner.kind === "cap"
        ? `That's the ${dailyCap} questions for today. You can ask again after midnight.`
        : "An answer is still coming in another window. You can ask here once it's done."}
    </Note>
  )
}

function copyText(parts: ReplyPart[]): string {
  return groupBlocks(parts)
    .filter(b => b.kind !== "crisis")
    .map(b =>
      b.kind === "steps"
        ? b.items.map(item => `${item[0].step}. ${item.map(p => p.text).join(" ")}`).join("\n")
        : (b.kind === "limits" ? "What I can't tell you: " : "") + b.parts.map(p => p.text).join(" "),
    )
    .join("\n\n")
}

// One turn of the guide conversation (boards "The pane on a task" and "States")
export function Reply({
  turn,
  onRetry,
  onFollowUp,
  onUndoMemory,
  focus,
  meta,
}: {
  turn: Turn
  onRetry: () => void
  onFollowUp: (text: string) => void
  onUndoMemory: (memoryId: string) => void
  // focused view: 17 px reading text (D3, D8)
  focus?: boolean
  // "Asked on this task · 29 Oct" under an earlier day's question
  meta?: string | null
}) {
  const [showSources, setShowSources] = useState(false)
  const { parts, status } = turn
  const streaming = status === "streaming" || status === "sending"
  const hasText = textCount(turn) > 0
  const sources = parts.filter((p): p is SourcePart => p.type === "source")
  const byIndex = new Map(sources.map(s => [s.index, s]))
  const prov = provenance(parts)
  const notices = new Set(parts.flatMap(p => (p.type === "notice" ? [p.kind] : [])))
  const lastCheck = parts.findLast(p => p.type === "notice" && p.kind in CHECKING)
  const taskLink = parts.find(p => p.type === "task_link")
  const followUp = parts.find(p => p.type === "follow_up")
  const memories = parts.filter(p => p.type === "memory_saved")
  const unverified = parts.filter(p => p.type === "unverified")
  const stoppedEarly = status === "cancelled" && !hasText
  const brokeOff = status === "interrupted" || (status === "failed" && hasText) || (notices.has("interrupted") && !streaming)

  const sentence = (p: TextPart, i: number) => (
    <span key={i} className={cn(streaming && "guide-settle")}>
      {i > 0 && " "}
      {phones(p.text)}
      {p.citations.map(n => {
        const s = byIndex.get(n)
        return s ? <Citation key={n} source={s} /> : null
      })}
    </span>
  )

  return (
    <div data-turn={turn.key} className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <h3 className={cn("text-balance", focus ? "text-title" : "text-section", stoppedEarly ? "text-muted" : "text-ink")}>{turn.question}</h3>
        {meta && <p className="text-small text-muted">{meta}</p>}
      </div>

      {notices.has("official_unavailable") && <Cut>Official sites didn&apos;t respond. Answering from the checked guide only.</Cut>}

      {prov && (
        <p className="flex items-center gap-2.5 text-small font-medium text-teal-text">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          <span>{prov.label}</span>
          <span className="font-normal text-muted">
            {prov.domain} · {prov.count} {prov.count === 1 ? "source" : "sources"}
          </span>
        </p>
      )}

      <div aria-live="polite" aria-busy={streaming} className={cn("flex flex-col gap-3 text-ink", "text-reading")}>
        {groupBlocks(parts).map((b, i) => {
          if (b.kind === "crisis") return <CrisisCard key={i} />
          if (b.kind === "steps")
            return (
              <ol key={i} aria-label="Steps" className="flex flex-col gap-2">
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-1.5">
                    <span aria-hidden className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-wash text-small font-semibold">
                      {item[0].step}
                    </span>
                    <span>{item.map(sentence)}</span>
                  </li>
                ))}
              </ol>
            )
          if (b.kind === "limits")
            return (
              <div key={i} className="flex gap-2 text-body text-muted">
                <Info className="mt-1 size-4 shrink-0" aria-hidden />
                <p>
                  <b className="block font-semibold text-ink">What I can&apos;t tell you</b>
                  {b.parts.map(sentence)}
                </p>
              </div>
            )
          return (
            <p key={i} className="max-w-prose">
              {b.parts.map(sentence)}
            </p>
          )
        })}
      </div>

      {streaming && (
        <p className="flex items-center gap-2 text-small text-muted">
          <span aria-hidden className="size-3.5 rounded-full border-2 border-tint-border border-t-teal motion-safe:animate-spin" />
          {!hasText && lastCheck?.type === "notice" ? CHECKING[lastCheck.kind] : "Writing the answer…"}
        </p>
      )}

      {status === "failed" && !hasText && (
        <Note error action={<RetryButton onRetry={onRetry} />}>
          Something went wrong before the answer started. This question wasn&apos;t counted.
        </Note>
      )}
      {brokeOff && <Note action={<RetryButton onRetry={onRetry} />}>The answer stopped partway.</Note>}
      {stoppedEarly && <Note>Stopped. This question wasn&apos;t counted.</Note>}
      {status === "cancelled" && hasText && <Cut>You stopped this answer.</Cut>}

      {unverified.map((u, i) => (
        <p key={i} className="flex gap-2 rounded-surface bg-wash px-3 py-2.5 text-small text-ink">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
          <span>{u.text}</span>
        </p>
      ))}

      {taskLink && (
        <Link
          href={`/app/roadmap?task=${taskLink.taskKey}`}
          className="flex items-center gap-3 rounded-surface bg-wash px-3.5 py-3 text-ink no-underline transition-colors hover:bg-tint hover:text-ink"
        >
          <i aria-hidden className="size-3 shrink-0 rounded-full border-2 border-teal bg-white" />
          <span className="flex flex-1 flex-col leading-tight">
            {/* The card links to a page, so it carries that page's title (owner 2026-10-30) */}
            <b className="text-ui font-semibold">{TASK_COPY[taskLink.taskKey]?.title ?? taskLink.title}</b>
            <small className="text-small text-muted">Your task</small>
          </span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}

      {showSources && sources.length > 0 && (
        <ul className="flex flex-col gap-0.5 rounded-surface bg-wash p-1.5">
          {sources.map(s => (
            <li key={s.index}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-control px-2 py-1.5 text-small text-ink no-underline hover:bg-white hover:text-ink"
              >
                <span aria-hidden className="grid size-4.5 shrink-0 place-items-center rounded-md bg-white text-small font-semibold text-teal-text">
                  {s.index}
                </span>
                <span className="flex-1">{s.title}</span>
                <small className="text-small text-muted">{domainOf(s.url)}</small>
              </a>
            </li>
          ))}
        </ul>
      )}

      {memories.map(m => (
        <span key={m.memoryId} className="inline-flex items-center gap-2 self-start rounded-full bg-tint py-1.25 pr-1.5 pl-3 text-small text-teal-text">
          <Check className="size-3.5" aria-hidden />
          Remembered: {m.text}
          <button
            type="button"
            onClick={() => onUndoMemory(m.memoryId)}
            className="relative cursor-pointer rounded-full bg-white px-2.5 py-0.5 text-small font-medium text-ink ring-1 ring-tint-border ring-inset after:absolute after:-inset-2"
          >
            Undo
          </button>
        </span>
      ))}

      {!streaming && hasText && (
        <div className="flex items-center gap-1 text-small text-muted">
          <button type="button" onClick={() => navigator.clipboard.writeText(copyText(parts))} className={chipButton}>
            <Copy className="size-3.5" aria-hidden />
            Copy
          </button>
          {sources.length > 0 && (
            <button type="button" aria-expanded={showSources} onClick={() => setShowSources(v => !v)} className={chipButton}>
              {showSources ? "Hide sources" : `${sources.length} ${sources.length === 1 ? "source" : "sources"}`}
            </button>
          )}
        </div>
      )}

      {notices.has("truncated") && !streaming ? (
        <>
          <Cut>This answer was cut short.</Cut>
          <FollowUp text="Want the rest?" onFollowUp={onFollowUp} />
        </>
      ) : (
        followUp && status === "complete" && <FollowUp text={followUp.text} onFollowUp={onFollowUp} />
      )}
    </div>
  )
}

const chipButton =
  "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-control px-2.5 text-small text-muted hover:bg-wash hover:text-ink max-narrow:min-h-11"
