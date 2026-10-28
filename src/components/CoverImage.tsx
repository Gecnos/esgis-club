import { imageUrl } from '../lib/storage.ts'

type Props = { src?: string | null; alt?: string; className?: string }

/**
 * Image qui remplit son parent (qui doit être `relative`). Sans photo, ne rend rien :
 * le placeholder rayé du parent reste visible.
 */
export default function CoverImage({ src, alt = '', className = '' }: Props) {
  const url = imageUrl(src)
  if (!url) return null
  return <img src={url} alt={alt} loading="lazy" className={`absolute inset-0 size-full rounded-[inherit] object-cover ${className}`} />
}
