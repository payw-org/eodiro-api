import { Response, NextHandler } from 'Http/RequestHandler'
import University from 'Database/models/university'
import LogHelper from 'Helpers/LogHelper'
import { checkSchema, ValidationChain } from 'express-validator'

export default class CheckVendor {
  /**
   * Validate middleware request.
   */
  public static validate(): ValidationChain[] {
    return checkSchema({
      vendor: {
        exists: true,
        in: 'params',
        isString: true,
        isLowercase: true,
        trim: true,
        escape: true,
        errorMessage: '`vendor` must be all lowercase string.'
      }
    })
  }

  /**
   * Check if vendor is not exist and pass university id.
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
      ).lean()

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
