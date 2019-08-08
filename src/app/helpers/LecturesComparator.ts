import { LectureInfo } from 'Http/controllers/vacant/ClassroomsController'

type Comparator = (a: LectureInfo, b: LectureInfo) => number

export default class LecturesComparator {
  /**
   * Compare by lecture time.
   * Return compare result as time flow.
   */
  public static comparator(): Comparator {
    return (a, b) => {
      let num_a = this.dayToNum(a.time.day)
      let num_b = this.dayToNum(b.time.day)

      return num_a < num_b
        ? -1
        : num_a > num_b
        ? 1
        : a.time.start < b.time.start
        ? -1
        : 1
    }
  }

  /**
   * Convert day of week to number.
   * ex) SUN - SAT => 0 - 6
   *
   * @param day
   */
  private static dayToNum(day: string): number {
    const day_num: { [index: string]: number } = {
      SUN: 0,
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6
    }

    return day_num[day.toUpperCase()]
  }
}
