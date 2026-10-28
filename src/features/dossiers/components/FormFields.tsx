import type { ReactNode } from 'react'
import Icon from '../../../components/Icon.tsx'
import type { UploadedFile } from '../types.ts'

const inputBase =
  'w-full rounded-xl border-[1.5px] bg-white text-base text-navy outline-none placeholder:text-[#7a8499] focus:border-navy focus:shadow-[0_0_0_3px_rgb(11_31_58/0.14)]'
const borderOf = (error?: string) => (error ? 'border-accent' : 'border-[#8a95a8]')

export function Required() {
  return (
    <span aria-hidden="true" className="text-accent">
      *
    </span>
  )
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="m-0 flex items-start gap-1.5 text-[13px]/[18px] font-medium text-accent">
      <Icon name="error" size={16} className="leading-[18px]" />
      {message}
    </p>
  )
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  placeholder?: string
  type?: string
  inputMode?: 'text' | 'email' | 'tel'
  autoComplete?: string
  className?: string
}

export function TextField({ id, label, value, onChange, error, hint, placeholder, type = 'text', inputMode, autoComplete, className = '' }: TextFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm/5 font-semibold">
        {label} <Required />
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputBase} h-12 px-3.5 ${borderOf(error)}`}
      />
      <FieldError id={`${id}-error`} message={error} />
      {hint && !error && <p className="m-0 text-[13px]/[18px] font-medium text-muted">{hint}</p>}
    </div>
  )
}

type TextAreaFieldProps = Omit<TextFieldProps, 'type' | 'inputMode' | 'autoComplete'>

export function TextAreaField({ id, label, value, onChange, error, hint, placeholder, className = '' }: TextAreaFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm/5 font-semibold">
        {label} <Required />
      </label>
      <textarea
        id={id}
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputBase} min-h-32 resize-y px-3.5 py-3 leading-6 ${borderOf(error)}`}
      />
      <FieldError id={`${id}-error`} message={error} />
      {hint && !error && <p className="m-0 text-[13px]/[18px] font-medium text-muted">{hint}</p>}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-soft p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 cursor-pointer rounded-[9px] border-0 px-3 text-[13px] font-semibold text-navy ${
            o.value === value ? 'bg-white shadow-[0_1px_3px_rgb(11_31_58/0.14)]' : 'bg-transparent'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

type FileUploadProps = {
  file: UploadedFile | null
  onFile: (file: File) => void
  onRemove: () => void
  accept: string
  icon: string
  title: ReactNode
  hint: string
  hasError?: boolean
  compact?: boolean
}

export function FileUpload({ file, onFile, onRemove, accept, icon, title, hint, hasError, compact }: FileUploadProps) {
  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#c9d1dd] py-2.5 pl-3 pr-1.5">
        <span className="flex size-10 flex-none items-center justify-center rounded-[10px] bg-soft">
          <Icon name="description" size={22} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px]/[22px] font-semibold">{file.name}</span>
          <span className="text-[13px]/[18px] font-medium text-muted">{file.size} · importé</span>
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Retirer le fichier"
          className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-muted hover:bg-soft hover:text-navy"
        >
          <Icon name="close" size={22} />
        </button>
      </div>
    )
  }

  const pick = (f: File | undefined) => f && onFile(f)

  return (
    <label
      onDrop={(e) => {
        e.preventDefault()
        pick(e.dataTransfer.files[0])
      }}
      onDragOver={(e) => e.preventDefault()}
      className={`relative flex cursor-pointer rounded-xl border-[1.5px] border-dashed bg-[#fafbfd] hover:border-navy hover:bg-soft ${
        hasError ? 'border-accent' : 'border-[#8a95a8]'
      } ${
        compact
          ? 'min-h-16 items-center gap-3 px-4 py-3'
          : 'min-h-[148px] flex-col items-center justify-center gap-1.5 px-4 py-6 text-center'
      }`}
    >
      <Icon name={icon} size={compact ? 24 : 32} />
      <span className={`flex flex-col ${compact ? '' : 'items-center gap-1.5'}`}>
        <span className={compact ? 'text-[15px]/[22px] font-semibold' : 'text-base/6 font-semibold'}>{title}</span>
        <span className="text-[13px]/[18px] font-medium text-muted">{hint}</span>
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(e) => pick(e.target.files?.[0])}
        className="absolute size-px overflow-hidden opacity-0"
      />
    </label>
  )
}
