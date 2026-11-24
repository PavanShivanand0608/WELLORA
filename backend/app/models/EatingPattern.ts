import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const eatingPatternSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  patternType: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, required: true, trim: true, maxlength: 2_000 },
  evidenceCount: { type: Number, required: true, min: 0, validate: Number.isInteger },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  keyNutrientGap: { type: String, trim: true, maxlength: 80 },
  evidenceSummary: { type: String, trim: true, maxlength: 4_000 },
}, { timestamps: true, versionKey: false })

eatingPatternSchema.pre('validate', function validatePatternWindow() {
  if (this.weekEnd < this.weekStart) {
    this.invalidate('weekEnd', 'Pattern window end must not precede its start.')
  }
})

eatingPatternSchema.index({ userId: 1, weekStart: -1 })

export type EatingPatternRecord = InferSchemaType<typeof eatingPatternSchema>
export const EatingPattern = (mongoose.models.EatingPattern as mongoose.Model<EatingPatternRecord> | undefined) ?? mongoose.model<EatingPatternRecord>('EatingPattern', eatingPatternSchema)
