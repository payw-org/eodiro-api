import { NextHandler } from 'Http/RequestHandler'
import University from 'Database/models/university'
import logger from 'Configs/log'

export default class CheckVendor {
  /**
   * Check if vendor is not exist and get university id.
   */
  public static handler(): NextHandler {
    return async (req, res, next) => {
      let vendor = req.params.vendor

      // Find university id by vendor
      let university = await University.findOne(
        { vendor: vendor },
        { _id: 1 },
        err => {
          if (err) {
            logger.error(err)
          }
        }
      )

      // if not found
      if (!university) {
        return res.status(404).json({
          err: {
            msg: 'Vendor not found.'
          }
        })
      }

      res.locals.univ_id = university._id

      return next()
    }
  }
}
