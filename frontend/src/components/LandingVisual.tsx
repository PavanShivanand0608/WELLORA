import { Sparkles } from 'lucide-react'
import { FoodArt } from './FoodArt'

export function LandingVisual() {
  return (
    <section
      aria-label="WELLORA nutrition visual"
      className="order-2 relative flex min-h-[360px] flex-1 items-center justify-center overflow-hidden bg-backdrop px-5 py-12 min-[721px]:order-1 min-[721px]:min-h-screen min-[721px]:px-10 lg:px-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-[12%] size-64 rounded-full bg-cream/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-[4%] size-80 rounded-full bg-accent-soft/40 blur-3xl"
      />

      <div className="relative aspect-square w-full max-w-[560px]">
        <div
          aria-hidden="true"
          className="absolute inset-[7%] rounded-full border border-ink/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-[16%] rounded-full border border-ink/10"
        />
        <div className="absolute inset-[22%] grid place-items-center rounded-full bg-cream shadow-soft">
          <div className="grid size-[78%] place-items-center rounded-full bg-sand">
            <FoodArt variant="bowl" className="size-[84%]" />
          </div>
        </div>

        <div className="absolute left-[2%] top-[18%] rounded-full border border-ink/10 bg-surface/70 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-panel sm:left-[4%] sm:text-[10px]">
          Wellness, in context
        </div>
        <div className="absolute right-[2%] top-[18%] size-10 rounded-full bg-accent shadow-soft sm:right-[7%] sm:size-14" />

        <div className="absolute bottom-[10%] right-[1%] flex max-w-[190px] items-center gap-3 rounded-tile border border-line bg-surface px-3 py-3 shadow-soft sm:right-[5%] sm:max-w-[220px] sm:px-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-panel">
            <Sparkles aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Everyday nourishment
            </span>
            <span className="mt-1 block text-xs font-semibold leading-snug text-ink sm:text-sm">
              Personal, not prescriptive.
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}

export default LandingVisual
