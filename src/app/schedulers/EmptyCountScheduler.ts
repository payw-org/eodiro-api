import schedule from 'node-schedule'
import EmptyCount, {
  e_day,
  e_hour,
  e_min,
  s_day,
  s_hour,
  s_min
} from 'Database/models/empty_count'
import { tick_min } from 'Database/models/empty_count'
import TimeManager from 'Helpers/TimeManager'

export default class EmptyCountScheduler {
  /**
   * Schedule the jobs associated with empty classroom count.
   */
  public static run(): void {
    this.scheduleSaveJob()
    this.scheduleDeleteJob()
  }

  /**
   * Save next time's empty count in advance every tick minutes.
   * If not activation time, do not save.
   */
  private static scheduleSaveJob(): void {
    const rule = new schedule.RecurrenceRule()
    rule.minute = new schedule.Range(0, 59, tick_min)
    rule.second = 30

    schedule.scheduleJob(rule, async () => {
      if (
        TimeManager.isDateInRange(
          new Date(),
          s_day,
          e_day,
          s_hour,
          e_hour,
          s_min,
          e_min
        )
      ) {
        await EmptyCount.saveNextCount()
      }
    })
  }

  /**
   * Delete previous time's empty count every tick minutes.
   * If not activation time, do not delete.
   */
  private static scheduleDeleteJob(): void {
    const rule = new schedule.RecurrenceRule()
    rule.minute = new schedule.Range(0, 59, tick_min)
    rule.second = 15

    schedule.scheduleJob(rule, async () => {
      if (
        TimeManager.isDateInRange(
          new Date(),
          s_day,
          e_day,
          s_hour,
          e_hour,
          s_min,
          e_min
        )
      ) {
        await EmptyCount.deletePrevCounts()
      }
    })
  }
}
