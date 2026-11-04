import CoverImage from '../../../components/CoverImage.tsx'
import type { BureauMember } from '../types.ts'

export default function ClubBureau({ bureau }: { bureau: BureauMember[] }) {
  if (bureau.length === 0) return null
  return (
    <section aria-labelledby="bureau-titre" className="flex flex-col gap-6">
      <h2 id="bureau-titre" className="m-0 text-[28px]/9 font-semibold">Bureau du club</h2>
      <div className="grid max-w-[1040px] grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))] gap-x-4 gap-y-6">
        {bureau.map((m) => (
          <div key={m.role} className="flex flex-col gap-3">
            <div className="ph-light relative flex aspect-square items-end rounded-xl p-2.5 font-mono text-[11px] text-muted">
              <CoverImage src={m.photoKey} alt={`Portrait de ${m.name}, ${m.role}`} />
              portrait
            </div>
            <dl className="m-0 flex flex-col gap-0.5">
              <dt className="text-[13px]/[18px] font-medium text-accent">{m.role}</dt>
              <dd className="m-0 text-base/6 font-semibold">{m.name}</dd>
            </dl>
          </div>
        ))}
      </div>
    </section>
  )
}
