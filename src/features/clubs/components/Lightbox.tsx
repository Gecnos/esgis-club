import { useEffect, useRef, useState } from 'react'
import CoverImage from '../../../components/CoverImage.tsx'
import Icon from '../../../components/Icon.tsx'
import type { GalleryPhoto } from '../types.ts'

type Props = { photos: GalleryPhoto[]; index: number; onChange: (index: number) => void; onClose: () => void }

const roundButton =
  'flex cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 text-white'

export default function Lightbox({ photos, index, onChange, onClose }: Props) {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const touchStart = useRef(0)
  const photo = photos[index]

  const go = (n: number) => onChange((index + n + photos.length) % photos.length)

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % photos.length)
      if (e.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, photos.length, onChange, onClose])

  if (!photo) return null

  const maxW = Math.min(size.w - 32, 960)
  const maxH = Math.min(size.h, 1200) - 200
  const width = Math.min(maxW, maxH * photo.ratio)
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galerie photo"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0]?.clientX ?? 0
      }}
      onTouchEnd={(e) => {
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[rgb(6_17_33/0.94)] px-4 pb-8 pt-[72px]"
    >
      <div className="absolute inset-x-4 top-3 flex items-center justify-between text-white">
        <span className="text-[15px] font-semibold tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button type="button" onClick={onClose} aria-label="Fermer" className={`${roundButton} size-12`}>
          <Icon name="close" size={26} />
        </button>
      </div>

      <div
        onClick={stop}
        style={{ width, height: width / photo.ratio }}
        className="relative flex items-end rounded-xl bg-[repeating-linear-gradient(135deg,#1c3657_0_12px,#17304f_12px_24px)] p-4 font-mono text-xs text-steel"
      >
        <CoverImage src={photo.key} alt={photo.label} />
        photo haute définition
      </div>
      <p onClick={stop} className="m-0 text-center text-[15px]/[22px] font-medium text-white">
        {photo.label}
      </p>

      <button
        type="button"
        aria-label="Photo précédente"
        onClick={(e) => {
          stop(e)
          go(-1)
        }}
        className={`${roundButton} absolute left-6 top-1/2 hidden size-[52px] -translate-y-1/2 md:flex`}
      >
        <Icon name="chevron_left" size={28} />
      </button>
      <button
        type="button"
        aria-label="Photo suivante"
        onClick={(e) => {
          stop(e)
          go(1)
        }}
        className={`${roundButton} absolute right-6 top-1/2 hidden size-[52px] -translate-y-1/2 md:flex`}
      >
        <Icon name="chevron_right" size={28} />
      </button>
      <span className="text-[13px]/[18px] font-medium text-steel md:hidden">Glisse pour naviguer</span>
    </div>
  )
}
