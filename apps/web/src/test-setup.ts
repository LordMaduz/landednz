import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest globals are off, so Testing Library cannot register its own unmount between tests
afterEach(cleanup)

// sonner removes a closed toast on an uncancelled 200ms timer; let it fire while jsdom still exists
afterEach(async () => {
  if (document.querySelector('[data-sonner-toast]')) await new Promise(r => setTimeout(r, 300))
})
