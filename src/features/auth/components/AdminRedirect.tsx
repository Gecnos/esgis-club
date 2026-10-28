import { Navigate } from 'react-router'
import { useAuth } from '../authContext.ts'

/** `/admin` renvoie vers l'espace correspondant au rôle de l'utilisateur connecté. */
export default function AdminRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'comite' ? '/admin/comite' : '/admin/club'} replace />
}
