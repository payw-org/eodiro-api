import ClassSeeder from 'DB/ClassSeeder'
import MealSeeder from 'DB/MealSeeder'
import MetadataSeeder from 'DB/MetadataSeeder'
import EmptyCount from 'Database/models/empty-count'

export default class DBInitializer {
  private metadataSeeder: MetadataSeeder

  private classSeeder: ClassSeeder

  private mealSeeder: MealSeeder

  public constructor() {
    this.metadataSeeder = new MetadataSeeder()
    this.classSeeder = new ClassSeeder()
    this.mealSeeder = new MealSeeder()
  }

  /**
   * Initialize database.
   */
  public async initialize(): Promise<void> {
    await this.metadataSeeder.run()

    const promises = []
    promises.push(this.classSeeder.run())
    promises.push(this.mealSeeder.run())
    await Promise.all(promises) // asynchronously seeding

    await this.calculateEmptyCounts()
  }

  /**
   * Delete all previous empty classroom counts.
   * Calculate and save empty classroom counts in advance.
   */
  private async calculateEmptyCounts(): Promise<void> {
    await EmptyCount.deletePrevCounts()
    await EmptyCount.saveCurrentCount()
    await EmptyCount.saveNextCount()
  }
}
