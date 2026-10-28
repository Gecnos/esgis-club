import { Link } from 'react-router'
import Icon from './Icon.tsx'
import Logo from './Logo.tsx'
import { navLinks } from './nav.ts'

const reseaux = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn']

const titre = 'text-[13px]/[18px] font-medium uppercase tracking-[.08em] text-steel'
const ligne = 'flex min-h-11 items-center gap-3 text-[15px] text-white no-underline'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="wrap pb-8 pt-16">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-10">
          <div className="flex flex-col gap-4">
            <Link to="/#top" className="text-white no-underline">
              <Logo />
            </Link>
            <p className="m-0 max-w-[300px] text-[15px]/6 text-mist">
              Le Comité de Gestion des Clubs coordonne, accompagne et évalue la vie des clubs de l'ESGIS.
            </p>
          </div>

          <nav aria-label="Liens rapides" className="flex flex-col gap-1">
            <span className={`${titre} mb-2`}>Liens rapides</span>
            {navLinks.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className="flex min-h-11 items-center text-[15px] font-medium text-white no-underline hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-1">
            <span className={`${titre} mb-2`}>Contact du Comité</span>
            <a href="mailto:comite.clubs@esgis.bj" className={ligne}>
              <Icon name="mail" size={20} className="text-mist" />
              comite.clubs@esgis.bj
            </a>
            <a href="https://wa.me/2290197000000" className={ligne}>
              <Icon name="call" size={20} className="text-mist" />
              +229 01 97 00 00 00
            </a>
            <span className={ligne}>
              <Icon name="location_on" size={20} className="text-mist" />
              Campus ESGIS, Cotonou
            </span>
            <span className={ligne}>
              <Icon name="schedule" size={20} className="text-mist" />
              Permanence le vendredi, 12h – 14h
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <span className={titre}>Suis-nous</span>
            <div className="flex flex-wrap gap-2">
              {reseaux.map((r) => (
                <a
                  key={r}
                  href="#"
                  className="flex h-11 items-center rounded-full border border-white/25 px-4 text-sm font-semibold text-white no-underline hover:bg-white/10"
                >
                  {r}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[13px]/[18px] font-medium text-mist">
          <span>© ESGIS Bénin – Comité de Gestion des Clubs</span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Link to="/connexion" className="font-semibold text-white no-underline hover:underline">
              Espace responsables
            </Link>
            Année universitaire 2026–2027
          </span>
        </div>
      </div>
    </footer>
  )
}
