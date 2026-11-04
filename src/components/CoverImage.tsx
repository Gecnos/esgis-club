import { imageUrl } from '../lib/storage.ts'

type Props = { src?: string | null; alt?: string; className?: string; priority?: boolean }

/**
 * Image qui remplit son parent (qui doit être `relative`). Sans photo, ne rend rien :
 * le placeholder rayé du parent reste visible.
 *
 * Passer `priority` pour les images au-dessus de la ligne de flottaison (LCP) :
 * active loading="eager" + fetchpriority="high" pour optimiser les Core Web Vitals.
 */
export default function CoverImage({ src, alt = '', className = '', priority = false }: Props) {
  const url = imageUrl(src)
  if (!url) return null
  return (
    <img
      src={url}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={`absolute inset-0 size-full rounded-[inherit] object-cover ${className}`}
    />
  )
}
