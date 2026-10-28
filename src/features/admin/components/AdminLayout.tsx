import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { useMediaQuery } from '../../../lib/useMediaQuery.ts'
import { discardDraft, publishDraft, undoToast } from '../actions.ts'
import { useAdmin } from '../adminContext.ts'
import { adminHeads, adminNav, adminSpaces, adminUsers } from '../nav.ts'
import type { ClubView, Role } from '../types.ts'
import AdminProvider from './AdminProvider.tsx'

const SAVE_VIEWS: string[] = ['fiche', 'bureau', 'activite']

function useAdminRoute() {
  const { pathname } = useLocation()
  const role: Role = pathname.startsWith('/admin/comite') ? 'comite' : 'club'
  const last = pathname.replace(/\/$/, '').split('/').pop() ?? ''
  const view = last === 'club' || last === 'comite' ? 'tableau' : last
  return { role, view }
}

function Shell() {
  const { state, apply } = useAdmin()
  const { role, view } = useAdminRoute()
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 899px)')

  const items = adminNav[role]
  const user = adminUsers[role]
  const [title, subtitle] = adminHeads[role][view] ?? adminHeads[role].tableau!
  const dirty = JSON.stringify(state.draft) !== JSON.stringify(state.saved)
  const showSave = role === 'club' && SAVE_VIEWS.includes(view) && dirty
  const openDossiers = state.dossiers.filter((d) => ['recu', 'etude', 'soutenance'].includes(d.statut)).length
  const countFor = (to: string) => (to.endsWith('/dossiers') ? openDossiers : 0)
  const publicHref = role === 'club' ? '/clubs/robotique' : '/'
  const publicLabel = role === 'club' ? 'Voir la page du club' : 'Voir le site'

  return (
    <div className="grid min-h-screen bg-soft text-navy min-[900px]:grid-cols-[264px_minmax(0,1fr)]">
      {!isMobile && (
        <aside className="bg-navy text-white">
          <div className="sticky top-0 flex flex-col gap-7 px-4 pb-8 pt-5">
            <Link to="/" className="flex min-h-11 items-center gap-3 px-2 text-white no-underline">
              <span className="flex size-10 items-center justify-center rounded-[10px] bg-white text-[15px] font-bold text-navy">ES</span>
              <span className="flex flex-col gap-0.5">
                <span className="text-lg/5 font-bold tracking-[.04em]">ESGIS</span>
                <span className="text-[13px]/4 font-medium text-mist">Espace admin</span>
              </span>
            </Link>

            <div role="group" aria-label="Espace" className="flex flex-col gap-1 rounded-xl bg-white/10 p-1">
              {adminSpaces.map((sp) => (
                <Link
                  key={sp.role}
                  to={sp.to}
                  aria-current={sp.role === role ? 'true' : undefined}
                  className={`flex min-h-[52px] flex-col items-start justify-center gap-0.5 rounded-[9px] px-3 py-2 text-white no-underline ${
                    sp.role === role ? 'bg-white/15' : ''
                  }`}
                >
                  <span className="text-[15px]/[22px] font-semibold">{sp.label}</span>
                  <span className="text-[13px]/[18px] font-medium text-mist">{sp.sub}</span>
                </Link>
              ))}
            </div>

            <nav aria-label="Navigation admin" className="flex flex-col gap-0.5">
              {items.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `flex h-12 items-center gap-3 rounded-[10px] px-3 text-[15px] font-medium text-white no-underline hover:bg-white/10 ${
                      isActive ? 'bg-white/15' : ''
                    }`
                  }
                >
                  <Icon name={n.icon} size={22} />
                  {n.label}
                  {countFor(n.to) > 0 && (
                    <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-[13px] font-semibold">
                      {countFor(n.to)}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex flex-col gap-1 border-t border-white/10 pt-5">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold">{user.initials}</span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm/5 font-semibold">{user.name}</span>
                  <span className="text-[13px]/[18px] font-medium text-mist">{user.role}</span>
                </span>
              </div>
              <Link to={publicHref} className="flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-white no-underline hover:bg-white/10">
                <Icon name="open_in_new" size={20} />
                Voir le site
              </Link>
              <Link to="/" className="flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-white no-underline hover:bg-white/10">
                <Icon name="logout" size={20} />
                Déconnexion
              </Link>
            </div>
          </div>
        </aside>
      )}

      <div className="flex min-w-0 flex-col">
        {isMobile && (
          <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy px-4 py-2.5 text-white">
            <span className="flex size-9 flex-none items-center justify-center rounded-[9px] bg-white text-[13px] font-bold text-navy">ES</span>
            <label className="flex min-w-0 flex-1 flex-col">
              <span className="text-[13px]/[18px] font-medium text-mist">Espace</span>
              <select
                value={role}
                onChange={(e) => navigate(`/admin/${e.target.value}`)}
                aria-label="Changer d'espace"
                className="min-h-7 max-w-full border-0 bg-transparent p-0 font-[inherit] text-base font-semibold text-white outline-none"
              >
                <option value="club" className="text-navy">Club Robotique</option>
                <option value="comite" className="text-navy">Comité des Clubs</option>
              </select>
            </label>
            <Link
              to={publicHref}
              aria-label="Voir le site"
              className="flex size-11 flex-none items-center justify-center rounded-xl bg-white/10 text-white no-underline"
            >
              <Icon name="open_in_new" size={22} />
            </Link>
          </div>
        )}

        <main
          className="flex w-full max-w-[1180px] flex-col gap-6 px-[clamp(16px,3vw,40px)] pt-[clamp(20px,3vw,40px)]"
          style={{ paddingBottom: isMobile ? (showSave ? 200 : 104) : 48 }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[13px]/[18px] font-medium text-muted">
                {role === 'club' ? 'Club Robotique · Espace responsable' : 'Comité de Gestion des Clubs'}
              </span>
              <h1 className="m-0 text-[clamp(26px,calc(1.4vw+16px),32px)] font-bold leading-[1.2] tracking-[-.02em]">{title}</h1>
              <p className="m-0 text-pretty text-base/6 text-muted">{subtitle}</p>
            </div>
            {!isMobile && (
              <Link to={publicHref} className="flex h-11 flex-none items-center gap-2 whitespace-nowrap rounded-xl border-[1.5px] border-navy bg-white px-4 text-[15px] font-semibold text-navy no-underline hover:bg-soft">
                <Icon name="visibility" size={20} />
                {publicLabel}
              </Link>
            )}
          </div>
          <Outlet />
        </main>

        {showSave && (
          <div
            className="sticky z-20 mx-[clamp(16px,3vw,40px)] mb-4 flex max-w-[1100px] flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white py-3 pl-5 pr-3 shadow-[0_-2px_8px_rgb(11_31_58/0.04),0_12px_32px_rgb(11_31_58/0.18)]"
            style={{ bottom: isMobile ? 76 : 16 }}
          >
            <span className="flex flex-col">
              <span className="text-[15px]/[22px] font-semibold">Modifications non publiées</span>
              <span className="text-[13px]/[18px] font-medium text-muted">Visibles immédiatement sur le site après publication.</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => apply(discardDraft)}
                className="h-12 cursor-pointer rounded-xl border-0 bg-transparent px-3.5 font-[inherit] text-[15px] font-semibold text-navy hover:bg-soft"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => apply((s) => publishDraft(s, view as ClubView))}
                className="h-12 cursor-pointer rounded-xl border-0 bg-accent px-5 font-[inherit] text-[15px] font-semibold text-white hover:bg-accent-dark"
              >
                Publier
              </button>
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <nav
          aria-label="Navigation admin"
          className="fixed inset-x-0 bottom-0 z-30 grid border-t border-line bg-white pb-[env(safe-area-inset-bottom)]"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `relative flex h-16 flex-col items-center justify-center gap-0.5 text-xs/4 font-semibold no-underline ${
                  isActive ? 'text-navy' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-x-1/4 top-0 h-[3px] rounded-b-[3px] bg-accent" />}
                  <Icon name={n.icon} />
                  {n.short}
                  {countFor(n.to) > 0 && (
                    <span className="absolute left-[calc(50%+8px)] top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-[5px] text-[11px] text-white">
                      {countFor(n.to)}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {state.toast && (
        <div
          role="status"
          className="fixed left-1/2 z-[60] flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-3 rounded-xl bg-navy py-2.5 pl-4 pr-2.5 text-[15px]/[22px] font-medium text-white shadow-[0_12px_32px_rgb(11_31_58/0.3)]"
          style={{ bottom: isMobile ? (showSave ? 170 : 84) : showSave ? 110 : 24 }}
        >
          <Icon name="check_circle" size={20} />
          <span className="flex-1">{state.toast.msg}</span>
          {state.toast.undo && (
            <button
              type="button"
              onClick={() => apply(undoToast)}
              className="h-10 cursor-pointer rounded-[10px] border-0 bg-white/10 px-3 font-[inherit] text-sm font-semibold text-white"
            >
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminProvider>
      <Shell />
    </AdminProvider>
  )
}
