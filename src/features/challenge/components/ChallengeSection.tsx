import Icon from '../../../components/Icon.tsx'
import type { Leaderboard } from '../types.ts'

export default function ChallengeSection({ board }: { board: Leaderboard }) {
  const max = Math.max(...board.entries.map((e) => e.points))

  return (
    <section className="bg-navy py-[clamp(64px,8vw,104px)] text-white">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-x-[72px] gap-y-10">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-[13px]/[18px] font-medium text-mist">
            <Icon name="emoji_events" size={18} />
            Saison 2026–2027
          </span>
          <h2 className="m-0 text-[28px]/9 font-semibold tracking-[-.01em]">Challenge inter-clubs</h2>
          <p className="m-0 text-pretty text-base/6 text-mist">
            Assiduité, activités ouvertes à tous et résultats en compétition rapportent des points. Le club en tête en
            juin remporte le trophée du Comité.
          </p>
          <span className="mt-2 text-[13px]/[18px] font-medium text-steel">
            Classement mis à jour le {board.updatedAt}
          </span>
        </div>

        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {board.entries.map((e, i) => (
            <li
              key={e.name}
              className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5"
            >
              <span
                className={`flex size-9 items-center justify-center rounded-full text-[15px] font-bold ${
                  i === 0 ? 'bg-accent' : 'bg-white/10'
                }`}
              >
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-2">
                <span className="flex flex-wrap items-baseline gap-2">
                  <span className="text-base/6 font-semibold">{e.name}</span>
                  <span className="text-[13px]/[18px] font-medium text-steel">{e.category}</span>
                </span>
                <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-white"
                    style={{ width: `${Math.round((e.points / max) * 100)}%` }}
                  />
                </span>
              </div>
              <span className="whitespace-nowrap text-base/6 font-semibold tabular-nums">
                {e.points.toLocaleString('fr-FR')} pts
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
