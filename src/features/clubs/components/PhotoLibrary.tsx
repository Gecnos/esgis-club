import { useState } from 'react'
import CoverImage from '../../../components/CoverImage.tsx'
import Icon from '../../../components/Icon.tsx'
import type { GalleryPhoto } from '../types.ts'
import Lightbox from './Lightbox.tsx'

type Props = { clubName: string; photos: GalleryPhoto[] }

export default function PhotoLibrary({ clubName, photos }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 text-[28px]/9 font-semibold">Bibliothèque photo</h2>
        {photos.length > 0 && (
          <span className="text-[13px]/[18px] font-medium text-muted">
            {photos.length} photos · touche une photo pour l'agrandir
          </span>
        )}
      </div>

      {photos.length > 0 ? (
        <div className="columns-[160px_3] gap-x-4">
          {photos.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Agrandir : ${p.label}`}
              style={{ aspectRatio: p.ratio }}
              className="relative mb-4 flex w-full cursor-zoom-in break-inside-avoid items-end overflow-hidden rounded-xl border-0 bg-[repeating-linear-gradient(135deg,#e1e6ee_0_10px,#eaeef4_10px_20px)] p-2.5 text-left font-mono text-[11px] text-muted hover:bg-[repeating-linear-gradient(135deg,#d6dce6_0_10px,#e1e6ee_10px_20px)]"
            >
              <CoverImage src={p.key} alt={p.label} />
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border-[1.5px] border-dashed border-[#c9d1dd] bg-[#fafbfd] px-6 py-[clamp(40px,6vw,72px)] text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-soft">
            <Icon name="photo_library" size={32} />
          </span>
          <h3 className="m-0 mt-1 text-xl/7 font-semibold">Les premiers souvenirs arrivent bientôt</h3>
          <p className="m-0 max-w-[440px] text-pretty text-base/6 text-muted">
            Les photos des séances et des événements du Club {clubName} apparaîtront ici après la première activité.
          </p>
        </div>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </section>
  )
}
