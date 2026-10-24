import type { Media, Project } from '@/payload-types'
import { asMedia, projectPalette } from '@/lib/data'

/** Responsive <img> built from Payload's generated sizes. */
export function MediaImg({
  media,
  className,
  sizes = '100vw',
  priority = false,
  alt,
  ...rest
}: { media: Media; className?: string; sizes?: string; priority?: boolean; alt?: string } & Record<string, unknown>) {
  const s = media.sizes
  const set = [s?.card, s?.large, s?.hero]
    .filter((x): x is NonNullable<typeof x> => !!x?.url && !!x?.width)
    .map((x) => `${x.url} ${x.width}w`)
  if (media.url && media.width) set.push(`${media.url} ${media.width}w`)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={s?.large?.url || media.url || ''}
      srcSet={set.length ? set.join(', ') : undefined}
      sizes={sizes}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      alt={alt ?? media.alt ?? ''}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      {...rest}
    />
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
 * The project's visual. The same markup is the hero, the "next project" frame,
 * the home preview and the fly-in, so the hand-over between pages is seamless.
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
    <div className={`visual${img ? ' has-img' : ''}`} style={style}>
      {img ? (
        <>
          <MediaImg media={img} className="v-img" alt="" priority={priority} data-h="0.18" />
          {video?.url && video.mimeType?.startsWith('video/') && (
            <video className="v-img v-video" src={video.url} muted loop playsInline preload="none" data-autoplay aria-hidden="true" />
          )}
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
