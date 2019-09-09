type Convertible = string
type Comparator = (a: Convertible, b: Convertible) => number
type PriorityTable = { [index: string]: number }

export default class PriorityComparator {
  /**
   * Compare by the given priority table.
   * Return compare result according to priority.
   *
   * @param table
   */
  public static comparator(table: PriorityTable): Comparator {
    return (a, b): number => {
      const numA = this.toPriority(table, a)
      const numB = this.toPriority(table, b)

      return numA < numB ? -1 : numA > numB ? 1 : 0
    }
  }

  /**
   * Convert value to priority.
   *
   * @param table
   * @param value
   */
  private static toPriority(table: PriorityTable, value: Convertible): number {
    if (
      !Object.prototype.hasOwnProperty.call(table, this.valueToString(value))
    ) {
      return -1
    }

    return table[value]
  }

  /**
   * Convert value to string.
   *
   * @param value
   */
  private static valueToString(value: Convertible): string {
    return value
  }
}
