import { SimpleHandler } from 'Http/RequestHandler'
import { UniversityDoc } from 'Database/schemas/university'
import University from 'Database/models/university'
import logger from 'Configs/log'
import { BuildingDoc } from 'Database/schemas/building'
import EmptyCount from 'Database//models/empty_count'

interface BldgInfo {
  number: string
  name: string
  empty: number
  total: number
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
        select: 'number name floors',
        match: { floors: { $exists: true, $not: { $size: 0 } } },
        options: { sort: { number: 1 } }
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

      // data formatting
      for (const bldg of buildings) {
        const count = await EmptyCount.getCurrentCountOfBuilding(bldg._id)

        building_list.push({
          number: bldg.number,
          name: bldg.name,
          empty: count.empty,
          total: count.total
        })
      }

      return res.status(200).json({
        buildings: building_list
      })
    }
  }
}
