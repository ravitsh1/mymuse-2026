import Image from 'next/image'
import type { Project } from '@/payload-types'
import { projectPalette } from '@/lib/data'
import { asMedia, mediaUrl } from '@/lib/media'

/**
 * One media item, rendered by type (same rule as threebears-2026's MediaEl): video → <video>, GIF/SVG or
 * unknown size → <img>, everything else → next/image. Never put mediaUrl() straight into a raw <img>.
 * `fill` makes it cover its positioned parent; otherwise it keeps its own aspect ratio.
 */
export function MediaEl({
  m,
  className,
  sizes = '100vw',
  eager = false,
  fill = false,
  decorative = false,
  quality,
  ...rest
}: {
  m: unknown
  className?: string
  sizes?: string
  eager?: boolean
  fill?: boolean
  decorative?: boolean
  /** 90 for full-screen and large images (heroes, screens with small text); next.config allows 75, 80 and 90 */
  quality?: 75 | 80 | 90
} & Record<`data-${string}`, string>) {
  const media = asMedia(m)
  const url = mediaUrl(m)
  if (!media || !url) return null
  const mime = media.mimeType || ''
  const alt = decorative ? '' : media.alt || ''
  if (mime.startsWith('video/'))
    return <video className={className} src={url} muted loop playsInline preload={eager ? 'auto' : 'none'} data-autoplay aria-hidden="true" {...rest} />
  if (mime === 'image/gif' || mime === 'image/svg+xml' || !media.width || !media.height)
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={url} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" {...rest} />
  const focal = media.focalX != null && media.focalY != null ? { objectPosition: `${media.focalX}% ${media.focalY}%` } : undefined
  return fill ? (
    <Image className={className} src={url} alt={alt} fill sizes={sizes} priority={eager} quality={quality} style={focal} {...rest} />
  ) : (
    <Image className={className} src={url} alt={alt} width={media.width} height={media.height} sizes={sizes} priority={eager} quality={quality} {...rest} />
  )
}

const POS = [
  [14, 8, 30, 16, 52, 38],
  [22, 12, 12, 10, 46, 34],
  [10, 18, 36, 8, 58, 42],
  [30, 6, 16, 20, 50, 30],
  [18, 14, 28, 12, 44, 40],
]

/**
 * The project's visual. The same markup is the hero, the "next project" frame, the home preview and the
 * fly-in, so the hand-over between pages is seamless.
 */
export function Visual({ project, index, priority = false }: { project: Project; index: number; priority?: boolean }) {
  const p = projectPalette(project)
  const img = asMedia(project.hero)
  const video = asMedia(project.heroVideo)
  const pos = POS[index % POS.length]
  const a = index % 2 ? 'right' : 'left'
  const b = index % 2 ? 'left' : 'right'
  const style = { '--v-bg': p.bg, '--v-ink': p.ink, '--v-acc': p.acc } as React.CSSProperties

  return (
    <div className={`visual${img ? ' has-img' : ''}${img && project.heroFitPortrait ? ' fit-portrait' : ''}`} style={style}>
      {img ? (
        <>
          <div className="v-img" data-h="0.18">
            <MediaEl m={img} fill eager={priority} decorative sizes="100vw" quality={90} />
          </div>
          {video?.mimeType?.startsWith('video/') && <MediaEl m={video} className="v-img v-video" />}
          <div className="v-shade" />
        </>
      ) : (
        <>
          <div className="glow" />
          <div className="shape disc" data-h="0.35" style={{ top: `${pos[0]}%`, [a]: `${pos[1]}%` }} />
          <div className="shape arch" data-h="-0.2" style={{ top: `${pos[2]}%`, [b]: `${pos[3]}%` }} />
          <div className="shape lines" data-h="0.12" style={{ top: `${pos[4]}%`, [a]: `${pos[5]}%` }} />
        </>
      )}
      <div className="word" aria-hidden="true">
        {project.nameEn || project.title}
      </div>
    </div>
  )
}
