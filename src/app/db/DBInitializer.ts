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
    let univ_count = await University.estimatedDocumentCount()
    if (univ_count === 0) {
      await this.dbSeeder.seedMetadata()
      await this.dbSeeder.seedClasses()
    }

    await this.calcEmptyCounts()
  }

  /**
   * Calculate and save empty classroom counts in advance.
   */
  private async calcEmptyCounts(): Promise<void> {
    await EmptyCount.saveCurrentCount()
    await EmptyCount.saveNextCount()
  }
}
