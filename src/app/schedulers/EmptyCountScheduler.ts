import schedule from 'node-schedule'
import EmptyCount from 'Database/models/empty_count'
import { tick_min } from 'Database/models/empty_count'

export default class EmptyCountScheduler {
  public static run(): void {
    this.scheduleSaveJob()
    this.scheduleDeleteJob()
  }

  private static scheduleSaveJob(): void {
    const rule = new schedule.RecurrenceRule()
    rule.minute = new schedule.Range(0, 59, tick_min)
    rule.second = 30

    schedule.scheduleJob(rule, async () => {
      await EmptyCount.saveNextCount()
    })
  }

  private static scheduleDeleteJob(): void {
    const rule = new schedule.RecurrenceRule()
    rule.minute = new schedule.Range(0, 59, tick_min)
    rule.second = 15

    schedule.scheduleJob(rule, async () => {
      await EmptyCount.deletePrevCounts()
    })
  }
}
