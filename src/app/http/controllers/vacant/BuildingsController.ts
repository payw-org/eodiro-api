import { SimpleHandler } from 'Http/RequestHandler'
import { UniversityDoc } from 'Database/schemas/university'
import University from 'Database/models/university'
import logger from 'Configs/log'
import { BuildingDoc } from 'Database/schemas/building'
import EmptyClassroomChecker from 'Helpers/EmptyClassroomChecker'
import { FloorDoc } from 'Database/schemas/floor'

interface BldgInfo {
  number: string
  name: string
  empty_classroom: number
  total_classroom: number
}

export default class BuildingsController {
  /**
   * Get a listing of the building.
   */
  public static index(): SimpleHandler {
    return async (req, res) => {
      let univ_id = res.locals.univ_id

      // find all building document of the university
      const university = <UniversityDoc>await University.findById(
        univ_id,
        { _id: 0, buildings: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      ).populate({
        path: 'buildings',
        select: 'number name floors -_id',
        options: { sort: { number: 1 } },
        populate: {
          path: 'floors',
          select: 'classrooms -_id'
        }
      })

      const buildings = <BuildingDoc[]>university.buildings

      // if building list not exist
      if (buildings.length === 0) {
        return res.status(404).json({
          err: {
            msg: 'Buildings not found.'
          }
        })
      }

      const building_list: BldgInfo[] = []
      const promise_list: Promise<boolean>[][] = [] // empty check promise list
      const empty_checker = new EmptyClassroomChecker()

      // data formatting
      buildings.forEach((bldg: BuildingDoc) => {
        if (bldg.floors.length !== 0) {
          promise_list.push([]) // add promise list for the building

          // add empty classroom checking promise to array
          bldg.floors.forEach((floor: FloorDoc) => {
            floor.classrooms.forEach((classroom_id: string) => {
              promise_list[promise_list.length - 1].push(
                empty_checker.isEmpty(classroom_id)
              )
            })
          })

          building_list.push({
            number: bldg.number,
            name: bldg.name,
            empty_classroom: 0,
            total_classroom: promise_list[promise_list.length - 1].length
          })
        }
      })

      // asynchronously resolve all empty classroom checking promise
      let empty_lists = await Promise.all(
        promise_list.map(Promise.all, Promise)
      )

      // count empty classroom
      empty_lists.forEach((empty_list, index) => {
        empty_list.forEach(is_empty => {
          if (is_empty) {
            building_list[index].empty_classroom++
          }
        })
      })

      return res.status(200).json({
        buildings: building_list
      })
    }
  }
}
