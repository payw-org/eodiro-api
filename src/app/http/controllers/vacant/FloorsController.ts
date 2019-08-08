import { SimpleHandler } from 'Http/RequestHandler'
import Building from 'Database/models/building'
import logger from 'Configs/log'
import { BuildingDoc } from 'Database/schemas/building'
import { FloorDoc } from 'Database/schemas/floor'
import EmptyClassroomChecker from 'Helpers/EmptyClassroomChecker'
import FloorsComparator from 'Helpers/FloorsComparator'

export interface FloorInfo {
  number: string
  empty_classroom: number
  total_classroom: number
}

export default class FloorsController {
  /**
   * Get a listing of the floor.
   */
  public static index(): SimpleHandler {
    return async (req, res) => {
      let bldg_id = res.locals.bldg_id

      // find all floor document of the building
      const building = <BuildingDoc>await Building.findById(
        bldg_id,
        { _id: 0, floors: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      ).populate({
        path: 'floors',
        select: 'number classrooms -_id'
      })

      const floors = <FloorDoc[]>building.floors

      // if floor list not exist
      if (floors.length === 0) {
        res.status(404).json({
          err: {
            msg: 'Floors not found.'
          }
        })
      }

      const floor_list: FloorInfo[] = []
      const promise_list: Promise<boolean>[][] = [] // empty check promise list
      const empty_checker = new EmptyClassroomChecker()

      // data formatting
      floors.forEach((floor: FloorDoc) => {
        promise_list.push([]) // add promise list for the floor

        // add empty classroom checking promise to array
        floor.classrooms.forEach((classroom_id: string) => {
          promise_list[promise_list.length - 1].push(
            empty_checker.isEmpty(classroom_id)
          )
        })

        floor_list.push({
          number: floor.number,
          empty_classroom: 0,
          total_classroom: promise_list[promise_list.length - 1].length
        })
      })

      // asynchronously resolve all empty classroom checking promise
      let empty_lists = await Promise.all(
        promise_list.map(Promise.all, Promise)
      )

      // count empty classroom
      empty_lists.forEach((empty_list, index) => {
        empty_list.forEach(is_empty => {
          if (is_empty) {
            floor_list[index].empty_classroom++
          }
        })
      })

      // sort by descending order of floor number
      floor_list.sort(FloorsComparator.comparator())

      return res.status(200).json({
        floors: floor_list
      })
    }
  }
}
