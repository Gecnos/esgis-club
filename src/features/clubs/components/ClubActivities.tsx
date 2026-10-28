import CoverImage from '../../../components/CoverImage.tsx'
import type { Activity } from '../types.ts'

export default function ClubActivities({ activities }: { activities: Activity[] }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="m-0 text-[28px]/9 font-semibold">Exemples d'activités</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-6">
        {activities.map((a) => (
          <article key={a.title} className="flex flex-col overflow-hidden rounded-xl bg-soft">
            <div className="relative flex aspect-[4/3] items-end bg-[repeating-linear-gradient(135deg,#e1e6ee_0_10px,#eaeef4_10px_20px)] p-3 font-mono text-[11px] text-muted">
              <CoverImage src={a.photoKey} />
              {a.photo}
              <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 font-sans text-[13px]/[18px] font-medium">
                {a.type}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 px-5 pb-5 pt-4">
              <h3 className="m-0 text-xl/7 font-semibold">{a.title}</h3>
              <p className="m-0 text-[15px]/[22px] text-muted">{a.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
