function lastFriday(year: number, month: number): Date {
  const d = new Date(year, month + 1, 0)
  while (d.getDay() !== 5) d.setDate(d.getDate() - 1)
  d.setHours(12, 0, 0, 0)
  return d
}

/** Prochain dernier vendredi du mois, à 12h, à partir de `now`. */
export function nextMonthlyActivity(now: Date): Date {
  const thisMonth = lastFriday(now.getFullYear(), now.getMonth())
  return thisMonth >= now ? thisMonth : lastFriday(now.getFullYear(), now.getMonth() + 1)
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
