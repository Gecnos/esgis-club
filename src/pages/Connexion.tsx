import { Navigate } from 'react-router'
import { useAuth } from '../features/auth/authContext.ts'
import LoginForm from '../features/auth/components/LoginForm.tsx'

export default function Connexion() {
  const { user, loading } = useAuth()

  // Déjà connecté : on envoie directement vers l'espace correspondant.
  if (!loading && user) return <Navigate to={user.role === 'comite' ? '/admin/comite' : '/admin/club'} replace />
  return <LoginForm />
}
