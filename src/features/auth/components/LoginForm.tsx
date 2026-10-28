import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import Logo from '../../../components/Logo.tsx'
import { env, useMocks } from '../../../lib/env.ts'
import { requestPasswordReset } from '../actions.ts'
import { useAuth } from '../authContext.ts'
import { demoAccounts } from '../mocks.ts'
import { validateLogin } from '../schemas.ts'
import type { LoginErrors } from '../schemas.ts'

const field =
  'h-12 w-full rounded-xl border-[1.5px] bg-white px-3.5 text-base text-navy outline-none placeholder:text-[#7a8499] focus:border-navy focus:shadow-[0_0_0_3px_rgb(11_31_58/0.14)]'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="m-0 flex items-start gap-1.5 text-[13px]/[18px] font-medium text-accent">
      <Icon name="error" size={16} className="leading-[18px]" />
      {message}
    </p>
  )
}

export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const found = validateLogin({ email, password })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSending(true)
    try {
      const user = await login({ email, password })
      navigate(from ?? (user.role === 'comite' ? '/admin/comite' : '/admin/club'), { replace: true })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Connexion impossible, réessaie.')
    } finally {
      setSending(false)
    }
  }

  async function onReset() {
    const found = validateLogin({ email, password: 'x' })
    if (found.email) return setErrors({ email: found.email })
    setErrors({})
    await requestPasswordReset(email)
    setResetSent(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-soft text-navy">
      <header className="bg-navy px-[clamp(16px,4vw,24px)] text-white">
        <div className="mx-auto flex h-[72px] max-w-[1248px] items-center justify-between">
          <Link to="/" aria-label="ESGIS Clubs – Accueil" className="text-white no-underline">
            <Logo />
          </Link>
          <Link to="/" className="flex h-11 items-center gap-2 rounded-xl px-3 text-[15px] font-medium text-white no-underline hover:bg-white/10">
            <Icon name="arrow_back" size={20} />
            Retour au site
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-[clamp(16px,4vw,24px)] py-[clamp(32px,6vw,72px)]">
        <div className="w-full max-w-[440px] rounded-xl bg-white p-[clamp(24px,5vw,40px)] shadow-[0_1px_2px_rgb(11_31_58/0.06),0_12px_32px_rgb(11_31_58/0.08)]">
          <div className="flex flex-col gap-2">
            <span className="flex size-12 items-center justify-center rounded-xl bg-navy text-white">
              <Icon name="lock" size={24} />
            </span>
            <h1 className="m-0 mt-2 text-[28px]/9 font-semibold tracking-[-.01em]">Connexion</h1>
            <p className="m-0 text-pretty text-base/6 text-muted">
              Espace réservé aux responsables de club et au Comité des Clubs.
            </p>
          </div>

          {useMocks && env.isDev && (
            <div className="mt-6 rounded-xl border border-line bg-soft p-4 text-[13px]/[18px] text-muted">
              <strong className="text-navy">Mode démo</strong> : Supabase n'est pas configuré. Comptes de test :
              <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
                {demoAccounts.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(a.email)
                        setPassword(a.password)
                      }}
                      className="cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-[13px] text-navy underline underline-offset-2"
                    >
                      {a.email}
                    </button>{' '}
                    · {a.role === 'club' ? 'Responsable de club' : 'Comité'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-5">
            {formError && (
              <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#f2c4c9] bg-[#fdf0f1] p-4">
                <Icon name="error" size={22} className="text-accent" />
                <span className="text-[15px]/[22px] font-semibold">{formError}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="login-email" className="text-sm/5 font-semibold">Email</label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="prenom.nom@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                className={`${field} ${errors.email ? 'border-accent' : 'border-[#8a95a8]'}`}
              />
              <FieldError id="login-email-error" message={errors.email} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="login-password" className="text-sm/5 font-semibold">Mot de passe</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  className={`${field} pr-24 ${errors.password ? 'border-accent' : 'border-[#8a95a8]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 cursor-pointer rounded-[10px] border-0 bg-transparent px-3 font-[inherit] text-[13px] font-semibold text-navy hover:bg-soft"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              <FieldError id="login-password-error" message={errors.password} />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="h-[52px] cursor-pointer rounded-xl border-0 bg-accent font-[inherit] text-base font-semibold text-white shadow-[0_4px_12px_rgb(214_40_57/0.25)] hover:bg-accent-dark disabled:opacity-60"
            >
              {sending ? 'Connexion…' : 'Se connecter'}
            </button>

            {resetSent ? (
              <p role="status" className="m-0 text-[13px]/[18px] font-medium text-muted">
                Si ce compte existe, un email de réinitialisation vient d'être envoyé.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void onReset()}
                className="min-h-11 cursor-pointer self-center border-0 bg-transparent font-[inherit] text-[15px] font-semibold text-navy underline underline-offset-[3px]"
              >
                Mot de passe oublié ?
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
