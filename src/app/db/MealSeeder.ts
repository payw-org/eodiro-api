import CAUFoodScraper, { ScrapedData } from '@payw/cau-food-scraper'
import DayMeal from 'Database/models/day-meal'
import LogHelper from 'Helpers/LogHelper'
import { DayMealDoc } from 'Database/schemas/day-meal'
import University from 'Database/models/university'

const dayScope = 5

export default class MealSeeder {
  /**
   * Seed(resource) data for meals
   */
  private mealsSeed: ScrapedData[] = []

  /**
   * Scrape meals and seed it to database.
   */
  public async run(): Promise<void> {
    // get most recent meal
    const recentMeal = (await DayMeal.findOne({}, { _id: 0, date: 1 })
      .lean()
      .sort('-date')) as DayMealDoc

    // if meals are empty
    if (recentMeal === null) {
      await this.scrapeMeals()
      await this.seedMeals()

      return
    }

    const recentDate = new Date(recentMeal.date)
    const currentDate = new Date()

    // calculate day difference between recent meal date and current date
    const dayDiff = Math.ceil(
      (recentDate.getTime() +
        currentDate.getTimezoneOffset() * 1000 * 60 -
        currentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    // if need to get new meals
    if (dayDiff < dayScope - 1) {
      await this.scrapeMeals()
      await this.seedMeals()
    }
  }

  /**
   * Scrape meal list from website
   */
  private async scrapeMeals(): Promise<void> {
    this.mealsSeed.push(
      await CAUFoodScraper({
        id: process.env.FOOD_SCRAPER_ID,
        pw: process.env.FOOD_SCRAPER_PASSWORD,
        days: dayScope
      })
    )
  }

  /**
   * Seed scraped meals to database.
   */
  private async seedMeals(): Promise<void> {
    await DayMeal.deleteMany({}) // delete old meals

    // asynchronously seed meals
    await Promise.all(
      this.mealsSeed.map(async (seed: ScrapedData) => {
        try {
          // create meals
          const meals = (await DayMeal.insertMany(seed.days)) as DayMealDoc[]

          // link meals to university
          await University.findOneAndUpdate(
            { vendor: seed.campus },
            { meals: meals }
          )
        } catch (err) {
          LogHelper.log('error', 'Meal save error: ' + err)
        }
      })
    )
  }
}
