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

      // find(count) vendor
      let count = await University.count({ vendor: vendor }, err => {
        if (err) {
          logger.error(err)
        }
      })

      // if not exist
      if (count === 0) {
        return res.status(404).json({
          err: {
            msg: 'Vendor not found.'
          }
        })
      }

      return next()
    }
  }
}
