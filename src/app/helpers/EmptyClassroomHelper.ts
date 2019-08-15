import { FloorDoc } from 'Database/schemas/floor'
import logger from 'Configs/log'
import { BuildingDoc } from 'Database/schemas/building'
import Building from 'Database/models/building'
import Classroom from 'Database/models/classroom'
import { ClassroomDoc } from 'Database/schemas/classroom'
import { LectureDoc } from 'Database/schemas/lecture'
import { ClassDoc } from 'Database/schemas/class'

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
    const buildings = <BuildingDoc[]>await Building.find(
      { floors: { $exists: true, $not: { $size: 0 } } },
      { _id: 1, floors: 1 },
      err => {
        if (err) {
          logger.error(err)
        }
      }
    ).populate({
      path: 'floors',
      select: '_id classrooms'
    })

    const building_empty_list: BuildingEmptyInfo[] = []
    const promises_3d: Promise<boolean>[][][] = [] // empty check promise list

    // data formatting
    buildings.forEach((bldg: BuildingDoc, i: number) => {
      building_empty_list[i] = {
        id: bldg._id,
        empty: 0,
        total: 0,
        floors: []
      }

      let floor_empty_list: EmptyInfo[] = []
      promises_3d[i] = [] // add promise list for a building
      bldg.floors.forEach((floor: FloorDoc, j: number) => {
        floor_empty_list[j] = {
          id: floor._id,
          empty: 0,
          total: 0
        }

        promises_3d[i][j] = [] // add promise list for a floor
        floor.classrooms.forEach((classroom_id: string, k: number) => {
          // add empty check promise to array
          promises_3d[i][j][k] = this.isEmpty(classroom_id, date)
        })

        // add total classroom count
        floor_empty_list[j].total = promises_3d[i][j].length
        building_empty_list[i].total += promises_3d[i][j].length
      })

      building_empty_list[i].floors = floor_empty_list
    })

    // asynchronously resolve all empty check promise
    const async_3d = await Promise.all(
      promises_3d.map(promises_2d => {
        return Promise.all(
          promises_2d.map(promises_1d => {
            return Promise.all(promises_1d)
          })
        )
      })
    )

    // count
    async_3d.forEach((async_2d, i) => {
      async_2d.forEach((async_1d, j) => {
        async_1d.forEach(is_empty => {
          if (is_empty) {
            building_empty_list[i].floors[j].empty++
            building_empty_list[i].empty++
          }
        })
      })
    })

    return Promise.resolve(building_empty_list)
  }

  /**
   * Checks whether a classroom is empty at date.
   *
   * @param classroom_id
   * @param date
   */
  public static async isEmpty(
    classroom_id: string,
    date: Date = new Date()
  ): Promise<boolean> {
    const converted_date = this.convertDate(date)

    // find all lectures which time is matched with current time
    const classroom = <ClassroomDoc>await Classroom.findById(classroom_id, {
      _id: 0,
      lectures: 1
    }).populate({
      path: 'lectures',
      select: 'class order -_id',
      populate: {
        path: 'class',
        select: 'times -_id',
        match: {
          'times.day': converted_date.day,
          'times.start': { $lte: converted_date.time },
          'times.end': { $gte: converted_date.time }
        }
      }
    })

    const lectures = <LectureDoc[]>classroom.lectures
    let is_empty = true

    // make sure the classroom is empty
    lectures.forEach((lecture: LectureDoc) => {
      if (lecture.class !== null) {
        let time = (<ClassDoc>lecture.class).times[lecture.order]

        if (time.day == converted_date.day) {
          if (
            time.start <= converted_date.time &&
            time.end >= converted_date.time
          ) {
            is_empty = false
            return
          }
        }
      }
    })

    return Promise.resolve(is_empty)
  }

  /**
   * Convert date as comparable form.
   *
   * @param date
   */
  private static convertDate(date: Date): CurrentDate {
    let day = date.getDay()
    let hour = date
      .getHours()
      .toString()
      .padStart(2, '0')
    let min = date
      .getMinutes()
      .toString()
      .padStart(2, '0')

    return { day: day, time: hour + min }
  }
}
