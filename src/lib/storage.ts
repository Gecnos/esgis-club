import { env } from './env.ts'
import { supabase } from './supabase.ts'

const IMAGE_MAX_SIDE = 1600

/**
 * URL affichable d'une image. `key` est une clé d'objet R2 (ex. `clubs/robotique/cover.jpg`),
 * ou déjà une URL (démo : `blob:`). Renvoie `undefined` s'il n'y a rien à afficher,
 * ce qui déclenche le placeholder rayé.
 */
export function imageUrl(key: string | null | undefined): string | undefined {
  if (!key || key.startsWith('demo:')) return undefined
  if (/^(https?:|blob:|data:)/.test(key)) return key
  return env.r2PublicUrl ? `${env.r2PublicUrl}/${key}` : undefined
}

type Dimensions = { blob: Blob; ratio: number }

/** Redimensionne à 1600 px max et compresse en JPEG, pour un chargement rapide sur mobile. */
async function shrinkImage(file: File): Promise<Dimensions> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
  return { blob: blob ?? file, ratio: bitmap.width / bitmap.height }
}

async function putToR2(body: Blob, folder: string, filename: string, contentType: string): Promise<string> {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.functions.invoke<{ uploadUrl: string; key: string }>('r2-presign', {
    body: { folder, filename, contentType, size: body.size },
  })
  if (error || !data) throw error ?? new Error("Impossible d'obtenir l'URL d'envoi")
  const res = await fetch(data.uploadUrl, { method: 'PUT', body, headers: { 'Content-Type': contentType } })
  if (!res.ok) throw new Error(`Envoi vers R2 refusé (${res.status})`)
  return data.key
}

/** Envoie une image (redimensionnée) vers R2. En démo, renvoie une URL `blob:` locale. */
export async function uploadImage(file: File, folder: string): Promise<{ key: string; ratio: number }> {
  const { blob, ratio } = await shrinkImage(file)
  if (!supabase) return { key: URL.createObjectURL(blob), ratio }
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return { key: await putToR2(blob, folder, name, 'image/jpeg'), ratio }
}

/** Envoie un document (PDF, DOCX…) vers R2 et renvoie sa clé. En démo, renvoie le nom du fichier. */
export async function uploadDocument(file: File, folder: string): Promise<string> {
  if (!supabase) return file.name
  return putToR2(file, folder, file.name, file.type || 'application/octet-stream')
}
