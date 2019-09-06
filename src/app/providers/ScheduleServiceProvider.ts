import EmptyCountScheduler from '../schedulers/EmptyCountScheduler'
import MealScheduler from '../schedulers/MealScheduler'

export default class ScheduleServiceProvider {
  public boot(): void {
    EmptyCountScheduler.run()
    MealScheduler.run()
  }
}
