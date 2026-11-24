import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Bell,
  Check,
  CircleHelp,
  LockKeyhole,
  LogOut,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sprout,
  UserRound,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { copyUserSettings } from '../api/mock/settings'
import { Badge, Button, Card, Chip, Input } from '../components/ui'
import { useSettings } from '../context/SettingsContext'
import { validateUserSettings, parseCommaSeparatedList } from '../lib/settings'
import type {
  ApplicationPreferences,
  FoodPreferences,
  GenderOption,
  SettingsFieldErrors,
  UserProfile,
  UserSettings,
  WellnessGoals,
} from '../types/settings'

const wellnessObjectives = [
  'Try more food variety',
  'Plan easy meals ahead',
  'Notice meal timing',
  'Cook at home more often',
  'Keep a thoughtful meal journal',
]

const dietaryPreferenceOptions = [
  'Gluten-free preference',
  'Dairy-free preference',
  'Jain-style preference',
  'No onion or garlic preference',
]

const favouriteCategoryOptions = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'South Indian',
  'North Indian',
  'Home-style meals',
  'Quick meals',
]

const controlClassName = 'min-h-12 w-full rounded-tile border border-line bg-surface px-3 text-sm text-ink outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted'
const textAreaClassName = 'min-h-24 w-full resize-y rounded-tile border border-line bg-surface px-3 py-3 text-sm text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent'

function initialsFor(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'W'
}

function SectionHeading({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-tile bg-cream text-panel"><Icon aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0"><h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2><p className="mt-1 text-sm leading-5 text-muted">{description}</p></div>
    </div>
  )
}

function FieldError({ id, children }: { id: string; children?: string }) {
  return children ? <p id={id} role="alert" className="text-xs leading-5 text-panel">{children}</p> : null
}

function CheckboxOption({
  checked,
  label,
  onChange,
  disabled = false,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-tile border border-line bg-surface px-3 py-2.5 text-sm text-ink transition-colors hover:bg-cream ${disabled ? 'cursor-not-allowed opacity-55' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" />
      <span>{label}</span>
    </label>
  )
}

function PreferenceToggle({
  checked,
  description,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean
  description: string
  disabled?: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className={`flex min-h-[4.5rem] items-center justify-between gap-4 rounded-tile border border-line bg-surface px-4 py-3 ${disabled ? 'opacity-55' : ''}`}>
      <span className="min-w-0"><span className="block text-sm font-semibold text-ink">{label}</span><span className="mt-1 block text-xs leading-5 text-muted">{description}</span></span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
          aria-label={label}
        />
        <span aria-hidden="true" className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed" />
        <span aria-hidden="true" className="pointer-events-none absolute left-1 size-4 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

function Settings() {
  const navigate = useNavigate()
  const { user, logout, requestPasswordReset } = useAuth()
  const { settings, saveSettings, isLoading: isSettingsLoading, isSaving, error: settingsError } = useSettings()
  const [draft, setDraft] = useState<UserSettings>(() => copyUserSettings(settings))
  const [errors, setErrors] = useState<SettingsFieldErrors>({})
  const [profileEditing, setProfileEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [accountMessage, setAccountMessage] = useState('')
  const [accountError, setAccountError] = useState('')
  const [isAccountActionPending, setIsAccountActionPending] = useState(false)
  const [draftInitialized, setDraftInitialized] = useState(false)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(settings)
  const hasUnsavedChanges = isDirty || profileEditing

  useEffect(() => {
    if (!isSettingsLoading && !settingsError && !draftInitialized) {
      setDraft(copyUserSettings(settings))
      setDraftInitialized(true)
    }
  }, [settings, isSettingsLoading, settingsError, draftInitialized])

  function updateProfile<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft((current) => ({ ...current, profile: { ...current.profile, [key]: value } }))
    setErrors({})
    setSaveMessage('')
  }

  function updateGoals<K extends keyof WellnessGoals>(key: K, value: WellnessGoals[K]) {
    setDraft((current) => ({ ...current, goals: { ...current.goals, [key]: value } }))
    setErrors({})
    setSaveMessage('')
  }

  function updateFoodPreferences<K extends keyof FoodPreferences>(key: K, value: FoodPreferences[K]) {
    setDraft((current) => ({ ...current, foodPreferences: { ...current.foodPreferences, [key]: value } }))
    setSaveMessage('')
  }

  function updateApplicationPreferences<K extends keyof ApplicationPreferences>(key: K, value: ApplicationPreferences[K]) {
    setDraft((current) => ({ ...current, applicationPreferences: { ...current.applicationPreferences, [key]: value } }))
    setErrors({})
    setSaveMessage('')
  }

  function toggleListItem<T extends string>(items: T[], value: T): T[] {
    return items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateUserSettings(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSaveMessage('Please review the highlighted fields before saving.')
      if (Object.keys(nextErrors).some((key) => key.startsWith('profile.'))) setProfileEditing(true)
      return
    }
    setSaveMessage('Saving your settings…')
    try {
      const saved = await saveSettings(draft)
      setDraft(copyUserSettings(saved))
      setProfileEditing(false)
      setSaveMessage('Your profile and preferences were saved to your account.')
    } catch (error) {
      setSaveMessage(error instanceof Error ? `Your changes could not be saved: ${error.message}` : 'Your changes could not be saved. Please try again.')
    }
  }

  function cancelChanges() {
    setDraft(copyUserSettings(settings))
    setErrors({})
    setProfileEditing(false)
    setSaveMessage('Unsaved changes were canceled.')
  }

  function resetPreferences() {
    setDraft((current) => ({
      ...current,
      foodPreferences: { foodStyle: 'Not set', allergies: [], dietaryPreferences: [], foodsToAvoid: [], favouriteCategories: [] },
      applicationPreferences: {
        notificationsEnabled: true, mealReminderEnabled: false, mealReminderTime: '',
        hydrationReminderEnabled: false, hydrationReminderTime: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', theme: 'light',
      },
    }))
    setErrors({})
    setSaveMessage('Preference defaults are in your draft. Save changes to apply them.')
  }

  async function handleSignOut() {
    setIsAccountActionPending(true)
    setAccountError('')
    try {
      await logout()
    } catch {
      setAccountError('The server could not confirm sign-out. Your local session was cleared; please close this browser if you are on a shared device.')
    } finally {
      setIsAccountActionPending(false)
      navigate('/', { replace: true })
    }
  }

  async function handleResetRequest() {
    if (!user) return
    setAccountError('')
    setAccountMessage('')
    setIsAccountActionPending(true)
    try {
      setAccountMessage(await requestPasswordReset(user.email))
    } catch {
      setAccountError('The password reset request could not be submitted. Please try again.')
    } finally {
      setIsAccountActionPending(false)
    }
  }

  const goalInputs: Array<{ key: keyof Pick<WellnessGoals, 'calories' | 'proteinG' | 'carbsG' | 'fatG'>; label: string; unit: string; errorKey: keyof SettingsFieldErrors }> = [
    { key: 'calories', label: 'Daily calorie goal', unit: 'kcal', errorKey: 'goals.calories' },
    { key: 'proteinG', label: 'Protein goal', unit: 'g', errorKey: 'goals.proteinG' },
    { key: 'carbsG', label: 'Carbohydrate goal', unit: 'g', errorKey: 'goals.carbsG' },
    { key: 'fatG', label: 'Fat goal', unit: 'g', errorKey: 'goals.fatG' },
  ]

  function objectiveChoice(objective: string): ReactNode {
    return (
      <CheckboxOption
        key={objective}
        checked={draft.goals.objectives.includes(objective)}
        label={objective}
        onChange={() => updateGoals('objectives', toggleListItem(draft.goals.objectives, objective))}
      />
    )
  }

  const customObjectives = draft.goals.objectives.filter((objective) => !wellnessObjectives.includes(objective)).join('\n')

  return (
    <main className="min-w-0 space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted">Your account & preferences</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">Make WELLORA feel more like your own space. Your profile and preferences are saved to your account.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button form="settings-form" type="submit" variant="dark" disabled={!isDirty || isSettingsLoading || isSaving || Boolean(settingsError)} loading={isSaving} icon={Check}>Save changes</Button>
          <Button type="button" variant="light" disabled={!hasUnsavedChanges} onClick={cancelChanges}>Cancel changes</Button>
        </div>
      </header>

      {saveMessage ? <p role="status" aria-live="polite" className="rounded-tile border border-line bg-accent-soft/60 px-4 py-3 text-sm text-ink">{saveMessage}</p> : null}
      {isSettingsLoading ? <Card role="status" className="p-4 text-sm text-muted">Loading your saved profile and preferences…</Card> : null}
      {settingsError ? <p role="alert" className="rounded-tile border border-accent bg-accent-soft/70 px-4 py-3 text-sm text-ink">Your saved settings could not be loaded: {settingsError.message}</p> : null}

      <form id="settings-form" noValidate onSubmit={handleSave} className="space-y-5">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeading icon={UserRound} title="Profile" description="Your account identity and personal profile details." />
            <Button type="button" variant="light" icon={UserRound} onClick={() => setProfileEditing((editing) => !editing)} aria-pressed={profileEditing}>
              {profileEditing ? 'Done editing profile' : 'Edit profile'}
            </Button>
          </div>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span aria-label={`${initialsFor(draft.profile.fullName)} profile avatar`} role="img" className="grid size-16 shrink-0 place-items-center rounded-full border-4 border-white bg-accent-soft text-lg font-semibold text-ink shadow-soft sm:size-[4.5rem]">{initialsFor(draft.profile.fullName)}</span>
              <div><p className="font-semibold text-ink">{draft.profile.fullName || 'Your name'}</p><Badge variant="neutral" className="mt-1.5">Authenticated account</Badge></div>
            </div>
            <p className="max-w-lg text-xs leading-5 text-muted">Your name and personal profile details are saved with your account. Email is read-only here.</p>
          </div>

          <fieldset disabled={!profileEditing} className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
            <Input id="settings-full-name" label="Full name" name="fullName" autoComplete="name" required value={draft.profile.fullName} onChange={(event) => updateProfile('fullName', event.target.value)} error={errors['profile.fullName']} variant="light" />
            <Input id="settings-email" label="Email address" name="email" type="email" autoComplete="email" required readOnly value={draft.profile.email} error={errors['profile.email']} variant="light" />
            <Input id="settings-age" label="Age" name="age" type="number" min="1" max="120" value={draft.profile.age ?? ''} onChange={(event) => updateProfile('age', event.target.value === '' ? null : Number(event.target.value))} error={errors['profile.age']} variant="light" />
            <label htmlFor="settings-gender" className="grid content-start gap-2 text-sm font-medium text-ink">Gender <span className="text-xs font-normal text-muted">Optional</span>
              <select id="settings-gender" name="gender" value={draft.profile.gender} onChange={(event) => updateProfile('gender', event.target.value as GenderOption)} className={controlClassName}>
                <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Self describe</option>
              </select>
            </label>
            <Input id="settings-height" label="Height" name="heightCm" type="number" min="50" max="250" step="0.1" value={draft.profile.heightCm ?? ''} onChange={(event) => updateProfile('heightCm', event.target.value === '' ? null : Number(event.target.value))} error={errors['profile.heightCm']} variant="light" trailingAction={<span className="text-xs text-muted">cm</span>} />
            <Input id="settings-weight" label="Current weight" name="weightKg" type="number" min="1" max="500" step="0.1" value={draft.profile.weightKg ?? ''} onChange={(event) => updateProfile('weightKg', event.target.value === '' ? null : Number(event.target.value))} error={errors['profile.weightKg']} variant="light" trailingAction={<span className="text-xs text-muted">kg</span>} />
          </fieldset>
          <FieldError id="profile-validation">{Object.entries(errors).some(([key]) => key.startsWith('profile.')) ? 'Review your profile information.' : undefined}</FieldError>
        </Card>

        <Card className="p-4 sm:p-6">
          <SectionHeading icon={Sprout} title="Wellness goals" description="These are optional preferences you configure, not medical prescriptions." />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {goalInputs.map(({ errorKey, key, label, unit }) => (
              <div key={key} className="min-w-0">
                <Input id={`goal-${key}`} label={label} name={key} type="number" min="1" step="any" value={draft.goals[key] ?? ''} onChange={(event) => updateGoals(key, event.target.value === '' ? null : Number(event.target.value))} error={errors[errorKey]} variant="light" trailingAction={<span className="text-xs text-muted">{unit}</span>} />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink">Personal wellness objectives</h3>
            <p className="mt-1 text-xs text-muted">Choose the intentions that feel useful to you.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{wellnessObjectives.map(objectiveChoice)}</div>
            <label htmlFor="custom-objectives" className="mt-4 grid gap-2 text-sm font-medium text-ink">Other objectives <span className="text-xs font-normal text-muted">One per line</span>
              <textarea id="custom-objectives" rows={3} value={customObjectives} onChange={(event) => {
                const custom = event.target.value.split('\n').map((item) => item.trim()).filter(Boolean)
                const selected = draft.goals.objectives.filter((objective) => wellnessObjectives.includes(objective))
                updateGoals('objectives', [...selected, ...custom])
              }} placeholder="Add an objective that matters to you" className={textAreaClassName} />
            </label>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <SectionHeading icon={Utensils} title="Food preferences" description="Use these fields to note choices and ingredients you want to remember." />
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-ink">Food style</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['Not set', 'Vegetarian', 'Non-vegetarian', 'Vegan'] as const).map((style) => (
                <Chip key={style} selected={draft.foodPreferences.foodStyle === style} onClick={() => updateFoodPreferences('foodStyle', style)}>{style}</Chip>
              ))}
            </div>
          </fieldset>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <label htmlFor="food-allergies" className="grid content-start gap-2 text-sm font-medium text-ink">Food allergies <span className="text-xs font-normal text-muted">Comma-separated; leave blank if none are recorded</span>
              <textarea id="food-allergies" value={draft.foodPreferences.allergies.join(', ')} onChange={(event) => updateFoodPreferences('allergies', parseCommaSeparatedList(event.target.value))} placeholder="e.g. peanuts, sesame" className={textAreaClassName} />
            </label>
            <label htmlFor="foods-to-avoid" className="grid content-start gap-2 text-sm font-medium text-ink">Foods to avoid <span className="text-xs font-normal text-muted">Comma-separated</span>
              <textarea id="foods-to-avoid" value={draft.foodPreferences.foodsToAvoid.join(', ')} onChange={(event) => updateFoodPreferences('foodsToAvoid', parseCommaSeparatedList(event.target.value))} placeholder="Add foods you prefer to avoid" className={textAreaClassName} />
            </label>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Dietary preferences</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {dietaryPreferenceOptions.map((preference) => (
                  <CheckboxOption key={preference} checked={draft.foodPreferences.dietaryPreferences.includes(preference)} label={preference} onChange={() => updateFoodPreferences('dietaryPreferences', toggleListItem(draft.foodPreferences.dietaryPreferences, preference))} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Favourite food categories</legend>
              <p className="mt-1 text-xs text-muted">Optional preferences; none are inferred.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {favouriteCategoryOptions.map((category) => (
                  <Chip key={category} selected={draft.foodPreferences.favouriteCategories.includes(category)} onClick={() => updateFoodPreferences('favouriteCategories', toggleListItem(draft.foodPreferences.favouriteCategories, category))}>{category}</Chip>
                ))}
              </div>
            </fieldset>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <SectionHeading icon={Bell} title="Application preferences" description="Choose whether reminder preferences are enabled for your account." />
          <div className="mt-5 space-y-3">
            <PreferenceToggle checked={draft.applicationPreferences.notificationsEnabled} label="Application notifications" description="Master preference for in-app reminder options." onChange={(checked) => updateApplicationPreferences('notificationsEnabled', checked)} />
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-3 rounded-card border border-line bg-screen p-3 sm:p-4">
                <PreferenceToggle checked={draft.applicationPreferences.mealReminderEnabled} disabled={!draft.applicationPreferences.notificationsEnabled} label="Daily meal reminder" description="A gentle reminder at a time you choose." onChange={(checked) => updateApplicationPreferences('mealReminderEnabled', checked)} />
                <Input id="meal-reminder-time" label="Meal reminder time" type="time" value={draft.applicationPreferences.mealReminderTime} disabled={!draft.applicationPreferences.notificationsEnabled || !draft.applicationPreferences.mealReminderEnabled} onChange={(event) => updateApplicationPreferences('mealReminderTime', event.target.value)} error={errors['applicationPreferences.mealReminderTime']} variant="light" />
              </div>
              <div className="space-y-3 rounded-card border border-line bg-screen p-3 sm:p-4">
                <PreferenceToggle checked={draft.applicationPreferences.hydrationReminderEnabled} disabled={!draft.applicationPreferences.notificationsEnabled} label="Hydration reminder" description="Choose whether a hydration reminder preference is enabled." onChange={(checked) => updateApplicationPreferences('hydrationReminderEnabled', checked)} />
                <Input id="hydration-reminder-time" label="Hydration reminder time" type="time" value={draft.applicationPreferences.hydrationReminderTime} disabled={!draft.applicationPreferences.notificationsEnabled || !draft.applicationPreferences.hydrationReminderEnabled} onChange={(event) => updateApplicationPreferences('hydrationReminderTime', event.target.value)} error={errors['applicationPreferences.hydrationReminderTime']} variant="light" />
              </div>
            </div>
          </div>
          <div className="mt-4 max-w-sm">
            <Input id="settings-timezone" label="Time zone" value={draft.applicationPreferences.timezone} onChange={(event) => updateApplicationPreferences('timezone', event.target.value)} placeholder="Asia/Kolkata" error={errors['applicationPreferences.timezone']} variant="light" />
            <p className="mt-1 text-xs text-muted">Use an IANA time zone such as Asia/Kolkata or America/Los_Angeles.</p>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-tile border border-line bg-cream/70 p-4">
            <Moon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-panel" />
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-ink">Theme</p><Badge variant="neutral">Light theme</Badge></div><p className="mt-1 text-xs leading-5 text-muted">WELLORA currently supports its light theme only. A dark theme is not available to select.</p></div>
          </div>
          <Button type="button" variant="light" icon={RotateCcw} className="mt-5" onClick={resetPreferences}>Reset food and app preferences</Button>
        </Card>
      </form>

      <Card className="p-4 sm:p-6">
        <SectionHeading icon={ShieldCheck} title="Account & privacy" description="Account tools prepared for a future connected service." />
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section className="rounded-card border border-line bg-screen p-4 sm:p-5" aria-labelledby="account-info-title">
            <h3 id="account-info-title" className="text-sm font-semibold text-ink">Account information</h3>
            <p className="mt-1 text-xs leading-5 text-muted">Identity loaded from the authenticated account API.</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Profile name</dt><dd className="mt-1 font-medium text-ink">{settings.profile.fullName}</dd></div>
              <div><dt className="text-xs text-muted">Email address</dt><dd className="mt-1 break-all font-medium text-ink">{settings.profile.email}</dd></div>
              <div><dt className="text-xs text-muted">Account created</dt><dd className="mt-1 font-medium text-ink">{user ? new Date(user.createdAt).toLocaleDateString() : '—'}</dd></div>
            </dl>
            <p className="mt-4 rounded-tile border border-line bg-surface p-3 text-xs leading-5 text-muted">Profile and preference changes are stored for this authenticated account.</p>
            {accountError ? <p role="alert" className="mt-3 text-xs text-ink">{accountError}</p> : null}
            <Button type="button" variant="light" icon={LogOut} className="mt-4" loading={isAccountActionPending} onClick={() => void handleSignOut()}>Sign out</Button>
          </section>

          <section className="rounded-card border border-line bg-screen p-4 sm:p-5" aria-labelledby="change-password-title">
            <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-panel"><LockKeyhole aria-hidden="true" className="size-4" /></span><div><h3 id="change-password-title" className="text-sm font-semibold text-ink">Password reset</h3><p className="mt-1 text-xs leading-5 text-muted">Reset tokens expire after 15 minutes and are stored as hashes. Email delivery is not configured, so no message can be sent and no password will change from this action.</p></div></div>
            <Button type="button" variant="light" icon={LockKeyhole} className="mt-4" disabled={isAccountActionPending} loading={isAccountActionPending} onClick={() => void handleResetRequest()}>Prepare reset request</Button>
            {accountMessage ? <p role="status" className="mt-3 rounded-tile border border-line bg-surface px-3 py-2 text-xs leading-5 text-ink">{accountMessage}</p> : null}
            {accountError ? <p role="alert" className="mt-3 rounded-tile border border-accent bg-accent-soft/60 px-3 py-2 text-xs leading-5 text-ink">{accountError}</p> : null}
          </section>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-tile border border-line bg-cream/70 p-4">
          <CircleHelp aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-panel" />
          <p className="text-xs leading-5 text-muted"><span className="font-semibold text-ink">Privacy and data state.</span> Authentication identity is verified by the API and carried in a short-lived HttpOnly cookie. Profile and preference updates are stored against that authenticated account. Password reset email delivery is not configured.</p>
        </div>
      </Card>
    </main>
  )
}

export default Settings
