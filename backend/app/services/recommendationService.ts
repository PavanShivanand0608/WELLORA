import { createHash } from 'node:crypto'
import mongoose from 'mongoose'
import { RecommendationFeedback, UserSettings } from '../models/index.js'
import { getNutritionTrends, getPatternsAnalytics } from './analyticsService.js'
import type { RecommendationFeedbackInput } from '../validators/settings.js'
import { AppError } from '../utils/AppError.js'

export type RecommendationCategory = 'Protein' | 'Fibre' | 'Fruit & veg' | 'Balanced meals' | 'Snack ideas' | 'Eating patterns'
export interface Recommendation {
  id: string
  title: string
  foodIdea: string
  description: string
  whySuggested: string
  observedPattern: string
  prepIdea: string
  category: RecommendationCategory
  source: 'personalized' | 'general'
  feedback?: { helpful?: boolean; relevant?: boolean }
  saved: boolean
  restriction: { ingredients: string[]; allergens: string[]; vegan: boolean; vegetarian: boolean; glutenFree: boolean; jainFriendly: boolean }
}
interface FoodIdea extends Omit<Recommendation, 'id' | 'feedback' | 'saved' | 'restriction'> {
  baseId: string
  ingredients: string[]
  allergens: string[]
  vegan: boolean
  vegetarian: boolean
  glutenFree: boolean
  jainFriendly: boolean
}

const categories: RecommendationCategory[] = ['Protein', 'Fibre', 'Fruit & veg', 'Balanced meals', 'Snack ideas', 'Eating patterns']

const generalIdeas: FoodIdea[] = [
  {
    baseId: 'general-idli-sambar-v1', title: 'Idli with vegetable sambar', foodIdea: 'Steamed idli with a bowl of vegetable sambar.',
    description: 'A familiar meal idea with a lentil-based accompaniment and vegetables.', whySuggested: 'This is a general food idea. Ingredient-level preferences and nutrient amounts are not inferred from food names.',
    observedPattern: 'General inspiration; it is not based on a personal nutrient gap.', prepIdea: 'Make extra sambar when preparing it and pair it with idli or dosa another day.', category: 'Protein', source: 'general',
    ingredients: ['idli', 'rice', 'urad dal', 'sambar', 'vegetables'], allergens: ['legumes'], vegan: true, vegetarian: true, glutenFree: true, jainFriendly: false,
  },
  {
    baseId: 'general-sprouts-salad-v1', title: 'Sprouts and crunchy vegetable salad', foodIdea: 'Sprouts with cucumber, tomato, lemon, and herbs.',
    description: 'A fresh, adaptable food idea with sprouts and vegetables; no nutrient amount is assumed.', whySuggested: 'This is a general variety idea. Ingredient details are not structured in your log.',
    observedPattern: 'General inspiration; no personal ingredient preference has been inferred.', prepIdea: 'Prepare chopped vegetables ahead and add sprouts and seasoning when ready to eat.', category: 'Fibre', source: 'general',
    ingredients: ['sprouts', 'cucumber', 'tomato', 'lemon'], allergens: ['legumes'], vegan: true, vegetarian: true, glutenFree: true, jainFriendly: false,
  },
  {
    baseId: 'general-curd-fruit-v1', title: 'Curd with seasonal fruit', foodIdea: 'Plain curd with fruit such as banana, guava, or papaya.',
    description: 'A flexible snack or breakfast side with a fruit option.', whySuggested: 'Fruit ingredients are not tracked in a structured way, so this idea is offered generally.',
    observedPattern: 'General inspiration; no fruit preference has been inferred.', prepIdea: 'Keep washed fruit handy and add it to a bowl of curd just before eating.', category: 'Fruit & veg', source: 'general',
    ingredients: ['curd', 'milk', 'banana', 'guava', 'papaya'], allergens: ['milk', 'dairy'], vegan: false, vegetarian: true, glutenFree: true, jainFriendly: true,
  },
  {
    baseId: 'general-dal-rice-veg-v1', title: 'Dal, rice, and seasonal vegetables', foodIdea: 'A plate with dal, rice, and one seasonal vegetable preparation.',
    description: 'A familiar meal structure with a grain, lentils, and vegetables.', whySuggested: 'This is a general meal idea; ingredient-level portions are not recorded for comparison.',
    observedPattern: 'General inspiration; it is not based on a personal target or diagnosis.', prepIdea: 'Cook extra dal or vegetables to make another meal easier to assemble.', category: 'Balanced meals', source: 'general',
    ingredients: ['dal', 'lentils', 'rice', 'vegetables'], allergens: ['legumes'], vegan: true, vegetarian: true, glutenFree: true, jainFriendly: false,
  },
  {
    baseId: 'general-roasted-chana-v1', title: 'Roasted chana for a ready-to-go snack', foodIdea: 'A portion of roasted chana, with fruit if that suits you.',
    description: 'A portable option that needs little preparation at the moment you want a snack.', whySuggested: 'This is a general snack alternative, not a response to a presumed craving.',
    observedPattern: 'General inspiration; no personal snack preference has been inferred.', prepIdea: 'Portion some into a reusable container so it is easy to take along.', category: 'Snack ideas', source: 'general',
    ingredients: ['chana', 'chickpeas'], allergens: ['legumes'], vegan: true, vegetarian: true, glutenFree: true, jainFriendly: false,
  },
  {
    baseId: 'general-roasted-makhana-v1', title: 'Roasted makhana for a simple snack', foodIdea: 'A small portion of roasted makhana, seasoned in a way you enjoy.',
    description: 'A simple snack idea that can be prepared ahead in a small container.', whySuggested: 'This is a general food idea, not a response to a presumed hunger cue or nutrient gap.',
    observedPattern: 'General inspiration; no personal snack preference has been inferred.', prepIdea: 'Roast a batch and store it in an airtight container for a quick option.', category: 'Snack ideas', source: 'general',
    ingredients: ['makhana', 'fox nuts'], allergens: [], vegan: true, vegetarian: true, glutenFree: true, jainFriendly: true,
  },
  {
    baseId: 'general-vegetable-upma-v1', title: 'Vegetable upma', foodIdea: 'Upma with vegetables such as peas, carrots, or beans.',
    description: 'A warm, adaptable meal that can use vegetables already on hand.', whySuggested: 'This is a general meal idea for variety; no ingredient preferences are inferred.',
    observedPattern: 'General inspiration; not personalized to a logged food preference.', prepIdea: 'Chop vegetables in advance or use suitable leftovers to shorten preparation.', category: 'Balanced meals', source: 'general',
    ingredients: ['semolina', 'wheat', 'peas', 'carrot', 'beans'], allergens: ['gluten'], vegan: true, vegetarian: true, glutenFree: false, jainFriendly: false,
  },
]

function userScopedId(userId: string, baseId: string) {
  return `rec_${createHash('sha256').update(`${userId}:${baseId}`).digest('hex').slice(0, 32)}`
}

function preferenceTokens(values: unknown): string[] {
  return Array.isArray(values) ? values.filter((item): item is string => typeof item === 'string').map((item) => item.trim().toLowerCase()).filter(Boolean) : []
}

function allowedForPreferences(idea: FoodIdea, preferences: Record<string, unknown>): boolean {
  const style = String(preferences.foodStyle ?? 'NOT_SET').toUpperCase()
  const dietary = preferenceTokens(preferences.dietaryPreferences)
  const avoid = [...preferenceTokens(preferences.allergies), ...preferenceTokens(preferences.foodsToAvoid)]
  if (style === 'VEGAN' && !idea.vegan) return false
  if (style === 'VEGETARIAN' && !idea.vegetarian) return false
  if (dietary.some((item) => item.includes('vegan')) && !idea.vegan) return false
  if (dietary.some((item) => item.includes('gluten-free')) && !idea.glutenFree) return false
  if (dietary.some((item) => item.includes('dairy-free')) && idea.allergens.includes('dairy')) return false
  if (dietary.some((item) => item.includes('jain')) && !idea.jainFriendly) return false
  if (dietary.some((item) => item.includes('no onion') || item.includes('no garlic')) && !idea.jainFriendly) return false
  const ingredientText = [...idea.ingredients, ...idea.allergens, idea.title, idea.foodIdea].join(' ').toLowerCase()
  if (avoid.some((item) => ingredientText.includes(item) || idea.allergens.some((allergen) => allergen.includes(item) || item.includes(allergen)))) return false
  return true
}

function withIdentity(userId: string, idea: FoodIdea): Recommendation {
  return {
    id: userScopedId(userId, idea.baseId), title: idea.title, foodIdea: idea.foodIdea,
    description: idea.description, whySuggested: idea.whySuggested, observedPattern: idea.observedPattern,
    prepIdea: idea.prepIdea, category: idea.category, source: idea.source, saved: false,
    restriction: { ingredients: [...idea.ingredients], allergens: [...idea.allergens], vegan: idea.vegan, vegetarian: idea.vegetarian, glutenFree: idea.glutenFree, jainFriendly: idea.jainFriendly },
  }
}

function uniqueTop<T extends { count: number }>(items: readonly T[]): T | undefined {
  const populated = items.filter((item) => item.count > 0)
  if (!populated.length) return undefined
  const maximum = Math.max(...populated.map((item) => item.count))
  const leaders = populated.filter((item) => item.count === maximum)
  return leaders.length === 1 ? leaders[0] : undefined
}

function recommendation(baseId: string, fields: Omit<FoodIdea, 'baseId' | 'ingredients' | 'allergens' | 'vegan' | 'vegetarian' | 'glutenFree' | 'jainFriendly'>, ingredients: string[], allergens: string[], flags: Pick<FoodIdea, 'vegan' | 'vegetarian' | 'glutenFree' | 'jainFriendly'>): FoodIdea {
  return { baseId, ingredients, allergens, ...flags, ...fields }
}

function compatibleFoodIdea(preferences: Record<string, unknown>, allowedCategories: RecommendationCategory[]) {
  return generalIdeas.find((idea) => allowedCategories.includes(idea.category) && allowedForPreferences(idea, preferences))
}

function buildPersonalized(userId: string, patterns: Awaited<ReturnType<typeof getPatternsAnalytics>>, trends: Awaited<ReturnType<typeof getNutritionTrends>>, preferences: Record<string, unknown>) {
  const ideas: FoodIdea[] = []
  const meals = patterns.mealCount
  const proteinCount = trends.days.reduce((sum, day) => sum + (day.recorded.proteinG ?? 0), 0)
  if (meals >= 3 && proteinCount >= 3) {
    const safePairing = compatibleFoodIdea(preferences, ['Protein', 'Balanced meals'])
    if (safePairing) {
      const goal = trends.goals.proteinG
      ideas.push(recommendation('personal-protein-rotation-v1', {
        title: 'Explore another protein pairing', foodIdea: safePairing.foodIdea,
        description: 'A familiar lentil or grain pairing can make it easy to vary a meal.',
        whySuggested: goal
          ? `You configured a protein preference of ${goal} g per day, and protein was recorded for ${proteinCount} of ${meals} meals in the last 30 days. Because entries may be incomplete, this is not a comparison with your goal.`
          : `Protein was recorded for ${proteinCount} of ${meals} meals in the last 30 days. This describes logging coverage, not whether an intake target was met.`,
        observedPattern: 'Blank nutrition values remain unknown; ingredients are not inferred from meal names.',
        prepIdea: safePairing.prepIdea,
        category: 'Protein', source: 'personalized',
      }, safePairing.ingredients, safePairing.allergens, safePairing))
    }
  }
  if (patterns.cueTaggedCount >= 3) {
    const cue = uniqueTop(patterns.cueDistribution)
    if (cue) {
      const convenience = cue.key === 'CONVENIENCE'
      const safeSnack = compatibleFoodIdea(preferences, ['Snack ideas', 'Fruit & veg', 'Balanced meals'])
      if (safeSnack) ideas.push(recommendation(`personal-cue-${cue.key.toLowerCase()}-v1`, {
        title: convenience ? 'Make a low-prep option easier to reach' : 'Keep a flexible food idea nearby',
        foodIdea: safeSnack.foodIdea,
        description: 'Having a couple of suitable options in mind can make a food choice simpler.',
        whySuggested: `${cue.label} was the most frequently recorded cue (${cue.count} of ${patterns.cueTaggedCount} cue-tagged meals) in the last 30 days.`,
        observedPattern: 'This describes the cue recorded; it does not explain why it occurred.',
        prepIdea: safeSnack.prepIdea,
        category: 'Snack ideas', source: 'personalized',
      }, safeSnack.ingredients, safeSnack.allergens, safeSnack))
    }
  }
  if (patterns.unplannedCount >= 3) {
    const time = uniqueTop(patterns.unplannedDaypartDistribution)
    if (time && time.count >= 3) {
      const safeSnack = compatibleFoodIdea(preferences, ['Snack ideas', 'Fruit & veg', 'Balanced meals'])
      if (safeSnack) ideas.push(recommendation(`personal-unplanned-${time.key.toLowerCase().replaceAll(' ', '-')}-v1`, {
        title: `Plan a convenient option for ${time.label.toLowerCase()}`,
        foodIdea: safeSnack.foodIdea,
        description: 'A prepared option can be convenient if it fits what you feel like eating.',
        whySuggested: `${time.count} of ${patterns.unplannedCount} meals marked unplanned in the last 30 days were recorded during ${time.label.toLowerCase()}.`,
        observedPattern: 'This is a timing pattern in your entries, not a judgment about the meals.',
        prepIdea: safeSnack.prepIdea,
        category: 'Eating patterns', source: 'personalized',
      }, safeSnack.ingredients, safeSnack.allergens, safeSnack))
    }
  }
  const usualTime = patterns.commonHours[0]
  if (patterns.mealCount >= 5 && usualTime && usualTime.count >= 3 && usualTime.count > (patterns.commonHours[1]?.count ?? 0)) {
    ideas.push(recommendation(`personal-meal-time-${usualTime.hour}-v1`, {
      title: 'Make a frequently logged meal time easier', foodIdea: 'A ready idea could be vegetable dosa with sambar or dal and rice.',
      description: 'A little preparation can make a familiar meal easier to assemble.',
      whySuggested: `Around ${usualTime.label} was your most frequently recorded meal time, with ${usualTime.count} entries in the last 30 days.`,
      observedPattern: 'This reflects recorded timestamps and may not represent every meal.',
      prepIdea: 'Prepare a suitable accompaniment such as chutney, sambar, or cooked dal ahead.',
      category: 'Eating patterns', source: 'personalized',
    }, ['vegetable dosa', 'sambar', 'dal', 'rice', 'urad'], ['legumes'], { vegan: true, vegetarian: true, glutenFree: true, jainFriendly: false }))
  }
  return ideas.filter((idea) => allowedForPreferences(idea, preferences)).slice(0, 4).map((idea) => withIdentity(userId, idea))
}

function buildObservations(patterns: Awaited<ReturnType<typeof getPatternsAnalytics>>) {
  const observations: Array<{ title: string; detail: string }> = []
  if (patterns.mealCount > 0) observations.push({ title: 'Recent meal history', detail: `${patterns.mealCount} meal entries were recorded in the last 30 days.` })
  const cue = uniqueTop(patterns.cueDistribution)
  if (cue && patterns.cueTaggedCount >= 3) observations.push({ title: 'Recorded eating cues', detail: `${cue.label} was recorded most often (${cue.count} of ${patterns.cueTaggedCount} cue-tagged meals).` })
  const unplannedTime = uniqueTop(patterns.unplannedDaypartDistribution)
  if (unplannedTime && patterns.unplannedCount >= 3) observations.push({ title: 'Unplanned meal timing', detail: `${unplannedTime.label} was the most common recorded time for unplanned meals (${unplannedTime.count} of ${patterns.unplannedCount}).` })
  const hour = patterns.commonHours[0]
  if (hour && hour.count >= 3 && hour.count > (patterns.commonHours[1]?.count ?? 0)) observations.push({ title: 'Common meal time', detail: `Around ${hour.label} appears most often in your recorded timestamps (${hour.count} entries).` })
  return observations
}

async function buildPlan(userId: string) {
  const settings = await UserSettings.findOne({ userId }).lean()
  const timezone = settings?.applicationPreferences?.timezone || 'UTC'
  const params = { range: '30' as const, timezone }
  const [patterns, trends] = await Promise.all([
    getPatternsAnalytics(userId, params),
    getNutritionTrends(userId, params),
  ])
  const preferences = (settings?.foodPreferences ?? {}) as Record<string, unknown>
  const personalized = buildPersonalized(userId, patterns, trends, preferences)
  const general = generalIdeas.filter((idea) => allowedForPreferences(idea, preferences)).map((idea) => withIdentity(userId, idea))
  const feedback = await RecommendationFeedback.find({ userId, recommendationKey: { $in: [...personalized, ...general].map((item) => item.id) } }).lean()
  const byKey = new Map(feedback.map((record) => [record.recommendationKey, record]))
  const attach = (item: Recommendation): Recommendation => {
    const record = byKey.get(item.id)
    return {
      ...item,
      ...(record?.helpful != null ? { feedback: { helpful: record.helpful, ...(record.relevant != null ? { relevant: record.relevant } : {}) } } : record?.relevant != null ? { feedback: { relevant: record.relevant } } : {}),
      saved: Boolean(record?.saved),
    }
  }
  const nutritionCoverage = (['calories', 'proteinG', 'carbsG', 'fatG'] as const).map((key) => {
    const recordedEntries = trends.days.reduce((sum, day) => sum + (day.recorded[key] ?? 0), 0)
    const sum = trends.days.reduce((total, day) => total + (key === 'calories' ? day.caloriesTotal ?? 0 : key === 'proteinG' ? day.proteinGTotal ?? 0 : key === 'carbsG' ? day.carbsGTotal ?? 0 : day.fatGTotal ?? 0), 0)
    return { key, recordedEntries, mealCount: patterns.mealCount, averageKnown: recordedEntries ? sum / recordedEntries : null }
  })
  const labels: Record<string, string> = { calories: 'Calories', proteinG: 'Protein', carbsG: 'Carbohydrates', fatG: 'Fat' }
  const units: Record<string, string> = { calories: 'kcal', proteinG: 'g', carbsG: 'g', fatG: 'g' }
  return {
    period: { days: 30, startDate: patterns.startDate, endDate: patterns.endDate },
    mealCount: patterns.mealCount,
    personalized: personalized.map(attach),
    general: general.map(attach),
    nutritionCoverage: nutritionCoverage.map((item) => ({ ...item, label: labels[item.key], unit: units[item.key] })),
    observations: buildObservations(patterns),
    hasEnoughHistory: patterns.mealCount >= 3,
  }
}

export async function getRecommendations(userId: string) {
  return buildPlan(userId)
}

export async function getRecommendation(userId: string, recommendationId: string) {
  const plan = await buildPlan(userId)
  const recommendation = [...plan.personalized, ...plan.general].find((item) => item.id === recommendationId)
  if (!recommendation) throw new AppError(404, 'RECOMMENDATION_NOT_FOUND', 'This recommendation is not available for this account.')
  return recommendation
}

export async function updateRecommendationFeedback(userId: string, recommendationId: string, input: RecommendationFeedbackInput) {
  await getRecommendation(userId, recommendationId)
  const update: Record<string, boolean> = {}
  if (input.helpful !== undefined) update.helpful = input.helpful
  if (input.relevant !== undefined) update.relevant = input.relevant
  await RecommendationFeedback.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), recommendationKey: recommendationId },
    { $set: update, $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), recommendationKey: recommendationId } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  )
  return getRecommendation(userId, recommendationId)
}

export async function saveRecommendation(userId: string, recommendationId: string) {
  const recommendation = await getRecommendation(userId, recommendationId)
  const snapshot = {
    title: recommendation.title, foodIdea: recommendation.foodIdea, description: recommendation.description,
    whySuggested: recommendation.whySuggested, observedPattern: recommendation.observedPattern,
    prepIdea: recommendation.prepIdea, category: recommendation.category, source: recommendation.source,
    restriction: recommendation.restriction,
  }
  await RecommendationFeedback.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId), recommendationKey: recommendationId },
    { $set: { saved: true, recommendationSnapshot: snapshot }, $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), recommendationKey: recommendationId } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  )
  return { ...recommendation, saved: true }
}

export async function unsaveRecommendation(userId: string, recommendationId: string) {
  const record = await RecommendationFeedback.findOne({ userId, recommendationKey: recommendationId, saved: true })
  if (!record) throw new AppError(404, 'SAVED_RECOMMENDATION_NOT_FOUND', 'This saved recommendation could not be found.')
  record.saved = false
  record.recommendationSnapshot = undefined
  await record.save()
  return { success: true }
}

export async function getSavedRecommendations(userId: string) {
  const [rows, settings] = await Promise.all([
    RecommendationFeedback.find({ userId, saved: true }).sort({ updatedAt: -1 }).limit(100).lean(),
    UserSettings.findOne({ userId }).select('foodPreferences').lean(),
  ])
  const preferences = (settings?.foodPreferences ?? {}) as Record<string, unknown>
  return rows.flatMap((row) => {
    const snapshot = row.recommendationSnapshot
    if (!snapshot?.restriction) return []
    const compatibility = {
      ...snapshot.restriction,
      baseId: 'saved-snapshot',
      ingredients: snapshot.restriction.ingredients ?? [],
      allergens: snapshot.restriction.allergens ?? [],
    } as FoodIdea
    if (!allowedForPreferences(compatibility, preferences)) return []
    return [{
      id: row.recommendationKey,
      title: snapshot.title,
      foodIdea: snapshot.foodIdea,
      description: snapshot.description,
      whySuggested: snapshot.whySuggested,
      observedPattern: snapshot.observedPattern,
      prepIdea: snapshot.prepIdea,
      category: snapshot.category as RecommendationCategory,
      source: snapshot.source as 'personalized' | 'general',
      saved: true,
      restriction: snapshot.restriction,
      ...(row.helpful != null ? { feedback: { helpful: row.helpful, ...(row.relevant != null ? { relevant: row.relevant } : {}) } } : row.relevant != null ? { feedback: { relevant: row.relevant } } : {}),
    } satisfies Recommendation]
  })
}

export function isRecommendationId(value: string) {
  return /^rec_[a-f\d]{32}$/.test(value)
}

export { categories as recommendationCategories }
