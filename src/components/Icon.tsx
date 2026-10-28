type Props = { name: string; size?: number; className?: string }

export default function Icon({ name, size = 24, className = '' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded select-none ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {name}
    </span>
  )
}
