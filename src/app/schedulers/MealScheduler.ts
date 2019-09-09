import schedule from 'node-schedule'
import MealSeeder from 'DB/MealSeeder'

const mealSchedulingOption = {
  hour: 0,
  minute: 0,
  second: 30
}

export default class MealScheduler {
  /**
   * Schedule the jobs associated with meals.
   */
  public static run(): void {
    this.scheduleSeedJob()
  }

  /**
   * Seed meals every day.
   */
  private static scheduleSeedJob(): void {
    schedule.scheduleJob(mealSchedulingOption, () => {
      const mealSeeder = new MealSeeder()
      mealSeeder.run().then()
    })
  }
}
