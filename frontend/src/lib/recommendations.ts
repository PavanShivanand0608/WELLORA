import { calculatePatternAnalytics, eatingCueOptions, hungerLevelOptions } from './patternAnalytics'
import type { MealEntry } from '../types/meal'

export type RecommendationCategory =
  | 'Protein'
  | 'Fibre'
  | 'Fruit & veg'
  | 'Balanced meals'
  | 'Snack ideas'
  | 'Eating patterns'

export interface FoodRecommendation {
  id: string
  title: string
  foodIdea: string
  description: string
  whySuggested: string
  observedPattern: string
  prepIdea: string
  category: RecommendationCategory
  source: 'personalized' | 'general'
}

export interface NutritionCoverage {
  key: 'calories' | 'proteinG' | 'carbsG' | 'fatG'
  label: string
  unit: string
  recordedEntries: number
  mealCount: number
  averageKnown: number | null
}

export interface PatternObservation {
  title: string
  detail: string
}

export interface RecommendationPlan {
  periodDays: 30
  mealCount: number
  personalized: FoodRecommendation[]
  general: FoodRecommendation[]
  nutritionCoverage: NutritionCoverage[]
  observations: PatternObservation[]
  hasEnoughHistory: boolean
}

const metricOptions: Array<{ key: NutritionCoverage['key']; label: string; unit: string }> = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'proteinG', label: 'Protein', unit: 'g' },
  { key: 'carbsG', label: 'Carbohydrates', unit: 'g' },
  { key: 'fatG', label: 'Fat', unit: 'g' },
]

export const recommendationCategories: RecommendationCategory[] = [
  'Protein',
  'Fibre',
  'Fruit & veg',
  'Balanced meals',
  'Snack ideas',
  'Eating patterns',
]

export const generalFoodIdeas: FoodRecommendation[] = [
  {
    id: 'general-idli-sambar',
    title: 'Idli with vegetable sambar',
    foodIdea: 'Steamed idli with a bowl of sambar and vegetables.',
    description: 'A familiar meal idea with a lentil-based accompaniment and a different texture from the idli.',
    whySuggested: 'A general way to add variety to a breakfast or light meal; it is not based on a personal nutrient gap.',
    observedPattern: 'General idea. Your food log does not capture ingredient details or personal preferences.',
    prepIdea: 'Make extra sambar when preparing it, then pair it with idli or dosa another day.',
    category: 'Protein',
    source: 'general',
  },
  {
    id: 'general-sprouts-salad',
    title: 'Sprouts and crunchy vegetable salad',
    foodIdea: 'A bowl of sprouts with cucumber, tomato, lemon, and herbs.',
    description: 'A simple fibre-rich food idea using sprouts and vegetables, with no nutrient amount assumed.',
    whySuggested: 'Fibre values are not captured in Meal Log, so this is a general variety suggestion rather than a personalized assessment.',
    observedPattern: 'General idea. Ingredient-level food data is not available in your log.',
    prepIdea: 'Prepare the chopped vegetables ahead and add sprouts and seasoning when ready to eat.',
    category: 'Fibre',
    source: 'general',
  },
  {
    id: 'general-curd-fruit',
    title: 'Curd with seasonal fruit',
    foodIdea: 'Plain curd served with fruit you enjoy, such as banana, guava, or papaya.',
    description: 'A flexible snack or breakfast side that brings a fruit option into the mix.',
    whySuggested: 'Fruit ingredients are not tracked as structured data, so this idea is offered generally.',
    observedPattern: 'General idea. No fruit preference has been inferred.',
    prepIdea: 'Keep washed fruit handy and add it to a bowl of curd just before serving.',
    category: 'Fruit & veg',
    source: 'general',
  },
  {
    id: 'general-dal-rice-veg',
    title: 'Dal, rice, and seasonal vegetables',
    foodIdea: 'A simple plate with dal, rice, and one seasonal vegetable preparation.',
    description: 'A familiar meal structure with a grain, lentils, and vegetables.',
    whySuggested: 'A general balanced meal idea. Your log does not record ingredient-level portions for comparison.',
    observedPattern: 'General idea. It is not based on a personal target or diagnosis.',
    prepIdea: 'Cook an extra portion of dal or vegetables to make the next meal easier to assemble.',
    category: 'Balanced meals',
    source: 'general',
  },
  {
    id: 'general-roasted-chana',
    title: 'Roasted chana for a ready-to-go snack',
    foodIdea: 'A small container of roasted chana, with water or fruit if that suits you.',
    description: 'A portable option that takes little preparation at the moment you want a snack.',
    whySuggested: 'A practical snack alternative offered as a general idea, not as a response to a presumed craving.',
    observedPattern: 'General idea. No personal snack preference has been inferred.',
    prepIdea: 'Portion some into a reusable container so it is easy to take along.',
    category: 'Snack ideas',
    source: 'general',
  },
  {
    id: 'general-vegetable-upma',
    title: 'Vegetable upma',
    foodIdea: 'Upma with vegetables such as peas, carrots, or beans.',
    description: 'A warm, adaptable meal that can use vegetables already on hand.',
    whySuggested: 'A general meal idea for variety; ingredient preferences are not inferred from meal names.',
    observedPattern: 'General idea. Not personalized to a logged food preference.',
    prepIdea: 'Chop vegetables in advance or use leftovers to shorten preparation.',
    category: 'Balanced meals',
    source: 'general',
  },
]

function knownNutritionValues(meals: readonly MealEntry[], key: NutritionCoverage['key']): number[] {
  return meals
    .map((meal) => meal[key])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0)
}

function createNutritionCoverage(meals: readonly MealEntry[]): NutritionCoverage[] {
  return metricOptions.map(({ key, label, unit }) => {
    const values = knownNutritionValues(meals, key)
    return {
      key,
      label,
      unit,
      recordedEntries: values.length,
      mealCount: meals.length,
      averageKnown: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    }
  })
}

function topUnique<T extends { count: number }>(items: readonly T[]): T | null {
  const populated = items.filter((item) => item.count > 0)
  if (!populated.length) return null
  const highest = Math.max(...populated.map((item) => item.count))
  const leaders = populated.filter((item) => item.count === highest)
  return leaders.length === 1 ? leaders[0] : null
}

function readableCue(key: string): string {
  return eatingCueOptions.find((cue) => cue.value === key)?.label ?? key.toLowerCase().replaceAll('_', ' ')
}

function buildPersonalized(analytics: ReturnType<typeof calculatePatternAnalytics>): FoodRecommendation[] {
  const recommendations: FoodRecommendation[] = []
  if (analytics.mealCount < 3) return recommendations

  const proteinCoverage = createNutritionCoverage(analytics.meals).find((item) => item.key === 'proteinG')
  if (proteinCoverage && proteinCoverage.recordedEntries >= 3) {
    const average = proteinCoverage.averageKnown === null ? null : Math.round(proteinCoverage.averageKnown)
    recommendations.push({
      id: 'personal-protein-variety',
      title: 'Explore another protein pairing',
      foodIdea: 'Try dal with rice, sprouts in a salad, or paneer with vegetables.',
      description: 'A few familiar ingredients make it easy to vary the protein source in a meal.',
      whySuggested: `Protein values were entered for ${proteinCoverage.recordedEntries} of ${proteinCoverage.mealCount} meals in the last 30 days. This coverage does not show a shortfall or establish a personal target.`,
      observedPattern: average === null
        ? 'Protein details are present on several entries; some other meals have no value recorded.'
        : `The entered protein values average ${average} g across those ${proteinCoverage.recordedEntries} entries only. Blank values remain unknown.`,
      prepIdea: 'Rotate a lentil, bean, paneer, or curd-based accompaniment through meals that suit you.',
      category: 'Protein',
      source: 'personalized',
    })
  }

  if (analytics.cueTaggedCount >= 3) {
    const cue = topUnique(analytics.cueDistribution)
    if (cue) {
      const cueLabel = readableCue(cue.key)
      const foodIdea = cue.key === 'CONVENIENCE'
        ? 'Keep roasted chana, fruit with curd, or a ready vegetable upma option in mind.'
        : cue.key === 'PHYSICAL_HUNGER'
          ? 'A flexible option could be idli with sambar or a vegetable dosa.'
          : 'If a snack sounds right, consider curd with fruit or roasted chana.'
      recommendations.push({
        id: `personal-cue-${cue.key.toLowerCase()}`,
        title: cue.key === 'CONVENIENCE' ? 'Make a low-prep option easier to reach' : 'Keep a flexible snack idea nearby',
        foodIdea,
        description: 'Having a couple of options in mind can make the next food choice feel simpler.',
        whySuggested: `${cueLabel} was the most frequently recorded cue in ${cue.count} of ${analytics.cueTaggedCount} cue-tagged meals over the last 30 days.`,
        observedPattern: 'This describes the cue you recorded; it does not explain why it occurred.',
        prepIdea: 'Choose one option you would actually like and keep its ingredients or a portion ready.',
        category: 'Snack ideas',
        source: 'personalized',
      })
    }
  }

  if (analytics.unplannedCount >= 3) {
    const commonUnplannedTime = topUnique(analytics.unplannedDaypartDistribution)
    if (commonUnplannedTime && commonUnplannedTime.count >= 3) {
      const timeName = commonUnplannedTime.label.toLowerCase()
      recommendations.push({
        id: `personal-unplanned-${timeName.replaceAll(' ', '-')}`,
        title: `Plan an easy option for ${timeName}`,
        foodIdea: 'Roasted chana, curd with fruit, or a simple vegetable upma.',
        description: 'A prepared option can be convenient if it fits what you feel like eating.',
        whySuggested: `${commonUnplannedTime.count} of ${analytics.unplannedCount} unplanned meals in the last 30 days were recorded during ${timeName}.`,
        observedPattern: 'This is a timing pattern in your log, not a judgment about the meals.',
        prepIdea: 'Set aside one shelf-stable snack or prep fruit and vegetables ahead of that time.',
        category: 'Snack ideas',
        source: 'personalized',
      })
    } else {
      recommendations.push({
        id: 'personal-unplanned-backup',
        title: 'Keep one flexible backup meal in mind',
        foodIdea: 'Vegetable upma or dal and rice with a seasonal vegetable.',
        description: 'A familiar, adaptable meal can be useful to have as an option on busy days.',
        whySuggested: `You recorded ${analytics.unplannedCount} unplanned meals in the last 30 days, but no single time of day stands out.`,
        observedPattern: 'The count is based on entries marked unplanned in your meal log.',
        prepIdea: 'Batch-cook a base such as dal, or keep vegetables ready for a quick upma.',
        category: 'Balanced meals',
        source: 'personalized',
      })
    }
  }

  const topHour = analytics.commonHours[0]
  const hasUniqueTopHour = topHour && (analytics.commonHours.length === 1 || topHour.count > analytics.commonHours[1].count)
  if (analytics.mealCount >= 5 && topHour && topHour.count >= 3 && hasUniqueTopHour) {
    recommendations.push({
      id: `personal-timing-${topHour.hour}`,
      title: 'Make your usual meal time easier',
      foodIdea: 'A ready meal idea: vegetable dosa with sambar or dal and rice.',
      description: 'A small amount of preparation can make a familiar meal easier to assemble.',
      whySuggested: `Around ${topHour.label} was your most frequently recorded meal time, with ${topHour.count} entries over the last 30 days.`,
      observedPattern: 'This reflects recorded timestamps and may not represent every meal.',
      prepIdea: 'Prepare a chutney, sambar, or cooked dal ahead if you plan to have it.',
      category: 'Balanced meals',
      source: 'personalized',
    })
  }

  return recommendations.slice(0, 4)
}

function buildObservations(analytics: ReturnType<typeof calculatePatternAnalytics>): PatternObservation[] {
  if (!analytics.mealCount) return []

  const observations: PatternObservation[] = [{
    title: 'Meal history',
    detail: `${analytics.mealCount} valid meal entries fall within the last 30 days.`,
  }]

  if (analytics.cueTaggedCount) {
    const cue = topUnique(analytics.cueDistribution)
    observations.push({
      title: 'Recorded eating cues',
      detail: cue && analytics.cueTaggedCount >= 3
        ? `${readableCue(cue.key)} appears most often (${cue.count} of ${analytics.cueTaggedCount} cue-tagged entries).`
        : `${analytics.cueTaggedCount} entries include an eating cue; more records are needed to identify a clear leading cue.`,
    })
  } else {
    observations.push({ title: 'Eating cues', detail: 'No eating cues have been recorded in this period yet.' })
  }

  if (analytics.unplannedCount) {
    const daypart = topUnique(analytics.unplannedDaypartDistribution)
    observations.push({
      title: 'Unplanned meals',
      detail: daypart && analytics.unplannedCount >= 3 && daypart.count >= 3
        ? `${daypart.count} of ${analytics.unplannedCount} unplanned entries were recorded during ${daypart.label.toLowerCase()}.`
        : `${analytics.unplannedCount} meals were marked unplanned; no clear time-of-day pattern is established yet.`,
    })
  }

  if (analytics.commonHours.length) {
    const top = analytics.commonHours[0]
    const distinctTop = analytics.commonHours.length === 1 || top.count > analytics.commonHours[1].count
    observations.push({
      title: 'Meal timing',
      detail: top.count >= 3 && distinctTop
        ? `Around ${top.label} is the most frequently recorded time (${top.count} entries).`
        : 'Your recorded meal times are spread across several hours.',
    })
  }

  if (analytics.hungerCount) {
    const commonLevel = analytics.mostCommonHunger
    const levelCount = commonLevel ? analytics.hungerDistribution.find((item) => item.label === commonLevel)?.count ?? 0 : 0
    observations.push({
      title: 'Hunger check-ins',
      detail: commonLevel && analytics.hungerCount >= 3
        ? `Level ${hungerLevelOptions.find((level) => level.label === commonLevel)?.value} was recorded most often (${levelCount} of ${analytics.hungerCount} check-ins).`
        : `${analytics.hungerCount} hunger ${analytics.hungerCount === 1 ? 'check-in is' : 'check-ins are'} available; more records are needed for a summary.`,
    })
  }
  return observations.slice(0, 4)
}

export function buildRecommendationPlan(sourceMeals: readonly MealEntry[], today = new Date()): RecommendationPlan {
  const analytics = calculatePatternAnalytics(sourceMeals, 30, today)
  const nutritionCoverage = createNutritionCoverage(analytics.meals)
  return {
    periodDays: 30,
    mealCount: analytics.mealCount,
    personalized: buildPersonalized(analytics),
    general: generalFoodIdeas,
    nutritionCoverage,
    observations: buildObservations(analytics),
    hasEnoughHistory: analytics.mealCount >= 3,
  }
}
