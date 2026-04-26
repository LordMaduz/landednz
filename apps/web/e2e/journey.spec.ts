import { test, expect } from '@playwright/test'

test.describe('Full user journey', () => {
  test('sign in → onboard → roadmap → open task → mark complete → verify', async ({ page }) => {
    // Auth state already loaded from storageState (playwright-auth.json set by global-setup)

    // ── 1. Navigate to /roadmap — no profile yet → should redirect to /onboarding ──
    await page.goto('/roadmap')
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 })

    // ── 2. Scope screen — click "Let's go →" to enter the 5 questions ──
    // OnboardingFlow starts in phase:'scope' (ScopeScreen) not questions
    await page.getByRole('button', { name: /Let's go/i }).click()

    // ── 3. Q1: Visa type ──
    await expect(page.getByText("What brings you to New Zealand?")).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Accredited Employer Work Visa/i }).click()

    // ── 4. Q2: City (auto-advance: 400ms delay + 350ms exit + 500ms enter) ──
    await expect(page.getByText("Which city are you arriving in?")).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Auckland/i }).click()

    // ── 5. Q3: Family situation ──
    await expect(page.getByText("Who are you settling in with?")).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Arriving alone/i }).click()

    // ── 6. Q4: Occupation ──
    await expect(page.getByText("What's your professional background?")).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /Technology \/ Engineering/i }).click()

    // ── 7. Q5: Arrival timing ──
    await expect(page.getByText("When are you arriving or when did you arrive?")).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: /More than 2 months ago/i }).click()

    // ── 8. RoadmapReveal — with reducedMotion:reduce the reveal skips instantly ──
    // RoadmapReveal.tsx: useState(revealComplete || reducedMotion) → showFinal=true immediately
    // "See my roadmap →" button is visible right away
    const seeRoadmapBtn = page.getByRole('button', { name: /See my roadmap/i })
    await expect(seeRoadmapBtn).toBeVisible({ timeout: 8000 })
    await seeRoadmapBtn.click()

    // ── 9. Profile submitted to API → redirected to /roadmap ──
    await expect(page).toHaveURL(/\/roadmap/, { timeout: 15000 })

    // ── 10. Roadmap loads — wait for "Do these first" section with priority tasks ──
    await expect(page.getByText('Do these first')).toBeVisible({ timeout: 15000 })

    // ── 11. Click the first priority task row ──
    // TaskRow renders as div[role="button"]. HeroCard and filter tabs use native <button>.
    // The first [role="button"] in the DOM is the first priority task.
    const firstTask = page.locator('[role="button"]').first()
    await expect(firstTask).toBeVisible({ timeout: 5000 })
    await firstTask.click()

    // ── 12. Task detail panel opens ──
    // TaskDetail renders a "Back to roadmap" button and h2 with the task name
    await expect(page.getByRole('button', { name: /Back to roadmap/i })).toBeVisible({ timeout: 10000 })

    // ── 13. Mark the task as done ──
    const markDoneBtn = page.getByRole('button', { name: /Mark as done/i }).first()
    await expect(markDoneBtn).toBeVisible({ timeout: 5000 })
    await markDoneBtn.click()

    // ── 14. Verify update: handleComplete → optimistic update → API → setSelectedTask(null) ──
    // When selectedTask becomes null, TaskDetail unmounts and roadmap list renders again.
    // Wait for "Do these first" to reappear (proof the detail panel closed after success).
    await expect(page.getByText('Do these first')).toBeVisible({ timeout: 15000 })

    // ── 15. Still on /roadmap ──
    await expect(page).toHaveURL(/\/roadmap/)
  })
})
