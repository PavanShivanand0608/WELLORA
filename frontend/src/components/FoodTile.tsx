import type { HTMLAttributes } from 'react'
import { FoodArt, type FoodArtVariant } from './FoodArt'
import { cn } from './ui/styles'

export interface FoodTileProps extends HTMLAttributes<HTMLElement> {
  title: string
  detail: string
  art: FoodArtVariant
}

export function FoodTile({ art, className, detail, title, ...props }: FoodTileProps) {
  return (
    <article
      {...props}
      className={cn(
        'min-w-0 overflow-hidden rounded-tile border border-surface/10 bg-ink p-1.5',
        className,
      )}
    >
      <div className="aspect-square overflow-hidden rounded-[12px] bg-cream p-1.5">
        <FoodArt variant={art} className="h-full w-full" />
      </div>
      <div className="px-1 pb-1 pt-2 text-left">
        <h3 className="truncate text-[11px] font-semibold leading-tight text-surface sm:text-xs">
          {title}
        </h3>
        <p className="mt-1 truncate text-[10px] leading-tight text-muted sm:text-[11px]">
          {detail}
        </p>
      </div>
    </article>
  )
}

export default FoodTile
