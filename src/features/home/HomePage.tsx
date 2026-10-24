import { Hammer } from 'lucide-react'

export function HomePage() {
  return (
    <section className="space-y-3">
      <h1 className="flex items-center gap-2 font-serif text-3xl">
        <Hammer aria-hidden className="size-7" />
        Joinery
      </h1>
      <p className="text-muted">Scaffold is running. Features land behind accepted ADRs.</p>
    </section>
  )
}
