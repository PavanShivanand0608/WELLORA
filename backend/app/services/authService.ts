import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import type { AppConfig } from '../config/env.js'
import { User, UserSettings } from '../models/index.js'
import { hashPassword, verifyPassword } from './passwordService.js'
import { createAccessToken } from './tokenService.js'
import { AppError, DuplicateEmailError } from '../utils/AppError.js'
import type { LoginInput, RegisterInput, ResetPasswordInput } from '../validators/auth.js'

const dummyPasswordHash = bcrypt.hashSync('WELLORA timing check only - not a user password', 12)

export interface PublicUser {
  id: string
  fullName: string
  email: string
  createdAt: string
  profile: {
    age?: number
    gender?: string
    heightCm?: number
    weightKg?: number
    activityLevel?: 'LOW' | 'MODERATE' | 'HIGH'
  }
}

export interface AuthResult {
  accessToken: string
  user: PublicUser
}

export function toPublicUser(user: InstanceType<typeof User>): PublicUser {
  const profile: PublicUser['profile'] = {}
  if (user.age != null) profile.age = user.age
  if (user.gender != null) profile.gender = user.gender
  if (user.heightCm != null) profile.heightCm = user.heightCm
  if (user.weightKg != null) profile.weightKg = user.weightKg
  if (user.activityLevel != null) profile.activityLevel = user.activityLevel

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    profile,
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000
}

export async function registerUser(input: RegisterInput, config: AppConfig): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase()
  if (await User.exists({ email })) throw new DuplicateEmailError()

  const passwordHash = await hashPassword(input.password)
  let user: InstanceType<typeof User> | undefined
  try {
    user = await User.create({ fullName: input.fullName.trim(), email, passwordHash })
    await UserSettings.create({ userId: user._id })
  } catch (error) {
    if (user) {
      try {
        await User.deleteOne({ _id: user._id })
      } catch {
        // Keep the original account-creation failure as the visible error.
      }
    }
    if (isDuplicateKeyError(error)) throw new DuplicateEmailError()
    throw error
  }

  return {
    accessToken: createAccessToken(user._id.toString(), config),
    user: toPublicUser(user),
  }
}

export async function loginUser(input: LoginInput, config: AppConfig): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase()
  const user = await User.findOne({ email }).select('+passwordHash')
  const passwordHash = user?.passwordHash ?? dummyPasswordHash
  const passwordMatches = await verifyPassword(input.password, passwordHash)
  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
  }

  return {
    accessToken: createAccessToken(user._id.toString(), config),
    user: toPublicUser(user),
  }
}

export async function findAuthenticatedUser(userId: string): Promise<PublicUser> {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid or expired.')
  }
  const user = await User.findById(userId)
  if (!user) throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid or expired.')
  return toPublicUser(user)
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Returns the raw token only to the caller. Controllers must never include it in a response. */
export async function createPasswordResetToken(email: string, config: AppConfig): Promise<string | undefined> {
  const user = await User.findOne({ email: email.trim().toLowerCase() })
  if (!user) return undefined

  const token = randomBytes(32).toString('base64url')
  user.passwordResetTokenHash = hashResetToken(token)
  user.passwordResetExpiresAt = new Date(Date.now() + config.passwordResetTokenExpireMinutes * 60_000)
  await user.save()
  return token
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const user = await User.findOne({
    passwordResetTokenHash: hashResetToken(input.token),
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt')
  if (!user) throw new AppError(400, 'INVALID_RESET_TOKEN', 'The password reset link is invalid or expired.')

  user.passwordHash = await hashPassword(input.password)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  await user.save()
}
