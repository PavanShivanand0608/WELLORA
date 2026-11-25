import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Check,
  KeyRound,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PhoneShowcase from '../components/showcase/PhoneShowcase'
import { useAuth } from '../lib/auth'

interface NutritionTileData {
  id: 'citrus' | 'quinoa' | 'harvest'
  title: string
  subtitle: string
  calories: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  description: string
  satietyRank: string
}

const NUTRITION_TILES: Record<string, NutritionTileData> = {
  citrus: {
    id: 'citrus',
    title: 'Citrus Energy Bowl',
    subtitle: 'Daily Energy & Low Glycemic Baseline',
    calories: '380 kcal',
    protein: '14g',
    carbs: '48g',
    fat: '16g',
    fiber: '12g',
    description:
      'Nutrient-dense combination of whole quinoa, fresh ruby citrus wheels, and healthy avocado monounsaturated fats. Engineered for continuous glucose stability without post-meal fatigue.',
    satietyRank: 'High (4.6 / 5.0)',
  },
  quinoa: {
    id: 'quinoa',
    title: 'Quinoa Power Bowl',
    subtitle: 'Complete Amino Acids & Satiety',
    calories: '520 kcal',
    protein: '28g',
    carbs: '62g',
    fat: '18g',
    fiber: '14g',
    description:
      'Features a complete plant-protein profile with all nine essential amino acids. High in magnesium and iron to support cellular energy, muscle recovery, and craving suppression.',
    satietyRank: 'Very High (4.9 / 5.0)',
  },
  harvest: {
    id: 'harvest',
    title: 'Harvest Greens Bowl',
    subtitle: 'Gut Health & Micronutrient Density',
    calories: '410 kcal',
    protein: '18g',
    carbs: '54g',
    fat: '14g',
    fiber: '16g',
    description:
      'Loaded with soluble and prebiotic fibers to nourish gut microbiota. Abundant phytonutrients and antioxidants support metabolic resilience and stable appetite cues.',
    satietyRank: 'High (4.7 / 5.0)',
  },
}

export default function Landing() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  // Mode: Sign-In vs. Registration
  const [isRegistering, setIsRegistering] = useState(false)

  // Form Fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation & Touched States
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Authentication Submission State: 'idle' | 'loading' | 'success'
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Interactive Nutrition Highlight Tiles
  const [selectedTile, setSelectedTile] = useState<'citrus' | 'quinoa' | 'harvest' | null>(null)

  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showForgotModal) {
        setShowForgotModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showForgotModal])

  // Email format checker
  const isEmailFormatValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())

  // Dynamic Password Strength Calculator (Scores 0 to 4)
  const computePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-neutral-800 text-muted' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-400' }
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500 text-amber-400' }
      case 3:
        return { score: 3, label: 'Good', color: 'bg-accent text-accent' }
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500 text-emerald-400' }
      default:
        return { score: 0, label: 'None', color: 'bg-neutral-800 text-muted' }
    }
  }

  const pwStrength = computePasswordStrength(password)

  // Real-time Field Validator
  const validateField = (field: string, val: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (isRegistering) {
          if (!val.trim()) return 'Full name is required'
          if (val.trim().length < 2) return 'Please enter your actual full name'
        }
        return undefined
      case 'email':
        if (!val.trim()) return 'Email address is required'
        if (!isEmailFormatValid(val)) return 'Please enter a valid email address (e.g. name@example.com)'
        return undefined
      case 'password':
        if (!val) return 'Password is required'
        if (isRegistering && val.length < 6) return 'Password must be at least 6 characters'
        return undefined
      case 'confirmPassword':
        if (isRegistering) {
          if (!val) return 'Please confirm your password'
          if (val !== password) return 'Passwords do not match'
        }
        return undefined
      default:
        return undefined
    }
  }

  // Handle Input Changes with Real-time Feedback
  const handleInputChange = (field: string, val: string) => {
    switch (field) {
      case 'fullName':
        setFullName(val)
        break
      case 'email':
        setEmail(val)
        break
      case 'password':
        setPassword(val)
        break
      case 'confirmPassword':
        setConfirmPassword(val)
        break
    }

    // Clear feedback banner on typing
    if (feedbackMessage) setFeedbackMessage(null)

    // If already touched, validate and update errors continuously
    if (touched[field]) {
      const err = validateField(field, val)
      setErrors((prev) => {
        const next = { ...prev }
        if (err) next[field] = err
        else delete next[field]
        return next
      })
    }

    // In registration mode, if changing password, re-check confirmPassword if it was touched
    if (field === 'password' && isRegistering && touched.confirmPassword) {
      if (confirmPassword && val !== confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      } else if (confirmPassword && val === confirmPassword) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next.confirmPassword
          return next
        })
      }
    }
  }

  // Handle Field Blur Event
  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    let val = ''
    if (field === 'fullName') val = fullName
    if (field === 'email') val = email
    if (field === 'password') val = password
    if (field === 'confirmPassword') val = confirmPassword

    const err = validateField(field, val)
    setErrors((prev) => {
      const next = { ...prev }
      if (err) next[field] = err
      else delete next[field]
      return next
    })
  }

  // Validate Entire Form on Submit
  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {}
    const newTouched: Record<string, boolean> = {
      email: true,
      password: true,
    }

    const emailErr = validateField('email', email)
    if (emailErr) newErrors.email = emailErr

    const passErr = validateField('password', password)
    if (passErr) newErrors.password = passErr

    if (isRegistering) {
      newTouched.fullName = true
      newTouched.confirmPassword = true

      const nameErr = validateField('fullName', fullName)
      if (nameErr) newErrors.fullName = nameErr

      const confirmErr = validateField('confirmPassword', confirmPassword)
      if (confirmErr) newErrors.confirmPassword = confirmErr
    }

    setTouched(newTouched)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Main Sign-In / Register Form Submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFeedbackMessage(null)

    if (!validateAllFields()) {
      return
    }

    // Step 1: Enter Loading State
    setAuthStatus('loading')

    if (isRegistering) {
      // Mock Registration Flow
      setTimeout(() => {
        // Step 2: Show distinct Success State
        setAuthStatus('success')
        setFeedbackMessage('Your WELLORA account is ready! Welcome aboard.')

        // Step 3: Authenticate and Navigate after visible confirmation
        setTimeout(() => {
          signIn(email, fullName || 'Alex Morgan')
          navigate('/dashboard')
        }, 850)
      }, 750)
    } else {
      // Mock Login Flow
      setTimeout(() => {
        // Step 2: Show distinct Success State
        setAuthStatus('success')
        setFeedbackMessage('Credentials verified! Loading your personal wellness dashboard...')

        // Step 3: Authenticate and Navigate after visible confirmation
        setTimeout(() => {
          signIn(email, 'Alex Morgan')
          navigate('/dashboard')
        }, 850)
      }, 750)
    }
  }

  // Toggle between Sign In and Registration Modes
  const handleToggleMode = () => {
    setIsRegistering((prev) => !prev)
    setErrors({})
    setTouched({})
    setFeedbackMessage(null)
    setPassword('')
    setConfirmPassword('')
    // Preserves `email` so the user doesn't have to retype it
  }

  // Handle Forgot Password Form Submission
  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      setForgotError('Email address is required')
      return
    }
    if (!isEmailFormatValid(forgotEmail)) {
      setForgotError('Please enter a valid email address')
      return
    }

    setForgotLoading(true)
    setTimeout(() => {
      setForgotLoading(false)
      setForgotSuccess(true)
    }, 650)
  }

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row overflow-x-hidden font-sans bg-[#111112]">
      {/* ========================================================================= */}
      {/* LEFT PANEL: 3-Phone Mobile Showcase Area (approx. 56% desktop width)      */}
      {/* Preserved completely from Phase 2.4/2.5 without alteration                */}
      {/* ========================================================================= */}
      <section
        aria-label="Mobile Application Showcase"
        className="w-full lg:w-[56%] min-h-[640px] lg:min-h-0 lg:h-full bg-gradient-to-b from-[#181716] via-[#131211] to-[#0E0D0D] text-cream flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-800/80"
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/6 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sand/5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Header Bar */}
        <header className="flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-cream/80 font-bold">
              WELLORA Mobile Experience
            </span>
          </div>
          <span className="text-xs text-muted font-medium hidden sm:inline-block">
            DBMS AI & ML Project
          </span>
        </header>

        {/* Center: The Three-Phone Mockup Showcase */}
        <div className="my-auto w-full z-10 py-4 lg:py-2 flex items-center justify-center">
          <PhoneShowcase />
        </div>

        {/* Bottom Disclaimers & Version Info */}
        <footer className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted gap-2 z-10 shrink-0">
          <span>Interpretable Nutrition AI</span>
          <span>Not medical advice · Patterns are associations, not causes</span>
        </footer>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Upgraded Interactive Authentication & Branding (~44% width)  */}
      {/* Genuinely functional controls with instant visual feedback on interaction */}
      {/* ========================================================================= */}
      <section
        aria-label="Authentication and Account Portal"
        className="w-full lg:w-[44%] min-h-screen lg:h-full bg-panel text-cream flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-y-auto"
      >
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          {/* Brand Header */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-cream">WELLORA</span>
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-neutral-800 text-muted border border-neutral-700/60">
              Mock Auth
            </span>
          </header>

          {/* Main Headline & Supporting Text (Updates smoothly between modes) */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-cream tracking-tight mb-1">
              {isRegistering ? 'Create your WELLORA account' : 'Your Food, Decoded By AI'}
            </h1>
            <p className="text-sm text-muted">
              {isRegistering
                ? 'Join to unlock personalized baseline and hunger-pattern detection.'
                : 'Personal AI nutrition assistant'}
            </p>
          </div>

          {/* ===================================================================== */}
          {/* THREE INTERACTIVE NUTRITION HIGHLIGHT TILES                           */}
          {/* ===================================================================== */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Nutrition Baselines
              </span>
              <span className="text-[10px] text-accent/80 flex items-center gap-1 font-medium">
                <Info size={11} />
                Click tile to inspect macros
              </span>
            </div>

            {/* Tile Buttons */}
            <div className="grid grid-cols-3 gap-2.5" role="region" aria-label="Featured Nutrition Profiles">
              {/* Tile 1: Citrus Bowl */}
              <button
                type="button"
                onClick={() => setSelectedTile(selectedTile === 'citrus' ? null : 'citrus')}
                aria-expanded={selectedTile === 'citrus'}
                className={`p-3 rounded-tile flex flex-col items-center text-center transition-all duration-200 cursor-pointer ${
                  selectedTile === 'citrus'
                    ? 'bg-[#2b2522] border-accent ring-2 ring-accent/40 -translate-y-1 shadow-lg'
                    : 'bg-[#222222] border-neutral-800 hover:border-neutral-700 hover:bg-[#282828] hover:-translate-y-0.5'
                } border`}
              >
                <div className="w-10 h-10 rounded-full bg-accent-soft/10 border border-accent/25 flex items-center justify-center text-accent mb-1.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                    <path d="M12 12 19.07 4.93" />
                    <path d="M12 12 4.93 19.07" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-cream truncate w-full">Citrus Bowl</span>
                <span className="text-[10px] text-accent font-medium mt-0.5">380 kcal · Low GI</span>
              </button>

              {/* Tile 2: Quinoa Power */}
              <button
                type="button"
                onClick={() => setSelectedTile(selectedTile === 'quinoa' ? null : 'quinoa')}
                aria-expanded={selectedTile === 'quinoa'}
                className={`p-3 rounded-tile flex flex-col items-center text-center transition-all duration-200 cursor-pointer ${
                  selectedTile === 'quinoa'
                    ? 'bg-[#2b2522] border-sand ring-2 ring-sand/40 -translate-y-1 shadow-lg'
                    : 'bg-[#222222] border-neutral-800 hover:border-neutral-700 hover:bg-[#282828] hover:-translate-y-0.5'
                } border`}
              >
                <div className="w-10 h-10 rounded-full bg-sand/10 border border-sand/30 flex items-center justify-center text-sand mb-1.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
                    <path d="M7 12a5 5 0 0 1 10 0" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-cream truncate w-full">Quinoa Power</span>
                <span className="text-[10px] text-sand font-medium mt-0.5">520 kcal · 24g P</span>
              </button>

              {/* Tile 3: Harvest Green */}
              <button
                type="button"
                onClick={() => setSelectedTile(selectedTile === 'harvest' ? null : 'harvest')}
                aria-expanded={selectedTile === 'harvest'}
                className={`p-3 rounded-tile flex flex-col items-center text-center transition-all duration-200 cursor-pointer ${
                  selectedTile === 'harvest'
                    ? 'bg-[#2b2522] border-cream/70 ring-2 ring-cream/30 -translate-y-1 shadow-lg'
                    : 'bg-[#222222] border-neutral-800 hover:border-neutral-700 hover:bg-[#282828] hover:-translate-y-0.5'
                } border`}
              >
                <div className="w-10 h-10 rounded-full bg-cream/10 border border-cream/20 flex items-center justify-center text-cream mb-1.5">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-cream truncate w-full">Harvest Green</span>
                <span className="text-[10px] text-muted font-medium mt-0.5">410 kcal · 14g F</span>
              </button>
            </div>

            {/* Expandable Tile Detail Inspection Card */}
            {selectedTile && NUTRITION_TILES[selectedTile] && (
              <div className="mt-3 p-4 rounded-tile bg-[#232323] border border-neutral-700/90 text-cream transition-all duration-200 shadow-xl">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-cream flex items-center gap-1.5">
                      <span>{NUTRITION_TILES[selectedTile].title}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-accent/15 text-accent font-semibold border border-accent/30">
                        {NUTRITION_TILES[selectedTile].calories}
                      </span>
                    </h4>
                    <p className="text-[10px] text-accent font-medium mt-0.5">
                      {NUTRITION_TILES[selectedTile].subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close nutrition details"
                    onClick={() => setSelectedTile(null)}
                    className="text-muted hover:text-cream p-1 cursor-pointer rounded-xs"
                  >
                    <X size={15} />
                  </button>
                </div>

                <p className="text-[11px] text-cream/85 leading-relaxed mb-3">
                  {NUTRITION_TILES[selectedTile].description}
                </p>

                {/* Macro Nutrients Breakdown Row */}
                <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-neutral-800 text-center">
                  <div className="bg-neutral-800/80 rounded-xs py-1 px-1">
                    <span className="block text-[11px] font-bold text-accent">
                      {NUTRITION_TILES[selectedTile].protein}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-muted font-medium">Protein</span>
                  </div>
                  <div className="bg-neutral-800/80 rounded-xs py-1 px-1">
                    <span className="block text-[11px] font-bold text-cream">
                      {NUTRITION_TILES[selectedTile].carbs}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-muted font-medium">Carbs</span>
                  </div>
                  <div className="bg-neutral-800/80 rounded-xs py-1 px-1">
                    <span className="block text-[11px] font-bold text-sand">
                      {NUTRITION_TILES[selectedTile].fat}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-muted font-medium">Fat</span>
                  </div>
                  <div className="bg-neutral-800/80 rounded-xs py-1 px-1">
                    <span className="block text-[11px] font-bold text-emerald-400">
                      {NUTRITION_TILES[selectedTile].fiber}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-muted font-medium">Fiber</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-muted">
                  <span>Satiety Index: <strong className="text-cream">{NUTRITION_TILES[selectedTile].satietyRank}</strong></span>
                  <span className="text-accent/80 font-medium">FoodItem Entity Match</span>
                </div>
              </div>
            )}
          </div>

          {/* ===================================================================== */}
          {/* INTERACTIVE FORM CONTAINER                                            */}
          {/* ===================================================================== */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {/* Feedback Alert Banner */}
            {feedbackMessage && (
              <div
                role="status"
                className={`p-3.5 rounded-tile text-xs font-medium leading-relaxed flex items-center gap-2.5 transition-all ${
                  authStatus === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                    : 'bg-accent-soft/15 border border-accent/40 text-accent'
                }`}
              >
                {authStatus === 'success' ? (
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                ) : (
                  <Sparkles size={18} className="shrink-0 text-accent" />
                )}
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Registration Mode: Full Name Input */}
            {isRegistering && (
              <div>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Alex Morgan"
                  value={fullName}
                  onBlur={() => handleFieldBlur('fullName')}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={touched.fullName ? errors.fullName : undefined}
                  disabled={authStatus === 'loading' || authStatus === 'success'}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email Address with Real-time Verification Feedback */}
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                inputMode="email"
                placeholder="alex@wellora.health"
                value={email}
                onBlur={() => handleFieldBlur('email')}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={touched.email ? errors.email : undefined}
                disabled={authStatus === 'loading' || authStatus === 'success'}
                autoComplete="email"
                className={isEmailFormatValid(email) || (touched.email && errors.email) ? 'pr-11' : ''}
              />
              {/* Visual Validity Indicator Icon */}
              {isEmailFormatValid(email) && !errors.email && (
                <span
                  className="absolute right-3.5 top-[35px] text-emerald-400 pointer-events-none transition-transform duration-200 flex items-center justify-center"
                  title="Valid email format verified"
                  aria-hidden="true"
                >
                  <Check size={16} strokeWidth={2.5} />
                </span>
              )}
              {touched.email && errors.email && (
                <span
                  className="absolute right-3.5 top-[35px] text-accent pointer-events-none transition-transform duration-200 flex items-center justify-center"
                  title="Invalid email format"
                  aria-hidden="true"
                >
                  <AlertCircle size={16} />
                </span>
              )}
            </div>

            {/* Password Input with Visibility Toggle */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onBlur={() => handleFieldBlur('password')}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={touched.password ? errors.password : undefined}
                disabled={authStatus === 'loading' || authStatus === 'success'}
                className="pr-12"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={authStatus === 'loading' || authStatus === 'success'}
                className="absolute right-3.5 top-[35px] text-muted hover:text-cream cursor-pointer p-1 rounded-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Registration Mode: Live Password Strength Meter & Interactive Checklist */}
            {isRegistering && password.length > 0 && (
              <div className="space-y-2 pt-1 pb-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted font-medium">Password strength:</span>
                  <span className={`font-bold ${pwStrength.color.split(' ')[1]}`}>
                    {pwStrength.label}
                  </span>
                </div>
                {/* 4 Segmented Strength Bars */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        step <= pwStrength.score
                          ? pwStrength.color.split(' ')[0]
                          : 'bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Real-time Requirement Validation Checklist */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                  <span className={`flex items-center gap-1 ${password.length >= 6 ? 'text-emerald-400 font-semibold' : 'text-muted'}`}>
                    <Check size={11} strokeWidth={2.5} className={password.length >= 6 ? 'opacity-100' : 'opacity-30'} />
                    6+ chars
                  </span>
                  <span className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-emerald-400 font-semibold' : 'text-muted'}`}>
                    <Check size={11} strokeWidth={2.5} className={/[0-9]/.test(password) ? 'opacity-100' : 'opacity-30'} />
                    Number
                  </span>
                  <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-400 font-semibold' : 'text-muted'}`}>
                    <Check size={11} strokeWidth={2.5} className={/[A-Z]/.test(password) ? 'opacity-100' : 'opacity-30'} />
                    Uppercase
                  </span>
                </div>
              </div>
            )}

            {/* Registration Mode: Confirm Password with Match Detection */}
            {isRegistering && (
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  disabled={authStatus === 'loading' || authStatus === 'success'}
                  className="pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={authStatus === 'loading' || authStatus === 'success'}
                  className="absolute right-3.5 top-[35px] text-muted hover:text-cream cursor-pointer p-1 rounded-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
                {/* Instant Match Icon when matching */}
                {confirmPassword.length > 0 && confirmPassword === password && (
                  <span
                    className="absolute right-10 top-[35px] text-emerald-400 pointer-events-none flex items-center justify-center"
                    title="Passwords match perfectly"
                  >
                    <Check size={16} strokeWidth={2.5} />
                  </span>
                )}
              </div>
            )}

            {/* Login Mode: Functional Remember Me Checkbox & Forgot Password Link */}
            {!isRegistering && (
              <div className="flex items-center justify-between text-xs pt-1">
                {/* Custom Functional Interactive Checkbox */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2.5 text-xs text-muted hover:text-cream cursor-pointer select-none group transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      rememberMe
                        ? 'bg-accent border-accent text-ink shadow-xs'
                        : 'bg-neutral-900 border-neutral-700 group-hover:border-neutral-500'
                    }`}
                  >
                    {rememberMe && <Check size={12} strokeWidth={3} className="text-ink" />}
                  </div>
                  <span className={rememberMe ? 'text-cream font-medium' : 'text-muted'}>
                    Remember me
                  </span>
                </button>

                {/* Forgot Password Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true)
                    setForgotEmail(email)
                    setForgotError('')
                    setForgotSuccess(false)
                  }}
                  className="text-xs text-accent hover:underline font-medium cursor-pointer transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-xs"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* =================================================================== */}
            {/* MAIN ACTION BUTTON (Distinct Normal, Hover, Loading, Success States)*/}
            {/* =================================================================== */}
            <Button
              variant={authStatus === 'success' ? 'dark' : 'accent'}
              size="lg"
              type="submit"
              disabled={authStatus === 'loading' || authStatus === 'success'}
              className={`w-full mt-3 font-semibold shadow-md transition-all cursor-pointer ${
                authStatus === 'success'
                  ? '!bg-emerald-500 !text-white !border-emerald-400 font-bold'
                  : 'hover:brightness-105 active:scale-[0.98]'
              }`}
            >
              {authStatus === 'loading' ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                  <span>{isRegistering ? 'Creating account...' : 'Signing in...'}</span>
                </div>
              ) : authStatus === 'success' ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" aria-hidden="true" />
                  <span>Success! Redirecting...</span>
                </div>
              ) : isRegistering ? (
                'Create account'
              ) : (
                'Sign in to WELLORA'
              )}
            </Button>

            {/* Switch Mode Toggle Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={authStatus === 'loading' || authStatus === 'success'}
                onClick={handleToggleMode}
                className="text-xs text-muted hover:text-cream transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? (
                  <>
                    Already have an account?{' '}
                    <span className="text-accent hover:underline font-semibold ml-1">Sign in</span>
                  </>
                ) : (
                  <>
                    New to WELLORA?{' '}
                    <span className="text-accent hover:underline font-semibold ml-1">Create an account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Metadata & Medical Notice */}
        <footer className="pt-6 mt-6 border-t border-neutral-800 flex flex-col gap-1 text-[11px] text-muted">
          <div className="flex items-center justify-between">
            <span>Personal AI nutrition assistant</span>
            <span>WELLORA v0.1</span>
          </div>
          <p className="text-[10px] text-muted/70">
            Not medical advice; patterns are associations, not causes.
          </p>
        </footer>
      </section>

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL (Accessible Interactive Reset-Password Dialog)       */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs transition-opacity"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForgotModal(false)
          }}
        >
          <div className="bg-[#242424] border border-neutral-700/90 rounded-card p-6 w-full max-w-md text-cream shadow-2xl relative">
            {/* Close Modal Button */}
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-muted hover:text-cream cursor-pointer p-1 rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <X size={18} />
            </button>

            {/* Modal Heading */}
            <div className="flex items-center gap-2 mb-3 text-accent">
              <KeyRound size={20} />
              <h3 id="forgot-modal-title" className="text-lg font-bold text-cream">
                Reset Password
              </h3>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-tile bg-accent-soft/15 border border-accent/40 text-accent text-xs font-medium leading-relaxed">
                  <p className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    Reset instructions dispatched!
                  </p>
                  <p className="text-cream/90">
                    A password reset link has been dispatched to{' '}
                    <strong className="underline text-cream">{forgotEmail}</strong>.
                  </p>
                  <p className="text-[10px] text-muted mt-2 pt-2 border-t border-accent/20">
                    (Demonstration only — no actual email was sent in mock mode.)
                  </p>
                </div>
                <Button
                  variant="sand"
                  size="md"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full font-semibold"
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                <p className="text-xs text-muted leading-relaxed">
                  Enter your registered email address and we'll send a secure password recovery link to your inbox.
                </p>

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    inputMode="email"
                    placeholder="alex@wellora.health"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value)
                      if (forgotError) setForgotError('')
                    }}
                    error={forgotError}
                    autoComplete="email"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    variant="dark"
                    size="md"
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="md"
                    type="submit"
                    loading={forgotLoading}
                    className="flex-1 font-semibold"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
