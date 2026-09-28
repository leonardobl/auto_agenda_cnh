import type { GalleryItem } from '../content'

type IconProps = { className?: string }

function CarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 30v-6l4-10a4 4 0 0 1 3.7-2.5h16.6A4 4 0 0 1 36 14l4 10v6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="6" y="30" width="36" height="8" rx="2" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="14" cy="38" r="3" fill="currentColor" />
      <circle cx="34" cy="38" r="3" fill="currentColor" />
    </svg>
  )
}

function WheelIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 12v8M24 28v8M12 24h8M28 24h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function RoadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M18 8 8 40M30 8l10 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 10v4M24 20v4M24 30v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function CapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M24 12 4 20l20 8 20-8-20-8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M14 24v8c0 2.2 4.5 6 10 6s10-3.8 10-6v-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const ICONS: Record<GalleryItem['icon'], (props: IconProps) => ReturnType<typeof CarIcon>> = {
  car: CarIcon,
  wheel: WheelIcon,
  road: RoadIcon,
  cap: CapIcon,
}

function GalleryIcon({ icon, className }: { icon: GalleryItem['icon']; className?: string }) {
  const Icon = ICONS[icon]
  return <Icon className={className} />
}

export default GalleryIcon
