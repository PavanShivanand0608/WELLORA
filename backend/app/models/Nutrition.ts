import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const nonNegative = { min: 0 }
const nutritionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  mealId: { type: Schema.Types.ObjectId, ref: 'Meal', required: true, immutable: true },
  calories: { type: Number, ...nonNegative },
  proteinG: { type: Number, ...nonNegative },
  carbsG: { type: Number, ...nonNegative },
  fatG: { type: Number, ...nonNegative },
  fiberG: { type: Number, ...nonNegative },
  sugarG: { type: Number, ...nonNegative },
  sodiumMg: { type: Number, ...nonNegative },
}, { timestamps: true, versionKey: false })

nutritionSchema.index({ userId: 1, mealId: 1 }, { unique: true })

export type NutritionRecord = InferSchemaType<typeof nutritionSchema>
export const Nutrition = (mongoose.models.Nutrition as mongoose.Model<NutritionRecord> | undefined) ?? mongoose.model<NutritionRecord>('Nutrition', nutritionSchema)
