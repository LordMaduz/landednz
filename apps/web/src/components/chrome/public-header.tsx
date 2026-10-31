import { Brand } from './logo'

export function PublicHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface">
      <div className="container-page flex h-14 items-center justify-between gap-6">
        <Brand href="/" />
        {right}
      </div>
    </header>
  )
}
