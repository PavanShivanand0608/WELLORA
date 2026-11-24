import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const goalsSchema = new Schema({
  calories: { type: Number, min: 1 },
  proteinG: { type: Number, min: 1 },
  carbsG: { type: Number, min: 1 },
  fatG: { type: Number, min: 1 },
  fiberG: { type: Number, min: 1 },
  objectives: { type: [String], default: [] },
}, { _id: false })

const foodPreferencesSchema = new Schema({
  foodStyle: { type: String, enum: ['NOT_SET', 'VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN'], default: 'NOT_SET' },
  allergies: { type: [String], default: [] },
  dietaryPreferences: { type: [String], default: [] },
  foodsToAvoid: { type: [String], default: [] },
  favouriteCategories: { type: [String], default: [] },
}, { _id: false })

const reminderPreferencesSchema = new Schema({
  notificationsEnabled: { type: Boolean, default: true },
  mealReminderEnabled: { type: Boolean, default: false },
  mealReminderTime: { type: String, match: /^(?:[01]\d|2[0-3]):[0-5]\d$/ },
  hydrationReminderEnabled: { type: Boolean, default: false },
  hydrationReminderTime: { type: String, match: /^(?:[01]\d|2[0-3]):[0-5]\d$/ },
  timezone: { type: String, trim: true, default: 'UTC', maxlength: 80 },
  theme: { type: String, enum: ['LIGHT'], default: 'LIGHT' },
}, { _id: false })

const userSettingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  goals: { type: goalsSchema, default: () => ({}) },
  foodPreferences: { type: foodPreferencesSchema, default: () => ({}) },
  applicationPreferences: { type: reminderPreferencesSchema, default: () => ({}) },
}, { timestamps: true, versionKey: false })

userSettingsSchema.index({ userId: 1 }, { unique: true })

export type UserSettingsRecord = InferSchemaType<typeof userSettingsSchema>
export const UserSettings = (mongoose.models.UserSettings as mongoose.Model<UserSettingsRecord> | undefined) ?? mongoose.model<UserSettingsRecord>('UserSettings', userSettingsSchema)
