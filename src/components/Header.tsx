import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import Logo from './Logo.tsx'
import { navLinks } from './nav.ts'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-white/10 bg-night-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" aria-label="ESGIS Clubs, accueil">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `border-b-2 py-1 font-semibold ${
                  isActive ? 'border-accent text-white' : 'border-transparent text-white/85 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/connexion"
          className="hidden rounded-lg bg-accent px-5 py-3 font-bold text-white hover:brightness-110 lg:block"
        >
          Rejoindre un club
        </Link>

        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-2 lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Fermer' : 'Menu'}
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" className="flex flex-col gap-1 px-6 pb-4 lg:hidden" aria-label="Navigation mobile">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 font-semibold ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/connexion"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg bg-accent px-5 py-3 text-center font-bold"
          >
            Rejoindre un club
          </Link>
        </nav>
      )}
    </header>
  )
}
