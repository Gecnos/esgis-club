import { useState } from 'react'
import Icon from '../../../components/Icon.tsx'
import { capitalize } from '../../../lib/text.ts'

type Props = {
  prenom: string
  clubName: string
  whatsapp: string
  reference: string
  onReset: () => void
}

export default function SubmissionSuccess({ prenom, clubName, whatsapp, reference, onReset }: Props) {
  const [deadline] = useState(() =>
    capitalize(
      new Date(Date.now() + 7 * 864e5).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
    ),
  )
  const items = [
    { label: 'N° de dossier', value: reference },
    { label: 'Réponse au plus tard', value: deadline },
    { label: 'Contact WhatsApp', value: whatsapp || '—' },
  ]

  return (
    <div role="status" className="mx-auto flex max-w-[600px] flex-col items-center gap-4 py-[clamp(16px,4vw,40px)] text-center">
      <span className="flex size-[72px] items-center justify-center rounded-full bg-navy text-white">
        <Icon name="check" size={40} />
      </span>
      <h3 className="m-0 mt-2 text-[28px]/9 font-semibold">Ton projet est bien arrivé !</h3>
      <p className="m-0 text-pretty text-base/6 text-muted">
        Merci {prenom}. Le Secrétariat Général et le Comité des Clubs étudient le dossier « {clubName} »{' '}
        <strong className="text-navy">sous 7 jours</strong>. Tu recevras la date de ta soutenance sur WhatsApp.
      </p>
      <dl className="m-0 mt-2 grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-px overflow-hidden rounded-xl bg-line text-left">
        {items.map((i) => (
          <div key={i.label} className="bg-soft p-4">
            <dt className="text-[13px]/[18px] font-medium text-muted">{i.label}</dt>
            <dd className="m-0 mt-1 text-base/6 font-semibold">{i.value}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-[13px]/[18px] font-medium text-muted">
        Prochaine étape : prépare ta soutenance devant le panel. La décision t'est communiquée dans les 24 h qui suivent.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 h-11 cursor-pointer rounded-xl border-0 bg-transparent px-4 text-[15px] font-semibold text-navy underline underline-offset-[3px] hover:bg-soft"
      >
        Soumettre un autre projet
      </button>
    </div>
  )
}
