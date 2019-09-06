import CAUFoodScraper, { Data } from '@payw/cau-food-scraper'
import DayMeal from 'Database/models/day-meal'
import LogHelper from 'Helpers/LogHelper'
import { DayMealDoc } from 'Database/schemas/day-meal'

const dayScope = 5

export default class MealSeeder {
  /**
   * Seed(resource) data for meals
   */
  private mealsSeed: Data

  /**
   * Scrape meals and seed it to database.
   */
  public async run(): Promise<void> {
    // get most recent meal
    const recentMeal = (await DayMeal.findOne({}, { _id: 0, date: 1 }).sort(
      '-date'
    )) as DayMealDoc

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
    this.mealsSeed = await CAUFoodScraper({
      id: process.env.FOOD_SCRAPER_ID,
      pw: process.env.FOOD_SCRAPER_PASSWORD,
      days: dayScope
    })
  }

  /**
   * Seed scraped meals to database.
   */
  private async seedMeals(): Promise<void> {
    await DayMeal.deleteMany({}) // delete old meals

    try {
      await DayMeal.insertMany(this.mealsSeed) // seed new
    } catch (err) {
      LogHelper.log('error', 'Meal save error: ' + err)
    }
  }
}
