import { Response, NextHandler } from 'Http/RequestHandler'
import University from 'Database/models/university'
import LogHelper from 'Helpers/LogHelper'

export default class CheckVendor {
  /**
   * Check if vendor is not exist and get university id.
   */
  public static handler(): NextHandler {
    return async (req, res, next): Promise<Response | void> => {
      const vendor = req.params.vendor

      // Find university id
      const university = await University.findOne(
        { vendor: vendor },
        { _id: 1 },
        err => {
          if (err) {
            LogHelper.log('error', err)
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

      // pass the university document id
      res.locals.univId = university._id

      return next()
    }
  }
}
