import schedule from 'node-schedule'
import EmptyCount, {
  eDay,
  eHour,
  eMin,
  sDay,
  sHour,
  sMin,
  tickMin
} from 'Database/models/empty-count'
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
    rule.minute = new schedule.Range(0, 59, tickMin)
    rule.second = 30

    schedule.scheduleJob(rule, () => {
      if (
        TimeManager.isDateInRange(
          new Date(),
          sDay,
          eDay,
          sHour,
          eHour,
          sMin,
          eMin
        )
      ) {
        EmptyCount.saveNextCount().then()
      }
    })
  }

  /**
   * Delete previous time's empty count every tick minutes.
   * If not activation time, do not delete.
   */
  private static scheduleDeleteJob(): void {
    const rule = new schedule.RecurrenceRule()
    rule.minute = new schedule.Range(0, 59, tickMin)
    rule.second = 15

    schedule.scheduleJob(rule, () => {
      if (
        TimeManager.isDateInRange(
          new Date(),
          sDay,
          eDay,
          sHour,
          eHour,
          sMin,
          eMin
        )
      ) {
        EmptyCount.deletePrevCounts().then()
      }
    })
  }
}
