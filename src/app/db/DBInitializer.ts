import University from 'Database/models/university'
import ClassSeeder from 'DB/ClassSeeder'
import EmptyCount from 'Database/models/empty-count'

export default class DBInitializer {
  private classSeeder: ClassSeeder

  public constructor() {
    this.classSeeder = new ClassSeeder()
  }

  /**
   * Initialize database.
   */
  public async initialize(): Promise<void> {
    // check if collection about vacant is empty, seed data.
    const univCount = await University.estimatedDocumentCount()
    if (univCount === 0) {
      await this.classSeeder.seedMetadata()
      await this.classSeeder.seedClasses()
      await this.classSeeder.linkClassesOfCurrentSemester()
    }

    await this.calcEmptyCounts()
  }

  /**
   * Delete all previous empty classroom counts.
   * Calculate and save empty classroom counts in advance.
   */
  private async calcEmptyCounts(): Promise<void> {
    await EmptyCount.deletePrevCounts()
    await EmptyCount.saveCurrentCount()
    await EmptyCount.saveNextCount()
  }
}
