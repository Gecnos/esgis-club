import type { ReactNode } from 'react'
import Icon from '../../../components/Icon.tsx'

export const cardClass =
  'rounded-xl bg-white shadow-[0_1px_2px_rgb(11_31_58/0.06),0_4px_16px_rgb(11_31_58/0.05)]'

export const inputClass =
  'w-full rounded-xl border-[1.5px] border-[#8a95a8] bg-white font-[inherit] text-base text-navy outline-none placeholder:text-[#7a8499] focus:border-navy focus:shadow-[0_0_0_3px_rgb(11_31_58/0.14)]'

export const smallInputClass =
  'w-full rounded-[10px] border border-[#c9d1dd] bg-white font-[inherit] text-navy outline-none focus:border-navy'

export const ghostButton =
  'flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-transparent font-[inherit] font-semibold text-navy hover:bg-soft'

export const primaryButton =
  'flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-accent font-[inherit] text-[15px] font-semibold text-white hover:bg-accent-dark'

export const outlineButton =
  'flex cursor-pointer items-center gap-2 rounded-xl border-[1.5px] border-navy bg-white font-[inherit] text-[15px] font-semibold text-navy no-underline hover:bg-soft'

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${cardClass} flex flex-col gap-5 p-[clamp(20px,3vw,32px)] ${className}`}>
      {title && <h2 className="m-0 text-xl/7 font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

export function Field({ id, label, children }: { id?: string; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm/5 font-semibold">
        {label}
      </label>
      {children}
    </div>
  )
}

type TextInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}

export function TextInput({ id, label, value, onChange, type = 'text', placeholder }: TextInputProps) {
  return (
    <Field id={id} label={label}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} h-12 px-3.5`}
      />
    </Field>
  )
}

type TextAreaInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  rows: number
  max: number
}

export function TextAreaInput({ id, label, value, onChange, rows, max }: TextAreaInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        <label htmlFor={id} className="text-sm/5 font-semibold">
          {label}
        </label>
        <span className="text-[13px]/[18px] font-medium tabular-nums text-muted">
          {value.length} / {max}
        </span>
      </div>
      <textarea
        id={id}
        rows={rows}
        maxLength={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y px-3.5 py-3 leading-6`}
      />
    </div>
  )
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 flex gap-1.5 text-[13px]/[18px] font-medium text-accent">
      <Icon name="error" size={16} className="leading-[18px]" />
      {children}
    </p>
  )
}

export function FileButton({
  accept,
  multiple,
  onFiles,
  className,
  children,
}: {
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  className: string
  children: ReactNode
}) {
  return (
    <label className={`relative cursor-pointer ${className}`}>
      {children}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
        className="absolute size-px opacity-0"
      />
    </label>
  )
}
