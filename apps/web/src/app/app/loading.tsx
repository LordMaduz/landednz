// Still wash bars while the page loads (no shimmer)
export default function Loading() {
  return (
    <main aria-busy="true" className="container-page flex flex-col gap-4 pt-12 pb-24">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-64 rounded-control bg-wash" />
      <div className="h-4 w-96 max-w-full rounded-control bg-wash" />
      <div className="mt-8 h-48 rounded-surface bg-wash" />
    </main>
  )
}
