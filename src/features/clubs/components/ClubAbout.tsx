import Icon from '../../../components/Icon.tsx'
import type { ClubDetail } from '../types.ts'

export default function ClubAbout({ club }: { club: ClubDetail }) {
  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-x-12 gap-y-6">
      <div className="flex flex-col gap-3">
        <h2 className="m-0 text-[28px]/9 font-semibold">Le club</h2>
        <p className="m-0 text-pretty text-base/6 text-muted">{club.longDescription}</p>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-soft p-[clamp(20px,3vw,32px)]">
        <span className="flex items-center gap-2 text-[13px]/[18px] font-medium uppercase tracking-[.08em] text-muted">
          <Icon name="flag" size={18} className="text-navy" />
          But du club
        </span>
        <p className="m-0 text-pretty text-lg/7 font-medium">{club.goal}</p>
      </div>
    </section>
  )
}
