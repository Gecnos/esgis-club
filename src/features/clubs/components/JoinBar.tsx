import { useEffect } from 'react'
import Icon from '../../../components/Icon.tsx'

type Props = { clubName: string; href: string }

/** Barre fixe affichée sur mobile ; la classe sur <body> réserve sa hauteur au-dessus du pied de page. */
export default function JoinBar({ clubName, href }: Props) {
  useEffect(() => {
    document.body.classList.add('has-join-bar')
    return () => document.body.classList.remove('has-join-bar')
  }, [])

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-white px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(11_31_58/0.08)] md:hidden">
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px]/[22px] font-semibold">Club {clubName}</span>
        <span className="text-[13px]/[18px] font-medium text-muted">Cotisation 2 000 FCFA</span>
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="flex h-[52px] flex-none items-center gap-2 rounded-xl bg-accent px-5 text-base font-semibold text-white no-underline"
      >
        <Icon name="chat" size={20} />
        Rejoindre le club
      </a>
    </div>
  )
}
