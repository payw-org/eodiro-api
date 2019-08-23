import { GlobalNameDoc } from 'Database/schemas/global_name'
import metadataSeoulJSON from 'Resources/metadata/cau_seoul.json'
// import metadataAnseongJSON from 'Resources/metadata/cau_anseong.json'
import classesSeoulJSON from 'Resources/classes/cau_seoul.json'
// import classesAnseongJSON from 'Resources/classes/cau_anseong.json'
import University from 'Database/models/university'
import Building from 'Database/models/building'
import Class from 'Database/models/class'
import { ClassDoc } from 'Database/schemas/class'
import Floor from 'Database/models/floor'
import Classroom from 'Database/models/classroom'
import Lecture from 'Database/models/lecture'
import LogHelper from 'Helpers/LogHelper'

interface ClassesJSON {
  vendor: string
  classes: ClassDoc[]
}

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

export default class DBSeeder {
  /**
   * Seed(resource) data for metadata
   */
  private metadataSeed: UnivMetaJSON[] = [
    metadataSeoulJSON as UnivMetaJSON
    // metadataAnseongJSON as UnivMetaJSON
  ]

  /**
   * Seed(resource) data for classes
   */
  private classesSeed: ClassesJSON[] = [
    classesSeoulJSON as ClassesJSON
    // classesAnseongJSON as ClassesJSON
  ]

  /**
   * Seed the collection of university and building.
   */
  public async seedMetadata(): Promise<void> {
    // asynchronously seed metadata
    await Promise.all(
      this.metadataSeed.map(async (seed: UnivMetaJSON) => {
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
      })
    )
  }

  /**
   * Seed the collection of class, floor, classroom, lecture.
   */
  public async seedClasses(): Promise<void> {
    // asynchronously seed classes
    await Promise.all(
      this.classesSeed.map(async (seed: ClassesJSON) => {
        try {
          // create classes
          const classes = (await Class.insertMany(seed.classes)) as ClassDoc[]

          // link classes to university
          await University.findOneAndUpdate(
            { vendor: seed.vendor },
            { classes: classes },
            { new: true }
          )
        } catch (err) {
          LogHelper.log('error', 'Class save error: ' + err)
        }
      })
    )

    // get all classes
    const classes = (await Class.find(
      {},
      { _id: 1, closed: 1, locations: 1 }
    )) as ClassDoc[]
    const unregisteredBldgSet = new Set()

    // create and link floors, classrooms, lectures
    for (const cls of classes) {
      // skip closed class
      if (cls.closed) {
        continue
      }

      for (let i = 0; i < cls.locations.length; i++) {
        const location = cls.locations[i]

        const floorRegexp = /(?:[Bb]|)\d+(?=\d\d)/
        const floorNum = floorRegexp.exec(location.room)[0]

        // find class building
        const building = await Building.findOne({
          number: location.building
        })

        // skip unregistered building
        if (building === null) {
          unregisteredBldgSet.add(location.building)
          continue
        }

        // find class floor
        // if not exist, create floor
        const floor = await Floor.findOneAndUpdate(
          { building: building._id, number: floorNum },
          { building: building._id, number: floorNum },
          { upsert: true, new: true }
        )

        // link floor to building
        await Building.findByIdAndUpdate(building._id, {
          $addToSet: { floors: floor._id }
        })

        // find classroom
        // if not exist, create classroom
        const classroom = await Classroom.findOneAndUpdate(
          { floor: floor._id, number: location.room },
          { floor: floor._id, number: location.room },
          { upsert: true, new: true }
        )

        // link classroom to floor
        await Floor.findByIdAndUpdate(floor._id, {
          $addToSet: { classrooms: classroom._id }
        })

        // create lecture
        const lecture = await Lecture.create({
          classroom: classroom._id,
          class: cls._id,
          order: i
        })

        // link lecture to classroom
        await Classroom.findByIdAndUpdate(classroom._id, {
          $addToSet: { lectures: lecture._id }
        })
      }
    }

    // log unregistered buildings
    if (unregisteredBldgSet.size !== 0) {
      LogHelper.log(
        'warn',
        'Buildings `' +
          Array.from(unregisteredBldgSet)
            .sort()
            .join(', ') +
          '` are unregistered.'
      )
    }
  }

  /**
   * Apply refreshed seed data.
   */
  public async refreshMetadataAndClasses(): Promise<void> {
    // delete all documents about metadata and classes
    await Promise.all([
      Class.deleteMany({}),
      University.deleteMany({}),
      Building.deleteMany({}),
      Floor.deleteMany({}),
      Classroom.deleteMany({}),
      Lecture.deleteMany({})
    ])

    // re-seeding
    await this.seedMetadata()
    await this.seedClasses()
  }
}
