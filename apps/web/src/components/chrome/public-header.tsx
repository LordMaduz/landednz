import { Brand } from './logo'

export function PublicHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-hairline">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Brand href="/" />
        {right}
      </div>
    </header>
  )
}
