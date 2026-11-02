// Server-only module: reads the content bundle produced by apps/api's buildBundle.
// Used by static pages at build time. Throws on errors so the deploy fails (G4).
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
// Type-only: erased at build, so Turbopack never resolves apps/api's .js-extension imports.
import type { Bundle, ResolvedItem } from '../../../api/src/content/build'
import { GUIDE_SLUGS } from './guides.slugs'
import { legForPhase, legName } from './legs'
import { shortDate } from './nz-date'

const BUNDLE_PATH = resolve(process.cwd(), '../../apps/api/content-bundle.json')

function loadBundle(): Bundle {
  const raw = readFileSync(BUNDLE_PATH, 'utf8')
  return JSON.parse(raw) as Bundle
}

function filterItems<T extends ResolvedItem>(items: T[]): T[] {
  return items.filter(item => !item.when)
}

export interface GuideIndexItem {
  id: string
  slug: string
  name: string
  phase: number
  leg: string
  legName: string
  checkedAt: string
}

export interface GuideDetail {
  id: string
  slug: string
  name: string
  checkedAt: string
  why: ResolvedItem[]
  steps: ResolvedItem[]
  documents: ResolvedItem[]
  mistakes: ResolvedItem[]
  watchOuts: ResolvedItem[]
  cost?: ResolvedItem
  advice?: ResolvedItem & { required: boolean }
  sources: Array<{ id: string; title: string; agency: string; url: string }>
  leg: string
  legName: string
}

export { GUIDE_SLUGS }

export function guides(): GuideIndexItem[] {
  const bundle = loadBundle()
  return bundle.tasks
    .filter(t => !t.retired)
    .map(t => {
      const slug = GUIDE_SLUGS[t.id]
      if (!slug) throw new Error(`Task ${t.id} missing from GUIDE_SLUGS`)
      return {
        id: t.id,
        slug,
        name: t.name,
        phase: t.phase,
        leg: legForPhase(t.phase),
        legName: legName(legForPhase(t.phase), true),
        checkedAt: shortDate(t.checkedAt!),
      }
    })
}

export function guide(slug: string): GuideDetail | undefined {
  const bundle = loadBundle()
  const id = Object.entries(GUIDE_SLUGS).find(([, s]) => s === slug)?.[0]
  if (!id) return undefined
  const task = bundle.tasks.find(t => t.id === id && !t.retired)
  if (!task) return undefined

  const sources = new Map<string, { title: string; agency: string; url: string }>()
  // An item's own source plus the source of every fact quoted in its text
  const collect = (items: ResolvedItem[]) => items.forEach(i =>
    [i.source, ...i.factIds.map(fid => bundle.facts[fid]!.source)].forEach(id => {
      if (!sources.has(id)) sources.set(id, bundle.sources[id]!)
    }))

  collect(filterItems(task.why))
  collect(filterItems(task.steps))
  collect(filterItems(task.documents))
  collect(filterItems(task.mistakes))
  collect(filterItems(task.watchOuts))
  if (task.cost) collect([task.cost])
  if (task.advice) collect([task.advice])

  return {
    id: task.id,
    slug,
    name: task.name,
    checkedAt: shortDate(task.checkedAt!),
    why: filterItems(task.why),
    steps: filterItems(task.steps),
    documents: filterItems(task.documents),
    mistakes: filterItems(task.mistakes),
    watchOuts: filterItems(task.watchOuts),
    cost: task.cost && !task.cost.when ? task.cost : undefined,
    advice: task.advice && !task.advice.when ? task.advice : undefined,
    sources: Array.from(sources.entries()).map(([id, s]) => ({ id, ...s })),
    leg: legForPhase(task.phase),
    legName: legName(legForPhase(task.phase), false),
  }
}