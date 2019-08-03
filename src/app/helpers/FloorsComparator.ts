import { FloorInfo } from 'Http/controllers/vacant/FloorsController'

type Comparator = (a: FloorInfo, b: FloorInfo) => number

export default class FloorsComparator {
  /**
   * Compare by floor number string.
   * Return compare result as descending order.
   */
  public static comparator(): Comparator {
    return (a, b) => {
      let int_a = this.floorToInt(a.number)
      let int_b = this.floorToInt(b.number)

      return int_a > int_b ? -1 : int_a < int_b ? 1 : 0
    }
  }

  /**
   * Convert floor number string to int.
   * ex) `B3` -> `-3`
   *
   * @param floor
   */
  private static floorToInt(floor: string): number {
    // check if basement floor
    if (floor.substring(0, 1).toLowerCase() == 'b') {
      return -parseInt(floor.substring(1))
    } else {
      return parseInt(floor)
    }
  }
}
