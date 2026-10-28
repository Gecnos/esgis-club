import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout.tsx'
import RouteError from './components/RouteError.tsx'
import AdminRedirect from './features/auth/components/AdminRedirect.tsx'
import RequireAuth from './features/auth/components/RequireAuth.tsx'
import Accueil from './pages/Accueil.tsx'
import Connexion from './pages/Connexion.tsx'
import { accueilLoader, clubLoader } from './pages/loaders.ts'
import PageClub from './pages/PageClub.tsx'

// L'espace admin est chargé à la demande pour alléger le site public.
const admin = (load: () => Promise<{ default: React.ComponentType }>) => ({
  lazy: async () => ({ Component: (await load()).default }),
})

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Accueil />, loader: accueilLoader },
      { path: '/clubs/:slug', element: <PageClub />, loader: clubLoader },
    ],
  },
  { path: '/connexion', element: <Connexion /> },
  {
    path: '/admin',
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <AdminRedirect /> },
      {
        ...admin(() => import('./features/admin/components/AdminLayout.tsx')),
        children: [
          { path: 'club', ...admin(() => import('./features/admin/components/ClubDashboard.tsx')) },
          { path: 'club/fiche', ...admin(() => import('./features/admin/components/ClubFiche.tsx')) },
          { path: 'club/galerie', ...admin(() => import('./features/admin/components/ClubGalerie.tsx')) },
          { path: 'club/bureau', ...admin(() => import('./features/admin/components/ClubBureauEditor.tsx')) },
          { path: 'club/activite', ...admin(() => import('./features/admin/components/ClubActivite.tsx')) },
          { path: 'comite', ...admin(() => import('./features/admin/components/ComiteDashboard.tsx')) },
          { path: 'comite/dossiers', ...admin(() => import('./features/admin/components/ComiteDossiers.tsx')) },
          { path: 'comite/planning', ...admin(() => import('./features/admin/components/ComitePlanning.tsx')) },
        ],
      },
    ],
  },
])
