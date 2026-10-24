"use client"

import { ApiDown } from "@/components/chrome/api-down"

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="container-page pt-12 pb-24">
      <ApiDown onRetry={retry} />
    </main>
  )
}
