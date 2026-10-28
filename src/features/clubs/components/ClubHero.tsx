import { Link } from 'react-router'
import CoverImage from '../../../components/CoverImage.tsx'
import Icon from '../../../components/Icon.tsx'
import type { ClubDetail } from '../types.ts'
import { whatsappLink } from '../whatsapp.ts'

function initials(name: string) {
  const letters = name
    .replace(/&/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return letters || name.slice(0, 2).toUpperCase()
}

export default function ClubHero({ club, isClubOfMonth }: { club: ClubDetail; isClubOfMonth: boolean }) {
  const president = club.bureau[0]?.name

  return (
    <section>
      <div className="ph-navy relative h-[clamp(176px,24vw,320px)]">
        <CoverImage src={club.coverKey} alt={`Couverture du Club ${club.name}`} />
        <div className="wrap relative flex h-full flex-col justify-between py-4">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-2 text-[13px]/[18px] font-medium text-mist">
            <Link to="/" className="text-white no-underline">Accueil</Link>
            <span>/</span>
            <Link to="/#clubs" className="text-white no-underline">Les clubs</Link>
            <span>/</span>
            <span aria-current="page">{club.name}</span>
          </nav>
          <span className="self-end font-mono text-[11px] text-steel">photo de couverture · {club.cover}</span>
        </div>
      </div>

      <div className="wrap">
        <div className="relative -mt-[clamp(40px,4vw,56px)] size-[clamp(80px,8vw,112px)] rounded-2xl bg-white p-1 shadow-[0_8px_24px_rgb(11_31_58/0.16)]">
          <div className="relative flex size-full items-center justify-center overflow-hidden rounded-xl bg-navy text-[clamp(24px,2.4vw,32px)] font-bold tracking-[-.02em] text-white">
            <CoverImage src={club.logoKey} alt={`Logo du Club ${club.name}`} />
            {initials(club.name)}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#e8ecf3] px-2.5 py-1 text-[13px]/[18px] font-medium">{club.category}</span>
              {isClubOfMonth && (
                <span className="rounded-full bg-accent px-2.5 py-1 text-[13px]/[18px] font-medium text-white">Club du mois</span>
              )}
              {club.isNew && (
                <span className="rounded-full border border-accent px-2 py-[3px] text-[13px]/[18px] font-medium text-accent">Nouveau</span>
              )}
            </div>
            <h1 className="m-0 text-[clamp(30px,calc(2.2vw+18px),40px)] font-bold leading-[1.2] tracking-[-.02em]">
              Club {club.name}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[15px]/[22px] text-muted">
              <span className="flex items-center gap-1.5">
                <Icon name="groups" size={20} />
                <strong className="font-semibold text-navy">{club.members}</strong> membres
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="schedule" size={20} />
                {club.schedule}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="flag" size={20} />
                Fondé en {club.founded}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappLink(club)}
              target="_blank"
              rel="noopener"
              className="flex h-[52px] items-center gap-2 rounded-xl bg-accent px-6 text-base font-semibold text-white no-underline shadow-[0_6px_16px_rgb(214_40_57/0.25)] hover:bg-accent-dark"
            >
              <Icon name="chat" size={20} />
              Rejoindre le club
            </a>
            <a
              href="#activite"
              className="flex h-[52px] items-center rounded-xl border-[1.5px] border-navy px-5 text-base font-semibold text-navy no-underline hover:bg-soft"
            >
              Activité phare
            </a>
          </div>
        </div>
        {president && (
          <p className="m-0 mt-3 text-[13px]/[18px] font-medium text-muted">
            Le bouton ouvre WhatsApp avec un message pré-rempli pour {president}, président(e) du club.
          </p>
        )}
      </div>
    </section>
  )
}
