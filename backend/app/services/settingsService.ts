import mongoose from 'mongoose'
import { User, UserSettings } from '../models/index.js'
import { AppError } from '../utils/AppError.js'
import type { UpdateProfileInput, UpdateSettingsInput } from '../validators/settings.js'

function unsetNullableFields(source: Record<string, unknown>, prefix: string, set: Record<string, unknown>, unset: Record<string, 1>) {
  for (const [key, value] of Object.entries(source)) {
    if (value === null) unset[`${prefix}.${key}`] = 1
    else if (value !== undefined) set[`${prefix}.${key}`] = value
  }
}

async function ensureSettings(userId: string) {
  return UserSettings.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $setOnInsert: {
      userId: new mongoose.Types.ObjectId(userId),
      goals: { objectives: [] },
      foodPreferences: { foodStyle: 'NOT_SET', allergies: [], dietaryPreferences: [], foodsToAvoid: [], favouriteCategories: [] },
      applicationPreferences: { notificationsEnabled: true, mealReminderEnabled: false, hydrationReminderEnabled: false, timezone: 'UTC', theme: 'LIGHT' },
    } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true },
  )
}

function serializeSettings(user: InstanceType<typeof User>, settings: NonNullable<Awaited<ReturnType<typeof ensureSettings>>>) {
  const settingsObject = settings.toObject()
  const profile: Record<string, unknown> = {
    fullName: user.fullName,
    email: user.email,
  }
  for (const field of ['age', 'gender', 'heightCm', 'weightKg', 'activityLevel'] as const) {
    const value = user[field]
    if (value !== undefined && value !== null && value !== '') profile[field] = value
  }
  return {
    profile,
    goals: settingsObject.goals ?? {},
    foodPreferences: settingsObject.foodPreferences ?? {},
    applicationPreferences: settingsObject.applicationPreferences ?? {},
  }
}

export async function getUserSettings(userId: string) {
  if (!mongoose.isValidObjectId(userId)) throw new AppError(401, 'INVALID_ACCESS_TOKEN', 'Access token is invalid or expired.')
  const [user, settings] = await Promise.all([
    User.findById(userId),
    ensureSettings(userId),
  ])
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'The account could not be found.')
  return serializeSettings(user, settings)
}

async function applyProfile(userId: string, profile: UpdateProfileInput) {
  const set: Record<string, unknown> = {}
  const unset: Record<string, 1> = {}
  for (const [key, value] of Object.entries(profile)) {
    if (value === null) unset[key] = 1
    else if (value !== undefined) set[key] = value
  }
  if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) return
  const user = await User.findByIdAndUpdate(userId, { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { returnDocument: 'after', runValidators: true })
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'The account could not be found.')
}

export async function updateUserProfile(userId: string, profile: UpdateProfileInput) {
  await applyProfile(userId, profile)
  return getUserSettings(userId)
}

export async function updateUserSettings(userId: string, input: UpdateSettingsInput) {
  if (input.profile) await applyProfile(userId, input.profile)
  const set: Record<string, unknown> = {}
  const unset: Record<string, 1> = {}
  if (input.goals) unsetNullableFields(input.goals, 'goals', set, unset)
  if (input.foodPreferences) unsetNullableFields(input.foodPreferences as Record<string, unknown>, 'foodPreferences', set, unset)
  if (input.applicationPreferences) unsetNullableFields(input.applicationPreferences as Record<string, unknown>, 'applicationPreferences', set, unset)
  if (Object.keys(set).length || Object.keys(unset).length) {
    await ensureSettings(userId)
    await UserSettings.updateOne(
      { userId: new mongoose.Types.ObjectId(userId) },
      { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) },
      { runValidators: true },
    )
  }
  return getUserSettings(userId)
}

export async function getUserProfile(userId: string) {
  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'The account could not be found.')
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    age: user.age ?? null,
    gender: user.gender ?? null,
    heightCm: user.heightCm ?? null,
    weightKg: user.weightKg ?? null,
    activityLevel: user.activityLevel ?? null,
  }
}
