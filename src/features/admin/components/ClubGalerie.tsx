import Icon from '../../../components/Icon.tsx'
import { addPhotos, removePhoto, setCover, setPhotoLabel } from '../actions.ts'
import { useAdmin } from '../adminContext.ts'

function toItems(files: File[]) {
  return files
    .filter((f) => f.type.startsWith('image/'))
    .map((f) => ({ label: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), url: URL.createObjectURL(f) }))
}

export default function ClubGalerie() {
  const { state, apply } = useAdmin()

  function add(files: File[]) {
    const items = toItems(files)
    if (items.length > 0) apply((s) => addPhotos(s, items))
  }

  return (
    <div className="flex flex-col gap-6">
      <label
        onDrop={(e) => {
          e.preventDefault()
          add(Array.from(e.dataTransfer.files))
        }}
        onDragOver={(e) => e.preventDefault()}
        className="relative flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border-[1.5px] border-dashed border-[#8a95a8] bg-white p-6 hover:border-navy"
      >
        <span className="flex size-14 flex-none items-center justify-center rounded-xl bg-soft">
          <Icon name="cloud_upload" size={28} />
        </span>
        <span className="flex min-w-[220px] flex-1 flex-col gap-0.5">
          <span className="text-base/6 font-semibold">Ajouter des photos</span>
          <span className="text-[13px]/[18px] font-medium text-muted">
            JPG ou PNG. Redimensionnées à 1600 px et compressées automatiquement pour un chargement rapide sur mobile.
          </span>
        </span>
        <span className="flex h-12 items-center rounded-xl bg-accent px-5 text-[15px] font-semibold text-white">
          Choisir des fichiers
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            add(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
          className="absolute size-px opacity-0"
        />
      </label>

      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 text-xl/7 font-semibold">{state.photos.length} photos publiées</h2>
        <span className="text-[13px]/[18px] font-medium text-muted">
          60 photos maximum · la légende s'affiche dans la lightbox
        </span>
      </div>

      {state.photos.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-white px-4 py-12 text-center">
          <Icon name="photo_library" size={32} />
          <span className="text-base font-semibold">Aucune photo pour l'instant</span>
          <span className="text-[13px]/[18px] font-medium text-muted">
            La page publique affiche « Les premiers souvenirs arrivent bientôt ».
          </span>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-4">
        {state.photos.map((p, i) => {
          const isCover = p.id === state.cover
          return (
            <div
              key={p.id}
              className={`flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(11_31_58/0.06),0_4px_16px_rgb(11_31_58/0.05)] outline-2 ${
                isCover ? 'outline outline-accent' : 'outline outline-transparent'
              }`}
            >
              <div className="relative aspect-[4/3] bg-[repeating-linear-gradient(135deg,#e1e6ee_0_10px,#eaeef4_10px_20px)]">
                {p.url ? (
                  <span
                    role="img"
                    aria-label={p.label}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${p.url})` }}
                  />
                ) : (
                  <span className="absolute bottom-2 left-2.5 font-mono text-[11px] text-muted">photo</span>
                )}
                {isCover && (
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[13px]/[18px] font-medium text-white">
                    <Icon name="star" size={14} />
                    Couverture
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 p-2.5">
                <input
                  aria-label={`Légende de la photo ${i + 1}`}
                  placeholder="Légende"
                  value={p.label}
                  onChange={(e) => apply((s) => setPhotoLabel(s, p.id, e.target.value))}
                  className="h-11 w-full rounded-[10px] border border-[#c9d1dd] px-2.5 font-[inherit] text-sm text-navy outline-none focus:border-navy"
                />
                <div className="flex items-center justify-between gap-1">
                  {isCover ? (
                    <span className="px-2 text-[13px] font-medium text-muted">Photo de couverture</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => apply((s) => setCover(s, p.id))}
                      className="flex h-11 cursor-pointer items-center gap-1 rounded-[10px] border-0 bg-transparent px-2 font-[inherit] text-[13px] font-semibold text-navy hover:bg-soft"
                    >
                      <Icon name="star" size={18} />
                      Couverture
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Supprimer la photo"
                    onClick={() => apply((s) => removePhoto(s, p.id))}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-transparent text-muted hover:bg-soft hover:text-accent"
                  >
                    <Icon name="delete" size={20} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
