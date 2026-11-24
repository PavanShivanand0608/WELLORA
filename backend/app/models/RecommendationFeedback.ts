import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const recommendationSnapshotSchema = new Schema({
  title: { type: String, required: true, maxlength: 180 },
  foodIdea: { type: String, required: true, maxlength: 500 },
  description: { type: String, required: true, maxlength: 800 },
  whySuggested: { type: String, required: true, maxlength: 1_000 },
  observedPattern: { type: String, required: true, maxlength: 800 },
  prepIdea: { type: String, required: true, maxlength: 800 },
  category: { type: String, required: true, maxlength: 40 },
  source: { type: String, enum: ['personalized', 'general'], required: true },
  restriction: {
    ingredients: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    vegan: { type: Boolean, required: true },
    vegetarian: { type: Boolean, required: true },
    glutenFree: { type: Boolean, required: true },
    jainFriendly: { type: Boolean, required: true },
  },
}, { _id: false })

const recommendationFeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  recommendationKey: { type: String, required: true, trim: true, maxlength: 160 },
  helpful: { type: Boolean },
  relevant: { type: Boolean },
  saved: { type: Boolean, default: false },
  feedbackNote: { type: String, trim: true, maxlength: 1_000 },
  recommendationSnapshot: { type: recommendationSnapshotSchema },
}, { timestamps: true, versionKey: false })

recommendationFeedbackSchema.index({ userId: 1, recommendationKey: 1 }, { unique: true })

export type RecommendationFeedbackRecord = InferSchemaType<typeof recommendationFeedbackSchema>
export const RecommendationFeedback = (mongoose.models.RecommendationFeedback as mongoose.Model<RecommendationFeedbackRecord> | undefined) ?? mongoose.model<RecommendationFeedbackRecord>('RecommendationFeedback', recommendationFeedbackSchema)
