import { GlobalNameDoc } from 'Database/schemas/global-name'
import metadataSeoulJSON from 'Resources/metadata/cau-seoul.json'
import University from 'Database/models/university'
import Building from 'Database/models/building'
import LogHelper from 'Helpers/LogHelper'

interface BldgMetaJSON {
  number: string
  name: string
}

interface UnivMetaJSON {
  name: GlobalNameDoc
  campus: GlobalNameDoc
  vendor: string
  buildings: BldgMetaJSON[]
}

export default class MetadataSeeder {
  /**
   * Seed(resource) data for metadata
   */
  private metadataSeed: UnivMetaJSON[] = [metadataSeoulJSON as UnivMetaJSON]

  /**
   * Seed(resource) data for metadata
   */
  public async run(): Promise<void> {
    const univCount = await University.estimatedDocumentCount()

    // if university collection is empty, then seed data.
    if (univCount === 0) {
      await this.seedMetadata()
    }
  }

  /**
   * Seed the collection of university and building.
   */
  private async seedMetadata(): Promise<void> {
    // asynchronously seed metadata
    await Promise.all(
      this.metadataSeed.map(async (seed: UnivMetaJSON) => {
        try {
          // create university
          const university = await University.create({
            name: seed.name,
            campus: seed.campus,
            vendor: seed.vendor
          })

          // create buildings
          const buildings = await Building.insertMany(seed.buildings)
          // get building id list
          const buildingsIds = buildings.map(bldg => {
            return bldg._id
          })

          // link university to buildings
          await Building.updateMany(
            { _id: { $in: buildingsIds } },
            { university: university._id }
          )

          // link buildings to university
          await University.findByIdAndUpdate(university._id, {
            buildings: buildings
          })
        } catch (err) {
          LogHelper.log('error', 'Metadata save error: ' + err)
        }
      })
    )
  }
}
