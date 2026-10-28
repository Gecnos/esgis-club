export function fmt(d: Date, options: Intl.DateTimeFormatOptions): string {
  return d.toLocaleDateString('fr-FR', options)
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Nombre de jours entiers entre deux dates (positif si `b` est après `a`). */
export function diffDays(a: Date, b: Date): number {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((day(b) - day(a)) / 864e5)
}

export function lastFridayOf(year: number, month: number): Date {
  const d = new Date(year, month + 1, 0)
  while (d.getDay() !== 5) d.setDate(d.getDate() - 1)
  return d
}
