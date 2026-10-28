import { createBrowserRouter } from 'react-router'
import Accueil from './pages/Accueil.tsx'

export const router = createBrowserRouter([{ path: '/', element: <Accueil /> }])
