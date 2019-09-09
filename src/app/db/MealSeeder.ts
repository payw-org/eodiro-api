import CAUFoodScraper, { ScrapedData } from '@payw/cau-food-scraper'
import DayMeal from 'Database/models/day-meal'
import LogHelper from 'Helpers/LogHelper'
import { DayMealDoc } from 'Database/schemas/day-meal'
import University from 'Database/models/university'
import { UniversityDoc } from 'Database/schemas/university'

const dayScope = 5

export default class MealSeeder {
  /**
   * Scrape meals and seed it to database.
   */
  public async run(): Promise<void> {
    let meals: ScrapedData[]

    const mealCount = await DayMeal.estimatedDocumentCount()
    // if meals are empty
    if (mealCount === 0) {
      meals = await this.scrapeMeals()
      await this.seedMeals(meals)

      return
    }

    // if meals are not recent
    if (!(await this.isRecent())) {
      meals = await this.scrapeMeals()
      await this.seedMeals(meals)
    }
  }

  /**
   * Check if meals of all university are recent.
   */
  private async isRecent(): Promise<boolean> {
    // get meals of all university as date recent order
    const universities = (await University.find({}, { _id: 0, meals: 1 })
      .lean()
      .populate({
        path: 'meals',
        select: 'date -_id',
        options: { sort: { date: -1 } }
      })) as UniversityDoc[]

    const currentDate = new Date()
    return universities.every(univ => {
      // if meals are empty
      if (univ.meals === null || univ.meals.length === 0) {
        return false
      }

      const meal = univ.meals[0] as DayMealDoc // recent meal
      const recentDate = new Date(meal.date)

      // Calculate day difference by reflecting timezone offset
      const dayDiff = Math.ceil(
        (recentDate.getTime() +
          currentDate.getTimezoneOffset() * 1000 * 60 -
          currentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )

      return dayDiff >= dayScope - 1
    })
  }

  /**
   * Scrape meal list from website
   */
  private async scrapeMeals(): Promise<ScrapedData[]> {
    const meals: ScrapedData[] = []

    meals.push(
      await CAUFoodScraper({
        id: process.env.FOOD_SCRAPER_ID,
        pw: process.env.FOOD_SCRAPER_PASSWORD,
        days: dayScope
      })
    )

    return meals
  }

  /**
   * Seed scraped meals to database.
   */
  private async seedMeals(meals: ScrapedData[]): Promise<void> {
    // asynchronously seed meals
    await Promise.all(
      meals.map(async (seed: ScrapedData) => {
        try {
          // get meals of each university
          const univ = (await University.findOne(
            { vendor: seed.campus },
            { _id: 1, meals: 1 }
          ).lean()) as UniversityDoc

          const mealIds = univ.meals as string[]

          let dayMeal
          // seeding
          for (const seedMeal of seed.days) {
            // update the existing meal or create new meal from seed
            dayMeal = await DayMeal.findOneAndUpdate(
              { _id: { $in: mealIds }, date: seedMeal.date },
              {
                date: seedMeal.date,
                breakfast: seedMeal.breakfast,
                lunch: seedMeal.lunch,
                supper: seedMeal.supper
              },
              { upsert: true, new: true }
            ).lean()

            // link meal to the university
            await University.findByIdAndUpdate(univ._id, {
              $addToSet: { meals: dayMeal._id }
            })
          }
        } catch (err) {
          LogHelper.log('error', 'Meal save error: ' + err)
        }
      })
    )
  }
}
