import { Link } from 'react-router'
import Logo from './Logo.tsx'
import { navLinks } from './nav.ts'

const reseaux = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn']

const contacts = [
  'comite.clubs@esgis.bj',
  '+229 01 97 00 00 00',
  'Campus ESGIS, Cotonou',
  'Permanence le vendredi, 12h – 14h',
]

const titre = 'mb-5 text-sm font-semibold uppercase tracking-wider text-white/70'

export default function Footer() {
  return (
    <footer className="bg-night-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-white/85">
            Le Comité de Gestion des Clubs coordonne, accompagne et évalue la vie des clubs de l'ESGIS.
          </p>
        </div>

        <nav aria-label="Liens rapides">
          <h2 className={titre}>Liens rapides</h2>
          <ul className="space-y-4">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="font-semibold hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={titre}>Contact du Comité</h2>
          <ul className="space-y-4">
            {contacts.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={titre}>Suis-nous</h2>
          <ul className="flex flex-wrap gap-3">
            {reseaux.map((r) => (
              <li key={r}>
                <a href="#" className="block rounded-full border border-white/25 px-5 py-2 font-semibold hover:bg-white/10">
                  {r}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-6 py-6 text-sm text-white/85 sm:flex-row">
          <p>© ESGIS Bénin – Comité de Gestion des Clubs</p>
          <p>Année universitaire 2026–2027</p>
        </div>
      </div>
    </footer>
  )
}
