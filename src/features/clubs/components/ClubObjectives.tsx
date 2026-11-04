import Icon from '../../../components/Icon.tsx'
import type { Objective } from '../types.ts'

export default function ClubObjectives({ objectives }: { objectives: Objective[] }) {
  if (objectives.length === 0) return null
  return (
    <section aria-labelledby="objectifs-titre" className="flex flex-col gap-6">
      <h2 id="objectifs-titre" className="m-0 text-[28px]/9 font-semibold">Objectifs</h2>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4 p-0">
        {objectives.map((o) => (
          <li key={o.text} className="flex items-start gap-4 rounded-xl border border-line p-5">
            <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-soft">
              <Icon name={o.icon} aria-hidden="true" />
            </span>
            <span className="pt-2.5 text-base/6 font-medium">{o.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
