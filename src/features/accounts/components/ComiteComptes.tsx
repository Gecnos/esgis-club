import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { useAdmin } from '../../admin/adminContext.ts'
import { Card, cardClass, ErrorNote, Field, ghostButton, inputClass, outlineButton, primaryButton, TextInput } from '../../admin/components/ui.tsx'
import { useAuth } from '../../auth/authContext.ts'
import type { Role } from '../../auth/types.ts'
import { createAccount, deleteAccount, resetAccountPassword } from '../actions.ts'
import { listAccounts } from '../queries.ts'
import { generatePassword, validateAccount } from '../schemas.ts'
import type { AccountErrors } from '../schemas.ts'
import type { Account } from '../types.ts'

type Form = { name: string; email: string; password: string; role: Role; clubSlug: string }
const emptyForm = (clubSlug = ''): Form => ({ name: '', email: '', password: generatePassword(), role: 'club', clubSlug })

/** Identifiants à transmettre une seule fois : le mot de passe n'est plus consultable ensuite. */
type Handout = { email: string; password: string; label: string }

export default function ComiteComptes() {
  const { state } = useAdmin()
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[] | null>(null)
  const [loadError, setLoadError] = useState('')
  // `?club=slug` (depuis la page Clubs) préremplit le club du nouveau responsable.
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<Form>(() => emptyForm(searchParams.get('club') ?? ''))
  const [errors, setErrors] = useState<AccountErrors>({})
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [handout, setHandout] = useState<Handout | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [rowError, setRowError] = useState('')

  useEffect(() => {
    listAccounts().then(setAccounts, (e: Error) => setLoadError(e.message))
  }, [])

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))
  const clubLabel = (slug: string | null) => state.clubOptions.find(([s]) => s === slug)?.[1] ?? slug ?? ''
  // Un club n'a en général qu'un responsable : on signale ceux qui n'en ont pas encore.
  const clubsWithoutAccount = state.clubOptions.filter(([slug]) => !accounts?.some((a) => a.clubSlug === slug))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateAccount(form)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return
    setBusy(true)
    try {
      const created = await createAccount(form)
      setAccounts((list) => [...(list ?? []), created].sort((a, b) => a.name.localeCompare(b.name, 'fr')))
      setHandout({ email: created.email, password: form.password, label: created.name })
      setForm(emptyForm())
      setCopied(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Création impossible.')
    } finally {
      setBusy(false)
    }
  }

  async function copyHandout() {
    if (!handout) return
    try {
      await navigator.clipboard.writeText(`Email : ${handout.email}\nMot de passe : ${handout.password}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function onReset(a: Account) {
    setRowError('')
    const password = generatePassword()
    try {
      await resetAccountPassword(a.id, password)
      setHandout({ email: a.email, password, label: a.name })
      setCopied(false)
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Changement impossible.')
    }
  }

  async function onDelete(a: Account) {
    setRowError('')
    try {
      await deleteAccount(a.id)
      setAccounts((list) => (list ?? []).filter((x) => x.id !== a.id))
      setConfirmId(null)
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Suppression impossible.')
    }
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-6">
      <Card title="Créer un compte">
        <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
          <Field label="Type de compte">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Type de compte">
              {(['club', 'comite'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={form.role === r}
                  onClick={() => set('role', r)}
                  className={`h-12 cursor-pointer rounded-xl border-[1.5px] font-[inherit] text-[15px] font-semibold ${
                    form.role === r ? 'border-navy bg-navy text-white' : 'border-[#8a95a8] bg-white text-navy hover:bg-soft'
                  }`}
                >
                  {r === 'club' ? 'Responsable de club' : 'Membre du Comité'}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex flex-col gap-1.5">
            <TextInput id="acc-name" label="Nom complet" value={form.name} onChange={(v) => set('name', v)} />
            {errors.name && <ErrorNote>{errors.name}</ErrorNote>}
          </div>
          <div className="flex flex-col gap-1.5">
            <TextInput id="acc-email" label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="prenom.nom@gmail.com" />
            {errors.email && <ErrorNote>{errors.email}</ErrorNote>}
          </div>

          {form.role === 'club' && (
            <div className="flex flex-col gap-1.5">
              <Field id="acc-club" label="Club géré">
                <select
                  id="acc-club"
                  value={form.clubSlug}
                  onChange={(e) => set('clubSlug', e.target.value)}
                  className={`${inputClass} h-12 px-3`}
                >
                  <option value="">Choisir un club…</option>
                  {state.clubOptions.map(([slug, name]) => (
                    <option key={slug} value={slug}>
                      {name}
                      {clubsWithoutAccount.some(([s]) => s === slug) ? '' : ' (a déjà un compte)'}
                    </option>
                  ))}
                </select>
              </Field>
              {errors.clubSlug && <ErrorNote>{errors.clubSlug}</ErrorNote>}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Field id="acc-password" label="Mot de passe provisoire">
              <div className="flex gap-2">
                <input
                  id="acc-password"
                  type="text"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="off"
                  className={`${inputClass} h-12 min-w-0 flex-1 px-3.5 font-mono`}
                />
                <button
                  type="button"
                  aria-label="Générer un autre mot de passe"
                  onClick={() => set('password', generatePassword())}
                  className={`${outlineButton} size-12 flex-none justify-center`}
                >
                  <Icon name="autorenew" size={22} />
                </button>
              </div>
            </Field>
            {errors.password && <ErrorNote>{errors.password}</ErrorNote>}
            <p className="m-0 text-[13px]/[18px] text-muted">Transmets-le à la personne : elle le verra une seule fois ici.</p>
          </div>

          {formError && <ErrorNote>{formError}</ErrorNote>}
          <button type="submit" disabled={busy} className={`${primaryButton} h-12 px-5 disabled:opacity-60`}>
            <Icon name="person_add" size={20} />
            {busy ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      </Card>

      <div className="flex flex-col gap-6">
        {handout && (
          <section role="status" className={`${cardClass} flex flex-col gap-3 border-l-4 border-accent p-5`}>
            <h2 className="m-0 text-lg/6 font-semibold">Identifiants de {handout.label}</h2>
            <p className="m-0 text-[15px]/[22px]">
              Email : <strong>{handout.email}</strong>
              <br />
              Mot de passe : <strong className="font-mono">{handout.password}</strong>
            </p>
            <p className="m-0 text-[13px]/[18px] text-muted">Ils ne seront plus affichés. Copie-les maintenant et transmets-les en privé.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => void copyHandout()} className={`${outlineButton} h-11 px-4`}>
                <Icon name={copied ? 'check' : 'content_copy'} size={20} />
                {copied ? 'Copié' : 'Copier'}
              </button>
              <button type="button" onClick={() => setHandout(null)} className={`${ghostButton} h-11 px-3.5`}>
                Fermer
              </button>
            </div>
          </section>
        )}

        <Card title={`Comptes${accounts ? ` (${accounts.length})` : ''}`}>
          {loadError && <ErrorNote>{loadError}</ErrorNote>}
          {!accounts && !loadError && <p className="m-0 text-muted">Chargement…</p>}
          {rowError && <ErrorNote>{rowError}</ErrorNote>}
          <ul className="m-0 flex list-none flex-col p-0">
            {accounts?.map((a) => {
              const self = a.id === user?.id
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eef1f5] py-3 first:border-t-0">
                  <span className="flex min-w-0 flex-1 basis-48 flex-col">
                    <span className="truncate text-[15px]/[22px] font-semibold">
                      {a.name}
                      {self && <span className="ml-2 text-[13px] font-medium text-muted">(toi)</span>}
                    </span>
                    <span className="truncate text-[13px]/[18px] text-muted">{a.email}</span>
                  </span>
                  <span className="rounded-full bg-soft px-3 py-1 text-[13px]/[18px] font-semibold">
                    {a.role === 'comite' ? 'Comité' : `Club ${clubLabel(a.clubSlug)}`}
                  </span>
                  {!self &&
                    (confirmId === a.id ? (
                      <span className="flex items-center gap-1">
                        <button type="button" onClick={() => void onDelete(a)} className={`${primaryButton} h-10 px-3.5`}>
                          Supprimer
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)} className={`${ghostButton} h-10 px-3`}>
                          Annuler
                        </button>
                      </span>
                    ) : (
                      <span className="flex gap-1">
                        <button
                          type="button"
                          aria-label={`Nouveau mot de passe pour ${a.name}`}
                          title="Nouveau mot de passe"
                          onClick={() => void onReset(a)}
                          className={`${ghostButton} size-11 justify-center`}
                        >
                          <Icon name="key" size={22} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Supprimer le compte de ${a.name}`}
                          title="Supprimer"
                          onClick={() => setConfirmId(a.id)}
                          className={`${ghostButton} size-11 justify-center`}
                        >
                          <Icon name="delete" size={22} />
                        </button>
                      </span>
                    ))}
                </li>
              )
            })}
          </ul>
          {accounts && clubsWithoutAccount.length > 0 && (
            <p className="m-0 text-[13px]/[18px] text-muted">
              Sans responsable : {clubsWithoutAccount.map(([, n]) => n).join(', ')}.
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
