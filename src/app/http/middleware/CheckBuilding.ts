import { Response, NextHandler } from 'Http/RequestHandler'
import Building from 'Database/models/building'
import LogHelper from 'Helpers/LogHelper'

export default class CheckBuilding {
  /**
   * Check if building is not exist and get building id.
   */
  public static handler(): NextHandler {
    return async (req, res, next): Promise<Response | void> => {
      const univId = res.locals.univId
      const bldgNum = req.params.building

      // Find building id
      const building = await Building.findOne(
        { university: univId, number: bldgNum },
        { _id: 1 },
        err => {
          if (err) {
            LogHelper.log('error', err)
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
      res.locals.bldgId = building._id

      return next()
    }
  }
}
