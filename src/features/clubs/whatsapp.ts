import type { ClubDetail } from './types.ts'

export function whatsappLink(club: ClubDetail) {
  return `https://wa.me/${club.whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite rejoindre le club ${club.name}.`)}`
}
