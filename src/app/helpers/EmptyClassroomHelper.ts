import { FloorDoc } from 'Database/schemas/floor'
import { BuildingDoc } from 'Database/schemas/building'
import Building from 'Database/models/building'
import Classroom from 'Database/models/classroom'
import { ClassroomDoc } from 'Database/schemas/classroom'
import { LectureDoc } from 'Database/schemas/lecture'
import { ClassDoc } from 'Database/schemas/class'
import LogHelper from 'Helpers/LogHelper'

interface EmptyInfo {
  id: string
  empty: number
  total: number
}

interface BuildingEmptyInfo extends EmptyInfo {
  floors: EmptyInfo[]
}

interface CurrentDate {
  day: number
  time: string
}

export default class EmptyClassroomHelper {
  /**
   * Count empty classroom number of all buildings and floors.
   *
   * @param date
   */
  public static async countAll(date: Date): Promise<BuildingEmptyInfo[]> {
    // find all buildings which has activated classrooms
    const buildings = (await Building.find(
      { floors: { $exists: true, $not: { $size: 0 } } },
      { _id: 1, floors: 1 },
      err => {
        if (err) {
          LogHelper.log('error', err)
        }
      }
    ).populate({
      path: 'floors',
      select: '_id classrooms'
    })) as BuildingDoc[]

    const buildingEmptyList: BuildingEmptyInfo[] = []
    const promises3d: Promise<boolean>[][][] = [] // empty check promise list

    // data formatting
    buildings.forEach((bldg: BuildingDoc, i: number) => {
      buildingEmptyList[i] = {
        id: bldg._id,
        empty: 0,
        total: 0,
        floors: []
      }

      const floorEmptyList: EmptyInfo[] = []
      promises3d[i] = [] // add promise list for a building
      bldg.floors.forEach((floor: FloorDoc, j: number) => {
        floorEmptyList[j] = {
          id: floor._id,
          empty: 0,
          total: 0
        }

        promises3d[i][j] = [] // add promise list for a floor
        floor.classrooms.forEach((classroomId: string, k: number) => {
          // add empty check promise to array
          promises3d[i][j][k] = this.isEmpty(classroomId, date)
        })

        // add total classroom count
        floorEmptyList[j].total = promises3d[i][j].length
        buildingEmptyList[i].total += promises3d[i][j].length
      })

      buildingEmptyList[i].floors = floorEmptyList
    })

    // asynchronously resolve all empty check promise
    const async3d = await Promise.all(
      promises3d.map(promises2d => {
        return Promise.all(
          promises2d.map(promises1d => {
            return Promise.all(promises1d)
          })
        )
      })
    )

    // count
    async3d.forEach((async2d, i) => {
      async2d.forEach((async1d, j) => {
        async1d.forEach(isEmpty => {
          if (isEmpty) {
            buildingEmptyList[i].floors[j].empty++
            buildingEmptyList[i].empty++
          }
        })
      })
    })

    return buildingEmptyList
  }

  /**
   * Checks whether a classroom is empty at date.
   *
   * @param classroomId
   * @param date
   */
  public static async isEmpty(
    classroomId: string,
    date: Date = new Date()
  ): Promise<boolean> {
    const convertedDate = this.convertDate(date)

    // find all lectures which time is matched with current time
    const classroom = (await Classroom.findById(classroomId, {
      _id: 0,
      lectures: 1
    }).populate({
      path: 'lectures',
      select: 'class order -_id',
      populate: {
        path: 'class',
        select: 'times -_id',
        match: {
          'times.day': convertedDate.day,
          'times.start': { $lte: convertedDate.time },
          'times.end': { $gte: convertedDate.time }
        }
      }
    })) as ClassroomDoc

    const lectures = classroom.lectures as LectureDoc[]
    let isEmpty = true

    // make sure the classroom is empty
    lectures.forEach((lecture: LectureDoc) => {
      if (lecture.class !== null) {
        const time = (lecture.class as ClassDoc).times[lecture.order]

        if (time.day === convertedDate.day) {
          if (
            time.start <= convertedDate.time &&
            time.end >= convertedDate.time
          ) {
            isEmpty = false
          }
        }
      }
    })

    return isEmpty
  }

  /**
   * Convert date as comparable form.
   *
   * @param date
   */
  private static convertDate(date: Date): CurrentDate {
    const day = date.getDay()
    const hour = date
      .getHours()
      .toString()
      .padStart(2, '0')
    const min = date
      .getMinutes()
      .toString()
      .padStart(2, '0')

    return { day: day, time: hour + min }
  }
}
