import University from 'Database/models/university'
import DBSeeder from 'DB/DBSeeder'

export default class DBInitializer {
  private dbSeeder: DBSeeder

  public constructor() {
    this.dbSeeder = new DBSeeder()
  }

  public async initialize(): Promise<void> {
    // check if collection about vacant is empty, seed data.
    let univ_count = await University.estimatedDocumentCount()
    if (univ_count === 0) {
      await this.dbSeeder.seedMetadata()
      await this.dbSeeder.seedClasses()
    }

  }

  }
}
