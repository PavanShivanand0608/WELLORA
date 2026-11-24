import { z } from 'zod'
import { passwordPolicyIssues } from '../utils/passwordPolicy.js'

const emailSchema = z.string().trim().email().max(254).transform((email) => email.toLowerCase())
const passwordSchema = z.string()

function validatePasswordAndConfirmation(
  value: { password: string; confirmPassword: string },
  context: z.RefinementCtx,
) {
  for (const message of passwordPolicyIssues(value.password)) {
    context.addIssue({ code: 'custom', path: ['password'], message })
  }
  if (value.password !== value.confirmPassword) {
    context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' })
  }
}

export const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).strict().superRefine(validatePasswordAndConfirmation)

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72).refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'Password must fit within 72 UTF-8 bytes.',
  ),
}).strict()

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict()

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(200),
  password: passwordSchema,
  confirmPassword: z.string(),
}).strict().superRefine(validatePasswordAndConfirmation)

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
