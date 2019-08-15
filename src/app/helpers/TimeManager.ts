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
}
