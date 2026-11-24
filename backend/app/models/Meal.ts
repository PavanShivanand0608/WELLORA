import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const mealSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  foodName: { type: String, required: true, trim: true, maxlength: 180 },
  mealType: { type: String, enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'], required: true },
  logType: { type: String, enum: ['REGULAR', 'UNPLANNED'], required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  servingUnit: { type: String, required: true, trim: true, maxlength: 60 },
  loggedAt: { type: Date, required: true },
  eatingCue: { type: String, enum: ['HUNGRY', 'CRAVING', 'OVERATE', 'JUST_BECAUSE'] },
  eatingCueDetail: { type: String, enum: ['PHYSICAL_HUNGER', 'CRAVINGS', 'STRESS', 'BOREDOM', 'EMOTIONAL_EATING', 'SOCIAL_OCCASION', 'CONVENIENCE', 'OTHER'] },
  context: { type: String, trim: true, maxlength: 1_000 },
  notes: { type: String, trim: true, maxlength: 2_000 },
  moodBefore: { type: String, trim: true, maxlength: 80 },
  moodAfter: { type: String, trim: true, maxlength: 80 },
  hungerLevel: { type: Number, min: 1, max: 5, validate: Number.isInteger },
}, { timestamps: true, versionKey: false })

mealSchema.pre('validate', function validateCueForLogType() {
  if (this.logType === 'REGULAR' && (this.eatingCue || this.eatingCueDetail)) {
    this.invalidate('eatingCue', 'Eating cues can only be attached to unplanned meals.')
  }
})

// Stable, user-scoped sort and filter indexes for the paginated meal API.
mealSchema.index({ userId: 1, loggedAt: -1, _id: -1 })
mealSchema.index({ userId: 1, mealType: 1, loggedAt: -1 })
mealSchema.index({ userId: 1, logType: 1, loggedAt: -1 })
mealSchema.index({ userId: 1, eatingCueDetail: 1, loggedAt: -1 })

export type MealRecord = InferSchemaType<typeof mealSchema>
export const Meal = (mongoose.models.Meal as mongoose.Model<MealRecord> | undefined) ?? mongoose.model<MealRecord>('Meal', mealSchema)
