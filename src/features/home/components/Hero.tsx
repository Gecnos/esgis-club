import { Link } from 'react-router'
import Icon from '../../../components/Icon.tsx'

const photos = [
  { label: 'match de basket 3x3', className: 'col-[1/3] row-[1/3] p-3' },
  { label: 'robotique', className: 'col-3 row-1' },
  { label: 'danse', className: 'col-3 row-2' },
  { label: 'débat', className: 'col-1 row-3' },
  { label: 'concert du club Musique', className: 'col-[2/4] row-3' },
]

export default function Hero() {
  return (
    <section className="bg-navy pb-[clamp(96px,10vw,136px)] pt-[clamp(40px,7vw,88px)] text-white">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-center gap-[clamp(32px,5vw,72px)]">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px]/[18px] font-medium text-[#e3e8f0]">
            <span className="size-2 rounded-full bg-accent" />
            Inscriptions ouvertes · 2026–2027
          </span>
          <h1 className="m-0 text-balance text-[clamp(30px,calc(2.2vw+18px),40px)] font-bold leading-[1.2] tracking-[-.02em]">
            Trouve ton club, construis ton réseau
          </h1>
          <p className="m-0 max-w-[460px] text-pretty text-base/6 text-mist">
            11 clubs étudiants, ouverts à toutes les filières. Choisis ta passion, retrouve ton équipe chaque vendredi et
            élargis ton réseau ESGIS.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              to="/#clubs"
              className="flex h-[52px] items-center gap-2 rounded-xl bg-accent px-6 text-base font-semibold text-white no-underline shadow-[0_6px_16px_rgb(214_40_57/0.3)] hover:bg-accent-dark"
            >
              Découvrir les clubs
              <Icon name="arrow_forward" size={20} />
            </Link>
            <Link
              to="/#creer"
              className="flex h-[52px] items-center rounded-xl border-[1.5px] border-white px-6 text-base font-semibold text-white no-underline hover:bg-white/10"
            >
              Créer un club
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="grid grid-cols-3 grid-rows-[repeat(3,clamp(80px,10vw,140px))] gap-3"
        >
          {photos.map((p) => (
            <div
              key={p.label}
              className={`ph-dark flex items-end rounded-xl border border-white/10 p-2.5 font-mono text-[11px] text-steel ${p.className}`}
            >
              photo · {p.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
