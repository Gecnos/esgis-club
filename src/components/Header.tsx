import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import Icon from './Icon.tsx'
import Logo from './Logo.tsx'
import { joinLink, navLinks } from './nav.ts'

function useActiveKey() {
  const { hash } = useLocation()
  if (!hash) return 'accueil'
  return navLinks.find((l) => l.to.endsWith(hash))?.key ?? 'accueil'
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const active = useActiveKey()

  return (
    <header className="relative bg-navy text-white shadow-[0_1px_0_rgb(255_255_255/0.08)]">
      <div className="wrap flex h-[72px] items-center justify-between gap-6">
        <Link
          to="/#top"
          onClick={() => setOpen(false)}
          aria-label="ESGIS Clubs – Accueil"
          className="flex min-h-11 items-center text-white no-underline"
        >
          <Logo />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <nav aria-label="Navigation principale" className="flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                aria-current={l.key === active ? 'page' : undefined}
                className="relative flex h-11 items-center rounded-lg px-3.5 text-[15px] font-medium text-white no-underline hover:bg-white/10"
              >
                {l.label}
                {l.key === active && <span className="absolute inset-x-3.5 bottom-1 h-0.5 rounded-sm bg-accent" />}
              </Link>
            ))}
          </nav>
          <Link
            to={joinLink}
            className="flex h-11 items-center whitespace-nowrap rounded-xl bg-accent px-5 text-[15px] font-semibold text-white no-underline hover:bg-accent-dark"
          >
            Rejoindre un club
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="flex size-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-white/10 text-white lg:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} size={26} />
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-[72px] flex flex-col border-t border-white/10 bg-navy px-4 pb-6 pt-2 shadow-[0_24px_40px_rgb(11_31_58/0.35)] lg:hidden">
          <nav aria-label="Menu mobile" className="flex flex-col">
            {navLinks.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                onClick={() => setOpen(false)}
                aria-current={l.key === active ? 'page' : undefined}
                className="flex min-h-14 items-center justify-between border-b border-white/10 px-2 text-[17px] font-medium text-white no-underline"
              >
                {l.label}
                {l.key === active && <span className="size-2 rounded-full bg-accent" />}
              </Link>
            ))}
          </nav>
          <Link
            to={joinLink}
            onClick={() => setOpen(false)}
            className="mt-5 flex h-[52px] items-center justify-center rounded-xl bg-accent text-base font-semibold text-white no-underline"
          >
            Rejoindre un club
          </Link>
        </div>
      )}
    </header>
  )
}
