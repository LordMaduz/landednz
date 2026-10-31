import Link from "next/link"
import { Check } from "lucide-react"
import { Logo } from "@/components/chrome/logo"
import { answerLabel, DATE_QUESTION, QUESTIONS, type Answers } from "@/lib/answers"
import { weekdayDay } from "@/lib/nz-date"
import { cn } from "@/lib/utils"

const STEPS = [...QUESTIONS, DATE_QUESTION]
const NAMES = ["Visa", "Where you'll live", "Who's moving", "Your work", "When you land"]
const stepUrl = (n: number) => `/onboarding?step=${n}`

function answerText(i: number, answers: Partial<Answers>): string {
  const key = STEPS[i].key
  const value = answers[key]
  if (!value) return ""
  return key === "arrivalDate" ? `${weekdayDay(value)} ${value.slice(0, 4)}` : answerLabel(key, value)
}

const Wordmark = () => (
  <span translate="no" className="flex min-h-target items-center gap-2 font-semibold tracking-brand text-fg-on-action">
    <Logo onInk />
    LandedNZ
  </span>
)

// The five questions as a route: ticks for answered, a ringed dot for the one in hand (current = its 1-based number; null = all answered)
export function AnswerRail({ title, intro, answers, current }: { title: string; intro: string; answers: Partial<Answers>; current: number | null }) {
  const stateOf = (i: number) => (current === null || i < current - 1 ? "done" : i === current - 1 ? "now" : "next")
  const prev = current && current > 1 ? current - 2 : null

  return (
    <>
      <aside className="flex flex-col gap-16 bg-surface-inverse px-12 py-8 text-fg-on-action max-split:hidden">
        <Wordmark />
        <div className="flex flex-col gap-2">
          <h2 className="text-section">{title}</h2>
          <p className="m-0 text-fg-on-inverse">{intro}</p>
        </div>
        <ol aria-label="Your answers" className="m-0 list-none p-0">
          {STEPS.map((q, i) => {
            const state = stateOf(i)
            return (
              <li key={q.key} aria-current={state === "now" ? "step" : undefined} className="relative flex items-start gap-4 pb-8">
                {i < STEPS.length - 1 && (
                  <span aria-hidden="true" className={cn("absolute top-7 -bottom-1 left-2.75 w-0.5", stateOf(i + 1) === "next" ? "bg-fg-on-action/15" : "bg-accent-bright")} />
                )}
                {state === "done" ? (
                  <span aria-hidden="true" className="grid size-6 flex-none place-items-center rounded-full bg-accent-bright text-fg">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                ) : state === "now" ? (
                  <span aria-hidden="true" className="size-6 flex-none rounded-full border-5 border-accent-bright bg-surface-inverse shadow-rail" />
                ) : (
                  <span aria-hidden="true" className="size-6 flex-none rounded-full border-2 border-fg-muted" />
                )}
                <span className="flex flex-col pt-0.5 leading-snug">
                  <span className={cn("text-small", state === "now" ? "font-semibold text-link-on-inverse" : "font-medium text-fg-on-inverse-muted")}>
                    {state === "now" ? "Answering now" : NAMES[i]}
                  </span>
                  {state !== "next" && (
                    <span className={cn(state === "now" && "font-semibold")}>{state === "now" ? NAMES[i] : answerText(i, answers)}</span>
                  )}
                </span>
                {state === "done" && (
                  <Link href={stepUrl(i + 1)} className="ml-auto flex min-h-target items-center text-small text-link-on-inverse no-underline hover:text-fg-on-action">
                    Change<span className="sr-only"> {NAMES[i]}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </aside>

      <header className="hidden flex-col gap-4 bg-surface-inverse px-4 pt-2 pb-4 text-small text-fg-on-action max-split:flex">
        <div className="flex items-center justify-between">
          <Wordmark />
          <span className="text-fg-on-inverse">{current ? `${current} of ${STEPS.length}` : title}</span>
        </div>
        <div aria-hidden="true" className="flex items-center">
          {STEPS.map((q, i) => {
            const state = stateOf(i)
            return (
              <span key={q.key} className="contents">
                {i > 0 && <span className={cn("h-0.5 flex-1", state === "next" ? "bg-fg-on-action/15" : "bg-accent-bright")} />}
                <span className={cn("flex-none rounded-full", state === "done" && "size-3 bg-accent-bright", state === "now" && "size-4.5 border-4 border-accent-bright bg-surface-inverse", state === "next" && "size-3 border-2 border-fg-muted")} />
              </span>
            )
          })}
        </div>
        {prev !== null && (
          <div className="flex items-center justify-between">
            <span className="text-fg-on-inverse">{NAMES[prev]}: <span className="text-fg-on-action">{answerText(prev, answers)}</span></span>
            <Link href={stepUrl(prev + 1)} className="flex min-h-target items-center text-link-on-inverse no-underline hover:text-fg-on-action">
              Change<span className="sr-only"> {NAMES[prev]}</span>
            </Link>
          </div>
        )}
      </header>
    </>
  )
}
