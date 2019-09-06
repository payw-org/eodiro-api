import CAUFoodScraper, { Data } from '@payw/cau-food-scraper'
import DayMeal from 'Database/models/day-meal'
import LogHelper from 'Helpers/LogHelper'
import { DayMealDoc } from 'Database/schemas/day-meal'

const dayScope = 5

export default class MealSeeder {
  private mealsSeed: Data

  public async run(): Promise<void> {
    const recentMeal = (await DayMeal.findOne({}, { _id: 0, date: 1 }).sort(
      '-date'
    )) as DayMealDoc

    const recentDate = new Date(recentMeal.date)
    const currentDate = new Date()
    const dayDiff = Math.ceil(
      (recentDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (dayDiff < dayScope - 1) {
      await this.scrapeMeals()
      await this.seedMeals()
    }
  }

  private async scrapeMeals(): Promise<void> {
    this.mealsSeed = await CAUFoodScraper({
      id: process.env.FOOD_SCRAPER_ID,
      pw: process.env.FOOD_SCRAPER_PASSWORD,
      days: dayScope
    })
  }

  private async seedMeals(): Promise<void> {
    await DayMeal.deleteMany({})

    try {
      await DayMeal.insertMany(this.mealsSeed)
    } catch (err) {
      LogHelper.log('error', 'Meal save error: ' + err)
    }
  }
}
