type Props = { label: string; className?: string }

export default function PhotoPlaceholder({ label, className = '' }: Props) {
  return (
    <div
      className={`flex items-end rounded-2xl border border-white/10 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.03)_0_12px,transparent_12px_24px)] bg-night-900 p-3 ${className}`}
    >
      <span className="font-mono text-xs text-white/60">photo · {label}</span>
    </div>
  )
}
