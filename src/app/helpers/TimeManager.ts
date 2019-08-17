export default class TimeManager {
  /**
   * Return current tick time.
   * ex. curr time: `15:47`, tick min: `5` => curr tick: `15:45`
   *
   * @param tick_min
   */
  public static getCurrentTick(tick_min: number): Date {
    const date = new Date()
    let tick = Math.floor(date.getMinutes() / tick_min) * tick_min
    date.setMinutes(tick, 0, 0)

    return date
  }

  /**
   * Return next tick time.
   * ex. curr time: `15:47`, tick min: `5` => next tick: `15:50`
   *
   * @param tick_min
   */
  public static getNextTick(tick_min: number): Date {
    const date = this.getCurrentTick(tick_min)
    date.setMinutes(date.getMinutes() + tick_min)

    return date
  }

  /**
   * Check if a date is in time range.
   *
   * @param date
   * @param s_day Start day of week
   * @param e_day End day of week
   * @param s_hour Start hour
   * @param e_hour End hour
   * @param s_min Start minute
   * @param e_min End minute
   *
   * ex) When s_day: 6, e_day: 1, s_hour: 15, e_hour: 01
   *     These case are true: `SAT 15:00` ~ `SUN 01:00`
   *                          `SUN 15:00` ~ `MON 01:00`
   *                          `MON 15:00` ~ `TUE 01:00`
   */
  public static isDateInRange(
    date: Date,
    s_day: number,
    e_day: number,
    s_hour: number = 0,
    e_hour: number = 23,
    s_min: number = 0,
    e_min: number = 59
  ) {
    const s_time = new Date(date.getTime())
    const e_time = new Date(date.getTime())
    s_time.setHours(s_hour, s_min, 0, 0)
    e_time.setHours(e_hour, e_min, 0, 0)

    const day = date.getDay()
    const prev_day = (day + 6) % 7

    // until the next day
    if (s_time > e_time) {
      // check day
      if (day >= s_day && day <= e_day) {
        if (date >= s_time) {
          return true
        }
      }
      // check prev day
      if (prev_day >= s_day && prev_day <= e_day) {
        if (date <= e_time) {
          return true
        }
      }
    }
    // in a day
    else {
      // check day
      if (day >= s_day && day <= e_day) {
        if (date >= s_time && date <= e_time) {
          return true
        }
      }
    }

    return false
  }
}
