import { Outlet } from 'react-router'
import Footer from './Footer.tsx'
import Header from './Header.tsx'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
