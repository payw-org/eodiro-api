import University from 'Database/models/university'
import DBSeeder from 'DB/DBSeeder'
import EmptyCount from 'Database/models/empty_count'

export default class DBInitializer {
  private dbSeeder: DBSeeder

  public constructor() {
    this.dbSeeder = new DBSeeder()
  }

  /**
   * Initialize database.
   */
  public async initialize(): Promise<void> {
    // check if collection about vacant is empty, seed data.
    const univCount = await University.estimatedDocumentCount()
    if (univCount === 0) {
      await this.dbSeeder.seedMetadata()
      await this.dbSeeder.seedClasses()
      await this.dbSeeder.linkClassesOfCurrentSemester()
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
