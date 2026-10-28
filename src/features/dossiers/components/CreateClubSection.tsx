import CreateClubForm from './CreateClubForm.tsx'
import ProcessSteps from './ProcessSteps.tsx'

export default function CreateClubSection() {
  return (
    <section id="creer" className="scroll-mt-[72px] bg-soft py-[clamp(56px,8vw,96px)]">
      <div className="wrap">
        <div className="flex max-w-[720px] flex-col gap-3">
          <span className="text-[13px]/[18px] font-medium uppercase tracking-[.08em] text-muted">Créer un club</span>
          <h2 className="m-0 text-[28px]/9 font-semibold tracking-[-.01em]">Tu as une idée de club ? Propose-la !</h2>
          <p className="m-0 text-pretty text-base/6 text-muted">
            Tout étudiant de l'ESGIS peut porter un projet de club. Voici les 4 étapes, du dépôt de ton dossier à la
            décision du panel.
          </p>
        </div>
        <ProcessSteps />
        <CreateClubForm />
      </div>
    </section>
  )
}
