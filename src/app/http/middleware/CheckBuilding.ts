import { NextHandler } from 'Http/RequestHandler'
import Building from 'Database/models/building'
import logger from 'Configs/log'

export default class CheckBuilding {
  /**
   * Check if building is not exist and get building id.
   */
  public static handler(): NextHandler {
    return async (req, res, next) => {
      let univ_id = res.locals.univ_id
      let bldg_num = req.params.building

      // Find building id
      const building = await Building.findOne(
        { university: univ_id, number: bldg_num },
        { _id: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      )

      // if not found
      if (!building) {
        return res.status(404).json({
          err: {
            msg: 'Building not found.'
          }
        })
      }

      // pass the building document id
      res.locals.bldg_id = building._id

      return next()
    }
  }
}
