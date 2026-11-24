import { useId, type ReactNode, type SVGProps } from 'react'

export type FoodBowlVariant =
  | 'classic'
  | 'rainbow'
  | 'vegan'
  | 'quinoa'
  | 'avocado'

export type FoodArtVariant =
  | 'bowl'
  | 'citrus'
  | 'grains'
  | 'avocado'
  | 'fries'
  | 'bowl-icon'
  | 'jar'

type FoodIllustrationProps = Omit<SVGProps<SVGSVGElement>, 'title'> & {
  title?: string
}

export interface FoodArtProps extends FoodIllustrationProps {
  variant: FoodArtVariant
  bowlVariant?: FoodBowlVariant
}

export interface FoodBowlProps extends FoodIllustrationProps {
  variant?: FoodBowlVariant
}

interface IllustrationFrameProps extends FoodIllustrationProps {
  children: ReactNode
  viewBox: string
}

function IllustrationFrame({
  'aria-hidden': ariaHidden,
  'aria-labelledby': ariaLabelledBy,
  children,
  focusable,
  role,
  title,
  ...props
}: IllustrationFrameProps) {
  const titleId = useId()

  return (
    <svg
      {...props}
      fill="none"
      focusable={focusable ?? 'false'}
      role={title ? 'img' : role}
      aria-hidden={title ? undefined : ariaHidden ?? true}
      aria-labelledby={title ? titleId : ariaLabelledBy}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {children}
    </svg>
  )
}

function PlateBase() {
  return (
    <>
      <ellipse cx="60" cy="91" rx="38" ry="6" fill="var(--color-ink)" opacity=".08" />
      <ellipse cx="60" cy="54" rx="39" ry="34" fill="var(--color-surface)" />
      <ellipse cx="60" cy="53" rx="31" ry="27" fill="var(--color-sand)" />
      <ellipse cx="60" cy="52" rx="25" ry="21" fill="var(--color-cream)" />
    </>
  )
}

function ClassicBowlFood() {
  return (
    <>
      <path d="M36 59c7-12 17-18 27-17 10 1 18 8 23 19-12 10-35 11-50-2Z" fill="var(--color-accent-soft)" />
      <path d="M42 51c3-7 9-11 15-11-1 7-6 12-14 13M66 42c4-7 10-9 16-7-3 7-8 10-15 10" fill="var(--color-muted)" />
      <circle cx="49" cy="59" r="5" fill="var(--color-accent)" />
      <circle cx="70" cy="58" r="5.5" fill="var(--color-accent)" />
      <circle cx="59" cy="49" r="3.5" fill="var(--color-panel)" />
      <circle cx="60" cy="66" r="3" fill="var(--color-surface)" />
    </>
  )
}

function QuinoaBowlFood() {
  return (
    <>
      <path d="M38 63c2-11 12-19 23-18 11 1 19 10 20 21-12 7-30 7-43-3Z" fill="var(--color-accent-soft)" />
      <circle cx="45" cy="48" r="5" fill="var(--color-accent)" />
      <circle cx="68" cy="45" r="4.5" fill="var(--color-muted)" />
      <circle cx="77" cy="59" r="5" fill="var(--color-accent)" />
      <circle cx="54" cy="63" r="4" fill="var(--color-panel)" />
      <circle cx="65" cy="55" r="3.5" fill="var(--color-surface)" />
      <circle cx="47" cy="57" r="2.5" fill="var(--color-panel)" />
      <path d="M42 39c1-8 7-12 14-12-1 8-6 13-14 14M70 36c2-7 8-10 14-9-2 7-7 10-14 11" fill="var(--color-muted)" />
    </>
  )
}

function RainbowBowlFood() {
  return (
    <>
      <path d="M36 55c7-11 17-16 27-15 9 1 17 8 21 18-12 10-33 11-48-3Z" fill="var(--color-accent-soft)" />
      <path d="M40 47c4-8 11-11 18-10-1 8-7 12-16 13M67 39c4-6 10-8 15-6-2 6-7 9-13 10" fill="var(--color-muted)" />
      <circle cx="47" cy="59" r="5.5" fill="var(--color-accent)" />
      <circle cx="61" cy="52" r="4" fill="var(--color-panel)" />
      <circle cx="73" cy="59" r="5" fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth="2" />
      <circle cx="58" cy="66" r="3" fill="var(--color-surface)" />
      <circle cx="79" cy="47" r="2.5" fill="var(--color-panel)" />
    </>
  )
}

function VeganBowlFood() {
  return (
    <>
      <path d="M35 61c4-11 14-19 25-19 11 0 20 8 25 20-13 9-35 9-50-1Z" fill="var(--color-accent-soft)" />
      <path d="M43 55c-2-9 3-16 11-19 2 8-2 15-9 19M60 48c1-10 8-15 16-14-1 8-7 14-15 15M61 63c4-8 12-10 19-7-4 7-10 10-18 9" fill="var(--color-muted)" />
      <circle cx="48" cy="62" r="4.5" fill="var(--color-accent)" />
      <circle cx="59" cy="57" r="3" fill="var(--color-panel)" />
      <circle cx="72" cy="65" r="3.5" fill="var(--color-surface)" />
    </>
  )
}

function AvocadoBowlFood() {
  return (
    <>
      <path d="M43 34c5-8 12-13 17-13s12 5 17 13c6 9 10 17 8 25-2 9-9 13-18 10-5-2-9-2-14 0-9 3-16-1-18-10-2-8 2-16 8-25Z" fill="var(--color-accent)" />
      <path d="M48 36c4-7 8-10 12-10s8 3 12 10c5 7 8 14 6 20-1 5-5 8-11 6-5-2-9-2-14 0-6 2-10-1-11-6-2-6 1-13 6-20Z" fill="var(--color-accent-soft)" />
      <circle cx="60" cy="52" r="7" fill="var(--color-panel)" />
      <path d="M34 61c4 4 8 5 13 4M73 66c5 1 9 0 13-4" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" />
    </>
  )
}

export function FoodBowl({
  title,
  variant = 'classic',
  ...props
}: FoodBowlProps) {
  return (
    <IllustrationFrame viewBox="0 0 120 104" title={title} {...props}>
      <PlateBase />
      {variant === 'classic' ? <ClassicBowlFood /> : null}
      {variant === 'quinoa' ? <QuinoaBowlFood /> : null}
      {variant === 'rainbow' ? <RainbowBowlFood /> : null}
      {variant === 'vegan' ? <VeganBowlFood /> : null}
      {variant === 'avocado' ? <AvocadoBowlFood /> : null}
    </IllustrationFrame>
  )
}

export function FoodCitrus(props: FoodIllustrationProps) {
  return (
    <IllustrationFrame viewBox="0 0 120 104" {...props}>
      <PlateBase />
      <circle cx="45" cy="46" r="11" fill="var(--color-accent)" />
      <circle cx="45" cy="46" r="7.5" fill="var(--color-accent-soft)" />
      <path d="M45 38.5v15M37.5 46h15M39.7 40.7l10.6 10.6M50.3 40.7 39.7 51.3" stroke="var(--color-surface)" strokeWidth="1.5" />
      <circle cx="69" cy="60" r="10" fill="var(--color-accent-soft)" />
      <circle cx="69" cy="60" r="6.5" fill="var(--color-accent)" />
      <path d="M69 53.5v13M62.5 60h13M64.4 55.4l9.2 9.2M73.6 55.4l-9.2 9.2" stroke="var(--color-surface)" strokeWidth="1.5" />
      <path d="M67 34c7-8 15-8 19-6-2 8-9 13-17 12M38 65c-7 7-14 7-18 4 3-7 9-10 16-9" fill="var(--color-muted)" />
    </IllustrationFrame>
  )
}

export function FoodFries(props: FoodIllustrationProps) {
  return (
    <IllustrationFrame viewBox="0 0 120 104" {...props}>
      <ellipse cx="60" cy="89" rx="35" ry="5" fill="var(--color-ink)" opacity=".08" />
      <path d="M42 43h36l-5 39H47l-5-39Z" fill="var(--color-accent)" stroke="var(--color-panel)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M39 47h42" stroke="var(--color-panel)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M45 44V26c0-3 5-3 5 0v18M55 43V19c0-3 5-3 5 0v24M65 43V23c0-3 5-3 5 0v20M74 44V29c0-3 5-3 5 0v15" stroke="var(--color-surface)" strokeWidth="7" strokeLinecap="round" />
      <path d="M49 55h22M50 65h20" stroke="var(--color-accent-soft)" strokeWidth="2.5" strokeLinecap="round" />
    </IllustrationFrame>
  )
}

export function FoodBowlIcon(props: FoodIllustrationProps) {
  return (
    <IllustrationFrame viewBox="0 0 64 64" {...props}>
      <path d="M10 34h44c-2 13-10 21-22 21S12 47 10 34Z" fill="var(--color-accent-soft)" stroke="var(--color-panel)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M15 30c4-8 10-12 17-12s13 4 17 12" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 22c-2-4-1-7 2-10M38 21c0-5 3-8 7-9" stroke="var(--color-muted)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="39" r="3" fill="var(--color-panel)" />
    </IllustrationFrame>
  )
}

export function FoodJar(props: FoodIllustrationProps) {
  return (
    <IllustrationFrame viewBox="0 0 120 104" {...props}>
      <ellipse cx="60" cy="89" rx="29" ry="5" fill="var(--color-ink)" opacity=".08" />
      <path d="M43 29h34l4 9v38c0 5-4 9-9 9H48c-5 0-9-4-9-9V38l4-9Z" fill="var(--color-surface)" stroke="var(--color-panel)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M42 38h36v16H42z" fill="var(--color-accent-soft)" />
      <path d="M41 56h38v13c0 6-4 10-10 10H51c-6 0-10-4-10-10V56Z" fill="var(--color-sand)" />
      <path d="M43 28h34v-7H43v7Z" fill="var(--color-accent)" stroke="var(--color-panel)" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="52" cy="47" r="4" fill="var(--color-accent)" />
      <circle cx="65" cy="49" r="3.5" fill="var(--color-muted)" />
      <path d="M47 62c5-5 10-5 14 0s9 5 14 0" stroke="var(--color-panel)" strokeWidth="2.5" strokeLinecap="round" />
    </IllustrationFrame>
  )
}

export function FoodArt({
  bowlVariant = 'classic',
  title,
  variant,
  ...props
}: FoodArtProps) {
  switch (variant) {
    case 'bowl':
      return <FoodBowl title={title} variant={bowlVariant} {...props} />
    case 'grains':
      return <FoodBowl title={title} variant="quinoa" {...props} />
    case 'avocado':
      return <FoodBowl title={title} variant="avocado" {...props} />
    case 'citrus':
      return <FoodCitrus title={title} {...props} />
    case 'fries':
      return <FoodFries title={title} {...props} />
    case 'bowl-icon':
      return <FoodBowlIcon title={title} {...props} />
    case 'jar':
      return <FoodJar title={title} {...props} />
  }
}

export default FoodArt
