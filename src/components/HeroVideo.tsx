'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Home hero trial "video" (lib/trial.ts): a muted loop of the photo mockups behind the Passion words. Without JS, and
 * under prefers-reduced-motion, it stays on its poster; the button pauses and plays it (WCAG 2.2.2, it runs > 5s).
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    ref.current?.play().catch(() => {})
  }, [])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <div className="ph-video">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero/poster.webp"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/hero/hero-720.mp4" type="video/mp4" media="(max-width: 900px)" />
        <source src="/hero/hero-1080.mp4" type="video/mp4" />
      </video>
      <button type="button" className="ph-vbtn" onClick={toggle}>
        {playing ? 'עצירת הווידאו' : 'הפעלת הווידאו'}
      </button>
    </div>
  )
}
