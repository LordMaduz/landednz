"use client";

import { ArrowUp, Route, Square, X } from "lucide-react";
import type { GuideScreen } from "@landednz/types";
import { useGuideStore } from "@/lib/stores/guideStore";
import { TASK_COPY } from "@/lib/task-copy";
import { cn } from "@/lib/utils";

const MAX = 2000;
const same = (a: GuideScreen, b: GuideScreen | null) =>
  !!b && a.kind === b.kind && a.taskKey === b.taskKey;

function chipLabel(
  ctx: GuideScreen,
  titles: Record<string, string>,
): string | undefined {
  if (ctx.kind === "home") return "Home";
  if (ctx.kind === "roadmap") return "Roadmap";
  return ctx.taskKey
    ? (titles[ctx.taskKey] ?? TASK_COPY[ctx.taskKey]?.title)
    : undefined;
}

// Board composer (D6): context chip, "N left today", round Send that becomes Stop; aurora edge while writing (D7)
export function Composer({ titles }: { titles: Record<string, string> }) {
  const {
    draft,
    note,
    streaming,
    banner,
    context,
    page,
    opening,
    setDraft,
    ask,
    stop,
    clearContext,
  } = useGuideStore();
  const disabled = banner !== null;
  const label = disabled ? undefined : chipLabel(context, titles);
  const canSend = !disabled && !streaming && draft.trim() !== "";
  const send = () => {
    if (canSend) void ask(draft.trim());
  };
  const placeholder =
    banner?.kind === "cap"
      ? "You can ask again after midnight"
      : banner?.kind === "busy"
        ? "Waiting for the other window"
        : streaming
          ? "Writing the answer…"
          : "Ask anything about settling in";

  return (
    <div className="flex flex-col gap-2">
      {note && <p className="px-1 text-small text-muted">{note}</p>}
      <div className={cn("rounded-pane! p-px", streaming && "ai ai-streaming")}>
        <div
          className={cn(
            "flex flex-col gap-2.5 rounded-pane pt-3 pr-3 pb-2.5 pl-4",
            disabled ? "bg-wash ring-1 ring-hairline" : "bg-white",
            !disabled &&
              !streaming &&
              "ring-1 ring-border focus-within:ring-teal focus-within:outline-4 focus-within:outline-teal/12",
          )}
        >
          <textarea
            id="guide-composer"
            aria-label="Question"
            rows={1}
            maxLength={MAX}
            value={draft}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing)
                return;
              e.preventDefault();
              send();
            }}
            // 16 px below 1024 so iOS does not zoom into the field
            className="field-sizing-content max-h-40 min-h-6 w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed max-pane:text-reading"
          />
          <div data-row className="flex min-w-0 flex-nowrap items-center gap-2">
            {label && (
              <span className="inline-flex h-7 min-w-0 items-center gap-1.5 rounded-control bg-wash pr-1.5 pl-2.5 text-citation font-medium text-ink">
                <Route className="size-3.5 shrink-0 text-muted" aria-hidden />
                <span title={label} className="truncate">
                  {label}
                </span>
                {!same(context, page) && (
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={clearContext}
                    className="relative grid size-4.5 shrink-0 cursor-pointer place-items-center rounded-md text-muted after:absolute after:-inset-3.5 hover:bg-white hover:text-ink"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                )}
              </span>
            )}
            {/* count and Send end the row together, chip or no chip */}
            <div className="ml-auto flex shrink-0 items-center gap-3">
              {opening && (
                // D9: no count on the phone composer
                <span className="shrink-0 text-citation whitespace-nowrap text-muted max-narrow:hidden">
                  {banner?.kind === "cap" ? 0 : opening.leftToday} left today
                </span>
              )}
              <button
                type="button"
                aria-label={streaming ? "Stop" : "Send"}
                disabled={!streaming && !canSend}
                onClick={streaming ? () => void stop() : send}
                className={cn(
                  "relative grid size-8.5 shrink-0 cursor-pointer place-items-center rounded-full text-white after:absolute after:-inset-1.5 disabled:cursor-default",
                  streaming || canSend
                    ? "bg-ink hover:bg-ink-hover"
                    : "bg-track",
                )}
              >
                {streaming ? (
                  <Square className="size-3 fill-current" aria-hidden />
                ) : (
                  <ArrowUp className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
