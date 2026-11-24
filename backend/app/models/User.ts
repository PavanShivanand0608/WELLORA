import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const userSchema = new Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpiresAt: { type: Date, select: false },
  age: { type: Number, min: 1, max: 120 },
  gender: { type: String, trim: true, maxlength: 80 },
  heightCm: { type: Number, min: 50, max: 250 },
  weightKg: { type: Number, min: 1, max: 500 },
  activityLevel: { type: String, enum: ['LOW', 'MODERATE', 'HIGH'] },
}, { timestamps: true, versionKey: false })

userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ passwordResetTokenHash: 1 }, { unique: true, sparse: true })

export type UserRecord = InferSchemaType<typeof userSchema>
export const User = (mongoose.models.User as mongoose.Model<UserRecord> | undefined) ?? mongoose.model<UserRecord>('User', userSchema)
