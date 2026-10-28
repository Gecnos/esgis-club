import { Link } from 'react-router'
import CoverImage from '../../../components/CoverImage.tsx'
import Icon from '../../../components/Icon.tsx'
import type { Club } from '../types.ts'

export default function SimilarClubs({ clubs }: { clubs: Club[] }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="m-0 text-[28px]/9 font-semibold">Autres clubs qui pourraient te plaire</h2>
      <div className="-mx-[clamp(16px,4vw,24px)] grid snap-x snap-mandatory auto-cols-[minmax(min(84%,320px),1fr)] grid-flow-col gap-4 overflow-x-auto px-[clamp(16px,4vw,24px)] pb-3 pt-1 [scroll-padding:0_clamp(16px,4vw,24px)] [scrollbar-width:none]">
        {clubs.map((c) => (
          <Link
            key={c.slug}
            to={`/clubs/${c.slug}`}
            className="flex snap-start flex-col overflow-hidden rounded-xl border border-[#eef1f5] bg-white text-navy no-underline shadow-[0_1px_2px_rgb(11_31_58/0.06),0_4px_16px_rgb(11_31_58/0.06)] hover:shadow-[0_2px_4px_rgb(11_31_58/0.06),0_14px_30px_rgb(11_31_58/0.10)]"
          >
            <div className="ph-light relative flex aspect-[16/10] items-end p-3 font-mono text-[11px] text-muted">
                <CoverImage src={c.photoKey} />
              photo · {c.photoLabel}
              <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 font-sans text-[13px]/[18px] font-medium">
                {c.category}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 px-5 pb-5 pt-4">
              <h3 className="m-0 text-xl/7 font-semibold">{c.name}</h3>
              <p className="m-0 line-clamp-2 text-[15px]/[22px] text-muted">{c.description}</p>
              <span className="mt-2 flex items-center gap-1.5 text-[15px] font-semibold">
                Découvrir
                <Icon name="arrow_forward" size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
