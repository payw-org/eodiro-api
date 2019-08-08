import { NextHandler } from 'Http/RequestHandler'
import Floor from 'Database/models/floor'
import logger from 'Configs/log'

export default class CheckFloor {
  /**
   * Check if floor is not exist and get floor id.
   */
  public static handler(): NextHandler {
    return async (req, res, next) => {
      let bldg_id = res.locals.bldg_id
      let floor_num = req.params.floor

      // find floor id
      const floor = await Floor.findOne(
        {
          building: bldg_id,
          number: { $regex: new RegExp('^' + floor_num.toLowerCase(), 'i') }
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
      res.locals.floor_id = floor._id

      return next()
    }
  }
}
