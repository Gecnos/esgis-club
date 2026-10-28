import Icon from '../../../components/Icon.tsx'

const steps = [
  { title: 'Dépôt du dossier', text: 'Dépôt du document projet auprès du/de la Secrétaire Général(e) du Comité des Clubs.' },
  { title: 'Étude du dossier', text: 'Étude du dossier par le Secrétariat Général et le Comité des Clubs.', badge: 'Sous 7 jours' },
  {
    title: 'Soutenance',
    text: 'Devant un panel composé du Responsable des Clubs, du Vice-Président des Clubs, du Directeur des Études et du Conseil des Responsables de Clubs.',
  },
  { title: 'Décision', text: 'Approbation ou rejet communiqué dans les 24 h suivant la présentation.', badge: 'Sous 24 h' },
]

export default function ProcessSteps() {
  return (
    <>
      <ol className="relative m-0 mt-12 hidden list-none grid-cols-4 gap-6 p-0 md:grid">
        <li aria-hidden="true" className="absolute left-6 right-[calc(25%-42px)] top-[23px] h-0.5 bg-[#c9d1dd]" />
        {steps.map((s, i) => (
          <li key={s.title} className="relative flex flex-col gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-navy text-lg font-bold text-white shadow-[0_0_0_6px_#f4f6fa]">
              {i + 1}
            </span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h3 className="m-0 text-xl/7 font-semibold">{s.title}</h3>
              {s.badge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[13px]/[18px] font-medium text-white">
                  <Icon name="schedule" size={14} />
                  {s.badge}
                </span>
              )}
            </div>
            <p className="m-0 text-pretty text-base/6 text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      <ol className="m-0 mt-8 flex list-none flex-col p-0 md:hidden">
        {steps.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4">
            <div className="flex flex-col items-center">
              <span className="flex size-10 flex-none items-center justify-center rounded-full bg-navy text-base font-bold text-white">
                {i + 1}
              </span>
              {i < steps.length - 1 && <span className="my-1 w-0.5 flex-1 bg-[#c9d1dd]" />}
            </div>
            <div className="flex flex-col gap-2 pb-7 pt-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-lg/[26px] font-semibold">{s.title}</h3>
                {s.badge && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-[13px]/[18px] font-medium text-white">{s.badge}</span>
                )}
              </div>
              <p className="m-0 text-pretty text-[15px]/[22px] text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
