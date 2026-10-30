import { test, type Locator, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { ReplyPart } from '@landednz/types'
import { holdAnswers, resetTestUser, signIn } from './test-user'

// Board-vs-build comparison (owner 2026-10-30: automate it instead of a manual screenshot review).
// For each board element, read its computed style on the approved board (direction-d.html, zoom removed)
// and on the same element in the running app, then write every difference to gate/board-vs-build.md.
// Report only, never fails on a difference: run with BOARD_COMPARE=1 npx playwright test board-compare
test.skip(!process.env.BOARD_COMPARE, 'BOARD_COMPARE=1 runs the board comparison')
test.beforeAll(resetTestUser)

const GATE = resolve(import.meta.dirname, '../../../docs/design/guide/gate')
const BOARD = pathToFileURL(resolve(GATE, '../direction-d.html')).href
const SHOTS = resolve(GATE, 'compare')

const TYPE = ['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'] as const
const BOX = ['backgroundColor', 'borderTopLeftRadius', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap'] as const
const SIZE = ['width', 'height'] as const
type Prop = (typeof TYPE)[number] | (typeof BOX)[number] | (typeof SIZE)[number] | 'boxShadow'

type Item = {
  name: string
  board: string // CSS selector on the board; the first visible match is measured
  app: (p: Page) => Locator
  props: readonly Prop[]
  pseudo?: '::before'
}

const pane = (p: Page) => p.locator('#guide-pane')
const turn = (p: Page, i = 0) => p.locator('[data-turn]').nth(i)

const DESKTOP: Item[] = [
  { name: 'Pane', board: '.d .pane', app: p => p.locator('#guide-pane > div').first(), props: [...BOX, 'boxShadow'] },
  { name: 'Pane title', board: '.d .pn-hd .who', app: p => pane(p).getByText('Guide', { exact: true }).first(), props: TYPE },
  { name: 'Icon button', board: '.d .pn-hd .ib', app: p => pane(p).getByRole('button', { name: 'Expand' }), props: [...SIZE, 'borderTopLeftRadius', 'color'] },
  { name: 'Ask bar', board: '.d .abar', app: p => p.getByRole('button', { name: /^Ask about your / }), props: [...TYPE, ...BOX, ...SIZE, 'boxShadow'] },
  { name: 'Ask bar go button', board: '.d .abar .go2', app: p => p.getByRole('button', { name: /^Ask about your / }).locator('> :last-child'), props: [...SIZE, 'backgroundColor', 'borderTopLeftRadius'] },
  { name: 'Opening line', board: '.d .hello h3', app: p => pane(p).locator('h3').first(), props: TYPE },
  { name: 'Starter', board: '.d .starts button', app: p => pane(p).locator('h3 ~ div > button').first(), props: [...TYPE, ...BOX] },
  // The composer has focus when the pane opens, so it is compared with the board's focused composer
  { name: 'Composer', board: '.d .cmp.focus', app: p => p.locator('#guide-composer').locator('..'), props: [...BOX, 'boxShadow'] },
  { name: 'Composer text', board: '.d .cmp .txt', app: p => p.locator('#guide-composer'), props: ['fontSize', 'lineHeight'] },
  { name: 'Context chip', board: '.d .ctxchip', app: p => p.locator('#guide-composer + [data-row] > span').first(), props: [...TYPE, ...BOX, 'height'] },
  { name: 'N left today', board: '.d .cmp .left', app: p => pane(p).getByText(/left today$/), props: TYPE },
  { name: 'Send', board: '.d .send:not(.off)', app: p => pane(p).getByRole('button', { name: 'Send' }), props: [...SIZE, 'borderTopLeftRadius'] },
  { name: 'Question heading', board: '.d .pane .ask', app: p => turn(p).locator('h3'), props: TYPE },
  { name: 'Provenance line', board: '.d .prov', app: p => turn(p).getByText("LandedNZ's checked guide").locator('..'), props: [...TYPE, 'gap'] },
  { name: 'Reading text', board: '.d .pane .read', app: p => turn(p).locator('[aria-live]'), props: [...TYPE, 'gap'] },
  { name: 'Citation chip', board: '.d .cite:not(.hot)', app: p => turn(p).getByRole('button', { name: 'Source 1' }), props: [...TYPE, ...BOX, 'height'] },
  { name: 'Step number', board: '.d .read ol li', pseudo: '::before', app: p => turn(p).locator('ol[aria-label="Steps"] li > span[aria-hidden]').first(), props: [...TYPE, 'backgroundColor', ...SIZE] },
  { name: 'Steps list', board: '.d .read ol', app: p => turn(p).locator('ol[aria-label="Steps"]'), props: ['gap'] },
  { name: "What I can't tell you", board: '.d .limits', app: p => turn(p).getByText("What I can't tell you").locator('../..'), props: [...TYPE, 'gap'] },
  { name: 'Task card', board: '.d .trow', app: p => turn(p).locator('a[href*="task="]'), props: [...BOX] },
  { name: 'Task card title', board: '.d .trow b', app: p => turn(p).locator('a[href*="task="] b'), props: TYPE },
  { name: 'Task card subtitle', board: '.d .trow small', app: p => turn(p).locator('a[href*="task="] small'), props: TYPE },
  { name: 'Follow-up', board: '.d .fup', app: p => turn(p).getByRole('button', { name: 'What goes on the tax code declaration?' }), props: [...TYPE, 'paddingTop', 'gap'] },
  { name: 'Check note', board: '.check', app: p => turn(p).getByText('The tax code letters are worth checking.').locator('..'), props: [...TYPE, ...BOX] },
  { name: 'Memory pill', board: '.kept', app: p => turn(p).getByText(/^Remembered:/), props: [...TYPE, ...BOX] },
  { name: 'Memory Undo', board: '.kept button', app: p => turn(p).getByRole('button', { name: 'Undo' }), props: [...TYPE, ...BOX] },
  { name: 'Answer toolbar', board: '.d .bar', app: p => turn(p).locator('> div.text-muted').last(), props: TYPE },
  { name: 'Crisis card', board: '.help', app: p => p.locator('section[aria-label="Support"]').first(), props: [...BOX] },
  { name: 'Crisis lead', board: '.help p', app: p => p.locator('section[aria-label="Support"] > p').first(), props: TYPE },
  { name: 'Crisis row', board: '.help a', app: p => p.locator('section[aria-label="Support"] a').first(), props: BOX },
  { name: 'Crisis number', board: '.help a b', app: p => p.locator('section[aria-label="Support"] a b').first(), props: TYPE },
  { name: 'Crisis note', board: '.help a small', app: p => p.locator('section[aria-label="Support"] a small').first(), props: TYPE },
  { name: 'Cap note', board: '.gnote', app: p => pane(p).getByText(/questions for today/).locator('../..'), props: [...TYPE, 'gap'] },
  { name: 'Source preview', board: '.pop', app: p => p.getByRole('dialog'), props: [...BOX, 'width', 'boxShadow'] },
]

const FOCUSED: Item[] = [
  { name: 'Focused rail', board: '.fv-side', app: p => p.locator('#guide-pane > :first-child'), props: [...BOX, 'width'] },
  { name: 'Focused rail heading', board: '.fv-side h6', app: p => p.getByRole('heading', { name: 'This conversation, by task' }), props: TYPE },
  { name: 'Focused question', board: '.fv-col .ask', app: p => turn(p).locator('h3'), props: TYPE },
  { name: 'Focused reading text', board: '.fv-col .read', app: p => turn(p).locator('[aria-live]'), props: TYPE },
]

const PHONE: Item[] = [
  { name: 'Phone ask bar', board: '.m .abar', app: p => p.getByRole('button', { name: /^Ask about your / }), props: [...TYPE, ...BOX, 'height', 'boxShadow'] },
  { name: 'Phone sheet', board: '.m .sheet2', app: p => p.locator('#guide-pane'), props: [...BOX, 'boxShadow'] },
  { name: 'Phone grab handle', board: '.m .grab', app: p => p.locator('#guide-pane > div[aria-hidden]').first(), props: [...SIZE, 'backgroundColor', 'borderTopLeftRadius'] },
  { name: 'Phone opening line', board: '.m .hello h3', app: p => pane(p).locator('h3').first(), props: TYPE },
]

type Styles = Partial<Record<Prop, string>>

const read = (el: Element, { ps, pd }: { ps: readonly string[]; pd?: string }) => {
  const cs = getComputedStyle(el, pd)
  return Object.fromEntries(ps.map(k => [k, cs[k as keyof CSSStyleDeclaration] as string]))
}

async function boardStyles(page: Page, items: Item[]): Promise<Map<string, Styles | null>> {
  await page.goto(BOARD)
  // Frames are drawn with CSS zoom; measure at real size
  await page.addStyleTag({ content: '.d,.m,.wf{zoom:1!important}*{animation:none!important;transition:none!important}' })
  const out = new Map<string, Styles | null>()
  for (const it of items) {
    const el = page.locator(it.board).first()
    out.set(it.name, (await el.count()) ? await el.evaluate(read, { ps: it.props, pd: it.pseudo }) : null)
  }
  return out
}

async function appStyles(page: Page, items: Item[], into: Map<string, Styles | null>) {
  for (const it of items) {
    const el = it.app(page)
    const found = (await el.count()) > 0 && (await el.first().isVisible())
    into.set(it.name, found ? await el.first().evaluate(read, { ps: it.props }) : null)
  }
}

// Reply with every part the board draws, so one turn carries all answer elements
const FULL: ReplyPart[] = [
  { type: 'notice', kind: 'checking_guide' },
  { type: 'source', index: 1, title: 'New arrival: IRD number application', url: 'https://www.ird.govt.nz/new-arrival', origin: 'guide', checkedAt: '2026-10-20T00:00:00.000Z' },
  { type: 'source', index: 2, title: 'Tax codes', url: 'https://www.ird.govt.nz/tax-codes', origin: 'guide', checkedAt: '2026-10-20T00:00:00.000Z' },
  { type: 'text', text: 'You can start work before your IRD number arrives.', citations: [1] },
  { type: 'text', text: 'Register for myIR first.', citations: [1], block: 'step', step: 1 },
  { type: 'text', text: 'Give your employer the IR330.', citations: [2], block: 'step', step: 2 },
  { type: 'text', text: 'Your exact tax code depends on your other income.', citations: [], block: 'limits' },
  { type: 'task_link', taskKey: 'T08', title: 'Get your IRD number' },
  { type: 'unverified', text: 'The tax code letters are worth checking.' },
  { type: 'memory_saved', memoryId: 'm1', text: 'You start work on 9 November.' },
  { type: 'follow_up', text: 'What goes on the tax code declaration?' },
]
const CRISIS: ReplyPart[] = [
  { type: 'text', text: 'Free call or text 1737 any time.', citations: [], block: 'crisis' },
  { type: 'text', text: 'I can help with the IRD steps when you are ready.', citations: [] },
]

const sse = (id: string, parts: ReplyPart[]) =>
  [
    `event: start\ndata: ${JSON.stringify({ userMessageId: `u${id}`, assistantMessageId: id })}`,
    ...parts.map(p => `event: part\ndata: ${JSON.stringify(p)}`),
    `event: done\ndata: ${JSON.stringify({ assistantMessageId: id, status: 'complete' })}`,
  ].join('\n\n') + '\n\n'

const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }

// Answers 1 = full reply, 2 = distress, 3+ = daily cap
async function stubAnswers(page: Page) {
  let n = 0
  await page.route('**/guide/messages', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS })
    n += 1
    if (n >= 3) return route.fulfill({ status: 429, headers: CORS, json: { error: 'CHAT_DAILY_CAP_REACHED', message: 'cap', resetAt: '2026-10-31T11:00:00.000Z' } })
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'text/event-stream' }, body: sse(`a${n}`, n === 1 ? FULL : CRISIS) })
  })
  await page.route('**/guide/memories/m1', route => route.fulfill({ status: 204, headers: CORS }))
}

async function ask(page: Page, text: string) {
  const box = page.locator('#guide-composer')
  await box.fill(text)
  await box.press('Enter')
}

const settle = (page: Page) => page.waitForTimeout(600)

async function shot(page: Page, name: string) {
  await page.screenshot({ path: resolve(SHOTS, `${name}.png`) })
}

function report(board: Map<string, Styles | null>, app: Map<string, Styles | null>, items: Item[]): string[] {
  const rows: string[] = []
  for (const it of items) {
    const b = board.get(it.name)
    const a = app.get(it.name)
    if (!b) { rows.push(`| ${it.name} | (not on board: \`${it.board}\`) | | |`); continue }
    if (!a) { rows.push(`| ${it.name} | **missing in build** | | |`); continue }
    for (const k of it.props) {
      if (norm(b[k]) === norm(a[k])) continue
      const ruled = RULED[`${it.name}|${k}`] ?? (k === 'lineHeight' || k === 'letterSpacing' ? 'follows the type token' : undefined)
      rows.push(`| ${it.name} | ${k} | \`${norm(b[k])}\` | \`${norm(a[k])}\` |${ruled ? ` kept: ${ruled}` : ''}`)
    }
  }
  return rows
}

// Round px to 0.5 so sub-pixel rounding is not a difference
// Differences the owner already ruled on stay in the table, marked
const TYPE_SCALE = 'type roles 2026-10-30 (24/18/16/14/12, docs/design/type); board sizes off that scale are not used'
const RADIUS_SCALE = 'radius scale (control 8, surface 12, pane 18) kept for consistency (triage F)'
const RULED: Record<string, string> = {
  'Check note|color': 'owner 2026-10-30, no new colours (S2)',
  'Check note|backgroundColor': 'owner 2026-10-30, no new colours (S2)',
  'Crisis lead|color': 'no token for #D9E4E8; white/85 on ink renders within 2% (triage H)',
  'Composer|boxShadow': 'the 4 px focus halo is drawn as an outline',
  'Citation chip|fontSize': TYPE_SCALE, 'Citation chip|paddingRight': TYPE_SCALE, 'Citation chip|paddingLeft': TYPE_SCALE,
  "What I can't tell you|fontSize": TYPE_SCALE, 'Task card title|fontSize': TYPE_SCALE, 'Follow-up|fontSize': TYPE_SCALE,
  'Crisis lead|fontSize': TYPE_SCALE, 'Cap note|fontSize': TYPE_SCALE, 'Focused question|fontSize': TYPE_SCALE,
  'Icon button|borderTopLeftRadius': RADIUS_SCALE, 'Ask bar go button|borderTopLeftRadius': RADIUS_SCALE,
  'Source preview|borderTopLeftRadius': RADIUS_SCALE, 'Phone sheet|borderTopLeftRadius': 'the sheet is the pane: same 18 px radius (triage F)',
  'Phone grab handle|borderTopLeftRadius': 'full round on a 4 px bar = 2 px',
}

// Same value, different spelling: px rounded to 0.5; any fully round radius = "full"; Tailwind's empty
// ring/shadow layers dropped; oklab white (Tailwind white/N) = rgba(255, 255, 255, N)
const norm = (v?: string) =>
  (v ?? '')
    .replace(/^(50%|\d{3,}(\.\d+)?px|[\d.]+e\+\d+px)$/, 'full')
    .replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px,? ?/g, '')
    .replace(/oklab\(0\.99\d* [-\d.e]+ [-\d.e]+ \/ ([\d.]+)\)/g, 'rgba(255, 255, 255, $1)')
    .replace(/oklab\(0\.99\d* [-\d.e]+ [-\d.e]+\)/g, 'rgb(255, 255, 255)')
    .replace(/(\d+\.\d+)px/g, (_, n: string) => `${Math.round(Number(n) * 2) / 2}px`)
    .trim()

test('board vs build', async ({ browser }) => {
  test.setTimeout(180_000)
  mkdirSync(SHOTS, { recursive: true })
  const all = [...DESKTOP, ...FOCUSED, ...PHONE]

  const boardPage = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  // Screenshots first, at the board's own zoom, so frames fit their sections
  await boardPage.goto(BOARD)
  for (const [i, section] of (await boardPage.locator('section.board').all()).entries()) {
    await section.screenshot({ path: resolve(SHOTS, `board-${i + 1}.png`) })
  }
  const board = await boardStyles(boardPage, all)
  await boardPage.close()

  const app = new Map<string, Styles | null>()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await holdAnswers(page)
  await page.goto('/signin')
  await signIn(page)
  await page.waitForURL('/app')
  await stubAnswers(page)

  await page.goto('/app/roadmap?task=T08')
  await settle(page)
  await shot(page, 'build-1440-task-closed')
  await appStyles(page, DESKTOP.filter(i => i.name.startsWith('Ask bar')), app)
  await page.getByRole('button', { name: /^Ask about your / }).click()
  await settle(page)
  await shot(page, 'build-1440-opening')
  await appStyles(page, DESKTOP.filter(i => ['Pane', 'Pane title', 'Icon button', 'Opening line', 'Starter', 'Composer', 'Composer text', 'Context chip', 'N left today'].includes(i.name)), app)

  await page.locator('#guide-composer').fill('Can I start work?')
  await appStyles(page, DESKTOP.filter(i => i.name === 'Send'), app)
  await page.locator('#guide-composer').press('Enter')
  await turn(page).getByText('What I can\'t tell you').waitFor()
  await settle(page)
  await shot(page, 'build-1440-answer')
  await appStyles(page, DESKTOP.filter(i => !i.name.startsWith('Ask bar') && !i.name.startsWith('Crisis') && !['Cap note', 'Source preview'].includes(i.name) && !app.has(i.name)), app)
  await turn(page).getByRole('button', { name: 'Source 1' }).first().click()
  await settle(page)
  await shot(page, 'build-1440-source-preview')
  await appStyles(page, DESKTOP.filter(i => i.name === 'Source preview'), app)
  await page.keyboard.press('Escape')

  await ask(page, 'I feel like giving up')
  await page.locator('section[aria-label="Support"]').first().waitFor()
  await settle(page)
  await shot(page, 'build-1440-distress')
  await appStyles(page, DESKTOP.filter(i => i.name.startsWith('Crisis')), app)

  await ask(page, 'One more question')
  await pane(page).getByText(/questions for today/).waitFor()
  await settle(page)
  await shot(page, 'build-1440-cap')
  await appStyles(page, DESKTOP.filter(i => i.name === 'Cap note'), app)

  await pane(page).getByRole('button', { name: 'Expand' }).click()
  await settle(page)
  await shot(page, 'build-1440-focused')
  // The newest turn is the cap question's; the full answer is the oldest
  await page.locator('[data-turn]').last().scrollIntoViewIfNeeded()
  await appStyles(page, FOCUSED.filter(i => !i.name.startsWith('Focused question') && !i.name.startsWith('Focused reading')), app)
  for (const it of FOCUSED.filter(i => ['Focused question', 'Focused reading text'].includes(i.name))) {
    const el = it.name === 'Focused question' ? page.locator('[data-turn]').last().locator('h3') : page.locator('[data-turn]').last().locator('[aria-live]')
    app.set(it.name, await el.evaluate(read, { ps: it.props }))
  }
  await page.close()

  const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true })
  await holdAnswers(phone)
  await phone.goto('/signin')
  await signIn(phone)
  await phone.waitForURL('/app')
  await settle(phone)
  await shot(phone, 'build-390-home-closed')
  await appStyles(phone, PHONE.filter(i => i.name === 'Phone ask bar'), app)
  await phone.getByRole('button', { name: /^Ask about your / }).click()
  await settle(phone)
  await shot(phone, 'build-390-sheet-half')
  await appStyles(phone, PHONE.filter(i => i.name !== 'Phone ask bar'), app)
  await phone.close()

  const rows = report(board, app, all)
  writeFileSync(
    resolve(GATE, 'board-vs-build.md'),
    [
      '# Board vs build: computed-style differences',
      '',
      `Generated by \`apps/web/e2e/board-compare.spec.ts\` (BOARD_COMPARE=1) on ${new Date().toISOString().slice(0, 10)}.`,
      `Board: direction-d.html with zoom removed. Build: local app, 1440×900 and 390×844, guide answers stubbed with every part type. ${all.length} elements compared; px rounded to 0.5.`,
      'Screenshots: `compare/board-N.png` (board sections) and `compare/build-*.png`.',
      '',
      '| Element | Property | Board | Build |',
      '|---|---|---|---|',
      ...rows,
      '',
    ].join('\n'),
  )
  console.log(`board-vs-build: ${rows.length} differences`)
})
