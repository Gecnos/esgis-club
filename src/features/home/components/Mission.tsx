import Icon from '../../../components/Icon.tsx'

const buts = [
  { icon: 'school', title: 'Développer ses compétences', text: 'Ateliers, projets concrets et entraide entre étudiants, chaque vendredi.' },
  { icon: 'diversity_3', title: 'Créer une vraie communauté ESGIS', text: "Toutes filières et promotions réunies autour d'une même passion." },
  { icon: 'handshake', title: "S'ouvrir au réseau des alumni", text: "Rencontres avec d'anciens de l'ESGIS qui travaillent dans ton domaine." },
  { icon: 'rocket_launch', title: 'Saisir les opportunités', text: 'Compétitions, stages et événements partenaires accessibles via les clubs.' },
]

export default function Mission() {
  return (
    <section className="py-[clamp(64px,8vw,104px)]">
      <div className="wrap">
        <div className="flex max-w-[640px] flex-col gap-3">
          <h2 className="m-0 text-[28px]/9 font-semibold tracking-[-.01em]">Notre mission commune</h2>
          <p className="m-0 text-base/6 text-muted text-pretty">
            Sport, tech, arts ou business : chaque club a sa couleur, mais tous partagent les mêmes buts.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-6">
          {buts.map((b) => (
            <div key={b.icon} className="flex flex-col gap-3 rounded-xl bg-soft p-6">
              <span className="flex size-12 items-center justify-center rounded-xl bg-white shadow-[0_1px_2px_rgb(11_31_58/0.06)]">
                <Icon name={b.icon} />
              </span>
              <h3 className="m-0 mt-2 text-xl/7 font-semibold">{b.title}</h3>
              <p className="m-0 text-base/6 text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
