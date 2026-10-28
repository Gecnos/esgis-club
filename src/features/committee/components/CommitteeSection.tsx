import Icon from '../../../components/Icon.tsx'
import type { Member } from '../types.ts'

const roles = [
  { icon: 'hub', label: 'Coordonner' },
  { icon: 'handshake', label: 'Accompagner' },
  { icon: 'trending_up', label: 'Évaluer' },
]

export default function CommitteeSection({ members }: { members: Member[] }) {
  return (
    <section id="comite" className="scroll-mt-[72px] py-[clamp(64px,8vw,104px)]">
      <div className="wrap">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-16 gap-y-8">
          <div className="flex flex-col gap-3">
            <h2 className="m-0 text-[28px]/9 font-semibold tracking-[-.01em]">Qui gère les clubs ?</h2>
            <p className="m-0 text-pretty text-base/6 text-muted">
              Le Comité de Gestion des Clubs est composé d'étudiants élus. Il valide les nouveaux projets de club, fixe
              le calendrier du club du mois et organise le challenge inter-clubs.
            </p>
          </div>
          <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0">
            {roles.map((r) => (
              <li key={r.icon} className="flex flex-col gap-2 rounded-xl border border-line p-4">
                <Icon name={r.icon} />
                <span className="text-base/6 font-semibold">{r.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-x-4 gap-y-6">
          {members.map((m) => (
            <div key={m.name} className="flex flex-col gap-3">
              <div className="ph-light flex aspect-square items-end rounded-xl p-2.5 font-mono text-[11px] text-muted">
                portrait
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px]/[18px] font-medium text-accent">{m.role}</span>
                <span className="text-base/6 font-semibold">{m.name}</span>
                <span className="text-[13px]/[18px] font-medium text-muted">{m.filiere}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
