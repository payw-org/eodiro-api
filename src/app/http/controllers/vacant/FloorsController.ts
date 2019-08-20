import { Response, SimpleHandler } from 'Http/RequestHandler'
import Building from 'Database/models/building'
import logger from 'Configs/log'
import { BuildingDoc } from 'Database/schemas/building'
import { FloorDoc } from 'Database/schemas/floor'
import EmptyCount from 'Database//models/empty_count'
import FloorsComparator from 'Helpers/FloorsComparator'

export interface FloorInfo {
  number: string
  empty: number
  total: number
}

export default class FloorsController {
  /**
   * Get a listing of the floor.
   */
  public static index(): SimpleHandler {
    return async (req, res): Promise<Response> => {
      const bldgId = res.locals.bldgId

      // find all floor document of the building
      const building = (await Building.findById(
        bldgId,
        { _id: 0, floors: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      ).populate({
        path: 'floors',
        select: 'number'
      })) as BuildingDoc

      const floors = building.floors as FloorDoc[]

      // if floor list not exist
      if (floors.length === 0) {
        res.status(404).json({
          err: {
            msg: 'Floors not found.'
          }
        })
      }

      const floorList: FloorInfo[] = []

      // data formatting
      for (const floor of floors) {
        const count = await EmptyCount.getCurrentCountOfFloor(bldgId, floor._id)

        floorList.push({
          number: floor.number,
          empty: count.empty,
          total: count.total
        })
      }

      // sort by descending order of floor number
      floorList.sort(FloorsComparator.comparator())

      return res.status(200).json({
        floors: floorList
      })
    }
  }
}
