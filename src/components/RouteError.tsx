import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

/** Affiché quand le chargement des données d'une page échoue (Supabase injoignable, route inconnue…). */
export default function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="wrap flex flex-col items-start gap-4 py-24">
      <h1 className="m-0 text-[clamp(30px,calc(2.2vw+18px),40px)] font-bold">
        {notFound ? 'Page introuvable' : 'Impossible de charger la page'}
      </h1>
      <p className="m-0 text-base/6 text-muted">
        {notFound ? "Cette page n'existe pas." : 'Vérifie ta connexion puis réessaie dans un instant.'}
      </p>
      <div className="flex gap-4">
        {!notFound && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-11 cursor-pointer rounded-xl border-0 bg-accent px-5 font-[inherit] text-[15px] font-semibold text-white"
          >
            Réessayer
          </button>
        )}
        <Link to="/" className="flex h-11 items-center text-[15px] font-semibold text-navy">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
