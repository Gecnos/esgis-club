import { useState } from 'react'
import { Link } from 'react-router'
import CoverImage from '../../../components/CoverImage.tsx'
import Icon from '../../../components/Icon.tsx'
import { categories } from '../types.ts'
import type { Category, Club } from '../types.ts'

type Filter = 'Tous' | Category

type Props = { clubs: Club[]; clubOfMonthSlug?: string }

export default function ClubsSection({ clubs, clubOfMonthSlug }: Props) {
  const [filter, setFilter] = useState<Filter>('Tous')
  const filters: Filter[] = ['Tous', ...categories]
  const visible = clubs.filter((c) => filter === 'Tous' || c.category === filter)

  return (
    <section id="clubs" className="scroll-mt-[72px] bg-soft py-[clamp(64px,8vw,104px)]">
      <div className="wrap">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="m-0 text-[28px]/9 font-semibold tracking-[-.01em]">Nos clubs</h2>
          <p className="m-0 text-base/6 text-muted">
            Choisis un club, écris à son président sur WhatsApp, et rejoins la prochaine séance.
          </p>
        </div>

        <div
          role="group"
          aria-label="Filtrer par catégorie"
          className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        >
          {filters.map((f) => {
            const active = f === filter
            const count = f === 'Tous' ? clubs.length : clubs.filter((c) => c.category === f).length
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={`flex h-11 flex-none cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-4 text-[15px] font-semibold ${
                  active ? 'border-navy bg-navy text-white' : 'border-outline bg-white text-navy'
                }`}
              >
                {f}
                <span className="text-[13px] font-medium opacity-75">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6">
          {visible.map((c) => (
            <Link
              key={c.slug}
              to={`/clubs/${c.slug}`}
              className="flex flex-col overflow-hidden rounded-xl bg-white text-navy no-underline shadow-[0_1px_2px_rgb(11_31_58/0.06),0_4px_16px_rgb(11_31_58/0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgb(11_31_58/0.06),0_14px_30px_rgb(11_31_58/0.10)]"
            >
              <div className="ph-light relative flex aspect-[16/10] items-end p-3 font-mono text-[11px] text-muted">
                <CoverImage src={c.photoKey} />
                photo · {c.photoLabel}
                <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 font-sans text-[13px]/[18px] font-medium shadow-[0_1px_3px_rgb(11_31_58/0.12)]">
                  {c.category}
                </span>
                {c.slug === clubOfMonthSlug && (
                  <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 font-sans text-[13px]/[18px] font-medium text-white">
                    Club du mois
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-5">
                <h3 className="m-0 text-xl/7 font-semibold">{c.name}</h3>
                <p className="m-0 line-clamp-2 text-base/6 text-muted">{c.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <span className="flex items-center gap-1.5 text-[15px]/[22px] font-semibold">
                    Découvrir
                    <Icon name="arrow_forward" size={18} />
                  </span>
                  <span className="flex items-center gap-1 text-[13px]/[18px] font-medium text-muted">
                    <Icon name="groups" size={16} />
                    {c.members} membres
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
