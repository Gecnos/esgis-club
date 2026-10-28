import { Link } from 'react-router'
import PhotoPlaceholder from '../../../components/PhotoPlaceholder.tsx'

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium">
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
          Inscriptions ouvertes · 2026–2027
        </p>
        <h1 className="mt-8 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Trouve ton club, construis ton réseau
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/80">
          11 clubs étudiants, ouverts à toutes les filières. Choisis ta passion, retrouve ton équipe chaque
          vendredi et élargis ton réseau ESGIS.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/clubs"
            className="rounded-lg bg-accent px-7 py-4 font-bold shadow-lg shadow-accent/30 hover:brightness-110"
          >
            Découvrir les clubs →
          </Link>
          <Link
            to="/creer-un-club"
            className="rounded-lg border border-white/80 px-7 py-4 font-bold hover:bg-white/10"
          >
            Créer un club
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 grid-rows-[repeat(3,minmax(8rem,1fr))] gap-4" aria-hidden="true">
        <PhotoPlaceholder label="match de basket 3x3" className="col-span-2 row-span-2" />
        <PhotoPlaceholder label="robotique" />
        <PhotoPlaceholder label="danse" />
        <PhotoPlaceholder label="débat" />
        <PhotoPlaceholder label="concert du club Musique" className="col-span-2" />
      </div>
    </section>
  )
}
