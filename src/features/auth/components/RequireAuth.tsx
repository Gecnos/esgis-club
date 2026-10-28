import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../authContext.ts'

/** Protège les routes enfants : redirige vers la connexion si personne n'est connecté. */
export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-soft text-muted">
        Chargement…
      </div>
    )
  }
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}
