import { FloorDoc } from 'Database/schemas/floor'
import logger from 'Configs/log'
import EmptyClassroomChecker from 'Helpers/EmptyClassroomChecker'
import { BuildingDoc } from 'Database/schemas/building'
import Building from 'Database/models/building'

interface EmptyInfo {
  id: string
  empty: number
  total: number
}

interface BuildingEmptyInfo extends EmptyInfo {
  floors: EmptyInfo[]
}

export default class EmptyClassroomCounter {
  /**
   * Count empty classroom number of all buildings and floors.
   *
   * @param date
   */
  public static async count(date: Date): Promise<BuildingEmptyInfo[]> {
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
          promises_3d[i][j][k] = EmptyClassroomChecker.isEmpty(
            classroom_id,
            date
          )
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
}
