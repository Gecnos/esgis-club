import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout.tsx'
import Accueil from './pages/Accueil.tsx'
import PageClub from './pages/PageClub.tsx'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Accueil /> },
      { path: '/clubs/:slug', element: <PageClub /> },
    ],
  },
])
