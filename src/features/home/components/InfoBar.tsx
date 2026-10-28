import Icon from '../../../components/Icon.tsx'

const infos = [
  { icon: 'schedule', label: 'Rendez-vous', text: 'Clubs chaque vendredi dès midi' },
  { icon: 'event', label: 'Chaque mois', text: 'Une activité ouverte à tous le dernier vendredi du mois' },
  { icon: 'payments', label: 'Adhésion', text: 'Cotisation : 2 000 FCFA' },
]

export default function InfoBar() {
  return (
    <div className="wrap relative -mt-16">
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] rounded-xl bg-white p-2 shadow-[0_2px_4px_rgb(11_31_58/0.04),0_16px_40px_rgb(11_31_58/0.10)]">
        {infos.map((i) => (
          <li key={i.icon} className="flex items-center gap-4 px-5 py-4">
            <span className="flex size-12 flex-none items-center justify-center rounded-xl bg-soft">
              <Icon name={i.icon} />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px]/[18px] font-medium text-muted">{i.label}</span>
              <span className="text-base/6 font-semibold">{i.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
