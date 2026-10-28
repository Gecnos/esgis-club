import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Icon from '../../../components/Icon.tsx'
import { formatFileSize } from '../../../lib/text.ts'
import { useMediaQuery } from '../../../lib/useMediaQuery.ts'
import { submitDossier } from '../actions.ts'
import { validateDossier } from '../schemas.ts'
import { emptyForm, stepFields, stepTitles } from '../types.ts'
import type { DossierForm, ErrorKey, FieldErrors, Step, UploadedFile } from '../types.ts'
import { FieldError, FileUpload, Required, Segmented, TextAreaField, TextField } from './FormFields.tsx'
import SubmissionSuccess from './SubmissionSuccess.tsx'

const sectionTitle = (n: number, label: string) => (
  <div className="flex items-center gap-3 border-b border-line pb-3">
    <span className="flex size-7 items-center justify-center rounded-full bg-soft text-[13px] font-semibold">{n}</span>
    <span className="text-base/6 font-semibold">{label}</span>
  </div>
)

const toUploaded = (file: File): UploadedFile => ({ name: file.name, size: formatFileSize(file.size), file })

const smallInput =
  'w-full rounded-[10px] border border-[#c9d1dd] bg-white font-[inherit] text-navy outline-none focus:border-navy'

export default function CreateClubForm() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const formTop = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState<DossierForm>(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [step, setStep] = useState<Step>(1)
  const [reference, setReference] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const errorCount = Object.keys(errors).length
  const show = (n: Step) => !isMobile || step === n

  function scrollToForm() {
    const el = formTop.current
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 88, behavior: 'smooth' })
  }

  function update<K extends keyof DossierForm>(key: K, value: DossierForm[K], errorKey?: ErrorKey) {
    setForm((f) => ({ ...f, [key]: value }))
    const clear = errorKey ?? (key as ErrorKey)
    setErrors((e) => {
      if (!(clear in e)) return e
      const { [clear]: _removed, ...rest } = e
      return rest
    })
  }

  function setObjectif(i: number, value: string) {
    update('objectifs', form.objectifs.map((o, j) => (j === i ? value : o)))
  }

  function setRow(i: number, key: 'date' | 'activity', value: string) {
    update('calRows', form.calRows.map((r, j) => (j === i ? { ...r, [key]: value } : r)), 'cal')
  }

  function next() {
    const found = validateDossier(form, stepFields[step])
    setErrors(found)
    if (Object.keys(found).length === 0) {
      setStep((s) => Math.min(3, s + 1) as Step)
      scrollToForm()
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1) as Step)
    setErrors({})
    scrollToForm()
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validateDossier(form)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      const firstStep = ([1, 2, 3] as Step[]).find((n) => stepFields[n].some((k) => found[k])) ?? 1
      setStep(firstStep)
      scrollToForm()
      return
    }
    setSending(true)
    try {
      const result = await submitDossier(form)
      setReference(result.reference)
      setErrors({})
    } finally {
      setSending(false)
      scrollToForm()
    }
  }

  function reset() {
    setForm(emptyForm)
    setStep(1)
    setErrors({})
    setReference(null)
    scrollToForm()
  }

  return (
    <div
      ref={formTop}
      className="mt-[clamp(32px,5vw,56px)] rounded-xl bg-white p-[clamp(20px,4vw,48px)] shadow-[0_1px_2px_rgb(11_31_58/0.06),0_12px_32px_rgb(11_31_58/0.08)]"
    >
      {reference ? (
        <SubmissionSuccess
          prenom={form.nom.trim().split(/\s+/)[0] ?? ''}
          clubName={form.club || 'ton club'}
          whatsapp={form.wa}
          reference={reference}
          onReset={reset}
        />
      ) : (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-xl/7 font-semibold">Formulaire de proposition</h3>
            <p className="m-0 text-[13px]/[18px] font-medium text-muted">
              Les champs marqués <span className="text-accent">*</span> sont obligatoires · environ 10 minutes
            </p>
          </div>

          {isMobile && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base/6 font-semibold">{stepTitles[step]}</span>
                <span className="text-[13px]/[18px] font-medium text-muted">Étape {step} sur 3</span>
              </div>
              <div
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={3}
                aria-valuenow={step}
                className="h-1.5 overflow-hidden rounded-full bg-line"
              >
                <div className="h-full rounded-full bg-navy transition-[width]" style={{ width: `${(step / 3) * 100}%` }} />
              </div>
            </div>
          )}

          {errorCount > 0 && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-[#f2c4c9] bg-[#fdf0f1] p-4">
              <Icon name="error" size={22} className="text-accent" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px]/[22px] font-semibold">
                  {errorCount === 1
                    ? '1 champ à corriger avant de continuer.'
                    : `${errorCount} champs à corriger avant de soumettre ton projet.`}
                </span>
                <span className="text-[13px]/[18px] font-medium text-muted">
                  Les champs concernés sont signalés en rouge ci-dessous.
                </span>
              </div>
            </div>
          )}

          {show(1) && (
            <div className="flex flex-col gap-5">
              {!isMobile && sectionTitle(1, "Informations sur l'initiateur")}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-6 gap-y-5">
                <TextField id="f-nom" label="Nom et prénom" placeholder="Ex. Aïcha Houngbédji" autoComplete="name" value={form.nom} onChange={(v) => update('nom', v)} error={errors.nom} />
                <TextField id="f-filiere" label="Filière et niveau" placeholder="Ex. Génie logiciel – Licence 2" autoComplete="off" value={form.filiere} onChange={(v) => update('filiere', v)} error={errors.filiere} />
                <TextField id="f-email" label="Email" type="email" inputMode="email" autoComplete="email" placeholder="prenom.nom@gmail.com" value={form.email} onChange={(v) => update('email', v)} error={errors.email} />
                <TextField id="f-wa" label="Numéro WhatsApp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+229 01 XX XX XX XX" hint="Le Comité te contactera sur ce numéro." value={form.wa} onChange={(v) => update('wa', v)} error={errors.wa} />
              </div>
            </div>
          )}

          {show(2) && (
            <div className="flex flex-col gap-5">
              {!isMobile && sectionTitle(2, 'Projet de club')}
              <TextField id="f-club" label="Nom du club" placeholder="Ex. Club Échecs ESGIS" className="max-w-[560px]" value={form.club} onChange={(v) => update('club', v)} error={errors.club} />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-x-6 gap-y-5">
                <TextAreaField id="f-contexte" label="Contexte de la création" placeholder="Pourquoi ce club ? Quel besoin as-tu observé chez les étudiants ?" hint="3 à 5 phrases suffisent." value={form.contexte} onChange={(v) => update('contexte', v)} error={errors.contexte} />
                <TextAreaField id="f-vision" label="Vision" placeholder="Que sera devenu ton club dans 2 ou 3 ans ?" value={form.vision} onChange={(v) => update('vision', v)} error={errors.vision} />
              </div>

              <div className="flex max-w-[720px] flex-col gap-2">
                <span className="text-sm/5 font-semibold">
                  Objectifs <Required />
                </span>
                <span className="text-[13px]/[18px] font-medium text-muted">
                  Un objectif par ligne, concret et si possible mesurable.
                </span>
                {form.objectifs.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex size-7 flex-none items-center justify-center rounded-full bg-soft text-[13px] font-semibold">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      aria-label={`Objectif ${i + 1}`}
                      placeholder={i === 0 ? "Ex. Organiser une séance d'initiation chaque vendredi" : 'Objectif suivant'}
                      value={o}
                      onChange={(e) => setObjectif(i, e.target.value)}
                      className={`h-12 min-w-0 flex-1 rounded-xl border-[1.5px] bg-white px-3.5 text-base text-navy outline-none placeholder:text-[#7a8499] focus:border-navy focus:shadow-[0_0_0_3px_rgb(11_31_58/0.14)] ${
                        errors.objectifs && !o.trim() ? 'border-accent' : 'border-[#8a95a8]'
                      }`}
                    />
                    {form.objectifs.length > 1 && (
                      <button
                        type="button"
                        aria-label="Supprimer cet objectif"
                        onClick={() => update('objectifs', form.objectifs.filter((_, j) => j !== i))}
                        className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-muted hover:bg-soft hover:text-navy"
                      >
                        <Icon name="delete" size={22} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => form.objectifs.length < 8 && update('objectifs', [...form.objectifs, ''])}
                  className="flex h-11 cursor-pointer items-center gap-1.5 self-start rounded-xl border-0 bg-transparent pl-2 pr-3 text-[15px] font-semibold text-navy hover:bg-soft"
                >
                  <Icon name="add" size={22} />
                  Ajouter un objectif
                </button>
                <FieldError message={errors.objectifs} />
              </div>
            </div>
          )}

          {show(3) && (
            <div className="flex flex-col gap-7">
              {!isMobile && sectionTitle(3, 'Documents et engagement')}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-x-6 gap-y-7">
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm/5 font-semibold">
                      Règlement intérieur <Required />
                    </span>
                    <Segmented
                      value={form.reglMode}
                      onChange={(v) => update('reglMode', v)}
                      options={[
                        { value: 'file', label: 'Importer' },
                        { value: 'text', label: 'Saisir en texte' },
                      ]}
                    />
                  </div>
                  {form.reglMode === 'file' ? (
                    <FileUpload
                      file={form.reglFile}
                      onFile={(f) => update('reglFile', toUploaded(f), 'regl')}
                      onRemove={() => update('reglFile', null)}
                      accept=".pdf,.doc,.docx"
                      icon="cloud_upload"
                      hasError={!!errors.regl}
                      title={<>Dépose ton fichier ou <span className="underline underline-offset-[3px]">parcours</span></>}
                      hint="PDF ou DOCX · 10 Mo max"
                    />
                  ) : (
                    <textarea
                      aria-label="Règlement intérieur"
                      rows={6}
                      placeholder="Article 1 – Objet du club…"
                      value={form.reglText}
                      onChange={(e) => update('reglText', e.target.value, 'regl')}
                      className={`min-h-[148px] w-full resize-y rounded-xl border-[1.5px] px-3.5 py-3 text-base/6 text-navy outline-none focus:border-navy focus:shadow-[0_0_0_3px_rgb(11_31_58/0.14)] ${
                        errors.regl ? 'border-accent' : 'border-[#8a95a8]'
                      }`}
                    />
                  )}
                  <FieldError message={errors.regl} />
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm/5 font-semibold">
                      Calendrier d'activités <Required />
                    </span>
                    <Segmented
                      value={form.calMode}
                      onChange={(v) => update('calMode', v)}
                      options={[
                        { value: 'file', label: 'Importer' },
                        { value: 'table', label: 'Tableau simple' },
                      ]}
                    />
                  </div>
                  {form.calMode === 'file' ? (
                    <FileUpload
                      file={form.calFile}
                      onFile={(f) => update('calFile', toUploaded(f), 'cal')}
                      onRemove={() => update('calFile', null)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      icon="calendar_month"
                      hasError={!!errors.cal}
                      title={<>Dépose ton calendrier ou <span className="underline underline-offset-[3px]">parcours</span></>}
                      hint="PDF, DOCX ou XLSX · 10 Mo max"
                    />
                  ) : (
                    <div className={`overflow-hidden rounded-xl border-[1.5px] ${errors.cal ? 'border-accent' : 'border-[#8a95a8]'}`}>
                      <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_44px] gap-2 bg-soft px-3 py-2 text-[13px]/[18px] font-medium text-muted">
                        <span>Date</span>
                        <span>Activité / séance</span>
                        <span />
                      </div>
                      {form.calRows.map((r, i) => (
                        <div key={i} className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_44px] items-center gap-2 border-t border-line p-2">
                          <input
                            type="date"
                            aria-label={`Date de la séance ${i + 1}`}
                            value={r.date}
                            onChange={(e) => setRow(i, 'date', e.target.value)}
                            className={`${smallInput} h-11 px-2 text-sm`}
                          />
                          <input
                            type="text"
                            aria-label={`Activité de la séance ${i + 1}`}
                            placeholder="Ex. Séance d'initiation"
                            value={r.activity}
                            onChange={(e) => setRow(i, 'activity', e.target.value)}
                            className={`${smallInput} h-11 px-2.5 text-[15px]`}
                          />
                          <button
                            type="button"
                            aria-label="Supprimer la ligne"
                            onClick={() =>
                              update('calRows', form.calRows.length > 1 ? form.calRows.filter((_, j) => j !== i) : [{ date: '', activity: '' }])
                            }
                            className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-transparent text-muted hover:bg-soft hover:text-navy"
                          >
                            <Icon name="delete" size={20} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => update('calRows', [...form.calRows, { date: '', activity: '' }])}
                        className="flex h-12 w-full cursor-pointer items-center gap-1.5 border-0 border-t border-line bg-white px-3 text-[15px] font-semibold text-navy hover:bg-[#fafbfd]"
                      >
                        <Icon name="add" size={22} />
                        Ajouter une séance
                      </button>
                    </div>
                  )}
                  <FieldError message={errors.cal} />
                </div>
              </div>

              <div className="flex max-w-[640px] flex-col gap-2.5">
                <span className="text-sm/5 font-semibold">
                  Document projet complet <span className="font-medium text-muted">(facultatif)</span>
                </span>
                <FileUpload
                  compact
                  file={form.docFile}
                  onFile={(f) => update('docFile', toUploaded(f))}
                  onRemove={() => update('docFile', null)}
                  accept=".pdf,.doc,.docx"
                  icon="cloud_upload"
                  title="Ajouter le dossier complet"
                  hint="PDF ou DOCX · 20 Mo max"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-[1.5px] bg-soft p-4 ${
                    errors.engage ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.engage}
                    onChange={(e) => update('engage', e.target.checked)}
                    className="mt-px size-[22px] flex-none cursor-pointer accent-navy"
                  />
                  <span className="text-base/6 font-medium">
                    Je m'engage à défendre mon projet devant le panel <Required />
                  </span>
                </label>
                <FieldError message={errors.engage} />
              </div>
            </div>
          )}

          {!isMobile ? (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <span className="flex items-center gap-2 text-[13px]/[18px] font-medium text-muted">
                <Icon name="schedule" size={18} />
                Réponse du Comité sous 7 jours après le dépôt.
              </span>
              <button
                type="submit"
                disabled={sending}
                className="h-[52px] cursor-pointer rounded-xl border-0 bg-accent px-7 text-base font-semibold text-white shadow-[0_4px_12px_rgb(214_40_57/0.25)] hover:bg-accent-dark disabled:opacity-60"
              >
                Soumettre mon projet
              </button>
            </div>
          ) : (
            <div className="flex gap-3 border-t border-line pt-5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="flex h-[52px] cursor-pointer items-center gap-1 rounded-xl border-[1.5px] border-navy bg-white px-4 text-base font-semibold text-navy"
                >
                  <Icon name="chevron_left" size={22} />
                  Retour
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="flex h-[52px] flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl border-0 bg-navy text-base font-semibold text-white"
                >
                  Continuer
                  <Icon name="chevron_right" size={22} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={sending}
                  className="h-[52px] flex-1 cursor-pointer rounded-xl border-0 bg-accent text-base font-semibold text-white disabled:opacity-60"
                >
                  Soumettre mon projet
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  )
}
