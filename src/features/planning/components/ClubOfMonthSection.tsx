import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import CoverImage from '../../../components/CoverImage.tsx'
import Icon from '../../../components/Icon.tsx'
import { capitalize } from '../../../lib/text.ts'
import { nextMonthlyActivity } from '../dates.ts'
import type { ClubOfMonth } from '../types.ts'

const pad = (n: number) => String(n).padStart(2, '0')

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diff = Math.max(0, Math.floor((target.getTime() - now) / 1000))
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
  }
}

export default function ClubOfMonthSection({ club }: { club: ClubOfMonth }) {
  const [target] = useState(() => nextMonthlyActivity(new Date()))
  const { d, h, m, s } = useCountdown(target)

  const dateLabel = capitalize(
    target.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  )
  const monthLabel = capitalize(target.toLocaleDateString('fr-FR', { month: 'long' }))
  const units = [
    { v: pad(d), l: 'Jours' },
    { v: pad(h), l: 'Heures' },
    { v: pad(m), l: 'Min' },
    { v: pad(s), l: 'Sec' },
  ]

  return (
    <section id="club-du-mois" className="scroll-mt-[72px] pb-[clamp(64px,8vw,104px)]">
      <div className="wrap">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="m-0 text-[28px]/9 font-semibold tracking-[-.01em]">Club du mois</h2>
          <p className="m-0 text-base/6 text-muted">
            Chaque mois, un club organise l'activité ouverte à tous du dernier vendredi.
          </p>
        </div>

        <article className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] overflow-hidden rounded-xl bg-navy text-white shadow-[0_16px_40px_rgb(11_31_58/0.18)]">
          <div className="ph-navy relative flex min-h-[clamp(220px,30vw,440px)] items-end p-4 font-mono text-xs text-steel">
            <CoverImage src={club.photoKey} alt={club.clubName} />
            photo · {club.photoLabel}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 font-sans text-[13px]/[18px] font-medium text-white">
              <Icon name="workspace_premium" size={16} />
              Club du mois · {monthLabel}
            </span>
          </div>

          <div className="flex flex-col gap-5 p-[clamp(24px,4vw,48px)]">
            <div className="flex flex-col gap-2">
              <span className="text-[13px]/[18px] font-medium text-mist">
                {club.category} · {club.members} membres
              </span>
              <h3 className="m-0 text-[28px]/9 font-semibold">{club.clubName}</h3>
            </div>

            <div className="flex flex-col gap-2 text-[15px]/[22px]">
              <span className="flex items-center gap-2.5">
                <Icon name="calendar_month" size={20} className="text-mist" />
                {dateLabel} · {club.timeRange}
              </span>
              <span className="flex items-center gap-2.5">
                <Icon name="location_on" size={20} className="text-mist" />
                {club.location}
              </span>
            </div>

            <p className="m-0 line-clamp-2 text-base/6 text-[#dce2eb]">{club.description}</p>

            <div className="flex flex-col gap-2">
              <span className="text-[13px]/[18px] font-medium text-mist">Début dans</span>
              <div
                role="timer"
                aria-label={`${d} jours ${h} heures ${m} minutes avant l'activité`}
                className="grid max-w-[400px] grid-cols-4 gap-2"
              >
                {units.map((u) => (
                  <div
                    key={u.l}
                    className="flex flex-col items-center gap-0.5 rounded-xl border border-white/10 bg-white/5 px-1 py-2.5"
                  >
                    <span className="text-[28px]/9 font-semibold tabular-nums">{u.v}</span>
                    <span className="text-[13px]/[18px] font-medium text-mist">{u.l}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={`/clubs/${club.clubSlug}#activite`}
              className="flex h-[52px] items-center gap-2 self-start rounded-xl bg-accent px-6 text-base font-semibold text-white no-underline hover:bg-accent-dark"
            >
              Voir le programme
              <Icon name="arrow_forward" size={20} />
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}
