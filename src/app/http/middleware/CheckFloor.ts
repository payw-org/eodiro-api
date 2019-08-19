import { Response, NextHandler } from 'Http/RequestHandler'
import Floor from 'Database/models/floor'
import logger from 'Configs/log'

export default class CheckFloor {
  /**
   * Check if floor is not exist and get floor id.
   */
  public static handler(): NextHandler {
    return async (req, res, next): Promise<Response | void> => {
      const bldgId = res.locals.bldgId
      const floorNum = req.params.floor

      // find floor id
      const floor = await Floor.findOne(
        {
          building: bldgId,
          number: { $regex: new RegExp('^' + floorNum.toLowerCase(), 'i') }
        },
        { _id: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      )

      // if not found
      if (!floor) {
        return res.status(404).json({
          err: {
            msg: 'Floor not found.'
          }
        })
      }

      // pass the floor document id
      res.locals.floorId = floor._id

      return next()
    }
  }
}
