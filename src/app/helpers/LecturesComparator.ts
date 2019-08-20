import { LectureInfo } from 'Http/controllers/vacant/ClassroomsController'

type Comparator = (a: LectureInfo, b: LectureInfo) => number

export default class LecturesComparator {
  /**
   * Compare by lecture time.
   * Return compare result as time flow.
   */
  public static comparator(): Comparator {
    return (a, b): number => {
      return a.time.day < b.time.day
        ? -1
        : a.time.day > b.time.day
        ? 1
        : a.time.start < b.time.start
        ? -1
        : 1
    }
  }
}
