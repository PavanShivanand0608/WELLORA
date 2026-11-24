import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, Sprout, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApiRequestError } from '../api/client'
import { FoodTile } from '../components/FoodTile'
import { LandingVisual } from '../components/LandingVisual'
import { Button, IconButton, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'

type AuthMode = 'sign-in' | 'register' | 'forgot'
type FieldName = 'fullName' | 'email' | 'password' | 'confirmPassword'

interface FormValues {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type FormErrors = Partial<Record<FieldName, string>>

const emptyForm: FormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function Landing() {
  const navigate = useNavigate()
  const { login, register, requestPasswordReset } = useAuth()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [values, setValues] = useState<FormValues>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [notice, setNotice] = useState('')
  const [requestError, setRequestError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegistration = mode === 'register'
  const isForgotPassword = mode === 'forgot'

  function updateField(field: FieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setNotice('')
    setRequestError('')
  }

  function setAuthMode(nextMode: AuthMode) {
    setMode(nextMode)
    setValues((current) => ({ ...current, fullName: '', password: '', confirmPassword: '' }))
    setErrors({})
    setNotice('')
    setRequestError('')
    setShowPassword(false)
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {}

    if (isRegistration && !values.fullName.trim()) {
      nextErrors.fullName = 'Enter your full name.'
    }

    if (!values.email.trim()) {
      nextErrors.email = 'Enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!isForgotPassword && !values.password) {
      nextErrors.password = 'Enter your password.'
    } else if (!isForgotPassword && new TextEncoder().encode(values.password).length > 72) {
      nextErrors.password = 'Password must fit within 72 UTF-8 bytes.'
    } else if (isRegistration) {
      const classes = [/[a-z]/.test(values.password), /[A-Z]/.test(values.password), /\d/.test(values.password), /[^A-Za-z0-9]/.test(values.password)].filter(Boolean).length
      if (values.password.length < 12 || classes < 3 || new TextEncoder().encode(values.password).length > 72) {
        nextErrors.password = 'Use 12+ characters, at least 3 character types, and no more than 72 bytes.'
      }
      if (!values.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
      else if (values.confirmPassword !== values.password) nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || !validate()) return

    const submittedMode = mode
    setIsSubmitting(true)
    setNotice('')
    setRequestError('')
    try {
      if (submittedMode === 'forgot') {
        setNotice(await requestPasswordReset(values.email.trim()))
        setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
      } else if (submittedMode === 'register') {
        await register({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
        })
        navigate('/dashboard')
      } else {
        await login({ email: values.email.trim(), password: values.password })
        navigate('/dashboard')
      }
    } catch (error) {
      setRequestError(error instanceof ApiRequestError ? error.message : 'Authentication could not be completed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-panel min-[721px]:grid min-[721px]:grid-cols-[56fr_44fr]">
      <LandingVisual />

      <section className="order-1 flex min-h-screen min-w-0 flex-col bg-panel px-5 py-7 text-surface sm:py-9 min-[721px]:order-2 min-[1024px]:px-10 min-[1280px]:px-14">
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col">
          <header className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-ink">
              <Sprout aria-hidden="true" className="size-5" />
            </span>
            <span className="text-sm font-bold tracking-[0.2em] text-surface">
              WELLORA
            </span>
          </header>

          <div className="mt-7 sm:mt-9">
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-surface sm:text-[2.7rem]">
              {isForgotPassword ? 'A fresh start' : <><span className="block">Your Food,</span><span className="block">Decoded By AI</span></>}
            </h1>
            <p className="mt-3 text-sm font-medium text-muted sm:text-base">
              {isForgotPassword ? 'Email delivery is not configured yet, so no reset email will be sent.' : 'Personal AI nutrition assistant'}
            </p>
          </div>

          <form className="mt-6 grid gap-3.5" noValidate onSubmit={handleSubmit}>
            {isRegistration ? (
              <Input
                autoComplete="name"
                disabled={isSubmitting}
                error={errors.fullName}
                label="Full name"
                leadingIcon={UserRound}
                name="name"
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="Your name"
                required
                value={values.fullName}
              />
            ) : null}

            <Input
              autoComplete="email"
              disabled={isSubmitting}
              error={errors.email}
              label="Email"
              leadingIcon={Mail}
              name="email"
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={values.email}
            />

            {!isForgotPassword ? <Input
              autoComplete={isRegistration ? 'new-password' : 'current-password'}
              disabled={isSubmitting}
              error={errors.password}
              label="Password"
              leadingIcon={LockKeyhole}
              name="password"
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Enter your password"
              required
              trailingAction={
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  buttonSize="lg"
                  disabled={isSubmitting}
                  icon={showPassword ? EyeOff : Eye}
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                  variant="dark"
                />
              }
              type={showPassword ? 'text' : 'password'}
              value={values.password}
            /> : null}

            {isRegistration ? <Input
              autoComplete="new-password"
              disabled={isSubmitting}
              error={errors.confirmPassword}
              label="Confirm password"
              leadingIcon={LockKeyhole}
              name="confirmPassword"
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              placeholder="Enter your password again"
              required
              type={showPassword ? 'text' : 'password'}
              value={values.confirmPassword}
            /> : null}

            {requestError ? <p role="alert" className="rounded-tile border border-accent/40 bg-surface/5 px-3 py-2 text-sm text-surface">{requestError}</p> : null}

            {notice ? (
              <p role="status" className="text-sm text-accent-soft">
                {notice}
              </p>
            ) : null}

            <Button
              className="mt-1 h-12 w-full"
              loading={isSubmitting}
              type="submit"
              variant="accent"
            >
              {isSubmitting ? (isRegistration ? 'Creating account…' : isForgotPassword ? 'Sending request…' : 'Signing in…') : isRegistration ? 'Create account' : isForgotPassword ? 'Request password reset' : 'Sign in'}
            </Button>

            {!isForgotPassword ? <button
              className="min-h-10 justify-self-center rounded-tile px-2 text-xs font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
              disabled={isSubmitting}
              onClick={() => setAuthMode('forgot')}
              type="button"
            >Forgot password?</button> : null}

            <div className="flex flex-wrap items-center justify-center gap-x-2 text-center text-sm">
              <span className="text-muted">
                {isForgotPassword ? 'Remember your password?' : isRegistration ? 'Already have an account?' : 'New to WELLORA?'}
              </span>
              <button
                className="min-h-12 rounded-tile px-2 font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
                disabled={isSubmitting}
                onClick={() => setAuthMode(isRegistration || isForgotPassword ? 'sign-in' : 'register')}
                type="button"
              >
                {isRegistration || isForgotPassword ? 'Sign in' : 'Create an account'}
              </button>
            </div>
          </form>

          <section aria-labelledby="food-inspiration-title" className="mt-5 sm:mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2
                id="food-inspiration-title"
                className="text-xs font-semibold uppercase tracking-[0.15em] text-surface"
              >
                A little food inspiration
              </h2>
              <span className="text-[10px] font-medium text-muted">WELLORA</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <FoodTile art="grains" detail="Everyday balance" title="Quinoa bowl" />
              <FoodTile art="citrus" detail="Bright & fresh" title="Citrus greens" />
              <FoodTile art="avocado" detail="Simple goodness" title="Avocado plate" />
            </div>
          </section>

          <footer className="mt-auto border-t border-surface/10 pt-5 text-center sm:pt-6">
            <p className="text-sm font-medium text-surface">
              Personal AI nutrition assistant
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[11px] leading-relaxed text-muted">
              Not medical advice; patterns are associations, not causes.
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default Landing
