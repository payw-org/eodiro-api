export default class TimeManager {
  /**
   * Return current tick time.
   * ex. curr time: `15:47`, tick min: `5` => curr tick: `15:45`
   *
   * @param tickMin
   */
  public static getCurrentTick(tickMin: number): Date {
    const date = new Date()
    const tick = Math.floor(date.getMinutes() / tickMin) * tickMin
    date.setMinutes(tick, 0, 0)

    return date
  }

  /**
   * Return next tick time.
   * ex. curr time: `15:47`, tick min: `5` => next tick: `15:50`
   *
   * @param tickMin
   */
  public static getNextTick(tickMin: number): Date {
    const date = this.getCurrentTick(tickMin)
    date.setMinutes(date.getMinutes() + tickMin)

    return date
  }

  /**
   * Check if a date is in time range.
   *
   * @param date
   * @param sDay Start day of week
   * @param eDay End day of week
   * @param sHour Start hour
   * @param eHour End hour
   * @param sMin Start minute
   * @param eMin End minute
   *
   * ex) When sDay: 6, eDay: 1, sHour: 15, eHour: 01
   *     These case are true: `SAT 15:00` ~ `SUN 01:00`
   *                          `SUN 15:00` ~ `MON 01:00`
   *                          `MON 15:00` ~ `TUE 01:00`
   */
  public static isDateInRange(
    date: Date,
    sDay: number,
    eDay: number,
    sHour = 0,
    eHour = 23,
    sMin = 0,
    eMin = 59
  ): boolean {
    const sTime = new Date(date.getTime())
    const eTime = new Date(date.getTime())
    sTime.setHours(sHour, sMin, 0, 0)
    eTime.setHours(eHour, eMin, 0, 0)

    const day = date.getDay()
    const prevDay = (day + 6) % 7

    // until the next day
    if (sTime > eTime) {
      // check day
      if (day >= sDay && day <= eDay) {
        if (date >= sTime) {
          return true
        }
      }
      // check prev day
      if (prevDay >= sDay && prevDay <= eDay) {
        if (date <= eTime) {
          return true
        }
      }
    } else {
      // check day
      if (day >= sDay && day <= eDay) {
        if (date >= sTime && date <= eTime) {
          return true
        }
      }
    }

    return false
  }
}
