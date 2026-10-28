import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Footer from './Footer.tsx'
import Header from './Header.tsx'

export default function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
