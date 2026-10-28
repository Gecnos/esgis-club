import CoverImage from '../../../components/CoverImage.tsx'
import type { BureauMember } from '../types.ts'

export default function ClubBureau({ bureau }: { bureau: BureauMember[] }) {
  if (bureau.length === 0) return null
  return (
    <section className="flex flex-col gap-6">
      <h2 className="m-0 text-[28px]/9 font-semibold">Bureau du club</h2>
      <div className="grid max-w-[1040px] grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))] gap-x-4 gap-y-6">
        {bureau.map((m) => (
          <div key={m.role} className="flex flex-col gap-3">
            <div className="ph-light relative flex aspect-square items-end rounded-xl p-2.5 font-mono text-[11px] text-muted">
              <CoverImage src={m.photoKey} alt={m.name} />
              portrait
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px]/[18px] font-medium text-accent">{m.role}</span>
              <span className="text-base/6 font-semibold">{m.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
